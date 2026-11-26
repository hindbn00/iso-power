/* ISO POWER – pages optimisées pour Google (rendues côté serveur sur Vercel).
   Sert : /, /boutique, /categorie/..., /produit/..., /devis, pages privées (panier...), /sitemap.xml, /robots.txt
   Les produits viennent de Supabase (mise en cache 5 min) ; si Supabase est injoignable : catalogue de data.js. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = process.cwd();
const rd = f => fs.readFileSync(path.join(root, f), 'utf8');

let SHELL, C, STATIC, CFG, U;
function init() {
  if (SHELL) return;
  SHELL = rd('shell.html');
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(rd('data.js') + ';this.C=C;this.P=P;', ctx);
  vm.runInContext(rd('common.js'), ctx);
  C = ctx.C; STATIC = ctx.P; U = ctx;
  const cfg = rd('config.js'), g = k => { const m = cfg.match(new RegExp(k + "\\s*:\\s*'([^']*)'")); return m ? m[1] : ''; };
  CFG = { url: process.env.SUPABASE_URL || g('url'), key: process.env.SUPABASE_ANON_KEY || g('key'), site: process.env.SITE_URL || g('site') };
}

const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const catIdx = name => C.findIndex(x => x[0] === name);
const subIdx = (c, name) => { const s = C[c][1].indexOf(name); return s < 0 ? 0 : s; };

async function loadProducts() {
  if (CFG.url && CFG.key && !/VOTRE/.test(CFG.url + CFG.key)) {
    try {
      let all = [], from = 0;
      for (;;) {
        const r = await fetch(CFG.url + '/rest/v1/products?select=id,ref,name,category,subcategory,brand,description,price,image_url,is_new,is_popular,updated_at&visible=eq.true&order=id.asc',
          { headers: { apikey: CFG.key, Authorization: 'Bearer ' + CFG.key, 'Range-Unit': 'items', Range: from + '-' + (from + 999) } });
        if (!r.ok) throw new Error('Supabase ' + r.status);
        const d = await r.json(); all = all.concat(d);
        if (d.length < 1000) break; from += 1000;
      }
      return { rows: all.filter(p => catIdx(p.category) >= 0), live: true };
    } catch (e) { console.error(e); }
  }
  return { live: false, rows: STATIC.map(p => ({ id: p.id, ref: p.ref, name: p.n, category: C[p.c][0], subcategory: C[p.c][1][p.s], brand: null, description: null, price: p.p, image_url: p.img ? '/' + String(p.img).replace(/^\//, '') : null, is_new: !!p.nw, is_popular: !!p.pop, updated_at: null })) };
}

function siteOf(req) {
  if (CFG.site) return CFG.site.replace(/\/+$/, '');
  const h = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  return 'https://' + h;
}
const abs = (site, u) => /^https?:/.test(u) ? u : site + (u.startsWith('/') ? '' : '/') + u;
const pLink = p => U.pUrl(p.id, p.name);

/* ---------- blocs HTML (même mise en forme que la boutique) ---------- */
const priceH = p => p.price != null ? '<div class="pr">' + esc(U.fmtDA(p.price)) + '</div>' : '<div class="pr q">Prix sur demande</div>';
const imgH = (p, eager) => p.image_url ? '<img src="' + esc(p.image_url) + '" alt="' + esc(p.name) + '"' + (eager ? '' : ' loading="lazy" decoding="async"') + '>' : '<img class="pl" src="/assets/logo.png" alt="">';
function cardH(p) {
  const t = p.is_new ? 'Nouveau' : p.is_popular ? 'Populaire' : '';
  return '<div class="card">' + (t ? '<span class="bd ' + (t === 'Populaire' ? 'pop' : '') + '">' + t + '</span>' : '') +
    '<a class="ph" href="' + pLink(p) + '">' + imgH(p) + '</a><div class="cb"><small>' + esc(p.category) + ' · Réf. ' + esc(p.ref) + '</small><h3><a href="' + pLink(p) + '">' + esc(p.name) + '</a></h3>' + priceH(p) +
    '<a class="btn dk" href="' + pLink(p) + '">Voir le produit</a></div></div>';
}
const menuH = () => '<li><a href="/boutique">Tout le catalogue</a></li>' + C.map((c, i) => '<li class="hs"><a href="' + U.catUrl(i) + '">' + esc(c[0]) + '</a><div class="dd"><a class="mo" href="' + U.catUrl(i) + '">Voir toute la catégorie</a>' + c[1].map((s, j) => '<a href="' + U.catUrl(i, j) + '">' + esc(s) + '</a>').join('') + '</div></li>').join('');
const footCatsH = () => C.map((c, i) => '<a href="' + U.catUrl(i) + '">' + esc(c[0]) + '</a>').join('');

function shopBody(c, s, list, title) {
  const side = '<div class="side"><h4>Catégories</h4><a href="/boutique" class="' + (c == null ? 'on' : '') + '">Tout le catalogue</a>' +
    C.map((x, i) => '<a href="' + U.catUrl(i) + '" class="' + (c === i && s == null ? 'on' : '') + '">' + esc(x[0]) + '</a>' + (c === i ? x[1].map((y, j) => '<a class="sub ' + (s === j ? 'on' : '') + '" href="' + U.catUrl(i, j) + '">' + esc(y) + '</a>').join('') : '')).join('') + '</div>';
  const bc = '<div class="bc"><a href="/">Accueil</a> / <a href="/boutique">Boutique</a>' + (c != null ? ' / <a href="' + U.catUrl(c) + '">' + esc(C[c][0]) + '</a>' : '') + (s != null ? ' / ' + esc(C[c][1][s]) : '') + '</div>';
  const intro = c != null ? '<p class="meta" style="margin:0 0 14px">' + esc(U.catIntro(c, s)) + '</p>' : '';
  return '<div class="w">' + bc + '<div class="shop">' + side + '<div><div class="top2"><h1>' + esc(title) + ' <small style="font-size:14px;color:var(--mut);font-weight:400">(' + list.length + ')</small></h1></div>' + intro +
    (list.length ? '<div class="grid sg">' + list.map(cardH).join('') + '</div>' : '<div class="empty">Aucun produit pour le moment. <a href="/devis" style="color:var(--blue);font-weight:700">Demandez-nous cette référence</a>.</div>') + '</div></div></div>';
}
function productBody(p, similar) {
  const c = catIdx(p.category), s = subIdx(c, p.subcategory);
  const d = p.description ? esc(p.description).replace(/\n/g, '<br>') : 'Produit professionnel pour applications industrielles. Contactez-nous pour la fiche technique, la disponibilité et les conditions de livraison.';
  return '<div class="w"><div class="bc"><a href="/">Accueil</a> / <a href="' + U.catUrl(c) + '">' + esc(C[c][0]) + '</a> / <a href="' + U.catUrl(c, s) + '">' + esc(C[c][1][s]) + '</a></div>' +
    '<div class="pd"><div class="ph">' + imgH(p, true) + '</div><div><span class="meta">' + esc(C[c][1][s]) + '</span><h1>' + esc(p.name) + '</h1><div class="meta">Référence : <b>' + esc(p.ref) + '</b></div><div style="margin:14px 0">' + priceH(p) + '</div>' +
    (p.brand ? '<div class="meta">Marque : <b>' + esc(p.brand) + '</b></div>' : '') + '<p class="meta">' + d + '</p><div class="row"><a class="btn" href="/devis?produit=' + p.id + '">Demander un devis</a></div><div class="meta">Paiement à la livraison · Livraison partout en Algérie</div></div></div>' +
    (similar.length ? '<div class="sec"><div class="sh"><h2>Produits similaires</h2></div><div class="grid">' + similar.map(cardH).join('') + '</div></div>' : '') + '</div>';
}

/* ---------- données structurées (schema.org) ---------- */
const ld = o => '<script type="application/ld+json">' + JSON.stringify(o).replace(/</g, '\\u003c') + '</script>';
const orgLd = site => ({ '@context': 'https://schema.org', '@type': 'Store', '@id': site + '/#organisation', name: 'ISO POWER', url: site + '/', logo: site + '/assets/logo.png', image: site + '/assets/logo.png', telephone: '+213549512988', email: 'sales.isopower@gmail.com',
  description: 'Matériel électrique et pneumatique industriel : automatisme, départ moteur, distribution d’énergie, câbles, pneumatique, mesure et régulation.',
  address: { '@type': 'PostalAddress', streetAddress: 'SNTP, Hamiz', addressLocality: 'Alger', addressCountry: 'DZ' }, areaServed: { '@type': 'Country', name: 'Algérie' }, currenciesAccepted: 'DZD', paymentAccepted: 'Paiement à la livraison' });
const siteLd = site => ({ '@context': 'https://schema.org', '@type': 'WebSite', url: site + '/', name: 'ISO POWER', inLanguage: 'fr-DZ', potentialAction: { '@type': 'SearchAction', target: site + '/recherche?q={search_term_string}', 'query-input': 'required name=search_term_string' } });
const crumbLd = (site, items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x[0], item: site + x[1] })) });

/* ---------- assemblage de la page ---------- */
function head(site, o) {
  const url = site + o.path, img = abs(site, o.image || '/assets/logo.png');
  return '<title>' + esc(o.title) + '</title>\n' +
    (o.desc ? '<meta name="description" content="' + esc(o.desc) + '">\n' : '') +
    '<meta name="robots" content="' + (o.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large') + '">\n' +
    '<link rel="canonical" href="' + esc(url) + '">\n' +
    '<link rel="alternate" hreflang="fr-DZ" href="' + esc(url) + '">\n<link rel="alternate" hreflang="x-default" href="' + esc(url) + '">\n' +
    '<meta property="og:site_name" content="ISO POWER">\n<meta property="og:locale" content="fr_DZ">\n<meta property="og:type" content="' + (o.ogType || 'website') + '">\n' +
    '<meta property="og:title" content="' + esc(o.title) + '">\n' + (o.desc ? '<meta property="og:description" content="' + esc(o.desc) + '">\n' : '') +
    '<meta property="og:url" content="' + esc(url) + '">\n<meta property="og:image" content="' + esc(img) + '">\n<meta name="twitter:card" content="summary">\n' +
    (o.ld || []).map(ld).join('\n');
}
function page(site, o, body) {
  return SHELL.replace('<!--SEO_HEAD-->', head(site, o)).replace('<!--SEO_MENU-->', menuH()).replace('<!--SEO_FOOT_CATS-->', footCatsH()).replace('<!--SEO_BODY-->', body || '');
}
function send(res, code, type, body, cache) {
  res.statusCode = code; res.setHeader('Content-Type', type); res.setHeader('Cache-Control', cache); res.end(body);
}
const OK = 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400', SHORT = 'public, max-age=0, s-maxage=60';

module.exports = async (req, res) => {
  try {
    init();
    const q = new URL(req.url, 'http://x').searchParams, type = q.get('type') || 'h', site = siteOf(req);
    const html = (o, body, code, cache) => send(res, code || 200, 'text/html; charset=utf-8', page(site, o, body), cache || OK);

    if (type === 'robots') {
      return send(res, 200, 'text/plain; charset=utf-8', 'User-agent: *\nAllow: /\nDisallow: /panier\nDisallow: /commande\nDisallow: /recherche\nDisallow: /merci/\n\nSitemap: ' + site + '/sitemap.xml\n', OK);
    }
    if (type === 'n') { // pages privées : panier, commande, recherche, merci
      const k = q.get('k') || 'cart';
      return html({ title: U.seoMeta('noindex', k).title, path: ({ cart: '/panier', checkout: '/commande', search: '/recherche', done: '/merci' })[k] || '/', noindex: true }, '', 200, 'public, max-age=0, s-maxage=3600');
    }
    if (type === 'd') {
      const m = U.seoMeta('devis');
      return html({ title: m.title, desc: m.desc, path: '/devis', ld: [crumbLd(site, [['Accueil', '/'], ['Demande de devis', '/devis']])] });
    }

    const { rows, live } = await loadProducts(), cache = live ? OK : SHORT;

    if (type === 'sitemap') {
      const u = [], add = (loc, last, pr) => u.push('<url><loc>' + esc(site + loc) + '</loc>' + (last ? '<lastmod>' + new Date(last).toISOString().slice(0, 10) + '</lastmod>' : '') + '<priority>' + pr + '</priority></url>');
      add('/', null, '1.0'); add('/boutique', null, '0.9'); add('/devis', null, '0.5');
      C.forEach((c, i) => { add(U.catUrl(i), null, '0.8'); c[1].forEach((s, j) => add(U.catUrl(i, j), null, '0.7')); });
      rows.forEach(p => add(pLink(p), p.updated_at, '0.8'));
      return send(res, 200, 'application/xml; charset=utf-8', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + u.join('\n') + '\n</urlset>\n', cache);
    }

    if (type === 'h') {
      const m = U.seoMeta('home');
      return html({ title: m.title, desc: m.desc, path: '/', ld: [orgLd(site), siteLd(site)] }, '', 200, cache);
    }

    if (type === 's' || type === 'c') {
      let c = null, s = null;
      if (type === 'c') {
        c = C.findIndex(x => U.slugify(x[0]) === q.get('cat'));
        if (c < 0) return html({ title: 'Page introuvable | ISO POWER', path: '/boutique', noindex: true }, shopBody(null, null, [], 'Page introuvable'), 404, SHORT);
        if (q.get('sub')) { s = C[c][1].findIndex(x => U.slugify(x) === q.get('sub')); if (s < 0) { res.statusCode = 301; res.setHeader('Location', U.catUrl(c)); return res.end(); } }
      }
      const list = rows.filter(p => (c == null || catIdx(p.category) === c) && (s == null || subIdx(catIdx(p.category), p.subcategory) === s));
      const title = c == null ? 'Tout le catalogue' : s == null ? C[c][0] : C[c][1][s];
      const m = c == null ? U.seoMeta('shop') : U.seoMeta('cat', { c, s: s == null ? undefined : s });
      const path = c == null ? '/boutique' : U.catUrl(c, s);
      const crumbs = [['Accueil', '/'], ['Boutique', '/boutique']]; if (c != null) crumbs.push([C[c][0], U.catUrl(c)]); if (s != null) crumbs.push([C[c][1][s], U.catUrl(c, s)]);
      const itemList = { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: list.slice(0, 50).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: site + pLink(p), name: p.name })) };
      return html({ title: m.title, desc: m.desc, path, ld: [crumbLd(site, crumbs), itemList] }, shopBody(c, s, list, title), 200, cache);
    }

    if (type === 'p') {
      const slug = q.get('slug') || '', id = parseInt(slug, 10), p = rows.find(x => x.id === id);
      if (!p) return html({ title: 'Produit introuvable | ISO POWER', path: '/boutique', noindex: true }, shopBody(null, null, [], 'Produit introuvable'), 404, SHORT);
      if (pLink(p) !== '/produit/' + slug) { res.statusCode = 301; res.setHeader('Location', pLink(p)); res.setHeader('Cache-Control', SHORT); return res.end(); }
      const c = catIdx(p.category), s = subIdx(c, p.subcategory);
      const similar = rows.filter(x => x.id !== p.id && x.category === p.category).slice(0, 4);
      const m = U.seoMeta('p', { name: p.name, ref: p.ref, cat: C[c][0], sub: C[c][1][s], desc: p.description });
      const prod = { '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: p.ref, mpn: p.ref, category: C[c][0] + ' > ' + C[c][1][s], description: m.desc, url: site + pLink(p) };
      if (p.brand) prod.brand = { '@type': 'Brand', name: p.brand };
      if (p.image_url) prod.image = [abs(site, p.image_url)];
      if (p.price != null) prod.offers = { '@type': 'Offer', url: site + pLink(p), priceCurrency: 'DZD', price: String(Number(p.price)), itemCondition: 'https://schema.org/NewCondition', seller: { '@type': 'Organization', name: 'ISO POWER' } };
      return html({ title: m.title, desc: m.desc, path: pLink(p), image: p.image_url, ogType: 'product', ld: [prod, crumbLd(site, [['Accueil', '/'], [C[c][0], U.catUrl(c)], [C[c][1][s], U.catUrl(c, s)], [p.name, pLink(p)]])] }, productBody(p, similar), 200, cache);
    }

    return html({ title: 'ISO POWER', path: '/' }, '', 200, SHORT);
  } catch (e) {
    console.error(e);
    send(res, 500, 'text/plain; charset=utf-8', 'Erreur serveur', 'no-store');
  }
};
