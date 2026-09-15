"""One-off release helper for the 13 already researched and independently reviewed
potential corrections from PR #771.

No LLM/provider calls, no new ratings, and no write to main. The helper merges
only the reviewed public edition into the current main snapshot while preserving
newer queue metadata and the immutable original potential assessment.
"""
import copy
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys

BASE = 'a985626602d3deebdd8ae7625bfcd53874b31a77'
PROPOSAL = '6048f1b5336458cae9501088180af01f93409772'
IDS = {
    'wt-8d118596e0a5b188','wt-aa6a91f8546c7299','wt-fb34b1d598b813c7',
    'wt-20282aa68ebd0fa9','wt-9a5ca53dea779f2f','wt-53ce09a75455bdf7',
    'wt-89f8097af783b7e6','wt-b6a1d81a1c4e660b','wt-eb36c70c560b9e5d',
    'wt-bbf462183939f712','wt-e92f362208a8792e','wt-a82ecd0000a14269',
    'wt-e8ec5c7f64053fc8',
}
FILE = 'data/news/stories.json'
MISSING = object()
REPORT = Path(os.environ['RUNNER_TEMP']) / 'potential-release-772.json'
# These fields describe later queue/lifecycle state, not the reviewed published
# article. They may advance while the already-reviewed public edition is being
# recovered and therefore must be kept from current main.
PRESERVE_LIVE_ON_CONFLICT = {'pending_update', 'ai_retry', 'queue_source_repartitions'}
# A retrospective recovery must never rewrite the original forecast snapshot or
# older duplicate/living-file decisions. The impact review does not re-author
# either piece of lifecycle state.
ALWAYS_PRESERVE_LIVE = {'original_potential_assessment', 'living_file'}


def git(*args):
    return subprocess.check_output(['git', *args])


def load(ref):
    return json.loads(git('show', ref + ':' + FILE))


def index(store):
    records = store['stories']
    result = {r['story_id']: r for r in records}
    assert len(result) == len(records), 'Duplicate identities'
    return result


def merge_reviewed_record(old, proposed, live):
    merged, conflicts, preserved = copy.deepcopy(live), [], []
    for field in old.keys() | proposed.keys():
        b, p, c = old.get(field, MISSING), proposed.get(field, MISSING), live.get(field, MISSING)
        if b == p:
            continue
        if field in ALWAYS_PRESERVE_LIVE:
            preserved.append(field)
            continue
        if c != b and c != p:
            if field in PRESERVE_LIVE_ON_CONFLICT:
                preserved.append(field)
                continue
            conflicts.append(field)
            continue
        if p is MISSING:
            merged.pop(field, None)
        else:
            merged[field] = copy.deepcopy(p)
    # Never allow the recovery to change public identity or original date.
    for field in ('story_id', 'slug', 'url', 'published_at'):
        if live.get(field, MISSING) != merged.get(field, MISSING):
            conflicts.append('protected:' + field)
    # Current history may only grow. If the reviewed proposal changes history
    # while current main also changed it, require an explicit reconciliation.
    for field in ('versions', 'impact_history'):
        live_history, merged_history = live.get(field, []), merged.get(field, [])
        if not isinstance(live_history, list) or not isinstance(merged_history, list):
            if live_history != merged_history:
                conflicts.append('history:' + field)
        elif any(row not in merged_history for row in live_history):
            conflicts.append('history:' + field)
    return merged, sorted(set(conflicts)), sorted(set(preserved))


def prepare():
    assert os.environ['GITHUB_REPOSITORY'] == 'sustynats/wirkungsoekonomie.de'
    assert os.environ['GITHUB_REF'] == 'refs/heads/chatgpt/potential-release-build-20260915'
    current_ref = os.environ['CURRENT_MAIN']
    base_store, proposal_store, current_store = load(BASE), load(PROPOSAL), load(current_ref)
    base, proposal, current = map(index, (base_store, proposal_store, current_store))
    output = copy.deepcopy(current_store)
    positions = {r['story_id']: i for i, r in enumerate(output['stories'])}
    report = {'source_pr': 771, 'base': BASE, 'proposal': PROPOSAL, 'current_main': current_ref,
              'provider_calls': 0, 'new_ratings': 0, 'applied': [], 'held': []}
    for key in sorted(IDS):
        assert key in current and key in base and key in proposal, 'Missing reviewed story: ' + key
        merged, conflicts, preserved = merge_reviewed_record(base[key], proposal[key], current[key])
        if conflicts:
            report['held'].append({'story_id': key, 'fields': conflicts, 'preserved': preserved})
            continue
        review = merged.get('impact_semantic_review') or {}
        assessment = merged.get('impact_assessment') or {}
        dimensions = assessment.get('dimensions') or {}
        assert assessment.get('version') == '2.1'
        assert assessment.get('publication_status') == 'ready'
        assert review.get('status') == 'ready' and review.get('review_job_id')
        for dimension in ('human', 'planet', 'democracy'):
            value = dimensions.get(dimension) or {}
            assert value.get('path_status') == 'modelled', f'{key}:{dimension}:not-modelled'
            assert type(value.get('magnitude')) is int and 0 <= value['magnitude'] <= 5, f'{key}:{dimension}:magnitude'
            assert value.get('primary_paths'), f'{key}:{dimension}:path'
        output['stories'][positions[key]] = merged
        report['applied'].append({'story_id': key, 'slug': merged['slug'],
          'review_job_id': review['review_job_id'], 'preserved_live_fields': preserved,
          'magnitudes': {d: dimensions[d]['magnitude'] for d in ('human','planet','democracy')}})
    if report['held']:
        raise SystemExit('Reviewed profiles need explicit conflict resolution: ' + json.dumps(report['held'], ensure_ascii=False))
    assert len(report['applied']) == len(IDS) == 13
    assert any(row['story_id'] == 'wt-aa6a91f8546c7299' for row in report['applied'])
    assert [r['story_id'] for r in output['stories']] == [r['story_id'] for r in current_store['stories']]
    applied = set(IDS)
    for record in output['stories']:
        if record['story_id'] not in applied:
            assert record == current[record['story_id']], 'Unrelated record changed'

    # Bring the exact current main snapshot into the candidate branch first.
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
    assert len(report['applied']) == 13 and not report['held']
    assert report['provider_calls'] == 0 and report['new_ratings'] == 0
    assert hashlib.sha256(Path(FILE).read_bytes()).hexdigest() == report['canonical_sha256'], 'Build changed canonical data'
    feeds = [json.loads(p.read_text()) for p in Path('wirkungsticker/data/app/feeds').glob('news-*.json')]
    fragments = [item for feed in feeds for item in feed['items']]
    for row in report['applied']:
        slug = row['slug']
        assert re.fullmatch('[a-z0-9-]+', slug)
        html = Path('wirkungsticker', slug, 'index.html').read_text()
        assert len(re.findall(r'data-magnitude="[0-5]"', html)) >= 3, row['story_id']
        assert 'data-path-status="insufficient_basis"' not in html, 'Old null profile in article: ' + slug
        matches = [item for item in fragments if item['url'] == '/wirkungsticker/' + slug + '/']
        assert matches, 'No feed card: ' + slug
        for card in matches:
            assert len(re.findall(r'data-magnitude="[0-5]"', card['html'])) >= 3, 'Incomplete feed card: ' + slug
            assert 'data-path-status="insufficient_basis"' not in card['html'], 'Old null profile in feed: ' + slug
            detail = json.loads(Path('wirkungsticker/data/app/items', card['id'] + '.json').read_text())
            assert len(re.findall(r'data-magnitude="[0-5]"', detail['html'])) >= 3, 'Incomplete saved-card item: ' + slug
            assert 'data-path-status="insufficient_basis"' not in detail['html'], 'Old null profile in saved item: ' + slug
    report['public_surfaces_verified'] = ['article HTML', 'all applicable news feed fragments', 'bookmark item HTML']
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print('PASS: 13 already-reviewed profiles on article, news feeds and bookmark items; zero provider calls')


if __name__ == '__main__':
    verify() if '--verify' in sys.argv else prepare()
