/* Didactic calculation only. No tax assessment and no WÖk tariff adoption. */
(function (root) {
  'use strict';
  function finite(value, name, min=0, max=Infinity) {
    if (!['number','string'].includes(typeof value) || value === '' ||
        (typeof value === 'string' && value.trim() === '') || !Number.isFinite(Number(value))) {
      throw new TypeError(name + ': vollständige Zahl erforderlich');
    }
    const n=Number(value); if(n<min || n>max) throw new RangeError(name + ': außerhalb des Bereichs');
    return n;
  }
  function material(product) {
    const mass=finite(product.mass_kg,'Fasermasse',0.000001);
    const r=finite(product.recycled_fraction,'Rezyklatanteil',0,1);
    return {mass, recycled:mass*r, virgin:mass*(1-r)};
  }
  function levy(product, policy, rate) {
    const m=material(product), a=finite(policy.unlevied_virgin_fraction,'Freianteil',0,1);
    const taxable=Math.max(0,m.virgin-a*m.mass);
    return {taxable_kg:taxable, amount:taxable*finite(rate,'Lernsatz',0,1000)};
  }
  function compare(product, policy, rate, efficiencySaving) {
    const cost=finite(product.cost_eur,'Kosten',0), saving=finite(efficiencySaving,'Einsparung',0,cost);
    const margin=finite(policy.same_margin_eur,'Stücküberschuss',0);
    const vat=finite(policy.vat_rate,'Umsatzsteuer',0,1);
    const l=levy(product,policy,rate);
    const oldNet=cost+margin, newCost=cost-saving, newNet=newCost+l.amount+margin;
    return {oldNet,oldGross:oldNet*(1+vat), cost,newCost,levy:l.amount,taxableKg:l.taxable_kg,
      newNet,newGross:newNet*(1+vat),vatNew:newNet*vat,margin,efficiencySaving:saving};
  }
  function unitSurplus(product, policy, rate, netSellingPrice, efficiencySaving) {
    const q=compare(product,policy,rate,efficiencySaving);
    return finite(netSellingPrice,'Verkaufspreis',0)-q.newCost-q.levy;
  }
  function livingWageScore(covered,total) {
    const n=finite(total,'Beschäftigte',1), c=finite(covered,'Beschäftigte mit Lebenslohn',0,n);
    const p=c/n*100;
    // The selected register snapshot gives integer percentage bands.
    // Do not silently close gaps in the working calibration for fractional percentages.
    if(!Number.isInteger(p)) return {coverage:p,score:null,status:'Kalibrierung für Nachkommastellen offen'};
    const score=p>=95?3:p>=80?2:p>=60?0:p>=40?-2:-3;
    return {coverage:p,score,status:'Unvalidierte Arbeitskalibrierung WOK-S-101, v1.5'};
  }
  function waterPerProduct(p) {
    const w=finite(p.water_withdrawal_ml,'Entnahme'),d=finite(p.water_discharge_ml,'Einleitung',0,w);
    const n=finite(p.batch_units,'Stückzahl',1);
    return (w-d)*1000000/n; // ML -> L; constant storage and no additional flows assumed.
  }
  function sumStages(values) {
    if(!Array.isArray(values)||values.length===0) throw new TypeError('Stufen fehlen');
    return values.reduce((sum,v)=>sum+finite(v,'Stufenwert'),0);
  }
  function collectedForRoute(product,policy,rate,route,previouslyAssessed) {
    const allowed=['domestic','import-input','import-finished','intra-eu','direct-sale'];
    if(!allowed.includes(route)) throw new RangeError('Handelsweg unbekannt');
    if(typeof previouslyAssessed!=='boolean') throw new TypeError('Erhebungsstatus fehlt');
    return previouslyAssessed?0:levy(product,policy,rate).amount;
  }
  function integerBudget(value) {
    if(!Number.isSafeInteger(value)) throw new RangeError('Geldbetrag ist nicht centgenau darstellbar');
    return value;
  }
  function cents(value) { return integerBudget(Math.round((value + Number.EPSILON) * 100)); }
  // A teaching proposal, not a register calibration or a tax entitlement.
  // A price-linked fund payment is third-party consideration. VAT is calculated
  // on buyer payment + fund payment, never on a fictitiously reduced net price.
  function fundScenario(products,policy,{rate,quantities,reserveFraction,administrationCost,
    otherFunds,passThrough,eligibility}={}) {
    if(!Array.isArray(products)||!products.length) throw new TypeError('Produkte fehlen');
    if(!Array.isArray(quantities)||quantities.length!==products.length ||
       !Array.isArray(eligibility)||eligibility.length!==products.length) throw new TypeError('Absatz und Schutzprüfung fehlen');
    const q=quantities.map(x=>{const n=finite(x,'Absatz',0,1000000);if(!Number.isInteger(n)) throw new RangeError('Absatz muss ganzzahlig sein');return n;});
    if(eligibility.some(x=>typeof x!=='boolean')) throw new TypeError('Entlastungsberechtigung muss ausdrücklich geprüft sein');
    const rho=finite(reserveFraction,'Reservierter Anteil',0,1);
    const admin=cents(finite(administrationCost,'Verwaltungskosten'));
    const external=cents(finite(otherFunds,'Weitere verfügbare Mittel'));
    const share=finite(passThrough,'Preisweitergabe',0,1);
    const r=finite(rate,'Lernsatz',0,1000),vat=finite(policy.vat_rate,'Umsatzsteuer',0,1);
    const base=products.map(p=>compare(p,policy,r,0));
    const revenue=base.reduce((s,p,i)=>integerBudget(s+integerBudget(cents(p.levy)*q[i])),0);
    const reserve=Math.floor(revenue*rho);
    const grossCash=integerBudget(revenue+external);
    const committed=integerBudget(admin+reserve);
    const available=Math.max(0,integerBudget(integerBudget(grossCash-reserve)-admin));
    // Same material rule for every eligible product. No product-specific price target.
    const requested=products.map((p,i)=>eligibility[i]?Math.min(cents(material(p).recycled*r),cents(base[i].newGross)):0);
    const demand=requested.reduce((s,v,i)=>integerBudget(s+integerBudget(v*q[i])),0);
    const fundingShare=demand===0?0:Math.min(1,available/demand);
    const rows=base.map((p,i)=>{
      const fundCents=Math.floor(requested[i]*fundingShare+1e-8);
      const reductionCents=Math.floor(fundCents*share+1e-8);
      const fundPayment=fundCents/100,passedRelief=reductionCents/100;
      const buyerPayment=(cents(p.newGross)-reductionCents)/100;
      const sellerGross=buyerPayment+fundPayment;
      const sellerNet=sellerGross/(1+vat),vatDue=sellerGross-sellerNet;
      return {...p,id:products[i].id,quantity:q[i],eligible:eligibility[i],requestedRelief:requested[i]/100,
        fundPayment,passedRelief,buyerPayment,sellerGross,sellerNet,vatDue,
        actualSurplus:sellerNet-p.levy-p.cost,priceChange:buyerPayment-p.oldGross};
    });
    const paid=rows.reduce((s,p)=>integerBudget(s+integerBudget(cents(p.fundPayment)*p.quantity)),0);
    return {rows,revenue:revenue/100,reserve:reserve/100,administrationCost:admin/100,
      otherFunds:external/100,available:available/100,requested:demand/100,paid:paid/100,
      fundingGap:Math.max(0,demand-available)/100,
      cashGap:Math.max(0,integerBudget(committed-grossCash))/100,
      cashBalance:(revenue+external-admin-paid)/100,
      unallocated:Math.max(0,available-paid)/100,
      status:committed>grossCash?'financing-open':demand>available?'budget-limited':'funded'};
  }
  const api={finite,material,levy,compare,unitSurplus,livingWageScore,waterPerProduct,sumStages,collectedForRoute,fundScenario};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  root.WoekShirtDemo=api;
})(typeof globalThis!=='undefined'?globalThis:this);
