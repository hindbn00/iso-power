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
{n:"Automate programmable compact 24 E/S",c:0,s:0,t:"Nouveau"},
{n:"Écran tactile HMI 7 pouces",c:0,s:1},
{n:"Détecteur inductif M18 PNP",c:0,s:2},
{n:"Relais temporisé multifonction",c:0,s:3},
{n:"Alimentation 24 V DC 10 A",c:0,s:4,t:"Nouveau"},
{n:"Contacteur tripolaire 9 A, bobine 230 V AC",c:1,s:0,t:"Populaire"},
{n:"Variateur de vitesse triphasé 0,75 kW",c:1,s:1,t:"Populaire"},
{n:"Démarreur progressif 22 kW",c:1,s:2},
{n:"Disjoncteur moteur 6–10 A",c:1,s:3},
{n:"Disjoncteur modulaire 3P 32 A courbe C",c:2,s:0,t:"Populaire"},
{n:"Disjoncteur compact 160 A",c:2,s:0},
{n:"Coffret métallique 600 × 400 × 200 mm",c:2,s:1,t:"Nouveau"},
{n:"Interrupteur sectionneur 63 A",c:2,s:2},
{n:"Bornier de jonction 4 mm²",c:3,s:0},
{n:"Cosses à sertir isolées, lot de 100",c:3,s:1},
{n:"Pince à sertir hydraulique",c:3,s:2},
{n:"Projecteur LED 50 W IP65",c:4,s:1},
{n:"Interrupteur différentiel 40 A 30 mA",c:4,s:2},
{n:"Câble souple 3G2,5 mm²",c:5,s:0},
{n:"Câble blindé LIYCY 4 × 0,75 mm²",c:5,s:1},
{n:"Câble réseau FTP CAT6",c:5,s:2},
{n:"Vérin pneumatique ISO cylindrique",c:6,s:0,t:"Populaire"},
{n:"Électrovanne 2/2 voies 230 V",c:6,s:1},
{n:"Raccord droit instantané",c:6,s:2},
{n:"Filtre régulateur lubrificateur",c:6,s:3,t:"Nouveau"},
{n:"Manomètre inox 0–10 bar",c:7,s:0},
{n:"Transmetteur de pression 4–20 mA",c:7,s:0},
{n:"Contrôleur de niveau à flotteur",c:7,s:1},
{n:"Sonde de température PT100",c:7,s:2}
];
P.forEach((x,i)=>{x.id=i;x.ref=x.ref||'ISO-'+String(1001+i);x.p=x.p??null});
