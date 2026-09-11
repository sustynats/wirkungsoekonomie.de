import contextlib
import copy
from datetime import datetime, timedelta, timezone
import hashlib
import io
import json
import os
from pathlib import Path
import sys
import unittest
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts'))
import chatgpt_dropbox_bridge as bridge
import chatgpt_bridge_crypto as crypto
import chatgpt_processor_receipt as receipts
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa


def fixture():
    now = datetime.now(timezone.utc)
    run = 'auto-' + 'a' * 32 + '-' + 'b' * 32
    probe = {'probe_id': 'preflight-' + run, 'test_only': True}
    raw = bridge._serialize_payload(probe)
    digest = hashlib.sha256(raw).hexdigest()
    report = {'report_type': 'processor_preflight', 'run_id': run,
              'context': {'actor': 'chatgpt', 'kind': 'automation', 'context_id': 'test-chat-context', 'automation_id': 'a' * 32, 'shard': 1},
              'scheduled_for': (now - timedelta(minutes=4)).isoformat().replace('+00:00', 'Z'),
              'checked_at': (now - timedelta(minutes=1)).isoformat().replace('+00:00', 'Z'),
              'reads': dict.fromkeys(receipts.FOLDERS, True), 'probe_sha256': digest, 'readback_sha256': digest}
    return report, raw, 'processor-' + run, now


class ReceiptTests(unittest.TestCase):
    def test_immutable_private_destination_and_existing_health_contract(self):
        p, raw, job, now = fixture()
        dest = receipts.validate_report(p, job, now)
        self.assertEqual(dest, receipts.ROOT + '/95_LOGS/processor-preflight-' + p['run_id'] + '.json')
        r = receipts.verified_receipt(p, raw)
        self.assertEqual(r['status'], 'PASS')
        self.assertEqual(r['probe_path'], receipts.ROOT + '/20_OUTPUT_READY/preflight-' + p['run_id'] + '.probe.json')
        self.assertEqual(r['probe_hash'], hashlib.sha256(json.dumps(json.loads(raw), separators=(',', ':')).encode()).hexdigest())

    def test_no_manual_probe_promoted_to_scheduled_worker(self):
        for field, value in [('kind', 'manual'), ('actor', 'codex'), ('shard', True), ('shard', 3), ('automation_id', 'c'*32)]:
            p, _, job, now = fixture(); p['context'][field] = value
            with self.subTest(field=field), self.assertRaises(ValueError): receipts.validate_report(p, job, now)

    def test_future_old_or_pre_schedule_claims_rejected(self):
        for delta in [-1900, 60]:
            p, _, job, now = fixture(); p['checked_at'] = (now + timedelta(seconds=delta)).isoformat().replace('+00:00', 'Z')
            with self.assertRaises(ValueError): receipts.validate_report(p, job, now)
        p, _, job, now = fixture(); p['scheduled_for'] = now.isoformat().replace('+00:00', 'Z')
        with self.assertRaises(ValueError): receipts.validate_report(p, job, now)

    def test_readback_and_all_five_reads_required(self):
        for f in receipts.FOLDERS:
            p, _, job, now = fixture(); p['reads'][f] = False
            with self.assertRaises(ValueError): receipts.validate_report(p, job, now)
        p, _, job, now = fixture(); p['readback_sha256'] = '0'*64
        with self.assertRaises(ValueError): receipts.validate_report(p, job, now)

    def test_foreign_probe_and_tampered_bytes_rejected(self):
        p, raw, _, _ = fixture()
        with self.assertRaises(ValueError): receipts.verified_receipt(p, raw + b' ')
        other = bridge._serialize_payload({'probe_id': 'manual-old-probe', 'test_only': True})
        p['probe_sha256'] = hashlib.sha256(other).hexdigest()
        with self.assertRaises(ValueError): receipts.verified_receipt(p, other)

    def test_cannot_select_arbitrary_log_or_inject_status(self):
        p, _, job, now = fixture(); p['destination'] = '/other'
        with self.assertRaises(ValueError): receipts.validate_report(p, job, now)
        p, _, job, now = fixture(); p['status'] = 'PASS'
        with self.assertRaises(ValueError): receipts.validate_report(p, job, now)
        p, _, job, now = fixture()
        with self.assertRaises(ValueError): receipts.validate_report(p, 'processor-../other', now)

    def test_plaintext_report_is_forbidden(self):
        p, _, job, _ = fixture()
        with self.assertRaises(bridge.BridgeError):
            bridge._validate_envelope({'bridge_version': 1, 'job_id': job, 'destination_filename': job+'.processor.json', 'payload': p})

    def test_real_encrypted_delivery_and_identical_retry(self):
        p, raw, job, _ = fixture()
        key = rsa.generate_private_key(public_exponent=65537, key_size=3072)
        private = key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption())
        public = key.public_key().public_bytes(serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo)
        envelope = crypto.seal(p, job, job+'.processor.json', public)
        expected = bridge._serialize_payload(receipts.verified_receipt(p, raw))
        for existing, downloads in [(False, [raw, None, expected]), (True, [raw, expected])]:
            with mock.patch.dict(os.environ, {'CHATGPT_BRIDGE_PRIVATE_KEY': private.decode()}), mock.patch.object(bridge, '_load_issue_envelope', return_value=envelope), mock.patch.object(bridge, '_dropbox_access_token', return_value='MOCK'), mock.patch.object(bridge, '_download', side_effect=downloads), mock.patch.object(bridge, '_upload') as upload, contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(bridge.main(), 0)
                self.assertEqual(upload.call_count, 0 if existing else 1)
                if not existing:
                    self.assertEqual(upload.call_args.args[1], receipts.ROOT + '/95_LOGS/processor-preflight-' + p['run_id'] + '.json')


if __name__ == '__main__': unittest.main()
