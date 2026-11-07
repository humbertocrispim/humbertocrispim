// Terminal do topo: digita cada comando e revela a saída, linha por linha.
// O conteúdo completo já está no HTML; sem JavaScript, com movimento reduzido ou pausado, ele aparece pronto.
(()=>{
const term=document.querySelector('#term');
if(!term)return;
const lines=[...term.querySelectorAll('.tl')];
const full=new Map();
lines.forEach(l=>{const t=l.querySelector('.typed');if(t)full.set(l,t.textContent);});
const skip=()=>reduced.matches||(typeof paused!=='undefined'&&paused);
// Mantém o fim do terminal visível enquanto as linhas aparecem.
const bottom=()=>{term.scrollTop=term.scrollHeight;};
if(skip()){bottom();return;}
const cursor=document.createElement('span');cursor.className='typing-cursor';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let done=false;
function finish(){if(done)return;done=true;cursor.remove();lines.forEach(l=>{l.classList.remove('is-hidden');const t=l.querySelector('.typed');if(t)t.textContent=full.get(l);});bottom();}
lines.forEach(l=>{l.classList.add('is-hidden');const t=l.querySelector('.typed');if(t)t.textContent='';});
async function run(){
  await wait(900);
  for(const l of lines){
    if(skip())return finish();
    l.classList.remove('is-hidden');bottom();
    const t=l.querySelector('.typed');
    if(t){
      l.appendChild(cursor);
      const text=full.get(l);
      for(let k=1;k<=text.length;k++){if(skip())return finish();t.textContent=text.slice(0,k);await wait(38+Math.random()*52);}
      await wait(420);cursor.remove();
    }else await wait(l.classList.contains('gap')?140:l.classList.contains('yaml')?55:110);
  }
  done=true;
}
document.querySelector('#motion')?.addEventListener('click',()=>{if(skip())finish();});
run();
})();
