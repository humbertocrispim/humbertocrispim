// Blog: renderiza a lista de posts (index.html) e a página de um post (post.html).
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

// ---------- Home ----------
// Quantos artigos aparecem antes do botão "Mostrar mais". Aumente quando houver mais posts.
const PAGE=12;
const featuredEl=document.querySelector('#featured-list');
if(featuredEl){
  const featured=POSTS.filter(p=>p.featured).slice(0,5);
  featuredEl.innerHTML=featured.map(p=>`<li><a href="${postUrl(p)}"><span aria-hidden="true">→</span>${esc(p.title)}</a></li>`).join('');
  if(!featured.length)featuredEl.closest('.side-block').hidden=true;
}
const listEl=document.querySelector('#post-list');
if(listEl){
  const chipsEl=document.querySelector('#tag-filter'),more=document.querySelector('#show-more'),moreWrap=document.querySelector('#more-wrap');
  const tags=[...new Set(POSTS.flatMap(p=>p.tags||[]))].sort();
  const initial=new URLSearchParams(location.search).get('tag');
  const state={tag:tags.includes(initial)?initial:null,limit:PAGE};
  chipsEl.innerHTML=['',...tags].map(t=>`<button type="button" data-tag="${esc(t)}">${t?esc(t):'Todas'}</button>`).join('');
  function render(){
    chipsEl.querySelectorAll('button').forEach(c=>c.setAttribute('aria-pressed',String((c.dataset.tag||null)===state.tag)));
    const items=POSTS.filter(p=>!state.tag||(p.tags||[]).includes(state.tag));
    listEl.innerHTML=items.length?items.slice(0,state.limit).map(p=>`<article class="article-item"><h3><a href="${postUrl(p)}">${esc(p.title)}</a></h3><p class="sub"><time datetime="${esc(p.date)}">${fmtDate(p.date)}</time>${(p.tags||[]).length?' · '+p.tags.map(esc).join(', '):''}</p><p class="excerpt">${esc(p.summary)}</p><a class="read-more" href="${postUrl(p)}" aria-label="Ler mais: ${esc(p.title)}">Ler mais <span aria-hidden="true">→</span></a></article>`).join('')
      :'<p class="empty">Nenhum artigo nesta categoria.</p>';
    const hasMore=items.length>state.limit;moreWrap.hidden=!hasMore;
  }
  chipsEl.addEventListener('click',e=>{const c=e.target.closest('button');if(!c)return;state.tag=c.dataset.tag||null;state.limit=PAGE;render();});
  more.addEventListener('click',()=>{state.limit+=PAGE;render();});
  render();
}
const footerTags=document.querySelector('#footer-tags');
if(footerTags){
  const home=document.querySelector('#post-list')?'':'./index.html';
  footerTags.innerHTML=[...new Set(POSTS.flatMap(p=>p.tags||[]))].sort().map(t=>`<li><a href="${home||'./index.html'}?tag=${encodeURIComponent(t)}#posts">${esc(t)}</a></li>`).join('');
}

// ---------- Página do post ----------
const body=document.querySelector('#post-body');
if(body){
  const slug=new URLSearchParams(location.search).get('p');
  const idx=POSTS.findIndex(p=>p.slug===slug),post=POSTS[idx];
  const title=document.querySelector('#post-title'),meta=document.querySelector('#post-meta'),summary=document.querySelector('#post-summary'),tagsEl=document.querySelector('#post-tags'),nav=document.querySelector('#post-nav');
  if(!post){title.textContent='Post não encontrado';summary.textContent='O endereço pode estar errado ou o post foi removido.';body.innerHTML='<p><a href="./index.html#posts">Ver todos os posts</a></p>';return;}
  document.title=post.title+' — Humberto Crispim';
  title.textContent=post.title;summary.textContent=post.summary;
  meta.innerHTML=`<time datetime="${esc(post.date)}">${fmtDate(post.date)}</time>`;
  tagsEl.innerHTML=(post.tags||[]).map(t=>`<a class="tag" href="./index.html?tag=${encodeURIComponent(t)}#posts">${esc(t)}</a>`).join('');
  const newer=POSTS[idx-1],older=POSTS[idx+1];
  nav.innerHTML=(older?`<a href="${postUrl(older)}"><span>← Anterior</span>${esc(older.title)}</a>`:'<span></span>')+(newer?`<a class="next" href="${postUrl(newer)}"><span>Próximo →</span>${esc(newer.title)}</a>`:'');
  fetch('./posts/'+encodeURIComponent(post.slug)+'.md').then(r=>{if(!r.ok)throw new Error(r.status);return r.text();}).then(text=>{
    body.innerHTML=markdown(text);document.querySelector('#page').dispatchEvent(new Event('scroll'));
    const words=text.trim().split(/\s+/).length;
    meta.innerHTML+=` · ${Math.max(1,Math.round(words/200))} min de leitura`;
  }).catch(()=>{body.innerHTML='<p>Não foi possível carregar o post. Abra o site por um servidor local (<code>python3 -m http.server 8080</code>) ou publique numa hospedagem estática.</p>';});
}
})();
