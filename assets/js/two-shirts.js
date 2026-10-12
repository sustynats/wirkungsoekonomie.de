(function(){
 'use strict';
 const d=JSON.parse(document.querySelector('#example-data').textContent),p=d.demo_policy,c=WoekShirtDemo,f=p.fund;
 const euro=n=>n.toLocaleString('de-DE',{style:'currency',currency:'EUR'});
 const el=id=>document.getElementById(id),set=(id,t)=>{if(el(id))el(id).textContent=t;};
 const ids=['rate','quantity-a','quantity-b','reserve','admin-cost','other-funds','pass-through','profile-ready','route','redline'];
 function fraction(id){const raw=el(id).value;if(!raw.trim()||!Number.isFinite(Number(raw)))throw new Error('Vollständige Prozentangabe erforderlich.');return Number(raw)/100;}
 function render(){try{
  const blocked=el('redline').checked,ready=el('profile-ready').checked;
  const x=c.fundScenario(d.products,p,{rate:el('rate').value,quantities:[el('quantity-a').value,el('quantity-b').value],reserveFraction:fraction('reserve'),administrationCost:el('admin-cost').value,otherFunds:el('other-funds').value,passThrough:fraction('pass-through'),eligibility:[false,ready&&!blocked]});
  set('rate-value',euro(Number(el('rate').value))+' je kg');set('reserve-value',el('reserve').value+' %');set('pass-through-value',el('pass-through').value+' %');
  for(const [i,id] of ['a','b'].entries())for(const [suffix,key] of [['new','buyerPayment'],['cost','cost'],['levy','levy'],['fund','fundPayment'],['surplus','actualSurplus'],['tax-vat','vatDue']])set(id+'-'+suffix,euro(x.rows[i][key]));
  const b=x.rows[1];for(const [id,key] of [['buyer-b-detail','buyerPayment'],['fund-b-detail','fundPayment'],['seller-b-detail','sellerGross'],['vat-b-detail','vatDue'],['net-b-detail','sellerNet'],['cost-b-detail','cost'],['surplus-b-detail','actualSurplus']])set(id,euro(b[key]));
  set('price-result',(x.rows[0].priceChange>0?'A wird um '+euro(x.rows[0].priceChange)+' teurer.':'A wird hier nicht teurer.')+' '+(b.priceChange<-.005?'B wird um '+euro(-b.priceChange)+' günstiger als B vorher.':'B wird hier nicht günstiger als B vorher.'));
  for(const [id,key] of [['fund-revenue','revenue'],['fund-other','otherFunds'],['fund-admin','administrationCost'],['fund-reserve','reserve'],['fund-paid','paid'],['fund-gap','fundingGap'],['fund-balance','cashBalance']])set(id,euro(x[key]));
  set('fund-status',x.cashGap>0?'Finanzierung offen: '+euro(x.cashGap)+' fehlen schon für Verwaltung und Reservierung.':x.requested===0?'Für diese Einstellungen besteht kein berechtigter Auszahlungsbedarf. Schutzprüfung und Absatz sind gesondert zu prüfen.':x.fundingGap>0?'Budget begrenzt: '+euro(x.fundingGap)+' fehlen zur gewünschten vollen Entlastung. Ausgezahlt werden nur verfügbare Mittel.':'Das Periodenbudget deckt die errechnete Entlastung.');
  set('protection-status',blocked?'Schutzprüfung geschlossen: B erhält keine Fondsentlastung. Zahlung hebt die Schutzverletzung nicht auf.':!ready?'Gesamtprofil offen: B erhält keine Fondsentlastung. Fehlende Daten sind weder neutral noch ein Berechtigungsnachweis.':'B wird für die Fondsrechnung als ausreichend geprüft angenommen. Die Beispieldaten allein belegen das nicht. Eine reale Gesamtbewertung bleibt offen.');
  const route=el('route').value;
  set('route-amount','Im gleichen Lernmodul: A '+euro(c.collectedForRoute(d.products[0],p,el('rate').value,route,false))+', B '+euro(c.collectedForRoute(d.products[1],p,el('rate').value,route,false))+'. Herkunft ändert weder Materialregel noch Fondsbedingungen.');
  const notes={domestic:'Inländische Herstellung: Das Gesetz müsste Erstbereitstellung, Verpflichteten und Auszahlung regeln.','import-input':'Vorprodukte: Vorkettendaten bleiben enthalten; dieselbe Produktbelastung wird nicht zusätzlich auf den Inputimport erhoben.','import-finished':'Fertigproduktimport: Gleichwertige Nachweise und dieselben Fondsbedingungen für vergleichbare Produkte.','intra-eu':'EU-Bezug: Kein fiktiver Zoll. Besteuerung und Förderbedingungen benötigen eine eigene Rechtsprüfung.','direct-sale':'Direktversand: Verantwortlicher und Auszahlungsanspruch müssten gesetzlich bestimmt werden.'};set('route-note',notes[route]);
 }catch(e){
  for(const id of ['a','b'])for(const suffix of ['new','levy','fund','surplus','tax-vat'])set(id+'-'+suffix,'Nicht berechenbar');
  for(const id of ['fund-revenue','fund-other','fund-admin','fund-reserve','fund-paid','fund-gap','fund-balance','buyer-b-detail','fund-b-detail','seller-b-detail','vat-b-detail','net-b-detail','cost-b-detail','surplus-b-detail'])set(id,'Offen');
  set('price-result','Keine Preisbehauptung: vollständige gültige Eingaben erforderlich.');set('fund-status',e.message);
 }}
 for(const id of ids)el(id).addEventListener('input',render);
 el('reset').addEventListener('click',()=>{el('rate').value=p.rate_eur_per_kg;el('quantity-a').value=f.quantities[0];el('quantity-b').value=f.quantities[1];el('reserve').value=f.reserve_fraction*100;el('admin-cost').value=f.administration_cost_eur;el('other-funds').value=f.other_funds_eur;el('pass-through').value=f.pass_through*100;el('profile-ready').checked=f.eligibility_assumed[1];el('redline').checked=false;el('route').value='domestic';render();});
 el('open-all').addEventListener('click',()=>{for(const x of document.querySelectorAll('main details'))x.open=true;});
 el('close-all').addEventListener('click',()=>{for(const x of document.querySelectorAll('main details'))x.open=false;});render();
})();
