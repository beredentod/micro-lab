import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve, curveY } from './model.js';
const close = (a,b) => assert.ok(Math.abs(a-b) < 1e-8 * Math.max(1,Math.abs(b)), `${a} != ${b}`);
test('known default optimum and 100% tax', () => {
  const s={p1:2,p2:3,income:120,tax:0,alpha:.5};
  const a=solve(s), b=solve({...s,tax:1});
  close(a.x1,30);close(a.x2,20);close(a.utility,Math.sqrt(600));
  close(b.x1,15);close(b.x2,20);close(b.utility,Math.sqrt(300));
});
test('budget exhaustion, tangency, and global optimality along the budget', () => {
  for(const alpha of [.05,.3,.5,.8,.95]) for(const tax of [0,.25,1]) {
    const s={p1:7,p2:3,income:213,alpha,tax}, m=solve(s);
    close(m.price1*m.x1+s.p2*m.x2,s.income);
    close(alpha/(1-alpha)*m.x2/m.x1,m.price1/s.p2);
    close(curveY(m.x1,m.utility,alpha),m.x2);
    for(let i=1;i<100;i++) {
      const x=m.intercept1*i/100, y=(s.income-m.price1*x)/s.p2;
      assert.ok(x**alpha*y**(1-alpha)<=m.utility+1e-9);
    }
  }
});
test('rejects invalid inputs and handles supported scale extremes', () => {
  const s={p1:2,p2:3,income:120,tax:0,alpha:.5};
  for(const patch of [{p1:0},{p2:-1},{income:NaN},{tax:1.1},{alpha:1}]) assert.throws(()=>solve({...s,...patch}),RangeError);
  for(const alpha of [.05,.95]) {
    const m=solve({p1:.01,p2:1e6,income:.01,tax:1,alpha});
    assert.ok(Number.isFinite(m.utility) && m.utility>0);
  }
});

import { compare } from './model.js';
test('equal revenue is collected on post-tax consumption',()=>{
 const c=compare({p1:2,p2:3,income:120,tax:1,alpha:.5});
 close(c.revenue,30);close(c.netIncome,90);close(c.lump.x1,22.5);close(c.lump.x2,15);
 close(c.lump.utility,Math.sqrt(337.5));
});
test('budget-tax accounting and utility curves for the full tax range',()=>{
 for(const alpha of [.05,.3,.5,.8,.95])for(const income of [.01,120,1e6]){
  const s={p1:2,p2:3,income,tax:0,alpha},base=solve(s);
  for(let i=0;i<=100;i++){
   const tax=i/100,c=compare({...s,tax});
   close(c.revenue,alpha*income*tax/(1+tax));
   close(2*c.lump.x1+3*c.lump.x2+c.revenue,income);
   close(c.vat.utility,base.utility/(1+tax)**alpha);
   close(c.lump.utility,base.utility*(1-alpha*tax/(1+tax)));
   assert.ok(c.lump.utility>=c.vat.utility-1e-9);
   if(i===0)close(c.lump.utility,c.vat.utility);
  }
 }
});

import {utility,MODELS} from './model.js';
test('all utility families: budget, global choice, and equal-revenue welfare',()=>{
 for(const model of MODELS)for(const sigma of [.1,.7,1,2,10])for(const alpha of [.1,.5,.9])for(const tax of [0,.4,1]){
 const s={p1:2,p2:3,income:120,model,sigma,alpha,tax},c=compare(s);
 close(c.vat.price1*c.vat.x1+3*c.vat.x2,120);
 close(2*c.lump.x1+3*c.lump.x2+c.revenue,120);
 assert.ok(c.lump.utility>=c.vat.utility-1e-7);
 for(let i=0;i<=100;i++){const x=c.vat.intercept1*i/100,y=Math.max(0,(120-c.vat.price1*x)/3);assert.ok(utility(x,y,s)<=c.vat.utility+1e-7,JSON.stringify(s));}
 if(model==='leontief'){close(c.vat.x1,c.lump.x1);close(c.vat.x2,c.lump.x2);}
 if(model==='ces'&&sigma===1){const cd=solve({...s,model:'cd'});close(c.vat.utility,cd.utility);close(c.vat.x1,cd.x1);}
 }
});
test('substitutes tie convention and corner switch',()=>{
 const s={model:'substitutes',alpha:.5,p1:2,p2:3,income:120,tax:.5};
 const tie=solve(s);assert.equal(tie.tie,true);close(tie.x1,20);close(tie.x2,20);
 close(solve({...s,tax:.49}).x2,0);close(solve({...s,tax:.51}).x1,0);
});

import {decompose} from './model.js';
test('independent weights and Hicks decomposition across all models',()=>{
 for(const model of MODELS)for(const [alpha,beta] of [[.3,.7],[1.2,.4],[2,2],[.05,2]])for(const sigma of [.1,1,2,10])for(const tax of [0,.5,1]){
 const s={model,alpha,beta,sigma,tax,p1:2,p2:3,income:120},d=decompose(s),h=d.vatEffects.h;
 close(h.utility,d.original.utility);
 close(d.vat.price1*h.x1+3*h.x2,d.vatEffects.compensatedIncome);
 for(const [e,end] of [[d.vatEffects,d.vat],[d.lumpEffects,d.lump]])for(let i=0;i<2;i++)close(e.substitution[i]+e.income[i],end['x'+(i+1)]-d.original['x'+(i+1)]);
 assert.ok(d.lump.utility>=d.vat.utility-1e-7);
 assert.ok(d.vatEffects.substitution[0]<=1e-7);
 if(model==='leontief')d.vatEffects.substitution.forEach(v=>close(v,0));
 if(model==='cd')close(d.vat.x1,alpha/(alpha+beta)*120/(2*(1+tax)));
 if(model==='ces'&&sigma===1){const cd=solve({...s,model:'cd'});close(d.vat.x1,cd.x1);close(d.vat.x2,cd.x2);}
 for(let i=0;i<=50;i++){const x=d.vat.intercept1*i/50,y=Math.max(0,(120-d.vat.price1*x)/3);assert.ok(utility(x,y,s)<=d.vat.utility+1e-7);}
 if(model!=='leontief'&&h.x1>0&&h.x2>0)close(curveY(h.x1,h.utility,s),h.x2);
 }
});
