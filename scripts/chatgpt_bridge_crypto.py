"""Authenticated, encrypted issue envelopes; no editorial plaintext on GitHub.

Sender CLI: python chatgpt_bridge_crypto.py PUBLIC_KEY_PEM OUTPUT_JSON ISSUE_JSON
Only PUBLIC_KEY_PEM is supplied to the editorial processor.
"""
import base64
import gzip
import hashlib
import io
import json
import os
from pathlib import Path
import sys

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

MAX_PLAINTEXT = 256_000
MAX_ENVELOPE = 60_000
ALGORITHM = 'RSA-OAEP-SHA256+A256GCM'

def aad(job_id, filename, key_id):
    return json.dumps([2, job_id, filename, key_id], separators=(',', ':')).encode()

def key_id(public_key):
    return hashlib.sha256(public_key.public_bytes(serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo)).hexdigest()[:24]

def oaep():
    return padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None)

def seal(payload, job_id, filename, public_pem):
    public = serialization.load_pem_public_key(public_pem)
    if not isinstance(public, rsa.RSAPublicKey) or public.key_size < 3072:
        raise ValueError('Unsupported public key')
    data = (json.dumps(payload, ensure_ascii=False, indent=2, allow_nan=False) + '\n').encode()
    if len(data) > MAX_PLAINTEXT:
        raise ValueError('Output too large')
    kid = key_id(public)
    key, nonce = AESGCM.generate_key(bit_length=256), os.urandom(12)
    encoded = lambda value: base64.b64encode(value).decode('ascii')
    result = {'bridge_version': 2, 'job_id': job_id, 'destination_filename': filename,
              'sealed_payload': {'algorithm': ALGORITHM, 'key_id': kid, 'compression': 'gzip',
                'wrapped_key': encoded(public.encrypt(key, oaep())), 'nonce': encoded(nonce),
                'ciphertext': encoded(AESGCM(key).encrypt(nonce, gzip.compress(data, mtime=0), aad(job_id, filename, kid)))}}
    if len(json.dumps(result).encode()) > MAX_ENVELOPE:
        raise ValueError('Encrypted issue too large')
    return result

def unseal(envelope, private_pem):
    try:
        private = serialization.load_pem_private_key(private_pem, password=None)
        if not isinstance(private, rsa.RSAPrivateKey) or private.key_size < 3072:
            raise ValueError()
        s = envelope['sealed_payload']
        if set(s) != {'algorithm','key_id','compression','wrapped_key','nonce','ciphertext'}:
            raise ValueError()
        if s['algorithm'] != ALGORITHM or s['compression'] != 'gzip' or s['key_id'] != key_id(private.public_key()):
            raise ValueError()
        decoded = lambda name: base64.b64decode(s[name], validate=True)
        nonce = decoded('nonce')
        if len(nonce) != 12:
            raise ValueError()
        key = private.decrypt(decoded('wrapped_key'), oaep())
        compressed = AESGCM(key).decrypt(nonce, decoded('ciphertext'), aad(envelope['job_id'], envelope['destination_filename'], s['key_id']))
        with gzip.GzipFile(fileobj=io.BytesIO(compressed)) as stream:
            data = stream.read(MAX_PLAINTEXT + 1)
        if len(data) > MAX_PLAINTEXT:
            raise ValueError()
        return json.loads(data)
    except Exception:
        # Never echo decrypted bytes or error payloads into public logs.
        raise ValueError('Encrypted payload verification failed') from None

if __name__ == '__main__':
    public, source, destination = map(Path, sys.argv[1:4])
    payload = json.loads(source.read_text())
    report = payload.get('report_type') == 'processor_preflight'
    job = 'processor-' + payload['run_id'] if report else payload.get('job_id') or payload.get('probe_id')
    suffix = '.processor.json' if report else '.output.json' if payload.get('job_id') else '.probe.json'
    result = seal(payload, job, job + suffix, public.read_bytes())
    destination.write_text(json.dumps(result, separators=(',', ':')) + '\n')
    print('Encrypted envelope prepared: ' + destination.name)
