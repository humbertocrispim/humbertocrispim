// Blog: artigos recentes (index.html), página Blog com todos os artigos (blog.html) e página de um post (post.html).
(()=>{
const POSTS=(window.POSTS||[]).slice().sort((a,b)=>b.date.localeCompare(a.date));

const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const safeUrl=u=>/^\s*(javascript|data|vbscript):/i.test(u)?'#':u;
const fmtDate=d=>new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'}).replace(/\./g,'').replace(/ de /g,' ');
const postUrl=p=>'./post.html?p='+encodeURIComponent(p.slug);
const tagsHtml=tags=>(tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('');

// ---------- Markdown ----------
function inline(text){
  let s=esc(text);const codes=[];
  s=s.replace(/`([^`]+)`/g,(_,c)=>{codes.push(c);return '\u0000'+(codes.length-1)+'\u0000';});
  s=s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,(_,a,u)=>`<img src="${safeUrl(u)}" alt="${a}" loading="lazy">`)
     .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(_,t,u)=>`<a href="${safeUrl(u)}"${/^https?:/i.test(u)?' target="_blank" rel="noopener"':''}>${t}</a>`)
     .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
     .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g,'$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g,(_,i)=>'<code>'+codes[i]+'</code>');
}
const slugify=t=>t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const LIST=/^\s*([-*+]|\d+\.)\s+/,BREAK=/^(```|#{1,4}\s|>|\s*([-*+]|\d+\.)\s+|(-{3,}|\*{3,})\s*$)/;
function markdown(src){
  const lines=src.replace(/\r\n?/g,'\n').split('\n'),out=[];let i=0,m;
  while(i<lines.length){
    const l=lines[i];
    if(/^```/.test(l)){const lang=l.slice(3).trim(),buf=[];i++;while(i<lines.length&&!/^```/.test(lines[i]))buf.push(lines[i++]);i++;
      out.push(`<pre><code${lang?` class="language-${esc(lang)}"`:''}>${esc(buf.join('\n'))}</code></pre>`);continue;}
    if(!l.trim()){i++;continue;}
    if((m=l.match(/^(#{1,4})\s+(.*)$/))){const n=Math.min(m[1].length+1,4);out.push(`<h${n} id="${slugify(m[2])}">${inline(m[2])}</h${n}>`);i++;continue;}
    if(/^(-{3,}|\*{3,})\s*$/.test(l)){out.push('<hr>');i++;continue;}
    if(/^>/.test(l)){const buf=[];while(i<lines.length&&/^>/.test(lines[i]))buf.push(lines[i++].replace(/^>\s?/,''));out.push('<blockquote>'+markdown(buf.join('\n'))+'</blockquote>');continue;}
    if(LIST.test(l)){const ordered=/^\s*\d+\./.test(l),items=[];
      while(i<lines.length&&LIST.test(lines[i])){items.push(lines[i++].replace(LIST,''));
        while(i<lines.length&&/^\s{2,}\S/.test(lines[i])&&!LIST.test(lines[i]))items[items.length-1]+=' '+lines[i++].trim();}
      const t=ordered?'ol':'ul';out.push(`<${t}>${items.map(x=>'<li>'+inline(x)+'</li>').join('')}</${t}>`);continue;}
    const buf=[lines[i++].trim()];
    while(i<lines.length&&lines[i].trim()&&!BREAK.test(lines[i]))buf.push(lines[i++].trim());
    out.push('<p>'+inline(buf.join(' '))+'</p>');
  }
  return out.join('\n');
}

// ---------- Home: só os artigos mais recentes ----------
const RECENT=5;
const blogUrl=t=>'./blog.html'+(t?'?tag='+encodeURIComponent(t):'');
const allTags=[...new Set(POSTS.flatMap(p=>p.tags||[]))].sort();
const articleHtml=p=>`<article class="article-item"><h3><a href="${postUrl(p)}">${esc(p.title)}</a></h3><p class="sub"><time datetime="${esc(p.date)}">${fmtDate(p.date)}</time>${(p.tags||[]).length?' · '+p.tags.map(esc).join(', '):''}</p><p class="excerpt">${esc(p.summary)}</p><a class="read-more" href="${postUrl(p)}" aria-label="Ler mais: ${esc(p.title)}">Ler mais <span aria-hidden="true">→</span></a></article>`;
const featuredEl=document.querySelector('#featured-list');
if(featuredEl){
  const featured=POSTS.filter(p=>p.featured).slice(0,5);
  featuredEl.innerHTML=featured.map(p=>`<li><a href="${postUrl(p)}"><span aria-hidden="true">→</span>${esc(p.title)}</a></li>`).join('');
  if(!featured.length)featuredEl.closest('.side-block').hidden=true;
}
const listEl=document.querySelector('#post-list');
if(listEl){
  listEl.innerHTML=POSTS.slice(0,RECENT).map(articleHtml).join('')||'<p class="empty">Nenhum artigo ainda.</p>';
  const chipsEl=document.querySelector('#tag-filter');
  if(chipsEl)chipsEl.innerHTML=allTags.map(t=>`<a href="${blogUrl(t)}">${esc(t)}</a>`).join('');
}

// ---------- Página Blog no estilo de vercel.com/blog ----------
// Topo: até 3 destaques em cards grandes (posts com featured:true; se não houver, os mais novos).
// Abaixo: grade com os demais. Com uma categoria selecionada, mostra só a grade filtrada.
// Autor padrão dos posts; um post pode ter o próprio "author" em posts.js.
const AUTHOR={name:'Humberto Crispim',role:'DevOps',photo:'./assets/favicon-180.png'};
const vcDate=d=>new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{day:'numeric',month:'long'});
const vcHtml=(p,destaque)=>{const a=Object.assign({},AUTHOR,p.author||{}),cat=(p.tags||[])[0];return `<a class="vc-card${destaque?' vc-featured':''}" href="${postUrl(p)}">
  <div class="vc-meta"><time datetime="${esc(p.date)}">${vcDate(p.date)}</time>${cat?`<span>${esc(cat)}</span>`:''}</div>
  <h3>${esc(p.title)}</h3>
  <p class="vc-sum">${esc(p.summary)}</p>
  <div class="vc-author"><img src="${esc(a.photo)}" alt="" width="20" height="20"><span>${esc(a.name)}</span><small>${esc(a.role)}</small></div>
</a>`;};
const archive=document.querySelector('#archive');
if(archive){
  // Quantos itens da grade aparecem antes do botão "Veja mais" (e quantos cada clique acrescenta).
  const PAGE_CARDS=9;
  const chips=document.querySelector('#archive-tags'),moreRow=document.querySelector('#archive-more-row'),moreBtn=document.querySelector('#archive-more');
  const params=new URLSearchParams(location.search);
  const state={tag:allTags.includes(params.get('tag'))?params.get('tag'):null,limit:PAGE_CARDS};
  chips.innerHTML=['',...allTags].map(t=>`<button type="button" data-tag="${esc(t)}">${t?esc(t):'Todos'}</button>`).join('');
  function render(){
    chips.querySelectorAll('button').forEach(c=>c.setAttribute('aria-pressed',String((c.dataset.tag||null)===state.tag)));
    let destaques=[],lista;
    if(state.tag)lista=POSTS.filter(p=>(p.tags||[]).includes(state.tag));
    else{
      destaques=POSTS.filter(p=>p.featured).slice(0,3);
      if(!destaques.length)destaques=POSTS.slice(0,3);
      lista=POSTS.filter(p=>!destaques.includes(p));
    }
    if(!destaques.length&&!lista.length){archive.innerHTML='<p class="empty">Nenhum artigo nesta categoria.</p>';moreRow.hidden=true;return;}
    archive.innerHTML=(destaques.length?`<div class="vc-row">${destaques.map(p=>vcHtml(p,true)).join('')}</div>`:'')
      +(lista.length?`<div class="vc-grid">${lista.slice(0,state.limit).map(p=>vcHtml(p,false)).join('')}</div>`:'');
    moreRow.hidden=lista.length<=state.limit;
  }
  // Hover nos cards: o resumo é digitado letra a letra com cursor de bloco, como num terminal.
  // Nos destaques ele é redigitado; na grade ele fica escondido e aparece sendo digitado.
  // O texto real fica no lugar (invisível) e a digitação acontece por cima, então o card não muda de tamanho.
  // Só em telas com mouse; com movimento reduzido não anima.
  const podeDigitar=()=>matchMedia('(hover: hover)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
  archive.addEventListener('mouseover',e=>{
    const card=e.target.closest('.vc-card');
    if(!card||card.contains(e.relatedTarget)||!podeDigitar())return;
    const h3=card.querySelector('.vc-sum');if(!h3||h3.querySelector('.type-layer'))return;
    const texto=h3.textContent,layer=document.createElement('span'),typed=document.createElement('span'),cursor=document.createElement('span');
    layer.className='type-layer';layer.setAttribute('aria-hidden','true');cursor.className='type-cursor';
    layer.append(typed,cursor);h3.classList.add('is-typing');h3.append(layer);
    let i=0;
    const passo=()=>{if(!layer.isConnected)return;typed.textContent=texto.slice(0,++i);if(i<texto.length)card._typing=setTimeout(passo,/[,.;:]/.test(texto[i-1])?260:texto[i-1]===' '?70:38+Math.random()*30);};
    card._typing=setTimeout(passo,150);
  });
  archive.addEventListener('mouseout',e=>{
    const card=e.target.closest('.vc-card');
    if(!card||card.contains(e.relatedTarget))return;
    clearTimeout(card._typing);
    const h3=card.querySelector('.vc-sum');h3?.querySelector('.type-layer')?.remove();h3?.classList.remove('is-typing');
  });
  chips.addEventListener('click',e=>{const c=e.target.closest('button');if(!c)return;state.tag=c.dataset.tag||null;state.limit=PAGE_CARDS;history.replaceState(null,'',blogUrl(state.tag));render();});
  moreBtn.addEventListener('click',()=>{state.limit+=PAGE_CARDS;render();});
  render();
}
const footerTags=document.querySelector('#footer-tags');
if(footerTags)footerTags.innerHTML=allTags.map(t=>`<li><a href="${blogUrl(t)}">${esc(t)}</a></li>`).join('');

// ---------- TL;DR com IA ----------
// Abre uma IA com um pedido de resumo do post. Usa sempre o endereço publicado (a IA não acessa localhost)
// e indica também o arquivo .md, porque o texto da página é montado por JavaScript.
const SITE_URL='https://humbertocrispim.github.io/humbertocrispim/';
const AI_URLS={claude:'https://claude.ai/new?q=',chatgpt:'https://chatgpt.com/?q=',grok:'https://grok.com/?q='};
function setupTldr(post){
  const box=document.querySelector('#tldr');if(!box)return;
  const pagina=SITE_URL+'post.html?p='+encodeURIComponent(post.slug),texto=SITE_URL+'posts/'+encodeURIComponent(post.slug)+'.md';
  const pedido=`Por favor, use a busca na web para abrir e ler o artigo "${post.title}", de Humberto Crispim: ${pagina}
O texto completo, em Markdown, está em: ${texto}

Depois de ler o conteúdo real do artigo:
1) Resuma os pontos mais importantes e a conclusão.
2) Diga quais detalhes, exemplos e comandos o leitor perde por não ler o artigo completo. Seja específico o bastante para despertar a curiosidade.
3) Lembre que ele pode continuar fazendo perguntas sobre o artigo neste chat.
4) Sugira uma boa pergunta de acompanhamento para ele começar.`;
  const url=ai=>AI_URLS[ai]+encodeURIComponent(pedido);
  const link=document.querySelector('#tldr-link'),more=document.querySelector('#tldr-more'),menu=document.querySelector('#tldr-menu');
  link.href=url('claude');
  menu.querySelectorAll('[data-ai]').forEach(a=>a.href=url(a.dataset.ai));
  const abrir=v=>{menu.hidden=!v;more.setAttribute('aria-expanded',String(v));if(v)menu.querySelector('a').focus();};
  more.addEventListener('click',e=>{e.stopPropagation();abrir(menu.hidden);});
  link.addEventListener('contextmenu',e=>{e.preventDefault();abrir(true);});
  menu.addEventListener('click',()=>abrir(false));
  document.addEventListener('click',e=>{if(!box.contains(e.target))abrir(false);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){abrir(false);more.focus();}});
  box.hidden=false;
}

// ---------- Página do post ----------
const body=document.querySelector('#post-body');
if(body){
  const slug=new URLSearchParams(location.search).get('p');
  const idx=POSTS.findIndex(p=>p.slug===slug),post=POSTS[idx];
  const title=document.querySelector('#post-title'),meta=document.querySelector('#post-meta'),summary=document.querySelector('#post-summary'),tagsEl=document.querySelector('#post-tags'),nav=document.querySelector('#post-nav');
  if(!post){title.textContent='Post não encontrado';summary.textContent='O endereço pode estar errado ou o post foi removido.';body.innerHTML='<p><a href="./blog.html">Ver todos os artigos</a></p>';return;}
  document.title=post.title+' — Humberto Crispim';
  title.textContent=post.title;summary.textContent=post.summary;
  meta.innerHTML=`<time datetime="${esc(post.date)}">${fmtDate(post.date)}</time>`;
  tagsEl.innerHTML=(post.tags||[]).map(t=>`<a class="tag" href="${blogUrl(t)}">${esc(t)}</a>`).join('');
  setupTldr(post);
  const newer=POSTS[idx-1],older=POSTS[idx+1];
  nav.innerHTML=(older?`<a href="${postUrl(older)}"><span>← Anterior</span>${esc(older.title)}</a>`:'<span></span>')+(newer?`<a class="next" href="${postUrl(newer)}"><span>Próximo →</span>${esc(newer.title)}</a>`:'');
  fetch('./posts/'+encodeURIComponent(post.slug)+'.md').then(r=>{if(!r.ok)throw new Error(r.status);return r.text();}).then(text=>{
    body.innerHTML=markdown(text);document.querySelector('#page').dispatchEvent(new Event('scroll'));
    const words=text.trim().split(/\s+/).length;
    meta.innerHTML+=` · ${Math.max(1,Math.round(words/200))} min de leitura`;
  }).catch(()=>{body.innerHTML='<p>Não foi possível carregar o post. Abra o site por um servidor local (<code>python3 -m http.server 8080</code>) ou publique numa hospedagem estática.</p>';});
}
})();
