"""Validate native worker attestations before mirroring them to private logs.

This verifies transport evidence, not the ChatGPT scheduler's identity. Activation
still requires an independently observed scheduled run. A server probe alone
never becomes a worker capability receipt.
"""
from datetime import datetime, timezone
import hashlib
import json
import re

ROOT = '/WOEK/WIRKUNGSTICKER-CHATGPT-BRIDGE'
FOLDERS = ('98_CONFIG', '00_INBOX', '10_CLAIMED', '20_OUTPUT_READY', '30_ACK')
VERSION = '2026-09-11-2'
MAX_READBACK_AGE_SECONDS = 1800
# Scheduler delay is not the age of the capability observation. A native run
# may start late; its own probe/readback still has to be fresh and verified.
MAX_SCHEDULE_DELAY_SECONDS = 5400


def timestamp(value):
    if not isinstance(value, str) or not re.fullmatch(r'\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,6})?Z', value):
        raise ValueError('PROCESSOR_TIME_INVALID')
    return datetime.fromisoformat(value.replace('Z', '+00:00'))


def validate_report(payload, job, now=None):
    required = {'report_type', 'run_id', 'context', 'scheduled_for', 'checked_at', 'reads', 'probe_sha256', 'readback_sha256'}
    if not isinstance(payload, dict) or set(payload) != required or payload['report_type'] != 'processor_preflight':
        raise ValueError('PROCESSOR_REPORT_INVALID')
    context = payload['context']
    if not isinstance(context, dict) or set(context) != {'actor', 'kind', 'context_id', 'automation_id', 'shard'}:
        raise ValueError('PROCESSOR_CONTEXT_INVALID')
    if context['actor'] != 'chatgpt' or context['kind'] != 'automation' or type(context['shard']) is not int or context['shard'] not in (0, 1, 2):
        raise ValueError('PROCESSOR_AUTOMATION_REQUIRED')
    if not re.fullmatch(r'[a-f0-9]{32}', str(context['automation_id'])) or not re.fullmatch(r'[A-Za-z0-9_-]{8,100}', str(context['context_id'])):
        raise ValueError('PROCESSOR_CONTEXT_INVALID')
    run = payload['run_id']
    if not isinstance(run, str) or not re.fullmatch('auto-' + context['automation_id'] + r'-[a-f0-9]{32}', run) or job != 'processor-' + run:
        raise ValueError('PROCESSOR_RUN_BINDING_INVALID')
    checked, scheduled = timestamp(payload['checked_at']), timestamp(payload['scheduled_for'])
    now = now or datetime.now(timezone.utc)
    if (not scheduled <= checked <= now
            or (now - checked).total_seconds() > MAX_READBACK_AGE_SECONDS
            or (checked - scheduled).total_seconds() > MAX_SCHEDULE_DELAY_SECONDS):
        raise ValueError('PROCESSOR_STALE_OR_PREMATURE')
    if not isinstance(payload['reads'], dict) or set(payload['reads']) != set(FOLDERS) or any(payload['reads'][f] is not True for f in FOLDERS):
        raise ValueError('PROCESSOR_READS_INCOMPLETE')
    digest = payload['probe_sha256']
    if not isinstance(digest, str) or not re.fullmatch(r'[a-f0-9]{64}', digest) or payload['readback_sha256'] != digest:
        raise ValueError('PROCESSOR_READBACK_INVALID')
    return f'{ROOT}/95_LOGS/processor-preflight-{run}.json'


def verified_receipt(payload, raw):
    """Compare the worker's readback digest with the actual immutable probe."""
    probe_id = 'preflight-' + payload['run_id']
    if raw is None or hashlib.sha256(raw).hexdigest() != payload['probe_sha256']:
        raise ValueError('PROCESSOR_PROBE_DIGEST_MISMATCH')
    probe = json.loads(raw)
    if probe != {'probe_id': probe_id, 'test_only': True} or type(probe['test_only']) is not bool:
        raise ValueError('PROCESSOR_PROBE_BINDING_INVALID')
    # Compatible with contract.mjs hash(JSON.parse(probe)), preserving key order.
    parsed_hash = hashlib.sha256(json.dumps(probe, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
    return {'version': VERSION, 'context': payload['context'], 'shard': payload['context']['shard'],
            'run_id': payload['run_id'], 'checked_at': payload['checked_at'], 'scheduled_for': payload['scheduled_for'],
            'status': 'PASS', 'reads': payload['reads'], 'dropbox_read_ok': True, 'dropbox_write_ok': True,
            'probe_path': f'{ROOT}/20_OUTPUT_READY/{probe_id}.probe.json', 'probe_hash': parsed_hash,
            'probe_sha256': payload['probe_sha256'], 'worker_attestation': True, 'server_verified_probe': True}
