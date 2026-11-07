// Motion drives pointer and keyboard responses; Anime.js keeps the entrance choreography.
(()=>{
if(!window.Motion)return;
const {animate,hover,press}=Motion;
const running=new Map();
const allowed=()=>!paused&&!reduced.matches;
function move(el,values,options={}){running.get(el)?.stop();const controls=animate(el,values,{type:'spring',stiffness:290,damping:23,...options});running.set(el,controls);return controls;}
const cards=document.querySelectorAll('.code-window,.command-window');
hover(cards,el=>{if(!allowed())return;move(el,{y:-7,scale:1.012,borderColor:'rgba(138,222,255,.65)',boxShadow:'0 22px 60px rgba(0,0,0,.38),0 0 25px rgba(71,182,227,.12)'});return()=>move(el,{y:0,scale:1,borderColor:'rgba(255,255,255,.14)',boxShadow:'0 16px 40px rgba(0,0,0,.18)'});});
const buttons=document.querySelectorAll('.pill,.modes button,.replay');
hover(buttons,el=>{if(!allowed())return;move(el,{scale:1.045});return()=>move(el,{scale:1});});
press(buttons,el=>{if(!allowed())return;move(el,{scale:.95},{stiffness:500,damping:25});return()=>move(el,{scale:1},{stiffness:360,damping:16});});
// Logo: animação de entrada feita em CSS (styles.css), igual à de joshwcomeau.com, sem efeito de hover.
hover('.cta',el=>{if(!allowed())return;const arrow=el.querySelector('span');if(!arrow)return;move(arrow,{y:5});return()=>move(arrow,{y:0});});
buttons.forEach(el=>{el.addEventListener('focus',()=>{if(allowed())move(el,{scale:1.045});});el.addEventListener('blur',()=>move(el,{scale:1}));});
function reset(){for(const [el,control] of running){control.stop();animate(el,{scale:1,x:0,y:0,rotate:0},{duration:0});}running.clear();cards.forEach(el=>{el.style.borderColor='';el.style.boxShadow='';});}
document.querySelector('#motion')?.addEventListener('click',()=>{if(paused)reset();});
reduced.addEventListener('change',e=>{if(e.matches)reset();});
// Redes sociais: "boop" igual ao de joshwcomeau.com — gira 10° com mola e volta depois de 150ms.
document.querySelectorAll('.social-link').forEach(el=>{
  let timer;
  const boop=()=>{if(!allowed())return;clearTimeout(timer);animate(el,{rotate:10},{type:'spring',stiffness:300,damping:10});timer=setTimeout(()=>animate(el,{rotate:0},{type:'spring',stiffness:300,damping:10}),150);};
  el.addEventListener('mouseenter',boop);el.addEventListener('focus',boop);
});
document.body.dataset.motion='ready';
})();
