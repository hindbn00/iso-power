/* ISO POWER – administration (/admin). Données : Supabase. Accès : compte admin uniquement. */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DA=n=>n==null?'Sur demande':Number(n).toLocaleString('fr-FR').replace(/[\u202f\u00a0]/g,' ')+' DA';
const fdate=d=>new Date(d).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short',timeZone:'Africa/Algiers'});
const ST={nouvelle:'Nouvelle',confirmee:'Confirmée',expediee:'Expédiée',livree:'Livrée',annulee:'Annulée'};
const QST={nouveau:'Nouveau',traite:'Traité'};
const view=$('#view'),dlg=$('#dlg');
const S={orders:[],quotes:[],products:[],days:30,metric:'visitors',of:'all',os:'',qs:'',ps:'',pc:'',pv:'',page:1,sel:new Set()};

function toast(m,bad){const t=$('#toast');t.textContent=m;t.className=bad?'bad':'';t.style.display='block';clearTimeout(t._t);t._t=setTimeout(()=>t.style.display='none',bad?4500:2400)}
const fail=(e,m)=>{console.error(e);toast((m||'Une erreur est survenue')+(e&&e.message?' : '+e.message:''),true)};
async function all(q){let out=[],i=0;for(;;){const{data,error}=await q(i,i+999);if(error)throw error;out=out.concat(data);if(data.length<1000)break;i+=1000}return out}

/* ---------- CSV (ouvre directement dans Excel) ---------- */
function csv(name,head,rows){
  const q=v=>{if(v==null)return '';if(typeof v==='number')return String(v);v=String(v);if(/^[=+\-@\t\r]/.test(v))v="'"+v;return /[";\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  const t='\ufeff'+[head,...rows].map(r=>r.map(q).join(';')).join('\r\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv;charset=utf-8'}));
  a.download=name+'-'+new Date().toISOString().slice(0,10)+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500);
}

/* ---------- fenêtres ---------- */
function openDlg(html){dlg.innerHTML=html;if(!dlg.open)dlg.showModal();$$('[data-close]',dlg).forEach(b=>b.onclick=()=>dlg.close())}
dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});

/* ---------- connexion ---------- */
async function isAdmin(){const{data,error}=await sb.rpc('is_admin');return !error&&data===true}
function showLogin(msg){$('#shell').hidden=true;$('#login').hidden=false;const m=$('#lmsg');m.hidden=!msg;m.textContent=msg||''}
async function enter(){
  if(!(await isAdmin())){await sb.auth.signOut();return showLogin("Ce compte n'a pas accès à l'administration.")}
  $('#login').hidden=true;$('#shell').hidden=false;route();counts();
}
async function counts(){
  try{
    const[o,q]=await Promise.all([sb.from('orders').select('id',{count:'exact',head:true}).eq('status','nouvelle'),sb.from('quotes').select('id',{count:'exact',head:true}).eq('status','nouveau')]);
    const set=(id,n)=>{const b=$(id);b.hidden=!n;b.textContent=n||''};set('#bo',o.count);set('#bq',q.count);
  }catch(e){}
}
$('#lf').onsubmit=async e=>{
  e.preventDefault();const f=e.target,b=f.querySelector('button');b.disabled=true;
  const{error}=await sb.auth.signInWithPassword({email:f.e.value.trim(),password:f.p.value});
  b.disabled=false;
  if(error)return showLogin('E-mail ou mot de passe incorrect.');
  f.p.value='';enter();
};
$$('[data-out]').forEach(b=>b.onclick=async()=>{await sb.auth.signOut();showLogin()});

/* ---------- routeur ---------- */
const V={stats:vStats,orders:vOrders,quotes:vQuotes,products:vProducts};
function route(){
  const k=(location.hash||'#stats').slice(1);const v=V[k]?k:'stats';
  $$('#tabs a').forEach(a=>a.classList.toggle('on',a.dataset.v==v));
  S.sel.clear();S.page=1;V[v]();
}
addEventListener('hashchange',()=>{if(!$('#shell').hidden)route()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!$('#shell').hidden)counts()});

/* ================= STATISTIQUES ================= */
async function vStats(){
  view.innerHTML=`<div class="bar"><h1>Statistiques</h1><select id="per" aria-label="Période"><option value="7">7 derniers jours</option><option value="30">30 derniers jours</option><option value="90">90 derniers jours</option></select><button class="btn" id="rf">Actualiser</button></div><div class="empty">Chargement…</div>`;
  $('#per').value=S.days;$('#per').onchange=e=>{S.days=+e.target.value;vStats()};$('#rf').onclick=vStats;
  const{data:d,error}=await sb.rpc('admin_stats',{p_days:S.days});
  if(error)return view.insertAdjacentHTML('beforeend',`<p class="err">Impossible de charger les statistiques : ${esc(error.message)}. Avez-vous exécuté supabase.sql en entier ?</p>`),$('.empty',view).remove();
  const st=d.order_status||{},stRows=Object.keys(ST).filter(k=>st[k]).map(k=>`<li><span>${ST[k]}</span><b>${st[k]}</b></li>`).join('');
  view.innerHTML=`<div class="bar"><h1>Statistiques</h1><select id="per" aria-label="Période"><option value="7">7 derniers jours</option><option value="30">30 derniers jours</option><option value="90">90 derniers jours</option></select><button class="btn" id="rf">Actualiser</button></div>
  <div class="kpis">
   <div class="kpi"><span>Visiteurs</span><strong>${d.visitors}</strong><small>${d.today_visitors} aujourd’hui</small></div>
   <div class="kpi"><span>Pages vues</span><strong>${d.views}</strong><small>${d.today_views} aujourd’hui</small></div>
   <div class="kpi"><span>Commandes</span><strong>${d.orders}</strong><small>${d.new_orders} à traiter</small></div>
   <div class="kpi"><span>Chiffre d’affaires</span><strong style="font-size:22px">${DA(d.revenue)}</strong><small>hors annulées</small></div>
   <div class="kpi"><span>Demandes de devis</span><strong>${d.quotes}</strong><small>${d.new_quotes} nouvelles</small></div>
   <div class="kpi"><span>Produits</span><strong>${d.products}</strong><small>${d.hidden_products} masqué(s)</small></div>
  </div>
  <div class="panel"><div class="seg" role="group" aria-label="Courbe">${[['visitors','Visiteurs'],['views','Pages vues'],['orders','Commandes']].map(([k,l])=>`<button data-m="${k}" class="${S.metric==k?'on':''}">${l}</button>`).join('')}</div><div id="chart"></div></div>
  <div class="grid2">
   <div class="panel"><h2>Produits les plus consultés</h2>${d.top_products.length?`<ul class="rows">${d.top_products.map(p=>`<li><span>${esc(p.name)}<br><small>${esc(p.ref)}</small></span><b>${p.views}</b></li>`).join('')}</ul>`:'<div class="empty">Pas encore de données.</div>'}</div>
   <div class="panel"><h2>D’où viennent les visiteurs</h2>${d.sources.length?`<ul class="rows">${d.sources.map(p=>`<li><span>${esc(p.source)}</span><b>${p.sessions}</b></li>`).join('')}</ul>`:'<div class="empty">Pas encore de données.</div>'}</div>
   <div class="panel"><h2>Appareils</h2>${d.devices.length?`<ul class="rows">${d.devices.map(p=>`<li><span>${esc(p.device)}</span><b>${p.visitors}</b></li>`).join('')}</ul>`:'<div class="empty">Pas encore de données.</div>'}</div>
   <div class="panel"><h2>Commandes par statut</h2>${stRows?`<ul class="rows">${stRows}</ul>`:'<div class="empty">Aucune commande sur la période.</div>'}</div>
  </div>`;
  $('#per').value=S.days;$('#per').onchange=e=>{S.days=+e.target.value;vStats()};$('#rf').onclick=()=>{vStats();counts()};
  const draw=()=>{$('#chart').innerHTML=chart(d.daily,S.metric);$$('.seg button').forEach(b=>b.classList.toggle('on',b.dataset.m==S.metric))};
  $$('.seg button').forEach(b=>b.onclick=()=>{S.metric=b.dataset.m;draw()});draw();
}
function chart(daily,key){
  const W=800,H=230,L=36,B=26,T=10,n=daily.length,vals=daily.map(x=>x[key]),mx=Math.max(1,...vals);
  const p=10**Math.floor(Math.log10(mx)),top=[1,2,5,10].map(x=>x*p).find(x=>x>=mx),bw=(W-L)/n,ch=H-B-T;
  const lab=({visitors:'visiteur(s)',views:'page(s) vue(s)',orders:'commande(s)'})[key];
  let g='';for(const f of [0,.5,1]){const y=T+ch-ch*f;g+=`<line x1="${L}" x2="${W}" y1="${y}" y2="${y}" stroke="#e0e6ef"/><text x="${L-6}" y="${y+4}" text-anchor="end">${Math.round(top*f)}</text>`}
  const step=Math.ceil(n/8);
  daily.forEach((x,i)=>{const h=ch*x[key]/top,bx=L+i*bw+bw*.14,last=i==n-1,dt=new Date(x.day+'T00:00:00');
    g+=`<rect x="${bx}" y="${T+ch-h}" width="${bw*.72}" height="${Math.max(h,x[key]?1.5:0)}" rx="2" fill="${last?'#e3b112':'#1d4a8c'}"><title>${dt.toLocaleDateString('fr-FR')} : ${x[key]} ${lab}</title></rect>`;
    if(i%step==0||last)g+=`<text x="${bx+bw*.36}" y="${H-8}" text-anchor="middle">${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}</text>`});
  return `<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution par jour">${g}</svg>`;
}

/* ================= COMMANDES ================= */
async function vOrders(){
  view.innerHTML='<div class="empty">Chargement…</div>';
  try{S.orders=await all((a,b)=>sb.from('orders').select('*').order('created_at',{ascending:false}).range(a,b))}catch(e){return fail(e,'Chargement des commandes impossible')}
  view.innerHTML=`<div class="bar"><h1>Commandes</h1><input type="search" id="q" placeholder="Nom, téléphone, n° de commande…" value="${esc(S.os)}" aria-label="Rechercher"><button class="btn" id="dl">Télécharger (CSV)</button></div><div class="chips" id="chips"></div><div id="bk"></div><div class="tw" id="tb"></div>`;
  $('#q').oninput=e=>{S.os=e.target.value;S.sel.clear();drawOrders()};$('#dl').onclick=()=>{const L=ordersFiltered();
    csv('commandes',['N° commande','Date','Nom','Téléphone','Wilaya','Commune','Adresse','Produits','Total (DA)','Prix sur demande','Statut','Remarques client','Note interne'],L.map(o=>[o.code,fdate(o.created_at),o.name,o.phone,o.wilaya,o.commune,o.address,o.items.map(i=>`${i.qty} x ${i.name} (${i.ref})`).join(' | '),Number(o.total),o.has_unpriced?'Oui':'Non',ST[o.status]||o.status,o.notes,o.admin_note]))};
  drawOrders();counts();
}
function ordersFiltered(){const q=S.os.trim().toLowerCase();return S.orders.filter(o=>(S.of=='all'||o.status==S.of)&&(!q||(o.name+' '+o.phone+' '+o.code+' '+o.wilaya).toLowerCase().includes(q)))}
function drawOrders(){
  const cn=k=>k=='all'?S.orders.length:S.orders.filter(o=>o.status==k).length;
  $('#chips').innerHTML=['all',...Object.keys(ST)].map(k=>`<button class="chip ${S.of==k?'on':''}" data-k="${k}">${k=='all'?'Toutes':ST[k]} (${cn(k)})</button>`).join('');
  $$('#chips .chip').forEach(b=>b.onclick=()=>{S.of=b.dataset.k;S.sel.clear();drawOrders()});
  const L=ordersFiltered();
  $('#tb').innerHTML=L.length?`<table class="cards"><thead><tr><th><input type="checkbox" id="ca" aria-label="Tout sélectionner"></th><th>Commande</th><th>Client</th><th>Livraison</th><th>Total</th><th>Statut</th><th></th></tr></thead><tbody>${L.map(o=>`<tr><td class="ck"><input type="checkbox" class="rc" data-id="${o.id}" ${S.sel.has(o.id)?'checked':''} aria-label="Sélectionner ${esc(o.code)}"></td><td data-l="Commande"><b>${esc(o.code)}</b><small>${fdate(o.created_at)}</small></td><td data-l="Client">${esc(o.name)}<small><a href="tel:${esc(o.phone)}">${esc(o.phone)}</a></small></td><td data-l="Livraison">${esc(o.wilaya)}<small>${o.items.reduce((a,i)=>a+i.qty,0)} article(s)</small></td><td class="num" data-l="Total">${o.total>0?DA(o.total):'–'}${o.has_unpriced?'<small>+ prix sur demande</small>':''}</td><td data-l="Statut">${stSel(o.status,ST,'data-id="'+o.id+'" data-t="o"')}</td><td class="act"><button class="btn sm" data-v="${o.id}">Détails</button> <button class="btn sm dng" data-d="${o.id}">Supprimer</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty">Aucune commande.</div>';
  bulkOrders();
  $$('#tb .rc').forEach(c=>c.onchange=()=>{c.checked?S.sel.add(+c.dataset.id):S.sel.delete(+c.dataset.id);bulkOrders()});
  const ca=$('#ca');if(ca)ca.onchange=()=>{$$('#tb .rc').forEach(c=>{c.checked=ca.checked;ca.checked?S.sel.add(+c.dataset.id):S.sel.delete(+c.dataset.id)});bulkOrders()};
  $$('#tb [data-t=o]').forEach(s=>s.onchange=()=>setStatus('orders',+s.dataset.id,s.value,s));
  $$('#tb [data-v]').forEach(b=>b.onclick=()=>orderDlg(+b.dataset.v));
  $$('#tb [data-d]').forEach(b=>b.onclick=()=>delRows('orders',[+b.dataset.d],'cette commande'));
}
const stSel=(v,map,attr)=>`<select class="stsel ${v}" ${attr} aria-label="Statut">${Object.entries(map).map(([k,l])=>`<option value="${k}" ${k==v?'selected':''}>${l}</option>`).join('')}</select>`;
function bulkOrders(){
  const n=S.sel.size,b=$('#bk');
  b.innerHTML=n?`<div class="bulk"><b>${n} sélectionnée(s)</b><select id="bs"><option value="">Changer le statut…</option>${Object.entries(ST).map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select><button class="btn sm dng" id="bd">Supprimer</button></div>`:'';
  if(!n)return;
  $('#bs').onchange=async e=>{const v=e.target.value;if(!v)return;const ids=[...S.sel];const{error}=await sb.from('orders').update({status:v}).in('id',ids);if(error)return fail(error);S.orders.forEach(o=>{if(S.sel.has(o.id))o.status=v});toast('Statut mis à jour');S.sel.clear();drawOrders();counts()};
  $('#bd').onclick=()=>delRows('orders',[...S.sel],n+' commande(s)');
}
async function setStatus(table,id,v,el){
  const list=table=='orders'?S.orders:S.quotes,row=list.find(x=>x.id==id),old=row.status;
  const{error}=await sb.from(table).update({status:v}).eq('id',id);
  if(error){el.value=old;return fail(error)}
  row.status=v;el.className='stsel '+v;toast('Statut mis à jour');counts();
  if(table=='orders'&&S.of!='all')drawOrders();
}
async function delRows(table,ids,label){
  if(!confirm('Supprimer définitivement '+label+' ? Cette action est irréversible.'))return;
  const{error}=await sb.from(table).delete().in('id',ids);if(error)return fail(error);
  const set=new Set(ids);S[table]=S[table].filter(x=>!set.has(x.id));S.sel.clear();dlg.open&&dlg.close();toast('Supprimé');counts();
  ({orders:drawOrders,quotes:drawQuotes,products:drawProducts})[table]();
}
const waLink=p=>{let d=String(p).replace(/\D/g,'');if(d.startsWith('00'))d=d.slice(2);else if(d.startsWith('0'))d='213'+d.slice(1);return 'https://wa.me/'+d};
function orderDlg(id){
  const o=S.orders.find(x=>x.id==id);if(!o)return;
  openDlg(`<div class="dh"><h2>Commande ${esc(o.code)}</h2><button class="btn sm" data-close>Fermer</button></div><div class="db">
  <dl class="kv"><dt>Date</dt><dd>${fdate(o.created_at)}</dd><dt>Client</dt><dd>${esc(o.name)}</dd><dt>Téléphone</dt><dd><a href="tel:${esc(o.phone)}">${esc(o.phone)}</a> · <a href="${waLink(o.phone)}" target="_blank" rel="noopener">WhatsApp</a></dd><dt>Wilaya / commune</dt><dd>${esc(o.wilaya)} / ${esc(o.commune)}</dd><dt>Adresse</dt><dd>${esc(o.address)}</dd>${o.notes?`<dt>Remarques</dt><dd>${esc(o.notes)}</dd>`:''}<dt>Statut</dt><dd>${stSel(o.status,ST,'id="ds"')}</dd></dl>
  <div class="tw"><table style="min-width:0"><thead><tr><th>Réf.</th><th>Produit</th><th>Qté</th><th>Prix unitaire</th><th>Sous-total</th></tr></thead><tbody>${o.items.map(i=>`<tr><td>${esc(i.ref)}</td><td>${esc(i.name)}</td><td>${i.qty}</td><td class="num">${DA(i.price)}</td><td class="num">${i.price!=null?DA(i.price*i.qty):'–'}</td></tr>`).join('')}</tbody></table></div>
  <div><b>Total : ${DA(o.total)}</b>${o.has_unpriced?' <span class="mut">(+ articles à prix sur demande)</span>':''}</div>
  <label>Note interne (visible uniquement ici)<textarea id="dn" rows="3">${esc(o.admin_note||'')}</textarea></label></div>
  <div class="df"><button class="btn dng" id="dx">Supprimer</button><button class="btn pri" id="dsv">Enregistrer la note</button></div>`);
  $('#ds').onchange=async e=>{await setStatus('orders',o.id,e.target.value,e.target);drawOrders()};
  $('#dsv').onclick=async()=>{const v=$('#dn').value.trim()||null;const{error}=await sb.from('orders').update({admin_note:v}).eq('id',o.id);if(error)return fail(error);o.admin_note=v;toast('Note enregistrée')};
  $('#dx').onclick=()=>delRows('orders',[o.id],'cette commande');
}

/* ================= DEVIS ================= */
async function vQuotes(){
  view.innerHTML='<div class="empty">Chargement…</div>';
  try{S.quotes=await all((a,b)=>sb.from('quotes').select('*').order('created_at',{ascending:false}).range(a,b))}catch(e){return fail(e,'Chargement des devis impossible')}
  view.innerHTML=`<div class="bar"><h1>Demandes de devis</h1><input type="search" id="q" placeholder="Nom, téléphone, message…" value="${esc(S.qs)}" aria-label="Rechercher"><button class="btn" id="dl">Télécharger (CSV)</button></div><div id="bk"></div><div class="tw" id="tb"></div>`;
  $('#q').oninput=e=>{S.qs=e.target.value;S.sel.clear();drawQuotes()};
  $('#dl').onclick=()=>csv('devis',['Date','Nom / Société','Téléphone','E-mail','Message','Statut'],quotesFiltered().map(x=>[fdate(x.created_at),x.name,x.phone,x.email,x.message,QST[x.status]]));
  drawQuotes();counts();
}
function quotesFiltered(){const q=S.qs.trim().toLowerCase();return S.quotes.filter(x=>!q||(x.name+' '+x.phone+' '+(x.email||'')+' '+x.message).toLowerCase().includes(q))}
function drawQuotes(){
  const L=quotesFiltered();
  $('#tb').innerHTML=L.length?`<table class="cards"><thead><tr><th>Date</th><th>Contact</th><th>Demande</th><th>Statut</th><th></th></tr></thead><tbody>${L.map(x=>`<tr><td data-l="Date">${fdate(x.created_at)}</td><td data-l="Contact"><b>${esc(x.name)}</b><small><a href="tel:${esc(x.phone)}">${esc(x.phone)}</a> · <a href="${waLink(x.phone)}" target="_blank" rel="noopener">WhatsApp</a></small>${x.email?`<small><a href="mailto:${esc(x.email)}">${esc(x.email)}</a></small>`:''}</td><td data-l="Demande" style="white-space:pre-wrap;max-width:420px">${esc(x.message)}</td><td data-l="Statut">${stSel(x.status,QST,'data-id="'+x.id+'" data-t="q"')}</td><td class="act"><button class="btn sm dng" data-d="${x.id}">Supprimer</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty">Aucune demande de devis.</div>';
  $('#bk').innerHTML='';
  $$('#tb [data-t=q]').forEach(s=>s.onchange=()=>setStatus('quotes',+s.dataset.id,s.value,s));
  $$('#tb [data-d]').forEach(b=>b.onclick=()=>delRows('quotes',[+b.dataset.d],'cette demande'));
}

/* ================= PRODUITS ================= */
const IMG_PATH=u=>{const m=(u||'').match(/\/product-images\/(.+)$/);return m?decodeURIComponent(m[1]):null};
async function vProducts(){
  view.innerHTML='<div class="empty">Chargement…</div>';
  try{S.products=await all((a,b)=>sb.from('products').select('*').order('id',{ascending:false}).range(a,b))}catch(e){return fail(e,'Chargement des produits impossible')}
  view.innerHTML=`<div class="bar"><h1>Produits</h1><button class="btn pri" id="add">+ Ajouter un produit</button><button class="btn" id="dl">Télécharger (CSV)</button></div>
  <div class="bar"><input type="search" id="q" placeholder="Nom, référence, marque…" value="${esc(S.ps)}" aria-label="Rechercher"><select id="fc" aria-label="Catégorie"><option value="">Toutes les catégories</option>${C.map(c=>`<option ${S.pc==c[0]?'selected':''}>${esc(c[0])}</option>`).join('')}</select><select id="fv" aria-label="Visibilité"><option value="">Visibles et masqués</option><option value="1" ${S.pv=='1'?'selected':''}>Visibles</option><option value="0" ${S.pv=='0'?'selected':''}>Masqués</option></select></div>
  <div id="bk"></div><div class="tw" id="tb"></div><div class="pager" id="pg"></div>`;
  $('#q').oninput=e=>{S.ps=e.target.value;S.page=1;S.sel.clear();drawProducts()};
  $('#fc').onchange=e=>{S.pc=e.target.value;S.page=1;S.sel.clear();drawProducts()};
  $('#fv').onchange=e=>{S.pv=e.target.value;S.page=1;S.sel.clear();drawProducts()};
  $('#add').onclick=()=>productDlg();
  $('#dl').onclick=()=>csv('produits',['Référence','Nom','Catégorie','Sous-catégorie','Marque','Prix (DA)','Nouveauté (accueil)','Populaire (accueil)','Visible','Description','Image','Ajouté le'],productsFiltered().map(p=>[p.ref,p.name,p.category,p.subcategory,p.brand,p.price==null?'Sur demande':Number(p.price),p.is_new?'Oui':'Non',p.is_popular?'Oui':'Non',p.visible?'Oui':'Non',p.description,p.image_url,fdate(p.created_at)]));
  drawProducts();
}
function productsFiltered(){const q=S.ps.trim().toLowerCase();return S.products.filter(p=>(!S.pc||p.category==S.pc)&&(S.pv==''||(S.pv=='1')==p.visible)&&(!q||(p.name+' '+p.ref+' '+(p.brand||'')).toLowerCase().includes(q)))}
function drawProducts(){
  const L=productsFiltered(),per=50,pages=Math.max(1,Math.ceil(L.length/per));S.page=Math.min(S.page,pages);
  const rows=L.slice((S.page-1)*per,S.page*per);
  $('#tb').innerHTML=rows.length?`<table class="cards"><thead><tr><th><input type="checkbox" id="ca" aria-label="Tout sélectionner"></th><th></th><th>Référence</th><th>Produit</th><th>Catégorie</th><th>Prix</th><th>Visible</th><th></th></tr></thead><tbody>${rows.map(p=>`<tr><td class="ck"><input type="checkbox" class="rc" data-id="${p.id}" ${S.sel.has(p.id)?'checked':''} aria-label="Sélectionner ${esc(p.ref)}"></td><td class="im">${p.image_url?`<img class="th" src="${esc(p.image_url)}" alt="" loading="lazy">`:'<img class="th pl" src="assets/logo.png" alt="">'}</td><td data-l="Référence"><b>${esc(p.ref)}</b></td><td data-l="Produit">${esc(p.name)}${p.is_new?'<span class="pill">Nouveau</span>':''}${p.is_popular?'<span class="pill pop">Populaire</span>':''}${p.brand?`<small>${esc(p.brand)}</small>`:''}</td><td data-l="Catégorie">${esc(p.category)}<small>${esc(p.subcategory)}</small></td><td class="num" data-l="Prix">${DA(p.price)}</td><td data-l="Visible"><label class="sw" title="${p.visible?'Visible sur la boutique':'Masqué'}"><input type="checkbox" class="vz" data-id="${p.id}" ${p.visible?'checked':''} aria-label="Visible sur la boutique"><i></i></label></td><td class="act"><button class="btn sm" data-e="${p.id}">Modifier</button> <button class="btn sm dng" data-d="${p.id}">Supprimer</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty">Aucun produit. Utilisez « Ajouter un produit ».</div>';
  $('#pg').innerHTML=`${L.length} produit(s)${pages>1?` · <button class="btn sm" id="pp" ${S.page<=1?'disabled':''}>Précédent</button> page ${S.page}/${pages} <button class="btn sm" id="pn" ${S.page>=pages?'disabled':''}>Suivant</button>`:''}`;
  if(pages>1){$('#pp').onclick=()=>{S.page--;drawProducts()};$('#pn').onclick=()=>{S.page++;drawProducts()}}
  bulkProducts();
  $$('#tb .rc').forEach(c=>c.onchange=()=>{c.checked?S.sel.add(+c.dataset.id):S.sel.delete(+c.dataset.id);bulkProducts()});
  const ca=$('#ca');if(ca)ca.onchange=()=>{$$('#tb .rc').forEach(c=>{c.checked=ca.checked;ca.checked?S.sel.add(+c.dataset.id):S.sel.delete(+c.dataset.id)});bulkProducts()};
  $$('#tb .vz').forEach(c=>c.onchange=async()=>{const id=+c.dataset.id,p=S.products.find(x=>x.id==id);const{error}=await sb.from('products').update({visible:c.checked}).eq('id',id);if(error){c.checked=!c.checked;return fail(error)}p.visible=c.checked;toast(c.checked?'Produit affiché':'Produit masqué');if(S.pv!='')drawProducts()});
  $$('#tb [data-e]').forEach(b=>b.onclick=()=>productDlg(+b.dataset.e));
  $$('#tb [data-d]').forEach(b=>b.onclick=()=>delProducts([+b.dataset.d]));
}
function bulkProducts(){
  const n=S.sel.size,b=$('#bk');
  b.innerHTML=n?`<div class="bulk"><b>${n} sélectionné(s)</b><button class="btn sm" id="bh">Masquer</button><button class="btn sm" id="bsw">Afficher</button><button class="btn sm" id="bn">Mettre en Nouveautés</button><button class="btn sm" id="bp">Mettre en Populaires</button><button class="btn sm" id="bx">Retirer de l’accueil</button><button class="btn sm dng" id="bd">Supprimer</button></div>`:'';
  if(!n)return;
  const vis=async v=>{const{error}=await sb.from('products').update({visible:v}).in('id',[...S.sel]);if(error)return fail(error);S.products.forEach(p=>{if(S.sel.has(p.id))p.visible=v});toast(v?'Produits affichés':'Produits masqués');S.sel.clear();drawProducts()};
  const fl=async(o,m)=>{const{error}=await sb.from('products').update(o).in('id',[...S.sel]);if(error)return fail(error);S.products.forEach(p=>{if(S.sel.has(p.id))Object.assign(p,o)});toast(m);S.sel.clear();drawProducts()};
  $('#bn').onclick=()=>fl({is_new:true},'Ajoutés aux Nouveautés');$('#bp').onclick=()=>fl({is_popular:true},'Ajoutés aux Produits populaires');$('#bx').onclick=()=>fl({is_new:false,is_popular:false},'Retirés de l’accueil');
  $('#bh').onclick=()=>vis(false);$('#bsw').onclick=()=>vis(true);$('#bd').onclick=()=>delProducts([...S.sel]);
}
async function delProducts(ids){
  const L=S.products.filter(p=>ids.includes(p.id));
  if(!confirm(`Supprimer définitivement ${L.length>1?L.length+' produits':'« '+L[0].name+' »'} ?\n\nAstuce : « Masquer » le retire de la boutique sans le perdre. Les commandes déjà reçues restent intactes.`))return;
  const{error}=await sb.from('products').delete().in('id',ids);if(error)return fail(error);
  const paths=L.map(p=>IMG_PATH(p.image_url)).filter(Boolean);if(paths.length)sb.storage.from('product-images').remove(paths).then(()=>{},()=>{});
  S.products=S.products.filter(p=>!ids.includes(p.id));S.sel.clear();dlg.open&&dlg.close();toast('Supprimé');drawProducts();
}
function nextRef(){let m=1000;S.products.forEach(p=>{const x=/^ISO-(\d+)$/.exec(p.ref);if(x)m=Math.max(m,+x[1])});return 'ISO-'+(m+1)}
function resize(file,max=1000){return new Promise((ok,ko)=>{const im=new Image(),u=URL.createObjectURL(file);im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(b=>b?ok(b):ko(new Error('Image illisible')),'image/jpeg',.85)};im.onerror=()=>ko(new Error('Image illisible'));im.src=u})}
function productDlg(id){
  const p=id?S.products.find(x=>x.id==id):null,cat=p?p.category:C[0][0];
  const subs=c=>(C.find(x=>x[0]==c)||C[0])[1].map(s=>`<option ${p&&p.subcategory==s&&p.category==c?'selected':''}>${esc(s)}</option>`).join('');
  let newFile=null,rmImg=false;
  openDlg(`<form id="pf"><div class="dh"><h2>${p?'Modifier le produit':'Ajouter un produit'}</h2><button type="button" class="btn sm" data-close>Fermer</button></div><div class="db">
  <div class="f2"><label>Catégorie<select name="category" required>${C.map(c=>`<option ${c[0]==cat?'selected':''}>${esc(c[0])}</option>`).join('')}</select></label>
  <label>Sous-catégorie<select name="subcategory" required>${subs(cat)}</select></label></div>
  <div class="f2"><label>Référence<input name="ref" required maxlength="60" value="${esc(p?p.ref:nextRef())}"><span class="hint">Unique pour chaque produit.</span></label>
  <label>Marque (facultatif)<input name="brand" maxlength="80" value="${esc(p?p.brand:'')}" placeholder="Schneider, ABB…"></label></div>
  <label>Nom du produit<input name="name" required minlength="2" maxlength="200" value="${esc(p?p.name:'')}"></label>
  <div class="f2"><label>Prix en DA (facultatif)<input name="price" type="number" min="0" step="1" inputmode="numeric" value="${p&&p.price!=null?Number(p.price):''}"><span class="hint">Laisser vide = « Prix sur demande ».</span></label>
  <div class="hp"><b>Page d’accueil</b><label class="chk"><input type="checkbox" name="is_new" ${p&&p.is_new?'checked':''}> Afficher dans « Nouveautés »</label><label class="chk"><input type="checkbox" name="is_popular" ${p&&p.is_popular?'checked':''}> Afficher dans « Produits populaires »</label></div></div>
  <label>Description (facultatif)<textarea name="description" rows="4" maxlength="3000">${esc(p?p.description:'')}</textarea></label>
  <div><label>Photo<input type="file" id="pfile" accept="image/jpeg,image/png,image/webp"></label><div class="pv" style="margin-top:8px" id="pvw">${p&&p.image_url?`<img src="${esc(p.image_url)}" alt=""><button type="button" class="btn sm dng" id="prm">Retirer la photo</button>`:''}</div></div>
  <label class="chk"><input type="checkbox" name="visible" ${!p||p.visible?'checked':''}> Visible sur la boutique</label></div>
  <div class="df"><button type="button" class="btn" data-close>Annuler</button><button class="btn pri" id="psv">${p?'Enregistrer':'Ajouter le produit'}</button></div></form>`);
  const f=$('#pf');
  f.category.onchange=()=>{f.subcategory.innerHTML=subs(f.category.value)};
  const pvw=$('#pvw');
  $('#pfile').onchange=async e=>{const fl=e.target.files[0];if(!fl)return;try{newFile=await resize(fl);rmImg=false;pvw.innerHTML=`<img src="${URL.createObjectURL(newFile)}" alt="">`}catch(x){e.target.value='';newFile=null;fail(x,'Image refusée')}};
  const rm=$('#prm');if(rm)rm.onclick=()=>{rmImg=true;newFile=null;$('#pfile').value='';pvw.innerHTML='<span class="mut">La photo sera retirée à l’enregistrement.</span>'};
  f.onsubmit=async e=>{
    e.preventDefault();const b=$('#psv');b.disabled=true;b.textContent='Enregistrement…';
    try{
      let url=p?p.image_url:null,oldPath=null;
      if(newFile||rmImg){oldPath=IMG_PATH(url);url=null}
      if(newFile){const path='p-'+Date.now()+'-'+Math.random().toString(36).slice(2,7)+'.jpg';
        const up=await sb.storage.from('product-images').upload(path,newFile,{contentType:'image/jpeg',cacheControl:'31536000'});if(up.error)throw up.error;
        url=sb.storage.from('product-images').getPublicUrl(path).data.publicUrl}
      const row={ref:f.ref.value.trim(),name:f.name.value.trim(),category:f.category.value,subcategory:f.subcategory.value,brand:f.brand.value.trim()||null,description:f.description.value.trim()||null,price:f.price.value===''?null:Number(f.price.value),is_new:f.is_new.checked,is_popular:f.is_popular.checked,visible:f.visible.checked,image_url:url};
      const q=p?sb.from('products').update(row).eq('id',p.id).select().single():sb.from('products').insert(row).select().single();
      const{data,error}=await q;
      if(error){if(newFile&&url)sb.storage.from('product-images').remove([IMG_PATH(url)]).then(()=>{},()=>{});throw error}
      if(oldPath)sb.storage.from('product-images').remove([oldPath]).then(()=>{},()=>{});
      if(p)Object.assign(p,data);else S.products.unshift(data);
      dlg.close();toast(p?'Produit enregistré':'Produit ajouté');drawProducts();
    }catch(x){b.disabled=false;b.textContent=p?'Enregistrer':'Ajouter le produit';
      if(x&&x.code=='23505')toast('Cette référence existe déjà. Choisissez-en une autre.',true);else fail(x,'Enregistrement impossible')}
  };
}

/* ---------- démarrage ---------- */
(async()=>{
  if(!window.sb){showLogin();$('#lf').querySelector('button').disabled=true;const m=$('#lmsg');m.hidden=false;m.textContent='Supabase n’est pas configuré : renseignez config.js (voir README).';return}
  const{data}=await sb.auth.getSession();
  data.session?enter():showLogin();
})();
