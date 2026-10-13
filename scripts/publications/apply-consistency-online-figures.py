"""Publish the reviewed book diagrams at their existing public image URLs."""
from pathlib import Path
import hashlib, json, argparse, shutil

ROOT=Path(__file__).resolve().parents[2]
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
    source=ROOT/'content/grundlagen/online-book-figure-corrections-20261011.json'
    manifest=json.loads(source.read_text())
    if manifest['status']!='REVIEWED':raise RuntimeError('Figure review pending')
    prepared=[]
    for e in manifest['entries']:
        target=ROOT/e['path'];replacement=ROOT/e['replacement']
        if target.parent!=ROOT/'public/assets/imported/woek-main-2026' or e['visualReview']!='PASS':
            raise RuntimeError('Unreviewed figure target')
        if sha(replacement)!=e['afterSha256']:raise RuntimeError('Replacement figure changed: '+e['key'])
        current=sha(target)
        accepted={e['beforeSha256'],e['afterSha256'],*e.get('previousCorrectedSha256',[])}
        if current not in accepted:raise RuntimeError('Online figure conflict: '+e['key'])
        if current!=e['afterSha256']:
            if args.check:raise RuntimeError('Unapplied online figure: '+e['key'])
            archive=ROOT/'source-assets/originals/online-book-figures-20261011'/target.name
            if archive.exists() and sha(archive)!=e['beforeSha256']:raise RuntimeError('Archive source conflict')
            if current!=e['beforeSha256'] and not archive.exists():raise RuntimeError('Immutable online original missing')
            prepared.append((target,replacement,archive))
    for target,replacement,archive in prepared:
        archive.parent.mkdir(parents=True,exist_ok=True)
        if not archive.exists():shutil.copyfile(target,archive)
        shutil.copyfile(replacement,target)
    if not args.check:
        report=dict(status='PASS',manifestSha256=sha(source),figures=len(manifest['entries']),newlyApplied=len(prepared),
                    originalsPreserved=True,publicImageUrlsPreserved=True,entries=manifest['entries'])
        out=ROOT/'reports/consistency-20261009/online-book-figures.json'
        out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(dict(status='PASS',figures=len(manifest['entries']),newlyApplied=len(prepared))))
if __name__=='__main__':main()
