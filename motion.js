const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const app=document.querySelector('#app');
let previousView='',lastCompleted=new Set();
function enhance(){
 if(reduced())return;
 const heading=app.querySelector('main[data-current-view]')?.dataset.currentView||'welcome';
 const changed=heading!==previousView;previousView=heading;
 if(changed){
  const elements=app.querySelectorAll('.daily-pulse,.page-heading,.logger,.card,.upcoming,.welcome-grid>section');
  elements.forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(28px) scale(.985)',filter:'blur(3px)'},{opacity:1,transform:'translateY(0) scale(1)',filter:'blur(0px)'}],{duration:780,delay:Math.min(i*80,400),easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));
  app.querySelectorAll('.metric,.orbit-number').forEach(el=>{
   const node=Array.from(el.childNodes).find(n=>n.nodeType===Node.TEXT_NODE&&/\d/.test(n.textContent));if(!node)return;
   const original=node.textContent,match=original.match(/[\d,]+(?:\.\d+)?/);if(!match)return;
   const value=Number(match[0].replaceAll(',',''));if(!Number.isFinite(value))return;
   const decimal=match[0].includes('.'),start=performance.now();
   function tick(now){if(!el.isConnected)return;const t=Math.min(1,(now-start)/800),n=value*(1-Math.pow(1-t,3));node.textContent=original.replace(match[0],decimal?n.toFixed(1):Math.round(n).toLocaleString());if(t<1&&!reduced())requestAnimationFrame(tick);else node.textContent=original;}
   requestAnimationFrame(tick);
  });
  app.querySelectorAll('progress').forEach(el=>el.animate([{opacity:.25,transform:'scaleX(.8)',transformOrigin:'left'},{opacity:1,transform:'scaleX(1)',transformOrigin:'left'}],{duration:750,easing:'cubic-bezier(.22,1,.36,1)'}));
  app.querySelectorAll('.orbit-value').forEach(el=>el.animate([{strokeDashoffset:'100'},{strokeDashoffset:el.getAttribute('stroke-dashoffset')}],{duration:1300,delay:180,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));
 }
 const completed=new Set();app.querySelectorAll('.done-row').forEach(row=>{const id=row.querySelector('[data-complete]')?.dataset.complete;if(id){completed.add(id);if(!lastCompleted.has(id)&&!changed)row.classList.add('set-saved');}});lastCompleted=completed;
}
new MutationObserver(enhance).observe(app,{childList:true});
document.addEventListener('click',e=>{const button=e.target.closest('button');if(!button||button.disabled||reduced())return;button.animate([{scale:'1'},{scale:'.96'},{scale:'1'}],{duration:260,easing:'cubic-bezier(.22,1,.36,1)'});});
enhance();
