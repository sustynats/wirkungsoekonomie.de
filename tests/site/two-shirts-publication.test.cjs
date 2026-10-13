const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const context={module:{exports:{}}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/two-shirts-calculations.js'),'utf8'),context);
const calculation=context.module.exports;
const data=JSON.parse(fs.readFileSync(path.join(root,'content/examples/two-shirts.json'),'utf8'));
const figure=JSON.parse(fs.readFileSync(path.join(root,'content/grundlagen/book-figure-corrections-20261010.json'),'utf8')).entries.find(e=>e.key==='54');

test('published shirt table and financing note use the same common rule as the calculator',()=>{
  const policy=data.demo_policy;
  const fund=policy.fund;
  const scenario=calculation.fundScenario(data.products,policy,{
    rate:policy.rate_eur_per_kg,quantities:fund.quantities,
    reserveFraction:fund.reserve_fraction,administrationCost:fund.administration_cost_eur,
    otherFunds:fund.other_funds_eur,passThrough:fund.pass_through,
    eligibility:fund.eligibility_assumed
  });
  const money=n=>`${n.toFixed(2).replace('.',',')} Euro`;
  const pairs=[
    ['Herstellkosten netto',data.products.map(p=>p.cost_eur)],
    ['Stücküberschuss netto',scenario.rows.map(p=>p.margin)],
    ['Bisheriger Käuferpreis',scenario.rows.map(p=>p.oldGross)],
    ['Zusätzliche Abgabe netto',scenario.rows.map(p=>p.levy)],
    ['Fondsleistung brutto/Stück',scenario.rows.map(p=>p.fundPayment)],
    ['Neuer Käuferpreis',scenario.rows.map(p=>p.buyerPayment)]
  ];
  for(const [label,values] of pairs){
    const row=figure.table.find(r=>r[0]===label);
    assert.ok(row,`Publication row missing: ${label}`);
    assert.deepEqual(row.slice(1),values.map(money),label);
  }
  const recycled=Math.round(data.products[1].recycled_fraction*100);
  assert.ok(figure.note.includes(`B ${recycled} %`),'Book material share differs from calculation');
  for(const [value,label] of [[scenario.revenue,'Fondsaufkommen'],[scenario.reserve,'Reserve'],[scenario.paid,'Auszahlung']]){
    assert.ok(figure.note.includes(`${value} Euro ${label}`),label);
  }
  assert.ok(figure.note.includes(`Entlastungsziel B: ${scenario.requested} Euro`));
  assert.ok(figure.note.includes(`ungedeckt: ${scenario.fundingGap} Euro`));
  assert.equal(scenario.rows[0].cost,data.products[0].cost_eur);
  assert.equal(scenario.rows[1].cost,data.products[1].cost_eur);
  assert.ok(scenario.rows[0].buyerPayment>scenario.rows[0].oldGross);
  assert.ok(scenario.rows[1].buyerPayment<scenario.rows[1].oldGross);
});
