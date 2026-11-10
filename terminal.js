// Terminal do topo: digita cada comando e revela a saída, linha por linha, e recomeça em loop.
// O conteúdo completo já está no HTML; sem JavaScript ou com movimento reduzido, ele aparece pronto.
(()=>{
const term=document.querySelector('#term');
if(!term)return;
const lines=[...term.querySelectorAll('.tl')];
const full=new Map();
lines.forEach(l=>{const t=l.querySelector('.typed');if(t)full.set(l,t.textContent);});
const skip=()=>reduced.matches;
// Mantém o fim do terminal visível enquanto as linhas aparecem.
const bottom=()=>{term.scrollTop=term.scrollHeight;};
if(skip()){bottom();return;}
const cursor=document.createElement('span');cursor.className='typing-cursor';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// Tempo que o resultado final fica na tela antes de recomeçar.
const HOLD=8000;
function showAll(){cursor.remove();lines.forEach(l=>{l.classList.remove('is-hidden');const t=l.querySelector('.typed');if(t)t.textContent=full.get(l);});bottom();}
function reset(){cursor.remove();lines.forEach(l=>{l.classList.add('is-hidden');const t=l.querySelector('.typed');if(t)t.textContent='';});term.scrollTop=0;}
async function play(){
  reset();
  await wait(700);
  for(const l of lines){
    if(skip())return false;
    l.classList.remove('is-hidden');bottom();
    const t=l.querySelector('.typed');
    if(t){
      l.appendChild(cursor);
      const text=full.get(l);
      for(let k=1;k<=text.length;k++){if(skip())return false;t.textContent=text.slice(0,k);await wait(38+Math.random()*52);}
      await wait(420);cursor.remove();
    }else await wait(l.classList.contains('gap')?140:l.classList.contains('yaml')?60:110);
  }
  return true;
}
(async()=>{
  while(await play()){
    await wait(HOLD);
    if(skip())break;
  }
  showAll();
})();
reduced.addEventListener('change',e=>{if(e.matches)showAll();});
})();
