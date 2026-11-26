/* Fonctions partagées entre la boutique (navigateur) et la page serveur api/page.js (SEO).
   Ne dépend que de C (data.js). Ne pas y mettre de code lié au navigateur. */
function slugify(s){
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80).replace(/-+$/,'')||'produit';
}
function catUrl(i,j){return '/categorie/'+slugify(C[i][0])+(j!=null?'/'+slugify(C[i][1][j]):'')}
function pUrl(id,name){return '/produit/'+id+'-'+slugify(name)}
function fmtDA(n){return Number(n).toLocaleString('fr-FR').replace(/[\u202f\u00a0]/g,' ')+' DA'}
function clip(s,n){s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1).replace(/\s+\S*$/,'')+'…':s}
/* Petit texte descriptif des pages catégorie (utile pour Google : texte unique par page) */
function catIntro(i,j){
  if(j!=null)return C[i][1][j]+' : '+C[i][0].toLowerCase()+' chez ISO POWER. Livraison partout en Algérie, paiement à la livraison. Pour une référence précise ou une offre de quantité, demandez un devis au 0549 51 29 88.';
  return 'Découvrez notre sélection de '+C[i][0].toLowerCase()+' : '+C[i][1].join(', ').toLowerCase()+'. Livraison partout en Algérie, paiement à la livraison, devis rapide au 0549 51 29 88.';
}
/* Titres et descriptions SEO (même texte côté serveur et côté navigateur) */
function seoMeta(kind,o){
  o=o||{};
  if(kind=='home')return{title:'ISO POWER – Matériel électrique et pneumatique industriel en Algérie',desc:'Boutique en ligne ISO POWER à Alger : automates, variateurs, disjoncteurs, câbles, pneumatique. Livraison partout en Algérie, paiement à la livraison.'};
  if(kind=='shop')return{title:'Catalogue matériel électrique et pneumatique industriel | ISO POWER',desc:'Catalogue ISO POWER : automatisme, départ moteur, distribution d’énergie, câbles, pneumatique, mesure et régulation. Livraison en Algérie, paiement à la livraison.'};
  if(kind=='cat'){
    if(o.s!=null)return{title:C[o.c][1][o.s]+' – '+C[o.c][0]+' | ISO POWER Algérie',desc:clip(catIntro(o.c,o.s),158)};
    return{title:C[o.c][0]+' en Algérie – prix et devis | ISO POWER',desc:clip(catIntro(o.c),158)};
  }
  if(kind=='p'){
    const d=o.desc?clip(String(o.desc).replace(/<[^>]*>/g,' '),158):clip(o.name+' (réf. '+o.ref+') – '+o.sub+', '+o.cat+'. Livraison partout en Algérie, paiement à la livraison. Devis rapide ISO POWER, Hamiz, Alger.',158);
    return{title:clip(o.name,52)+' – Réf. '+o.ref+' | ISO POWER',desc:d};
  }
  if(kind=='devis')return{title:'Demande de devis matériel électrique industriel | ISO POWER',desc:'Envoyez votre liste de références ou votre besoin : ISO POWER vous répond rapidement avec un devis. Livraison partout en Algérie.'};
  return{title:({cart:'Mon panier',checkout:'Finaliser la commande',search:'Recherche',done:'Merci'})[o]+' | ISO POWER',desc:''};
}
