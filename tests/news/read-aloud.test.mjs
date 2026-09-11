import test from 'node:test';
import assert from 'node:assert/strict';
import {splitSpeech, localVoices, SpeechReader} from '../../assets/js/read-aloud.js';
function setup() {
  const calls = [], synth = {cancel(){calls.push('cancel');},resume(){},speak(u){calls.push(u);}};
  const reader = new SpeechReader({synth,Utterance:class {constructor(text){this.text=text;}}});
  const voice = {name:'Deutsch',lang:'de-DE',localService:true};
  return {reader,calls,voice, spoken:()=>calls.filter(x=>typeof x==='object')};
}
test('long passages retain the entire text and bound each utterance',()=>{
  const source='Europa braucht verlässliche Partner. '+('Eine lange Aussage mit Zahlen 139,6 Milliarden Euro und Bedingungen. '.repeat(100));
  const parts=splitSpeech(source);assert.ok(parts.length>10);assert.ok(parts.every(x=>x.length<=240));assert.equal(parts.join(' '),source.trim());
  assert.equal(splitSpeech('x'.repeat(700)).join(''),'x'.repeat(700));
});
test('only explicitly local voices in the document language are selected',()=>{
  const voices=[{name:'Remote',lang:'de-DE',localService:false},{name:'English',lang:'en-US',localService:true},{name:'German',lang:'de-DE',localService:true},{name:'Unknown',lang:'de-DE'},{name:'Default',lang:'de_AT',localService:true,default:true}];
  assert.deepEqual(localVoices(voices,'de-DE').map(v=>v.name),['Default','German']);
  assert.deepEqual(localVoices([], 'de'),[]);
});
test('never starts without an explicit local voice',()=>{const s=setup();assert.throws(()=>s.reader.start([{text:'Hallo'}],{localService:false}),/LOCAL_VOICE_REQUIRED/);assert.equal(s.spoken().length,0);});
test('pause stops immediately and resume replays only the current short passage',()=>{
  const s=setup();s.reader.start([{text:'Erster Absatz.'},{text:'Zweiter Absatz.'}],s.voice);
  const first=s.spoken()[0];s.reader.pause();assert.equal(s.reader.state,'paused');first.onend();assert.equal(s.spoken().length,1);
  s.reader.resume();assert.equal(s.spoken()[1].text,'Erster Absatz.');s.spoken()[1].onend();assert.equal(s.spoken()[2].text,'Zweiter Absatz.');
});
test('stop and restart ignore late callbacks from the earlier session',()=>{
  const s=setup();s.reader.start([{text:'Alt.'}],s.voice);const old=s.spoken()[0];s.reader.stop();s.reader.start([{text:'Neu.'}],s.voice);old.onerror({error:'interrupted'});old.onend();assert.equal(s.reader.state,'playing');assert.equal(s.reader.index,0);s.spoken().at(-1).onend();assert.equal(s.reader.state,'finished');
});
test('next skips the remainder of a long paragraph, including when paused',()=>{
  const s=setup();s.reader.start([{text:'Langer Absatz. '.repeat(100)},{text:'Nächster Absatz.'}],s.voice);s.reader.pause();s.reader.next();assert.equal(s.reader.state,'paused');s.reader.resume();assert.equal(s.spoken().at(-1).text,'Nächster Absatz.');s.reader.next();assert.equal(s.reader.state,'finished');
});
test('speed changes keep position and ignore the cancelled event',()=>{
  const s=setup();s.reader.start([{text:'Text.'}],s.voice);const old=s.spoken()[0];s.reader.setRate(1.2);old.onend();assert.equal(s.reader.index,0);assert.equal(s.spoken().at(-1).rate,1.2);
});
test('speech errors stop the reader without remote fallback',()=>{
  const s=setup();s.reader.start([{text:'Text.'}],s.voice);s.spoken()[0].onerror({error:'voice-unavailable'});assert.equal(s.reader.state,'error');assert.equal(s.spoken().length,1);
});
