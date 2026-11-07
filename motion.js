// Anime.js v4: entrance choreography and section reveals. (A digitação do terminal fica em terminal.js.)
(()=>{
if(!window.anime)return;
const {animate,stagger}=anime,animations=[];
const track=a=>(animations.push(a),a);

const title=document.querySelector('h1');title.setAttribute('aria-label','DevOps na prática. Arquitetura em construção.');
title.innerHTML='<span class="title-line" aria-hidden="true">DevOps na prática.</span><span class="title-line title-light" aria-hidden="true">Arquitetura em construção.</span>';
let entrances=[];
function intro(){if(reduced.matches)return;entrances.forEach(a=>a.cancel());entrances=[animate('.title-line',{y:[65,0],opacity:[0,1],duration:1350,delay:stagger(150),ease:'outExpo'}),animate('.hero .eyebrow, .hero p, .hero .pbtn',{y:[18,0],opacity:[0,1],duration:1100,delay:stagger(100,{start:450}),ease:'outExpo'}),animate('.terminal-demo',{y:[25,0],opacity:[0,1],duration:1400,delay:350,ease:'outExpo'})];if(paused)entrances.forEach(a=>a.pause());}

if(!reduced.matches){
intro();
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;const nodes=entry.target.querySelectorAll('h2,.eyebrow,.lead,.article-item,.cat-pills,.popular li,.cta');const a=track(animate(nodes,{y:[35,0],opacity:[0,1],duration:1050,delay:stagger(85),ease:'outExpo'}));if(paused)a.pause();observer.unobserve(entry.target);});},{root:page,threshold:.22});document.querySelectorAll('.section').forEach(s=>observer.observe(s));
}
document.querySelector('#motion')?.addEventListener('click',()=>{[...animations,...entrances].forEach(a=>paused?a.pause():a.resume());});
reduced.addEventListener('change',e=>{if(e.matches){[...animations,...entrances].forEach(a=>a.complete());}});
})();
