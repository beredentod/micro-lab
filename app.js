import {solve,compare,curveY,switchingTax,decompose} from './model.js';
const $=id=>document.getElementById(id);
const clean=n=>Math.abs(n)<1e-12?0:n;
const difference=(a,b)=>{const d=a-b;return Math.abs(d)<=32*Number.EPSILON*Math.max(1,Math.abs(a),Math.abs(b))?0:d;};
const fmt=n=>{n=clean(n);return Math.abs(n)>=1e5||(Math.abs(n)>0&&Math.abs(n)<.01)?n.toExponential(2):new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(n);};
const texNum=n=>{n=clean(n);if(Math.abs(n)>=1e5||(Math.abs(n)>0&&Math.abs(n)<.01)){const [mantissa,exponent]=n.toExponential(2).split('e');return `${mantissa}\\times10^{${Number(exponent)}}`;}return fmt(n).replaceAll(',','\\,');};
let state;
let lockedLimits=null;
function renderMath(el,tex){el.dataset.tex=tex;if(window.katex)window.katex.render(tex,el,{throwOnError:false});else el.textContent=tex;}
function math(id,tex){renderMath($(id),tex);}
function number(id,n,suffix=''){math(id,`${texNum(n)}${suffix}`);}
function typeset(){if(window.katex)document.querySelectorAll('[data-tex]').forEach(el=>window.katex.render(el.dataset.tex,el,{throwOnError:false}));}
document.addEventListener('mathready',typeset);
function update(event){
 const locked=$('weight-lock').checked;
 if(event?.target.id==='weight-lock'&&locked){const a=+$('alpha').value,b=+$('beta').value;$('alpha').value=Math.max(5,Math.min(95,Math.round(100*a/(a+b))));$('beta').value=100-+$('alpha').value;}
 for(const id of ['alpha','beta'])$(id).max=locked?'95':'200';
 if(locked&&event?.target.id==='alpha')$('beta').value=100-+$('alpha').value;
 if(locked&&event?.target.id==='beta')$('alpha').value=100-+$('beta').value;
 math('weight-sum',String.raw`\Sigma=${((+$('alpha').value + +$('beta').value)/100).toFixed(2)}`);
 let valid=true;for(const id of ['p1','p2','income']){const ok=$(id).checkValidity();$(id).setAttribute('aria-invalid',String(!ok));valid=valid&&ok;}
 $('input-error').hidden=valid;
 const model=document.querySelector('input[name=model]:checked').value;
 $('sigma-control').hidden=model!=='ces';
 for(const id of ['tax','alpha','beta','sigma']){const el=$(id);el.style.setProperty('--fill',`${100*(+el.value-+el.min)/(+el.max-+el.min)}%`);}
 math('tax-value',`${$('tax').value}\\%`);math('alpha-value',texNum(+$('alpha').value/100));math('beta-value',texNum(+$('beta').value/100));math('sigma-value',texNum(+$('sigma').value/100));
 if(!valid)return;
 state={model,p1:+$('p1').value,p2:+$('p2').value,income:+$('income').value,tax:+$('tax').value/100,alpha:+$('alpha').value/100,beta:+$('beta').value/100,sigma:+$('sigma').value/100};
 const c=compare(state);
 number('revenue',c.revenue);number('net-income',c.netIncome);number('effective',c.vat.price1);
 number('u-vat',c.vat.utility);number('u-lump',c.lump.utility);number('gain',difference(c.lump.utility,c.vat.utility));math('selected-rate',`${Math.round(state.tax*100)}\\%`);
 const tex={cd:String.raw`u=x_1^\alpha x_2^{\beta}`,ces:Math.abs(state.sigma-1)<1e-8?String.raw`u=(x_1^\alpha x_2^\beta)^{1/(\alpha+\beta)}`:String.raw`u=\left[\frac{\alpha x_1^\rho+\beta x_2^\rho}{\alpha+\beta}\right]^{1/\rho}`,leontief:String.raw`u=\min\!\left\{\frac{x_1}{\alpha},\frac{x_2}{\beta}\right\}`,substitutes:String.raw`u=\alpha x_1+\beta x_2`};
 math('preferences',tex[model]);math('vat-equation',String.raw`p_1(1+t)x_1+p_2x_2\leq m,\qquad p_1x_1+p_2x_2\leq m-R(t)`);
 const note=$('model-note');note.replaceChildren();
 const noteParts=model==='substitutes'?['Equal value per dollar. Demand can jump when the preferred good changes; gaps mark the jump.']:model==='leontief'?['Fixed proportions: ',{tex:String.raw`x_1/x_2=\alpha/\beta`},'. Both taxes yield the same optimal bundle and utility.']:model==='ces'?['CES weights: ',{tex:String.raw`\alpha/(\alpha+\beta),\quad\beta/(\alpha+\beta)`},'; ',{tex:String.raw`\rho=(\sigma-1)/\sigma`},'. At ',{tex:String.raw`\sigma=1`},', CES is Cobb–Douglas.']:['Indifference curves stay fixed as the tax rate changes. Prices, budget, or preferences change them.'];
 for(const part of noteParts){if(typeof part==='string')note.append(document.createTextNode(part));else{const span=document.createElement('span');renderMath(span,part.tex);note.append(span);}}
 draw();
}
function plot(id,maxX,maxY){
 const canvas=$(id),ctx=canvas.getContext('2d'),w=canvas.clientWidth,h=canvas.clientHeight,dpr=window.devicePixelRatio||1;
 canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
 const left=49,right=18,top=20,bottom=30,pw=w-left-right,ph=h-top-bottom;
 const X=x=>left+x/maxX*pw,Y=y=>top+ph-y/maxY*ph;
 const labelLayer=document.createElement('div');labelLayer.className='tick-labels';canvas.parentElement.querySelector('.tick-labels')?.remove();canvas.parentElement.append(labelLayer);
 function label(tex,x,y,align='center',kind='tick-label',color=''){const el=document.createElement('span');el.className=`tick-label ${kind}`;el.style.left=`${x}px`;el.style.top=`${y}px`;el.style.transform=align==='right'?'translate(-100%,-50%)':align==='left'?'translate(0,-50%)':'translate(-50%,-50%)';if(color)el.style.color=color;renderMath(el,tex);labelLayer.append(el);return el;}
 function line(points,color,width=1,dash=[]){ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);points.forEach(([x,y],i)=>i?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y)));ctx.stroke();ctx.setLineDash([]);}
 function dot(x,y,color,radius=4){ctx.beginPath();ctx.arc(X(x),Y(y),radius,0,2*Math.PI);ctx.fillStyle=color;ctx.fill();ctx.lineWidth=1.7;ctx.strokeStyle='white';ctx.stroke();}
 function ticks(xs,ys,xFormat=fmt){for(const x of xs){line([[x,0],[x,maxY]],'#eee');let t;if(xFormat===fmt)t=texNum(x);else{const raw=xFormat(x),pct=raw.endsWith('%');t=pct?`${texNum(Number(raw.slice(0,-1)))}\\%`:texNum(Number(raw));}label(t,X(x),Y(0)+18);}for(const y of ys){line([[0,y],[maxX,y]],'#eee');if(y!==0)label(texNum(y),left-8,Y(y)+2,'right');}}
 function axes(){line([[0,maxY],[0,0],[maxX,0]],'#555');}
 function clip(){ctx.save();ctx.beginPath();ctx.rect(left,top,pw,ph);ctx.clip();}
 return {canvas,ctx,w,h,maxX,maxY,X,Y,line,dot,ticks,axes,clip,label};
}
function consumption(id,current,baseline,color,effects,limits,overlay=null){
 const g=plot(id,limits.x,limits.y);
 const {ctx,X,Y}=g;
 g.ticks(Array.from({length:6},(_,i)=>limits.x*i/5),Array.from({length:6},(_,i)=>limits.y*i/5));
 g.clip();
 function shade(bundle,color){ctx.beginPath();ctx.moveTo(X(0),Y(0));ctx.lineTo(X(bundle.intercept1),Y(0));ctx.lineTo(X(0),Y(bundle.intercept2));ctx.closePath();ctx.fillStyle=color;ctx.fill();}
 const ref=compare(state);shade(ref.lump,'rgba(160,82,52,0.12)');shade(ref.vat,'rgba(36,100,136,0.12)');
 function curve(u,c,width,dash=[]){
  if(state.model==='leontief'){const kx=state.alpha*u,ky=state.beta*u;g.line([[kx,g.maxY],[kx,ky],[g.maxX,ky]],c,width,dash);return;}
  let points=[];
  for(let i=0;i<=1100;i++){const x=g.maxX*i/1100,y=curveY(x,u,state);if(!Number.isFinite(y)||y>g.maxY*2||y<0){if(points.length)g.line(points,c,width,dash);points=[];continue;}points.push([x,y]);}
  if(points.length)g.line(points,c,width,dash);
 }
 [.35,.55,.75,1,1.25,1.5].forEach(f=>curve(baseline.utility*f,'#bcc3bc',1));
 curve(current.utility,'#246488',1.35);
 if(overlay){curve(overlay.utility,'#a05234',1.35);g.line([[0,overlay.intercept2],[overlay.intercept1,0]],'#a05234',2);}
 g.line([[0,baseline.intercept2],[baseline.intercept1,0]],'#999',1.5,[5,4]);
 g.line([[0,current.intercept2],[current.intercept1,0]],'#246488',2);
 g.line([[0,effects.h.intercept2],[effects.h.intercept1,0]],'#8856a7',1.6,[7,4]);
 g.line([[current.x1,0],[current.x1,current.x2],[0,current.x2]],'#999',1,[2,4]);

 function arrow(a,b,color){
  const ax=X(a.x1),ay=Y(a.x2),bx=X(b.x1),by=Y(b.x2),length=Math.hypot(bx-ax,by-ay);
  if(length<1)return;
  g.line([[a.x1,a.x2],[b.x1,b.x2]],color,2.3);
  if(length<8)return;
  const angle=Math.atan2(by-ay,bx-ax),sz=6;
  ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx-sz*Math.cos(angle-.45),by-sz*Math.sin(angle-.45));ctx.lineTo(bx-sz*Math.cos(angle+.45),by-sz*Math.sin(angle+.45));ctx.closePath();ctx.fillStyle=color;ctx.fill();
 }
 arrow(baseline,effects.h,'#8856a7');arrow(effects.h,current,'#ce7b26');
 if(overlay)arrow(baseline,overlay,'#a05234');
 // Clip lines, but draw dots and labels after restoring so corner optima remain visible.
 ctx.restore();g.axes();
 const points=[{...baseline,label:'A',color:'#777'},{...effects.h,label:'H',color:'#8856a7'},{...current,label:overlay?'V':'B',color:color}];
 if(overlay)points.push({...overlay,label:'L',color:'#a05234'});
 const groups=[];
 for(const pt of points){const match=groups.find(q=>Math.hypot(X(q.x1)-X(pt.x1),Y(q.x2)-Y(pt.x2))<5);if(match){match.label+='='+pt.label;}else groups.push({...pt});}
 for(const pt of groups){
  const x=X(pt.x1),y=Y(pt.x2);
  if(x<49||x>g.w-18||y<20||y>g.h-30)continue;
  g.dot(pt.x1,pt.x2,pt.color,5.5);
  const right=x>g.w-105;
  g.label(String.raw`\boldsymbol{\large ${pt.label.replaceAll('=','\\!=\\!')}}`,x+(right?-8:8),y+(y<40?13:-9),right?'right':'left','point-label',pt.color);
 }

 g.canvas.setAttribute('aria-label',`${id==='vat-plot'?'Ad valorem':'Equal-revenue budget'} tax. Optimal quantities: ${fmt(current.x1)} and ${fmt(current.x2)}. Utility ${fmt(current.utility)}.${overlay?` Budget-tax optimum: ${fmt(overlay.x1)}, ${fmt(overlay.x2)}; utility ${fmt(overlay.utility)}; utility difference ${fmt(overlay.utility-current.utility)}.`:''}`);
}

function utilities(baseline,c){
 const g=plot('utility-plot',1,baseline.utility*1.08);
 g.ticks([0,.25,.5,.75,1],Array.from({length:4},(_,i)=>baseline.utility*i/3),x=>`${Math.round(x*100)}%`);
 const threshold=switchingTax(state),hasJump=state.model==='substitutes'&&threshold>=0&&threshold<=1;
 let rates=Array.from({length:201},(_,i)=>i/200);
 if(hasJump){rates=rates.filter(t=>Math.abs(t-threshold)>1e-8);rates.push(Math.max(0,threshold-1e-7),Math.min(1,threshold+1e-7));rates.sort((a,b)=>a-b);}
 g.clip();let va=[],lu=[],last=-1;
 function flush(){g.line(va,'#246488',2);g.line(lu,'#a05234',2);va=[];lu=[];}
 for(const tax of rates){if(hasJump&&last<threshold&&tax>=threshold)flush();const at=compare({...state,tax});va.push([tax,at.vat.utility]);lu.push([tax,at.lump.utility]);last=tax;}flush();
 if(hasJump){const at=compare({...state,tax:threshold});g.dot(threshold,at.lump.utility,'#a05234');}
 g.line([[state.tax,0],[state.tax,g.maxY]],'#999',1,[4,4]);g.dot(state.tax,c.vat.utility,'#246488');g.dot(state.tax,c.lump.utility,'#a05234');g.ctx.restore();g.axes();
 g.canvas.setAttribute('aria-label',`Utility over tax rates. At selected rate: ad valorem ${fmt(c.vat.utility)}, equal-revenue budget tax ${fmt(c.lump.utility)}.`);
}
function draw(){
 if(!state)return;
 const c=decompose(state),base=c.original;
 const autoLimits={x:1.1*Math.max(base.intercept1,c.vat.intercept1,c.lump.intercept1,c.vatEffects.h.intercept1),y:1.1*Math.max(base.intercept2,c.vat.intercept2,c.lump.intercept2,c.vatEffects.h.intercept2)};
 if($('lock-axes').checked&&!lockedLimits)lockedLimits=autoLimits;
 const limits=lockedLimits||autoLimits;
 consumption('vat-plot',c.vat,base,'#246488',c.vatEffects,limits,c.lump);
 utilities(base,c);
 math('vat-bundle',`A=(${texNum(base.x1)},${texNum(base.x2)}),\\quad H=(${texNum(c.vatEffects.h.x1)},${texNum(c.vatEffects.h.x2)}),\\quad V=(${texNum(c.vat.x1)},${texNum(c.vat.x2)}),\\quad L=(${texNum(c.lump.x1)},${texNum(c.lump.x2)})`);
 const texSigned=n=>{n=clean(n);return `${n>0?'+':''}${texNum(n)}`;};
 const effects=$('vat-effects');effects.replaceChildren();
 const effectTitle=document.createElement('h3');effectTitle.textContent='Tax effects';effects.append(effectTitle);
 for(const [label,vec,color] of [
  [String.raw`\text{VAT substitution }A\to H`,c.vatEffects.substitution,'#8856a7'],
  [String.raw`\text{VAT income }H\to V`,c.vatEffects.income,'#b26419'],
  [String.raw`\text{Budget-tax income }A\to L`,c.lumpEffects.income,'#a05234'],
  [String.raw`\text{Budget-tax substitution }A\to L`,[0,0],'#a05234']
 ]){
  const row=document.createElement('div');row.className='effect-row';row.style.color=color;
  const name=document.createElement('span');name.className='effect-label';renderMath(name,label);
  const value=document.createElement('span');value.className='effect-value';renderMath(value,`(${texSigned(vec[0])},\\,${texSigned(vec[1])})`);
  row.append(name,value);effects.append(row);
 }
}
 $('parameters').addEventListener('input',update);$('parameters').addEventListener('submit',e=>e.preventDefault());
 $('lock-axes').addEventListener('change',()=>{if($('lock-axes').checked&&state){const c=decompose(state);lockedLimits={x:1.1*Math.max(c.original.intercept1,c.vat.intercept1,c.lump.intercept1,c.vatEffects.h.intercept1),y:1.1*Math.max(c.original.intercept2,c.vat.intercept2,c.lump.intercept2,c.vatEffects.h.intercept2)};}else lockedLimits=null;$('axis-mode').textContent=lockedLimits?'Fixed scale':'Dynamic scale';draw();});
 $('reset').addEventListener('click',()=>{$('parameters').reset();$('lock-axes').checked=true;$('axis-mode').textContent='Fixed scale';lockedLimits=null;update();});
const observer=new ResizeObserver(draw);document.querySelectorAll('.plot-frame').forEach(el=>observer.observe(el));update();typeset();
