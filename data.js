/* ===== CONFIG : modifiez ici ===== */
const SHOP={phone:'0549 51 29 88',mail:'sales.isopower@gmail.com'};
/* Catégories : [nom, [sous-catégories]] */
const C=[
["Automatisme et contrôle",["Automates programmables","Écrans HMI","Capteurs et détecteurs","Relais","Alimentations"]],
["Départ moteur",["Contacteurs","Variateurs de vitesse","Démarreurs progressifs","Disjoncteurs moteur"]],
["Distribution d’énergie",["Disjoncteurs","Coffrets et armoires","Sectionneurs","Transformateurs"]],
["Connectique et outillage",["Borniers","Cosses et embouts","Outillage"]],
["Électricité bâtiment",["Appareillage","Éclairage","Protection domestique"]],
["Câbles",["Câbles de puissance","Câbles blindés","Câbles réseau"]],
["Pneumatique",["Vérins","Distributeurs et électrovannes","Raccords et tubes","Traitement d’air"]],
["Mesure et régulation",["Pression","Niveau et débit","Température"]]
];
/* Produits : n=nom, c=catégorie, s=sous-cat., p=prix en DA (null = sur demande), ref, img (ex: 'assets/p1.jpg'), t=badge */
const P=[
{ref:"ISO-1001",n:"Automate programmable compact 24 E/S",c:0,s:0,t:"Nouveau"},
{ref:"ISO-1005",n:"Alimentation 24 V DC 10 A",c:0,s:4,t:"Nouveau"},
{ref:"ISO-1006",n:"Contacteur tripolaire 9 A, bobine 230 V AC",c:1,s:0,t:"Populaire"},
{ref:"ISO-1007",n:"Variateur de vitesse triphasé 0,75 kW",c:1,s:1,t:"Populaire"},
{ref:"ISO-1010",n:"Disjoncteur modulaire 3P 32 A courbe C",c:2,s:0,t:"Populaire"},
{ref:"ISO-1012",n:"Coffret métallique 600 × 400 × 200 mm",c:2,s:1,t:"Nouveau"},
{ref:"ISO-1022",n:"Vérin pneumatique ISO cylindrique",c:6,s:0,t:"Populaire"},
{ref:"ISO-1025",n:"Filtre régulateur lubrificateur",c:6,s:3,t:"Nouveau"}
];
P.forEach((x,i)=>{x.id=i;x.ref=x.ref||'ISO-'+String(1001+i);x.p=x.p??null;x.nw=x.t=='Nouveau';x.pop=x.t=='Populaire'});
