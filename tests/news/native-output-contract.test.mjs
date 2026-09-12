import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { nativeOutputContract, writeNativeOutputContract, NATIVE_TRANSPORT } from '../../scripts/news/bridge/write-native-output-config.mjs';
const previous = {
 output_transport: { type: 'github_issue_encrypted', bridge_version: 2, max_payload_bytes: 256000, public_issue_body: 'encrypted only' },
 probe_transport: { bridge_version: 1, payload: { probe_id:'<job_id>',test_only:true }, additional_payload_fields:false },
 fresh_preflight: Array.from({length:10},(_,n)=>`requirement ${n}`),
 context_modes: { manual:'manual',automation:'actual scheduled occurrence, five reads and server attestation required' },
 editorial_rules:['Natalie final approval required'],queue_rules:['only own shard'],cloud_workers:[{shard:0},{shard:1},{shard:2}],
 processor_preflight_report:{encrypted:true},encoder_python:'preserved encoder',public_key_pem:'preserved public key',
};
const raw=JSON.stringify(previous), hash=createHash('sha256').update(raw).digest('hex');
test('native file transport preserves approvals, ownership, encryption and scheduler attestation',()=>{
 const next=nativeOutputContract(raw,hash);
 assert.equal(next.output_transport.type,'native_dropbox_file_preferred');
 assert.deepEqual(next.output_transport.encrypted_fallback,previous.output_transport);
 for(const key of ['editorial_rules','queue_rules','cloud_workers','processor_preflight_report','encoder_python','public_key_pem'])assert.deepEqual(next[key],previous[key]);
 assert.equal(next.context_modes.automation,previous.context_modes.automation);
 assert.equal(next.probe_transport.additional_payload_fields,false);
 for(const n of [0,1,5,6])assert.equal(next.fresh_preflight[n],previous.fresh_preflight[n]);
 assert.match(next.output_transport.safety_rule,/stops external delivery/);
 assert.match(next.output_transport.fallback_scope,/not to circumvent a safety rejection/);
 assert.deepEqual(JSON.parse(raw),previous);
});
test('changed predecessor never writes new config or a health result',async()=>{
 let writes=0;
 await assert.rejects(writeNativeOutputContract({read:async()=>raw+' ',writeAtomic:async()=>writes++},hash),/PREDECESSOR_CHANGED/);
 assert.equal(writes,0);
});
test('immutable file write requires complete readback and never asserts processor availability',async()=>{
 let stored;
 const transport={read:async p=>p.endsWith(NATIVE_TRANSPORT)?stored:raw,writeAtomic:async(p,c)=>{stored=JSON.stringify(c,null,2)+'\n';}};
 const result=await writeNativeOutputContract(transport,hash);
 assert.equal(result.status,'CONFIG_VERIFIED');assert.equal(result.bytes,Buffer.byteLength(stored));
 assert.equal(result.sha256,createHash('sha256').update(stored).digest('hex'));
 assert.equal(result.processor_health_changed,false);assert.equal(result.processor_available,undefined);
 transport.read=async p=>p.endsWith(NATIVE_TRANSPORT)?stored+' ':raw;
 await assert.rejects(writeNativeOutputContract(transport,hash),/READBACK_MISMATCH/);
});
