# ISO POWER - boutique en ligne + administration (/admin)

Site statique (sans build) + base Supabase.

## Mise en route (10 minutes)

1. **supabase.com** > New project (gardez le mot de passe de la base).
2. **SQL Editor** > New query > collez `supabase.sql` en entier > Run.
   Cela crée les tables, la sécurité, les statistiques, le stockage des photos et charge les 29 produits actuels.
3. **Authentication > Users > Add user** : votre e-mail + un mot de passe solide (cochez *Auto Confirm User*).
4. Dans le SQL Editor, exécutez (avec votre e-mail) :
   `insert into public.admins (user_id) select id from auth.users where email = 'VOTRE-EMAIL@exemple.com';`
5. **Authentication > Sign In / Providers** : désactivez *Allow new users to sign up*.
6. **Project Settings > API** : copiez *Project URL* et la clé **anon public** dans `config.js`
   (jamais la clé `service_role`).
7. Dans `config.js`, renseignez aussi `site` avec l'adresse officielle (ex. `https://www.votre-domaine.dz`).
8. Déployez sur Vercel (Framework Preset : Other, aucune commande de build). Ouvrez `votre-site.com/admin`.

## Ce que fait /admin
- **Statistiques** : visiteurs, pages vues, commandes, chiffre d'affaires, devis, courbe par jour, produits les plus vus, sources, appareils.
- **Commandes** : statut (nouvelle, confirmée, expédiée, livrée, annulée), détails, appel/WhatsApp, note interne, suppression, export CSV.
- **Devis** : liste, statut, suppression, export CSV.
- **Produits** : ajouter (catégorie, sous-catégorie, référence, marque, prix, badge, description, photo), modifier, masquer/afficher, supprimer, actions groupées, export CSV.

Les fichiers CSV s'ouvrent directement dans Excel.

## Notes
- Les catégories restent définies dans `data.js` (liste `C`). Pour en ajouter une, modifiez `C` : elle apparaît dans la boutique et dans le formulaire produit.
- Si `config.js` n'est pas rempli, la boutique fonctionne comme avant (catalogue de `data.js`, commande par e-mail).
- Les visites sont comptées sans adresse IP (identifiant anonyme dans le navigateur).
- Supabase gratuit : un projet inactif 7 jours est mis en pause. Une visite régulière ou le plan Pro l'évite.

## Référencement Google (SEO)
Chaque produit et chaque catégorie a sa vraie adresse : `/produit/12-nom-du-produit`, `/categorie/depart-moteur/contacteurs`.
Ces pages sont générées par `api/page.js` (fonction Vercel) avec titre, description, données structurées (Product, BreadcrumbList, Store), `sitemap.xml` et `robots.txt` automatiques.
Un produit ajouté, masqué ou supprimé dans /admin est pris en compte dans les pages et le sitemap en moins de 5 minutes.

Après la mise en ligne :
1. Google Search Console : ajoutez votre domaine, puis envoyez `https://votre-domaine/sitemap.xml`.
2. Créez la fiche Google Business Profile (adresse SNTP - Hamiz, téléphone, horaires, photos).
3. Remplissez la description de chaque produit dans /admin (marque, usage, caractéristiques).
Fichiers : `shell.html` (modèle de page), `common.js` (titres/descriptions SEO partagés), `api/page.js`, `vercel.json` (adresses).
