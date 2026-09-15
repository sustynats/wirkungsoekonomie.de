"""One-off build helper for the already reviewed repair in PR #772.
No LLM/provider calls, new ratings, or writes to main.
"""
import copy
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys

BASE = '63540eb8a8fd62a5b8f392cf5ac4089efafcac3f'
PROPOSAL = '48cc81ef23c25b738eb599f3ad5af693f3ed2330'
IDS = {'wt-8d118596e0a5b188','wt-aa6a91f8546c7299','wt-fb34b1d598b813c7','wt-20282aa68ebd0fa9','wt-9a5ca53dea779f2f','wt-53ce09a75455bdf7','wt-89f8097af783b7e6','wt-b6a1d81a1c4e660b','wt-eb36c70c560b9e5d','wt-bbf462183939f712'}
FILE = 'data/news/stories.json'
MISSING = object()
REPORT = Path(os.environ['RUNNER_TEMP']) / 'potential-release-772.json'

def git(*args):
    return subprocess.check_output(['git', *args])

def load(ref):
    return json.loads(git('show', ref + ':' + FILE))

def index(store):
    records = store['stories']
    result = {r['story_id']: r for r in records}
    assert len(result) == len(records), 'Duplicate identities'
    return result

def prepare():
    assert os.environ['GITHUB_REPOSITORY'] == 'sustynats/wirkungsoekonomie.de'
    assert os.environ['GITHUB_REF'] == 'refs/heads/chatgpt/potential-release-build-20260915'
    current_ref = os.environ['CURRENT_MAIN']
    base_store, proposal_store, current_store = load(BASE), load(PROPOSAL), load(current_ref)
    base, proposal, current = map(index, (base_store, proposal_store, current_store))
    assert set(base) == set(proposal), 'Unexpected proposed identity change'
    assert {k for k in base if base[k] != proposal[k]} <= IDS, 'Unexpected editorial change'
    output = copy.deepcopy(current_store)
    positions = {r['story_id']: i for i, r in enumerate(output['stories'])}
    report = {'base': BASE, 'proposal': PROPOSAL, 'current_main': current_ref, 'applied': [], 'held': []}
    for key in sorted(IDS):
        assert key in current and key in base and key in proposal
        old, new, live = base[key], proposal[key], current[key]
        merged, conflicts = copy.deepcopy(live), []
        for field in old.keys() | new.keys():
            b, p, c = old.get(field, MISSING), new.get(field, MISSING), live.get(field, MISSING)
            if b == p:
                continue
            if c != b and c != p:
                conflicts.append(field)
            elif p is MISSING:
                merged.pop(field, None)
            else:
                merged[field] = copy.deepcopy(p)
        for field in ('story_id', 'slug', 'url', 'published_at', 'original_potential_assessment'):
            if live.get(field, MISSING) != merged.get(field, MISSING):
                conflicts.append('protected:' + field)
        for field in ('versions', 'impact_history'):
            assert isinstance(live.get(field, []), list) and isinstance(merged.get(field, []), list)
            if any(row not in merged.get(field, []) for row in live.get(field, [])):
                conflicts.append('history:' + field)
        if conflicts:
            report['held'].append({'story_id': key, 'fields': sorted(set(conflicts))})
            continue
        output['stories'][positions[key]] = merged
        report['applied'].append({'story_id': key, 'slug': merged['slug'], 'review_job_id': merged['impact_semantic_review']['review_job_id']})
    assert any(row['story_id'] == 'wt-aa6a91f8546c7299' for row in report['applied']), 'Screenshot story has a conflict; stop for review'
    assert [r['story_id'] for r in output['stories']] == [r['story_id'] for r in current_store['stories']]
    for record in output['stories']:
        if record['story_id'] not in {r['story_id'] for r in report['applied']}:
            assert record == current[record['story_id']], 'Unrelated record changed'
    merge = subprocess.run(['git', 'merge', '--no-commit', '--no-ff', current_ref], check=False)
    unresolved = git('diff', '--name-only', '--diff-filter=U').decode().splitlines()
    def generated(name):
        return name in {'assets/search/search-index.json', 'public/data/woek-search-meta.json', 'content/taxonomy/site-map.json', 'sitemap.xml'} or name.startswith('wirkungsticker/quellen/') and name.endswith('/index.html')
    if merge.returncode and not unresolved:
        raise SystemExit('Merge failed before conflict resolution')
    for name in unresolved:
        if name != FILE:
            assert generated(name), 'Unhandled source conflict: ' + name
            subprocess.run(['git', 'restore', '--source=' + current_ref, '--staged', '--worktree', '--', name], check=True)
    Path(FILE).write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n')
    subprocess.run(['git', 'add', '--', FILE], check=True)
    assert not git('diff', '--name-only', '--diff-filter=U').strip()
    report['story_count'] = len(output['stories'])
    report['canonical_sha256'] = hashlib.sha256(Path(FILE).read_bytes()).hexdigest()
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False, indent=2))

def verify():
    report = json.loads(REPORT.read_text())
    assert hashlib.sha256(Path(FILE).read_bytes()).hexdigest() == report['canonical_sha256'], 'Build changed canonical data'
    feeds = [json.loads(p.read_text()) for p in Path('wirkungsticker/data/app/feeds').glob('news-*.json')]
    fragments = [item for feed in feeds for item in feed['items']]
    for row in report['applied']:
        slug = row['slug']
        assert re.fullmatch('[a-z0-9-]+', slug)
        html = Path('wirkungsticker', slug, 'index.html').read_text()
        assert len(re.findall(r'data-magnitude="[0-5]"', html)) >= 3, row['story_id']
        matches = [item for item in fragments if item['url'] == '/wirkungsticker/' + slug + '/']
        assert matches, 'No feed card: ' + slug
        for card in matches:
            assert len(re.findall(r'data-magnitude="[0-5]"', card['html'])) >= 3, 'Incomplete feed card: ' + slug
            assert 'data-path-status="insufficient_basis"' not in card['html'], 'Old null profile in feed'
            detail = json.loads(Path('wirkungsticker/data/app/items', card['id'] + '.json').read_text())
            assert len(re.findall(r'data-magnitude="[0-5]"', detail['html'])) >= 3, 'Incomplete saved-card item'
    report['public_surfaces_verified'] = ['article HTML', 'all applicable news feed fragments', 'bookmark item HTML']
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print('PASS: article, news pagination/filter feeds and bookmark items, with unchanged canonical profiles')

if __name__ == '__main__':
    verify() if '--verify' in sys.argv else prepare()
