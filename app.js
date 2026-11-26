const $=s=>document.querySelector(s),app=$('#app');
const G=id=>P.find(x=>x.id==id);
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>n.toLocaleString('fr-FR').replace(/\u202f/g,' ')+' DA';
let cart={};try{cart=JSON.parse(localStorage.getItem('isoCart2')||'{}')}catch(e){}
const save=()=>{try{localStorage.setItem('isoCart2',JSON.stringify(cart))}catch(e){}$('#cn').textContent=Object.values(cart).reduce((a,b)=>a+b,0)};
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(t._t);t._t=setTimeout(()=>t.style.display='none',2200)}
function add(id,q=1){cart[id]=(cart[id]||0)+q;save();toast('Ajouté au panier : '+(G(id).nr||G(id).n))}
const slug=(c,s)=>'#/shop/'+c+(s!=null?'/'+s:'');
const img=p=>p.img?`<img src="${p.img}" alt="${p.n}">`:`<img class="pl" src="assets/logo.png" alt="">`;
const price=p=>p.p!=null?`<div class="pr">${fmt(p.p)}</div>`:`<div class="pr q">Prix sur demande</div>`;
const card=p=>`<div class="card">${p.t?`<span class="bd ${p.t=='Populaire'?'pop':''}">${p.t}</span>`:''}<a class="ph" href="#/p/${p.id}">${img(p)}</a><div class="cb"><small>${C[p.c][0]} · Réf. ${p.ref}</small><h3><a href="#/p/${p.id}">${p.n}</a></h3>${price(p)}<button class="btn dk" onclick="add(${p.id})">Ajouter au panier</button></div></div>`;
const menu=()=>{$('#menu').innerHTML='<li><a href="#/shop">Tout le catalogue</a></li>'+C.map((c,i)=>`<li class="hs"><a href="${slug(i)}">${c[0]}</a><div class="dd"><a class="mo" href="${slug(i)}">Voir toute la catégorie</a>${c[1].map((s,j)=>`<a href="${slug(i,j)}">${s}</a>`).join('')}</div></li>`).join('')};
const R={
home(){const nw=P.filter(p=>p.nw),pp=P.filter(p=>p.pop);
return `<div class="w"><div class="hero"><div><small>Industrial Solutions</small><h1>Votre boutique en ligne de matériel électrique et pneumatique industriel</h1><p>Automatisme, départ moteur, distribution d’énergie, câbles et composants pneumatiques, livrés partout en Algérie.</p><a class="btn" href="#/shop">Explorer le catalogue</a><a class="btn ol" href="#/devis">Demander un devis</a></div><video autoplay muted loop playsinline poster="assets/poster-blue.jpg"><source src="assets/intro-blue.mp4" type="video/mp4"></video></div>
<div class="perks"><div class="pk"><svg viewBox="0 0 24 24"><path d="M2 6h12v10H2zM14 9h4l4 4v3h-8z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg><div><b>Livraison en Algérie</b><span>Expédition rapide</span></div></div><div class="pk"><svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20"/></svg><div><b>Paiement à la livraison</b><span>Simple et sécurisé</span></div></div><div class="pk"><svg viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg><div><b>Produits d’origine</b><span>Marques garanties</span></div></div><div class="pk"><svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg><div><b>Assistance technique</b><span>0549 51 29 88</span></div></div></div>
<div class="sec"><div class="sh"><h2>Nos catégories</h2><a href="#/shop">Tout le catalogue</a></div><div class="cats">${C.map((c,i)=>`<a class="cc" href="${slug(i)}"><h3>${c[0]}</h3><p>${c[1].join(', ')}</p></a>`).join('')}</div></div>
<div class="sec"><div class="sh"><h2>Nouveautés</h2><a href="#/shop">Voir tout</a></div><div class="grid">${nw.map(card).join('')}</div></div>
<div class="sec"><div class="sh"><h2>Produits populaires</h2><a href="#/shop">Voir tout</a></div><div class="grid">${pp.map(card).join('')}</div></div>
<div class="sec"><div class="cta"><div><h2>Une référence à sourcer ou une offre volume ?</h2><p>Envoyez-nous votre liste, nous vous répondons rapidement.</p></div><a class="btn" href="#/devis">Demander un devis</a></div></div>
<div class="sec"><div class="sh"><h2>Nos partenaires</h2></div><div class="brands"><div><img src="assets/brands/schneider-electric.png" alt="Schneider Electric" loading="lazy"></div><div><img src="assets/brands/abb.png" alt="ABB" loading="lazy"></div><div><img src="assets/brands/perkins.png" alt="Perkins" loading="lazy"></div><div><img src="assets/brands/socomec.png" alt="Socomec" loading="lazy"></div><div><img src="assets/brands/deutz.png" alt="Deutz" loading="lazy"></div><div><img src="assets/brands/volvo-penta.png" alt="Volvo Penta" loading="lazy"></div><div><img src="assets/brands/cummins.png" alt="Cummins" loading="lazy"></div><div><img src="assets/brands/aksa.png" alt="Aksa" loading="lazy"></div><div><img src="assets/brands/iveco.png" alt="Iveco" loading="lazy"></div><div><img src="assets/brands/comap.png" alt="ComAp" loading="lazy"></div><div><img src="assets/brands/dse.png" alt="DSE" loading="lazy"></div></div></div>
<div class="sec"><div class="ab"><div><div class="sh"><h2>À propos d’ISO POWER</h2></div><p>ISO POWER distribue du matériel électrique et pneumatique industriel depuis SNTP – Hamiz, Alger. Notre équipe vous conseille dans le choix des références et vous livre partout en Algérie.</p><a class="btn dk" href="#/devis">Nous contacter</a></div><video controls playsinline preload="metadata" poster="assets/poster-white.jpg"><source src="assets/intro-white.mp4" type="video/mp4"></video></div></div></div>`},
shop(a,b,q){let c=a!==undefined&&a!==''?+a:null,s=b!==undefined?+b:null,L=P.filter(p=>(c==null||p.c==c)&&(s==null||p.s==s)&&(!q||(p.n+' '+p.ref).toLowerCase().includes(q.toLowerCase())));
const sort=$('#so')?$('#so').value:'';if(sort=='az')L=[...L].sort((x,y)=>x.n.localeCompare(y.n));
const title=q?`Résultats pour « ${q} »`:c==null?'Tout le catalogue':s==null?C[c][0]:C[c][1][s];
const side=`<div class="side"><h4>Catégories</h4><a href="#/shop" class="${c==null?'on':''}">Tout le catalogue</a>${C.map((x,i)=>`<a href="${slug(i)}" class="${c==i&&s==null?'on':''}">${x[0]}</a>`+(c==i?x[1].map((y,j)=>`<a class="sub ${s==j?'on':''}" href="${slug(i,j)}">${y}</a>`).join(''):'')).join('')}</div>`;
return `<div class="w"><div class="bc"><a href="#/">Accueil</a> / <a href="#/shop">Boutique</a>${c!=null?' / <a href="'+slug(c)+'">'+C[c][0]+'</a>':''}${s!=null?' / '+C[c][1][s]:''}</div><div class="shop">${side}<div><div class="top2"><h1>${title} <small style="font-size:14px;color:var(--mut);font-weight:400">(${L.length})</small></h1><select id="so" onchange="route()"><option value="">Trier : par défaut</option><option value="az"${sort=='az'?' selected':''}>Nom A–Z</option></select></div>${L.length?`<div class="grid sg">${L.map(card).join('')}</div>`:'<div class="empty">Aucun produit trouvé. <a href="#/devis" style="color:var(--blue);font-weight:700">Demandez-nous cette référence</a>.</div>'}</div></div></div>`},
p(id){const p=G(id);if(!p)return R.shop();let n=1;window.qd=d=>{n=Math.max(1,n+d);$('#qn').textContent=n};window.qa=()=>add(id,n);
return `<div class="w"><div class="bc"><a href="#/">Accueil</a> / <a href="${slug(p.c)}">${C[p.c][0]}</a> / <a href="${slug(p.c,p.s)}">${C[p.c][1][p.s]}</a></div><div class="pd"><div class="ph">${img(p)}</div><div><span class="meta">${C[p.c][1][p.s]}</span><h1>${p.n}</h1><div class="meta">Référence : <b>${p.ref}</b></div><div style="margin:14px 0">${price(p)}</div>${p.brand?`<div class="meta">Marque : <b>${p.brand}</b></div>`:''}<p class="meta">${p.desc?p.desc.replace(/\n/g,'<br>'):'Produit professionnel pour applications industrielles. Contactez-nous pour la fiche technique, la disponibilité et les conditions de livraison.'}</p><div class="row"><div class="qty"><button onclick="qd(-1)">−</button><span id="qn">1</span><button onclick="qd(1)">+</button></div><button class="btn dk" onclick="qa()">Ajouter au panier</button><a class="btn" href="#/devis/${p.id}">Demander un devis</a></div><div class="meta">Paiement à la livraison · Livraison partout en Algérie</div></div></div><div class="sec"><div class="sh"><h2>Produits similaires</h2></div><div class="grid">${P.filter(x=>x.c==p.c&&x.id!=p.id).slice(0,4).map(card).join('')}</div></div></div>`},
cart(){const ids=Object.keys(cart);if(!ids.length)return `<div class="w"><div class="sec"><div class="empty">Votre panier est vide.<br><br><a class="btn dk" href="#/shop">Parcourir le catalogue</a></div></div></div>`;
let tot=0,unk=false;const rows=ids.map(i=>{const p=G(i),q=cart[i];if(p.p!=null)tot+=p.p*q;else unk=true;return `<div class="ln"><a class="ph" href="#/p/${i}">${img(p)}</a><div><a href="#/p/${i}"><b>${p.n}</b></a><div class="meta">Réf. ${p.ref}</div><button class="rm" onclick="del(${i})">Retirer</button></div><div class="qty"><button onclick="chg(${i},-1)">−</button><span>${q}</span><button onclick="chg(${i},1)">+</button></div><div class="pr ${p.p==null?'q':''}">${p.p!=null?fmt(p.p*q):'Sur demande'}</div></div>`}).join('');
return `<div class="w"><div class="sec"><div class="sh"><h2>Mon panier</h2></div><div class="two"><div class="tbl">${rows}</div><div class="box"><h3>Récapitulatif</h3><p>Articles : <b>${Object.values(cart).reduce((a,b)=>a+b,0)}</b></p>${tot?`<p>Sous-total : <b>${fmt(tot)}</b></p>`:''}${unk?'<p class="meta">Les prix sur demande seront confirmés par notre équipe avant livraison.</p>':''}<p class="meta">Paiement à la livraison.</p><a class="btn dk" style="width:100%" href="#/checkout">Passer la commande</a></div></div></div></div>`},
checkout(){if(!Object.keys(cart).length)return R.cart();
return `<div class="w"><div class="sec"><div class="sh"><h2>Finaliser la commande</h2></div><div class="two"><form class="box" id="ck"><h3>Vos informations</h3><div class="f2"><label>Nom et prénom<input name="n" required></label><label>Téléphone<input name="t" type="tel" required></label></div><div class="f2"><label>Wilaya<input name="w" required></label><label>Commune<input name="c" required></label></div><label>Adresse de livraison<input name="a" required></label><label>Remarques (facultatif)<textarea name="r" rows="3"></textarea></label><button class="btn dk" style="width:100%">Envoyer la commande</button><p class="meta">${window.sb?'Notre équipe vous appelle pour confirmer la commande. Paiement à la livraison.':`Votre messagerie s’ouvrira avec la commande prête à envoyer à ${SHOP.mail}. Paiement à la livraison.`}</p></form><div class="box"><h3>Votre commande</h3>${Object.keys(cart).map(i=>`<p>${cart[i]} × ${G(i).n}</p>`).join('')}</div></div></div></div>`},
done(){const k=decodeURIComponent(location.hash.split('/')[2]||''),q=k=='devis';return `<div class="w"><div class="sec"><div class="empty"><h2>${q?'Demande de devis envoyée':'Commande envoyée, merci !'}</h2>${q?'':`<p>Votre numéro de commande : <b>${esc(k)}</b></p>`}<p>Notre équipe vous contacte très vite par téléphone.${q?'':' Paiement à la livraison.'}</p><br><a class="btn dk" href="#/shop">Continuer mes achats</a></div></div></div>`},
devis(id){const pre=id!==undefined&&G(id)?'- '+G(id).n+'\n':'';
return `<div class="w"><div class="sec"><div class="sh"><h2>Demande de devis</h2></div><div class="two"><form class="box" id="dv"><div class="f2"><label>Nom / Société<input name="n" required></label><label>Téléphone<input name="t" type="tel" required></label></div><label>E-mail<input name="e" type="email"></label><label>Produits ou références recherchés<textarea name="m" rows="6" required>${pre}</textarea></label><button class="btn dk" style="width:100%">Envoyer la demande</button></form><div class="box"><h3>Contact</h3><p><b>Adresse</b><br>SNTP – Hamiz, Alger</p><p><b>Téléphone</b><br><a href="tel:+213549512988">${SHOP.phone}</a></p><p><b>E-mail</b><br><a href="mailto:${SHOP.mail}">${SHOP.mail}</a></p></div></div></div></div>`}
};
window.del=i=>{delete cart[i];save();route()};window.chg=(i,d)=>{cart[i]=Math.max(1,cart[i]+d);save();route()};
const mail=(s,b)=>location.href='mailto:'+SHOP.mail+'?subject='+encodeURIComponent(s)+'&body='+encodeURIComponent(b);

/* ===== Supabase : catalogue, commandes, devis, visites ===== */
let ready=false;
async function loadProducts(){
 if(!window.sb)return;
 try{let all=[],from=0;
  for(;;){const{data,error}=await sb.from('products').select('id,ref,name,category,subcategory,brand,description,price,image_url,is_new,is_popular').eq('visible',true).order('id').range(from,from+999);
   if(error)throw error;all=all.concat(data);if(data.length<1000)break;from+=1000}
  const out=[];
  all.forEach(r=>{const c=C.findIndex(x=>x[0]==r.category);if(c<0)return;let s=C[c][1].indexOf(r.subcategory);if(s<0)s=0;
   out.push({id:r.id,nr:r.name,n:esc(r.name),c,s,p:r.price!=null?+r.price:null,ref:esc(r.ref),refr:r.ref,img:r.image_url?esc(r.image_url):null,nw:r.is_new,pop:r.is_popular,t:r.is_new?'Nouveau':r.is_popular?'Populaire':null,brand:r.brand?esc(r.brand):'',desc:r.description?esc(r.description):''})});
  P.length=0;P.push(...out);
 }catch(e){console.error('Catalogue Supabase indisponible, catalogue local utilisé',e)}
}
const purge=()=>{Object.keys(cart).forEach(i=>{if(!G(i))delete cart[i]});save()};
const lines=()=>Object.keys(cart).map(i=>({p:G(i),q:cart[i]})).filter(x=>x.p);
const newCode=()=>'IP-'+Date.now().toString(36).toUpperCase().slice(-5)+Math.random().toString(36).slice(2,5).toUpperCase();
async function submitOrder(e){e.preventDefault();const f=e.target,btn=f.querySelector('button'),L=lines();
 const items=L.map(({p,q})=>({id:p.id,ref:p.refr||p.ref,name:p.nr||p.n,qty:q,price:p.p})),
  total=L.reduce((a,{p,q})=>a+(p.p!=null?p.p*q:0),0),unp=L.some(({p})=>p.p==null),
  row={code:newCode(),name:f.n.value.trim(),phone:f.t.value.trim(),wilaya:f.w.value.trim(),commune:f.c.value.trim(),address:f.a.value.trim(),notes:f.r.value.trim()||null,items,total,has_unpriced:unp};
 if(window.sb){btn.disabled=true;btn.textContent='Envoi en cours…';
  const{error}=await sb.from('orders').insert(row);
  if(!error){cart={};save();location.hash='#/done/'+row.code;return}
  console.error(error);btn.disabled=false;btn.textContent='Envoyer la commande';toast('Envoi impossible, ouverture de votre messagerie…')}
 mail('Commande – '+row.name,'Nom : '+row.name+'\nTéléphone : '+row.phone+'\nWilaya : '+row.wilaya+'\nCommune : '+row.commune+'\nAdresse : '+row.address+'\n\nCommande :\n'+items.map(x=>'- '+x.qty+' x '+x.name+' (Réf. '+x.ref+')').join('\n')+'\n\nRemarques : '+(row.notes||'')+'\nPaiement à la livraison.');cart={};save()}
async function submitQuote(e){e.preventDefault();const f=e.target,btn=f.querySelector('button'),
 row={name:f.n.value.trim(),phone:f.t.value.trim(),email:f.e.value.trim()||null,message:f.m.value.trim()};
 if(window.sb){btn.disabled=true;btn.textContent='Envoi en cours…';
  const{error}=await sb.from('quotes').insert(row);
  if(!error){location.hash='#/done/devis';return}
  console.error(error);btn.disabled=false;btn.textContent='Envoyer la demande';toast('Envoi impossible, ouverture de votre messagerie…')}
 mail('Demande de devis – '+row.name,'Nom / Société : '+row.name+'\nTéléphone : '+row.phone+'\nE-mail : '+(row.email||'')+'\n\n'+row.message)}
const vid=(()=>{try{let v=localStorage.getItem('isoVid');if(!v){v=crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2);localStorage.setItem('isoVid',v)}return v}catch(e){return 'anon-'+Math.random().toString(36).slice(2)}})();
let lastTrack='';
function track(){
 if(!window.sb||navigator.webdriver||/bot|crawl|spider|headless|lighthouse/i.test(navigator.userAgent))return;
 const hash=location.hash||'#/';if(hash===lastTrack)return;lastTrack=hash;
 let sid=null,first=false;try{sid=sessionStorage.getItem('isoSid')}catch(e){}
 if(!sid){sid=Date.now().toString(36)+Math.random().toString(36).slice(2,8);first=true;try{sessionStorage.setItem('isoSid',sid)}catch(e){}}
 let ref=null;if(first){try{ref=document.referrer?new URL(document.referrer).hostname.replace(/^www\./,''):'Direct';if(ref==location.hostname)ref='Direct'}catch(e){ref='Direct'}}
 const m=hash.match(/^#\/p\/(\d+)/);
 sb.from('visits').insert({visitor_id:vid,session_id:sid,path:hash.slice(1)||'/',product_id:m?+m[1]:null,referrer:ref,device:matchMedia('(max-width:820px)').matches?'Mobile':'Ordinateur'}).then(()=>{},()=>{})}
function route(){if(!ready)return;const h=location.hash.replace(/^#\/?/,'').split('/'),k=h[0]||'home';
const q=k=='search'?decodeURIComponent(h[1]||''):'';
app.innerHTML=k=='shop'?R.shop(h[1]=='promo'?undefined:h[1],h[2]):k=='search'?R.shop(undefined,undefined,q):k=='p'?R.p(+h[1]):R[k]?R[k](h[1]!==undefined?+h[1]:undefined):R.home();
$('#nav').classList.remove('open');if(!window._keep)window.scrollTo(0,0);
const ck=$('#ck');if(ck)ck.onsubmit=submitOrder;
const dv=$('#dv');if(dv)dv.onsubmit=submitQuote;
track()}
$('#sf').onsubmit=e=>{e.preventDefault();const v=$('#q').value.trim();if(v)location.hash='#/search/'+encodeURIComponent(v)};
$('#menu').addEventListener('click',e=>{const k=e.target.closest('#menu>li>a');if(k&&matchMedia('(max-width:820px)').matches&&k.parentElement.classList.contains('hs')){e.preventDefault();const li=k.parentElement,w=li.classList.contains('open');document.querySelectorAll('#menu>li.open').forEach(x=>x.classList.remove('open'));if(!w)li.classList.add('open')}});
$('#mb').onclick=()=>$('#nav').classList.toggle('open');
addEventListener('hashchange',route);menu();save();
app.innerHTML='<div class="w"><div class="empty">Chargement du catalogue…</div></div>';
loadProducts().finally(()=>{purge();ready=true;menu();save();route()});
