export const MODELS=['cd','ces','leontief','substitutes'];
const beta=s=>s.beta??(1-s.alpha);
const logadd=(x,y)=>{const m=Math.max(x,y);return m+Math.log(Math.exp(x-m)+Math.exp(y-m));};
export function utility(x,y,s){
 const a=s.alpha,b=beta(s),model=s.model||'cd';
 if(model==='leontief')return Math.min(x/a,y/b);
 if(model==='substitutes')return a*x+b*y;
 if(model==='cd')return x<=0||y<=0?0:Math.exp(a*Math.log(x)+b*Math.log(y));
 if(Math.abs((s.sigma??1)-1)<1e-8)return x<=0||y<=0?0:Math.exp((a*Math.log(x)+b*Math.log(y))/(a+b));
 const rho=1-1/s.sigma;
 if((x<=0||y<=0)&&rho<0)return 0;
 return Math.exp((logadd(Math.log(a)+rho*Math.log(x),Math.log(b)+rho*Math.log(y))-Math.log(a+b))/rho);
}
function demand(s,income,q1,q2){
 const a=s.alpha,b=beta(s),model=s.model||'cd';let share;
 if(model==='leontief'){const k=income/(q1*a+q2*b);return {x1:a*k,x2:b*k,utility:k,tie:false};}
 let tie=false;
 if(model==='substitutes'){
  const gap=Math.log(a/q1)-Math.log(b/q2);tie=Math.abs(gap)<1e-10;
  share=tie?.5:gap>0?1:0;
 }else if(model==='ces'){
  const sigma=s.sigma??1;
  const d=sigma*Math.log(b/a)+(1-sigma)*Math.log(q2/q1);
  share=d>0?Math.exp(-d)/(1+Math.exp(-d)):1/(1+Math.exp(d));
 }else share=a/(a+b);
 const x1=share*income/q1,x2=(1-share)*income/q2;
 return {x1,x2,utility:utility(x1,x2,s),tie};
}
export function solve(s){
 if(![s.p1,s.p2,s.income].every(v=>Number.isFinite(v)&&v>=.01&&v<=1e6)||!Number.isFinite(s.tax)||s.tax<0||s.tax>1||!Number.isFinite(s.alpha)||s.alpha<.05||s.alpha>2||!Number.isFinite(beta(s))||beta(s)<.05||beta(s)>2||!MODELS.includes(s.model||'cd')||(s.model==='ces'&&(!Number.isFinite(s.sigma)||s.sigma<.1||s.sigma>10)))throw new RangeError('Parameters outside supported ranges.');
 const price1=s.p1*(1+s.tax);
 return {...demand(s,s.income,price1,s.p2),price1,intercept1:s.income/price1,intercept2:s.income/s.p2,originalIntercept1:s.income/s.p1};
}
export function compare(s){
 const vat=solve(s),revenue=s.tax*s.p1*vat.x1,netIncome=s.income-revenue;
 return {vat,revenue,netIncome,lump:{...demand(s,netIncome,s.p1,s.p2),intercept1:netIncome/s.p1,intercept2:netIncome/s.p2}};
}
export function curveY(x,u,alphaOrState){
 const s=typeof alphaOrState==='number'?{alpha:alphaOrState,model:'cd'}:alphaOrState;
 const a=s.alpha,b=beta(s),model=s.model||'cd';
 if(model==='substitutes')return (u-a*x)/b;
 if(model==='cd')return Math.exp((Math.log(u)-a*Math.log(x))/b);
 if(Math.abs(s.sigma-1)<1e-8)return Math.exp(((a+b)*Math.log(u)-a*Math.log(x))/b);
 const rho=1-1/s.sigma,term=Math.log(a/(a+b))+rho*Math.log(x)-rho*Math.log(u);
 if(term>=0)return NaN;
 return Math.exp((rho*Math.log(u)+Math.log(-Math.expm1(term))-Math.log(b/(a+b)))/rho);
}
export function switchingTax(s){return s.alpha*s.p2/(beta(s)*s.p1)-1;}

/** Hicks: restore original utility at the final prices, then remove compensation. */
export function decompose(s){
 const original=solve({...s,tax:0}),c=compare(s);
 const degree=(s.model||'cd')==='cd'?s.alpha+beta(s):1;
 const factor=Math.exp((Math.log(original.utility)-Math.log(c.vat.utility))/degree);
 const compensatedIncome=s.income*factor;
 const h={...demand(s,compensatedIncome,c.vat.price1,s.p2),intercept1:compensatedIncome/c.vat.price1,intercept2:compensatedIncome/s.p2};
 const diff=(a,b)=>[a.x1-b.x1,a.x2-b.x2];
 return {original,...c,vatEffects:{h,compensatedIncome,substitution:diff(h,original),income:diff(c.vat,h)},lumpEffects:{h:original,compensatedIncome:s.income,substitution:[0,0],income:diff(c.lump,original)}};
}
