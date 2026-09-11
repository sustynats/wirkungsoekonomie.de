import base64
import contextlib
import copy
import io
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts'))
import chatgpt_dropbox_bridge as bridge
import chatgpt_bridge_crypto as crypto
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

def probe():
    job = 'preflight-test-001'
    return {'bridge_version':1,'job_id':job,'destination_filename':job+'.probe.json','payload':{'probe_id':job,'test_only':True}}

class BridgeTests(unittest.TestCase):
    def test_valid_probe_and_unicode(self):
        self.assertEqual(bridge._validate_envelope(probe())[0], probe()['job_id'])
        self.assertIn('Ö'.encode(), bridge._serialize_payload({'title':'Ökonomie'}))

    def test_invalid_envelopes(self):
        for patch in [{'destination_filename':'../outside.json'}, {'destination_filename':'other.probe.json'}, {'bridge_version':True}, {'bridge_version':9}, {'extra':True}, {'payload':{'text':'Private draft'}}, {'destination_filename':probe()['job_id']+'.output.json'}]:
            with self.subTest(patch=patch), self.assertRaises(bridge.BridgeError):
                bridge._validate_envelope(probe() | patch)

    def test_strict_json_limits(self):
        for value in [{'x':float('nan')},{'x':'z'*256001}]:
            with self.assertRaises(bridge.BridgeError): bridge._serialize_payload(value)

    def delivery(self, values, upload_error=None):
        stack = contextlib.ExitStack()
        self.addCleanup(stack.close)
        stack.enter_context(mock.patch.object(bridge,'_load_issue_envelope',return_value=probe()))
        stack.enter_context(mock.patch.object(bridge,'_dropbox_access_token',return_value='MOCK'))
        download=stack.enter_context(mock.patch.object(bridge,'_download',side_effect=values))
        upload=stack.enter_context(mock.patch.object(bridge,'_upload',side_effect=upload_error))
        stack.enter_context(contextlib.redirect_stdout(io.StringIO()))
        stack.enter_context(contextlib.redirect_stderr(io.StringIO()))
        return upload,download

    def test_identical_retry_does_not_write(self):
        upload,_=self.delivery([bridge._serialize_payload(probe()['payload'])])
        self.assertEqual(bridge.main(),0)
        upload.assert_not_called()

    def test_conflicting_existing_output_never_overwritten(self):
        upload,_=self.delivery([b'old bytes'])
        self.assertEqual(bridge.main(),1)
        upload.assert_not_called()

    def test_write_then_exact_readback(self):
        data=bridge._serialize_payload(probe()['payload'])
        upload,_=self.delivery([None,data])
        self.assertEqual(bridge.main(),0)
        upload.assert_called_once()

    def test_readback_mismatch_fails(self):
        self.delivery([None,b'wrong bytes'])
        self.assertEqual(bridge.main(),1)

    def test_racing_identical_upload_is_idempotent(self):
        data=bridge._serialize_payload(probe()['payload'])
        self.delivery([None,data,data],bridge.BridgeError('conflict'))
        self.assertEqual(bridge.main(),0)

    def test_racing_different_upload_is_rejected(self):
        self.delivery([None,b'other'],bridge.BridgeError('conflict'))
        self.assertEqual(bridge.main(),1)

    def test_dropbox_write_is_atomic_add(self):
        with mock.patch.object(bridge,'_request',return_value=(200,b'{}')) as request:
            bridge._upload('MOCK','/target',b'{}')
            args=json.loads(request.call_args.kwargs['headers']['Dropbox-API-Arg'])
            self.assertEqual(args['mode'],'add')
            self.assertIs(args['strict_conflict'],True)
            self.assertIs(args['autorename'],False)

    def issue_context(self, author='maintainer', sender='maintainer', permission='write'):
        stack=contextlib.ExitStack(); self.addCleanup(stack.close)
        temp=stack.enter_context(tempfile.TemporaryDirectory())
        event={'action':'opened','repository':{'full_name':'owner/repo'},'sender':{'login':sender},'issue':{'title':'[CHATGPT-BRIDGE] '+probe()['job_id'],'user':{'login':author},'body':json.dumps(probe())}}
        p=Path(temp)/'event.json'; p.write_text(json.dumps(event))
        stack.enter_context(mock.patch.dict(os.environ,{'GITHUB_EVENT_PATH':str(p),'GITHUB_REPOSITORY':'owner/repo','GITHUB_ACTOR':sender,'GH_TOKEN':'MOCK'}))
        api=stack.enter_context(mock.patch.object(bridge,'_request',return_value=(200,json.dumps({'permission':permission}).encode())))
        return event,p,api

    def test_untrusted_public_issue_rejected_before_dropbox_token(self):
        self.issue_context('outsider','outsider','read')
        with mock.patch.object(bridge,'_dropbox_access_token') as token, contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(bridge.main(),1)
            token.assert_not_called()

    def test_permission_check_covers_sender_and_author(self):
        _,_,api=self.issue_context('author','sender')
        bridge._load_issue_envelope()
        self.assertEqual(len(api.call_args_list),2)

    def test_permission_api_failure_is_closed(self):
        _,_,api=self.issue_context(); api.side_effect=bridge.BridgeError('HTTP 403')
        with self.assertRaises(bridge.BridgeError): bridge._load_issue_envelope()

    def test_title_must_bind_job(self):
        event,path,_=self.issue_context()
        event['issue']['title']='[CHATGPT-BRIDGE] other'; path.write_text(json.dumps(event))
        with self.assertRaises(bridge.BridgeError): bridge._load_issue_envelope()

class EncryptionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.key=rsa.generate_private_key(public_exponent=65537,key_size=3072)
        cls.private=cls.key.private_bytes(serialization.Encoding.PEM,serialization.PrivateFormat.PKCS8,serialization.NoEncryption())
        cls.public=cls.key.public_key().public_bytes(serialization.Encoding.PEM,serialization.PublicFormat.SubjectPublicKeyInfo)

    def sealed(self):
        self.payload={'job_id':'wt_20260911T000000Z_'+'a'*24,'input_hash':'b'*64,'private_editorial_note':'Only the editorial team should read this.'}
        return crypto.seal(self.payload,self.payload['job_id'],self.payload['job_id']+'.output.json',self.public)

    def test_private_payload_roundtrip_and_no_plaintext(self):
        e=self.sealed()
        self.assertNotIn(self.payload['private_editorial_note'],json.dumps(e))
        self.assertEqual(crypto.unseal(e,self.private),self.payload)
        with mock.patch.dict(os.environ,{'CHATGPT_BRIDGE_PRIVATE_KEY':self.private.decode()}):
            self.assertEqual(bridge._validate_envelope(e)[2],self.payload)

    def test_each_delivery_has_new_key_and_nonce(self):
        a,b=self.sealed(),self.sealed()
        self.assertNotEqual(a['sealed_payload']['nonce'],b['sealed_payload']['nonce'])
        self.assertNotEqual(a['sealed_payload']['wrapped_key'],b['sealed_payload']['wrapped_key'])

    def test_tampering_and_destination_changes_rejected(self):
        e=self.sealed()
        altered=[]
        a=copy.deepcopy(e); a['job_id']='other'; altered.append(a)
        a=copy.deepcopy(e); a['destination_filename']='other.output.json'; altered.append(a)
        a=copy.deepcopy(e); a['sealed_payload']['ciphertext']='AAAA'; altered.append(a)
        a=copy.deepcopy(e); a['sealed_payload']['key_id']='invalid'; altered.append(a)
        for a in altered:
            with self.assertRaises(ValueError): crypto.unseal(a,self.private)

    def test_output_requires_claim_and_matching_hash(self):
        e=self.sealed(); data=bridge._serialize_payload(self.payload)
        with mock.patch.dict(os.environ,{'CHATGPT_BRIDGE_PRIVATE_KEY':self.private.decode()}), mock.patch.object(bridge,'_load_issue_envelope',return_value=e), mock.patch.object(bridge,'_dropbox_access_token',return_value='MOCK'), mock.patch.object(bridge,'_download',side_effect=[None,None,None,None,None,json.dumps({'job_id':e['job_id'],'input_hash':'x'*64}).encode()]), mock.patch.object(bridge,'_upload') as upload, contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(bridge.main(),1)
            upload.assert_not_called()

    def test_acknowledged_job_is_not_written(self):
        e=self.sealed()
        with mock.patch.dict(os.environ,{'CHATGPT_BRIDGE_PRIVATE_KEY':self.private.decode()}), mock.patch.object(bridge,'_load_issue_envelope',return_value=e), mock.patch.object(bridge,'_dropbox_access_token',return_value='MOCK'), mock.patch.object(bridge,'_download',side_effect=[None,None,None,None,None,json.dumps(self.payload).encode(),b'ACK']), mock.patch.object(bridge,'_upload') as upload, contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(bridge.main(),1)
            upload.assert_not_called()

    def test_complete_claimed_output_can_be_delivered(self):
        e=self.sealed(); data=bridge._serialize_payload(self.payload)
        with mock.patch.dict(os.environ,{'CHATGPT_BRIDGE_PRIVATE_KEY':self.private.decode()}), mock.patch.object(bridge,'_load_issue_envelope',return_value=e), mock.patch.object(bridge,'_dropbox_access_token',return_value='MOCK'), mock.patch.object(bridge,'_download',side_effect=[None,None,None,None,None,json.dumps(self.payload).encode(),None,data]), mock.patch.object(bridge,'_upload') as upload, contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(bridge.main(),0)
            upload.assert_called_once()

class RepairClaimTests(unittest.TestCase):
    job_id = 'wt_20260911T000000Z_' + 'c' * 24
    input_hash = 'd' * 64

    def check(self, files):
        root = bridge.DROPBOX_OUTPUT_DIR.removesuffix('/20_OUTPUT_READY')
        def download(token, path, *, allow_missing):
            key = path.removeprefix(root + '/')
            if key not in files:
                if allow_missing:
                    return None
                raise bridge.BridgeError('missing claimed input')
            return json.dumps(files[key]).encode()
        with mock.patch.object(bridge, '_download', side_effect=download):
            bridge._validate_claimed_output('MOCK', self.job_id,
                {'job_id': self.job_id, 'input_hash': self.input_hash})

    def repair(self, attempt):
        return {'job_id': self.job_id, 'input_hash': self.input_hash,
                'job_type': 'correction', 'correction_attempt': attempt,
                'original_input': {'job_id': self.job_id, 'input_hash': self.input_hash}}

    def test_repair_only_claim_is_sufficient(self):
        for attempt in (1, 2):
            with self.subTest(attempt=attempt):
                self.check({f'10_CLAIMED/{self.job_id}.repair-{attempt}.json': self.repair(attempt)})

    def test_pending_newer_repair_blocks_original_and_older_claim(self):
        for old_name, old in [('input', self.repair(1)['original_input']), ('repair-1', self.repair(1))]:
            with self.subTest(old=old_name), self.assertRaisesRegex(bridge.BridgeError, 'not been claimed'):
                self.check({f'10_CLAIMED/{self.job_id}.{old_name}.json': old,
                    f'00_INBOX/{self.job_id}.repair-2.json': self.repair(2)})

    def test_newer_invalid_claim_cannot_fall_back_to_old_valid_claim(self):
        bad = self.repair(2); bad['original_input']['input_hash'] = 'e' * 64
        with self.assertRaisesRegex(bridge.BridgeError, 'lineage'):
            self.check({f'10_CLAIMED/{self.job_id}.repair-2.json': bad,
                f'10_CLAIMED/{self.job_id}.input.json': self.repair(1)['original_input']})

    def test_repair_metadata_and_job_are_bound(self):
        for patch in [{'correction_attempt': 1}, {'correction_attempt': True},
                      {'job_type': 'new_story'}, {'job_id': 'other'}, {'input_hash': 'e' * 64}]:
            with self.subTest(patch=patch), self.assertRaises(bridge.BridgeError):
                self.check({f'10_CLAIMED/{self.job_id}.repair-2.json': self.repair(2) | patch})

    def test_ack_blocks_repaired_output(self):
        with self.assertRaisesRegex(bridge.BridgeError, 'acknowledged'):
            self.check({f'10_CLAIMED/{self.job_id}.repair-2.json': self.repair(2),
                f'30_ACK/{self.job_id}.ack.json': {'status': 'accepted'}})

    def test_missing_claim_is_not_authorized(self):
        with self.assertRaisesRegex(bridge.BridgeError, 'missing claimed input'):
            self.check({})

    def test_limit_matches_correction_protocol(self):
        protocol = (Path(__file__).resolve().parents[2] / 'scripts/news/bridge/corrections.mjs').read_text()
        self.assertIn(f'export const CORRECTION_LIMIT = {bridge.MAX_CORRECTION_ATTEMPTS};', protocol)

if __name__=='__main__': unittest.main()
