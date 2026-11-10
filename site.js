// Fundo por rolagem, barra de progresso e botão de pausar movimento.
const root=document.documentElement,page=document.querySelector('#page'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const palettes=[{p:0,t:[29,29,29],m:[60,60,60],b:[111,111,111],g:[111,111,111]},{p:.33,t:[65,65,65],m:[89,89,89],b:[111,111,111],g:[113,113,113]},{p:.68,t:[31,31,31],m:[48,48,48],b:[89,89,89],g:[111,111,111]},{p:1,t:[16,16,16],m:[26,26,26],b:[46,46,46],g:[86,86,86]}];
let mode='auto',current=0,target=0,paused=false,raf=0;
function render(){raf=0;current=reduced.matches?target:current+(target-current)*.075;const p=mode==='blue'?.33:current;let k=0;while(k<palettes.length-2&&p>palettes[k+1].p)k++;const a=palettes[k],b=palettes[k+1];let v=Math.max(0,Math.min(1,(p-a.p)/(b.p-a.p)));v=v*v*(3-2*v);const color=(key)=>a[key].map((x,i)=>Math.round(x+(b[key][i]-x)*v));for(const [css,key] of [['top','t'],['mid','m'],['bottom','b'],['glow','g']])root.style.setProperty('--'+css,color(key).join(','));const hx=document.querySelector('#hex');if(hx)hx.textContent='#'+color('t').map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase();if(Math.abs(target-current)>.0001&&!paused)raf=requestAnimationFrame(render)}
function update(){target=Math.max(0,Math.min(1,page.scrollTop/Math.max(1,page.scrollHeight-page.clientHeight)));if(!paused&&!raf)raf=requestAnimationFrame(render)}page.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);document.querySelectorAll('[data-mode]').forEach(btn=>btn.addEventListener('click',()=>{mode=btn.dataset.mode;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));if(!raf)raf=requestAnimationFrame(render)}));document.querySelector('#motion')?.addEventListener('click',function(){paused=!paused;document.body.classList.toggle('paused',paused);this.setAttribute('aria-pressed',String(paused));this.textContent=paused?'Retomar movimento ▷':'Pausar movimento Ⅱ';if(paused&&raf){cancelAnimationFrame(raf);raf=0}if(!paused)update()});for(const id of ['grain','glass'])document.querySelector('#'+id)?.addEventListener('input',function(){root.style.setProperty('--'+id,Number(this.value)/(id==='grain'?1000:100));document.querySelector('#'+id+'Val').textContent=this.value+'%'});update();

// Logo digitada como num terminal: as letras aparecem uma a uma com cursor de bloco,
// o cursor pisca um pouco e some. O nome real fica no lugar (invisível) e a digitação
// acontece por cima dele, então o menu não se mexe. Com movimento reduzido, aparece pronta.
(()=>{
const logo=document.querySelector('a.logo');
if(!logo||reduced.matches)return;
const parts=[...logo.children];
const text=parts.map(p=>p.classList.contains('logo-gap')?' ':p.textContent).join('');
const layer=document.createElement('span');layer.className='logo-layer';layer.setAttribute('aria-hidden','true');
const typed=document.createElement('span');typed.className='logo-typed';
const cursor=document.createElement('span');cursor.className='logo-cursor';
layer.append(typed,cursor);
parts.forEach(p=>p.style.visibility='hidden');
logo.append(layer);
let i=0;
const step=()=>{
  typed.textContent=text.slice(0,++i);
  if(i<text.length)setTimeout(step,text[i-1]===' '?220:80+Math.random()*90);
  else setTimeout(()=>{cursor.classList.add('is-done');setTimeout(()=>{layer.remove();parts.forEach(p=>p.style.visibility='');},700);},2400);
};
setTimeout(step,400);
})();
