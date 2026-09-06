import test from 'node:test';
import assert from 'node:assert/strict';
import { renderIndexStatuses } from '../../assets/js/polls.js';
function card(slug){const label={textContent:'Pausiert'};return{dataset:{pollListSlug:slug},querySelector:()=>label,label};}
test('overview reflects current activation and scheduled/end states instead of the build snapshot',()=>{
  const a=card('city'),b=card('feedback');
  renderIndexStatuses([a,b],[{slug:'city',status:'paused',effective_status:'active'},{slug:'feedback',status:'active'}]);
  assert.equal(a.label.textContent,'Aktiv');assert.equal(b.label.textContent,'Aktiv');
  for(const [state,label] of Object.entries({paused:'Pausiert',scheduled:'Geplant',ended:'Beendet',archived:'Archiviert'})){
    renderIndexStatuses([a],[{slug:'city',effective_status:state}]);assert.equal(a.label.textContent,label);
  }
});
test('overview does not claim a stale active status on API failure or removal',()=>{
  const a=card('city');
  renderIndexStatuses([a],null);assert.equal(a.label.textContent,'Status auf der Umfrageseite prüfen');
  renderIndexStatuses([a],[]);assert.equal(a.label.textContent,'Nicht mehr verfügbar');
  renderIndexStatuses([a],[{slug:'city',effective_status:'<script>alert(1)</script>'}]);
  assert.equal(a.label.textContent,'Nicht mehr verfügbar');
});
