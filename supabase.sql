-- =====================================================================
-- ISO POWER : configuration Supabase
-- Supabase > SQL Editor > New query > coller ce fichier en entier > Run
-- (Peut être relancé sans danger : rien n'est écrasé si ça existe déjà.)
-- =====================================================================

-- 1) ADMINISTRATEURS ---------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "admin lit sa ligne" on public.admins;
create policy "admin lit sa ligne" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- 2) PRODUITS ----------------------------------------------------------
create table if not exists public.products (
  id          bigint generated always as identity primary key,
  ref         text not null unique check (char_length(ref) between 1 and 60),
  name        text not null check (char_length(name) between 2 and 200),
  category    text not null,
  subcategory text not null,
  brand       text,
  description text,
  price       numeric(12,2) check (price is null or price >= 0),  -- null = prix sur demande
  image_url   text,
  badge       text check (badge in ('Nouveau','Populaire')),
  visible     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists products_visible_idx on public.products (visible);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

alter table public.products enable row level security;
drop policy if exists "produits visibles pour tous" on public.products;
create policy "produits visibles pour tous" on public.products
  for select to anon, authenticated using (visible or public.is_admin());
drop policy if exists "admin ajoute produits" on public.products;
create policy "admin ajoute produits" on public.products
  for insert to authenticated with check (public.is_admin());
drop policy if exists "admin modifie produits" on public.products;
create policy "admin modifie produits" on public.products
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin supprime produits" on public.products;
create policy "admin supprime produits" on public.products
  for delete to authenticated using (public.is_admin());

-- 3) COMMANDES ---------------------------------------------------------
create table if not exists public.orders (
  id           bigint generated always as identity primary key,
  code         text not null unique,
  created_at   timestamptz not null default now(),
  name         text not null check (char_length(name) between 2 and 120),
  phone        text not null check (char_length(phone) between 6 and 30),
  wilaya       text not null check (char_length(wilaya) between 2 and 60),
  commune      text not null check (char_length(commune) between 1 and 80),
  address      text not null check (char_length(address) between 3 and 300),
  notes        text check (notes is null or char_length(notes) <= 1000),
  items        jsonb not null,          -- copie des produits au moment de la commande
  total        numeric(14,2) not null default 0,
  has_unpriced boolean not null default false,
  status       text not null default 'nouvelle'
               check (status in ('nouvelle','confirmee','expediee','livree','annulee')),
  admin_note   text
);
create index if not exists orders_created_idx on public.orders (created_at desc);

alter table public.orders enable row level security;
drop policy if exists "client envoie une commande" on public.orders;
create policy "client envoie une commande" on public.orders
  for insert to anon, authenticated
  with check (
    status = 'nouvelle' and admin_note is null
    and jsonb_typeof(items) = 'array'
    and jsonb_array_length(items) between 1 and 100
  );
drop policy if exists "admin lit commandes" on public.orders;
create policy "admin lit commandes" on public.orders
  for select to authenticated using (public.is_admin());
drop policy if exists "admin modifie commandes" on public.orders;
create policy "admin modifie commandes" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin supprime commandes" on public.orders;
create policy "admin supprime commandes" on public.orders
  for delete to authenticated using (public.is_admin());

-- 4) DEMANDES DE DEVIS -------------------------------------------------
create table if not exists public.quotes (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name       text not null check (char_length(name) between 2 and 120),
  phone      text not null check (char_length(phone) between 6 and 30),
  email      text check (email is null or char_length(email) <= 160),
  message    text not null check (char_length(message) between 2 and 3000),
  status     text not null default 'nouveau' check (status in ('nouveau','traite'))
);
create index if not exists quotes_created_idx on public.quotes (created_at desc);

alter table public.quotes enable row level security;
drop policy if exists "client envoie un devis" on public.quotes;
create policy "client envoie un devis" on public.quotes
  for insert to anon, authenticated with check (status = 'nouveau');
drop policy if exists "admin lit devis" on public.quotes;
create policy "admin lit devis" on public.quotes
  for select to authenticated using (public.is_admin());
drop policy if exists "admin modifie devis" on public.quotes;
create policy "admin modifie devis" on public.quotes
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin supprime devis" on public.quotes;
create policy "admin supprime devis" on public.quotes
  for delete to authenticated using (public.is_admin());

-- 5) VISITES (statistiques, sans adresse IP) ---------------------------
create table if not exists public.visits (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  visitor_id text not null check (char_length(visitor_id) <= 80),
  session_id text not null check (char_length(session_id) <= 80),
  path       text not null check (char_length(path) <= 200),
  product_id bigint,
  referrer   text check (referrer is null or char_length(referrer) <= 120),
  device     text check (device is null or char_length(device) <= 20)
);
create index if not exists visits_created_idx on public.visits (created_at desc);
create index if not exists visits_product_idx on public.visits (product_id) where product_id is not null;

alter table public.visits enable row level security;
drop policy if exists "enregistrer une visite" on public.visits;
create policy "enregistrer une visite" on public.visits
  for insert to anon, authenticated with check (true);
drop policy if exists "admin lit visites" on public.visits;
create policy "admin lit visites" on public.visits
  for select to authenticated using (public.is_admin());
drop policy if exists "admin supprime visites" on public.visits;
create policy "admin supprime visites" on public.visits
  for delete to authenticated using (public.is_admin());

-- 6) STATISTIQUES POUR LE TABLEAU DE BORD ------------------------------
create or replace function public.admin_stats(p_days int default 30)
returns json language plpgsql security definer set search_path = public as $$
declare
  tz    constant text := 'Africa/Algiers';
  today date := (now() at time zone 'Africa/Algiers')::date;
  d0    date;
  since timestamptz;
  t0    timestamptz := ((now() at time zone 'Africa/Algiers')::date)::timestamp at time zone 'Africa/Algiers';
begin
  if not public.is_admin() then
    raise exception 'acces refuse' using errcode = '42501';
  end if;
  p_days := greatest(1, least(coalesce(p_days, 30), 365));
  d0 := today - (p_days - 1);
  since := d0::timestamp at time zone tz;

  return json_build_object(
    'days', p_days,
    'visitors',       (select count(distinct visitor_id) from visits where created_at >= since),
    'views',          (select count(*) from visits where created_at >= since),
    'today_visitors', (select count(distinct visitor_id) from visits where created_at >= t0),
    'today_views',    (select count(*) from visits where created_at >= t0),
    'orders',         (select count(*) from orders where created_at >= since),
    'revenue',        (select coalesce(sum(total), 0) from orders where created_at >= since and status <> 'annulee'),
    'new_orders',     (select count(*) from orders where status = 'nouvelle'),
    'quotes',         (select count(*) from quotes where created_at >= since),
    'new_quotes',     (select count(*) from quotes where status = 'nouveau'),
    'products',       (select count(*) from products),
    'hidden_products',(select count(*) from products where not visible),
    'daily', (
      select coalesce(json_agg(row_to_json(x) order by x.day), '[]'::json) from (
        select s.d::date as day,
               coalesce(v.visitors, 0) as visitors,
               coalesce(v.views, 0)    as views,
               coalesce(o.orders, 0)   as orders
        from generate_series(d0::timestamp, today::timestamp, interval '1 day') as s(d)
        left join (
          select (created_at at time zone tz)::date as d, count(distinct visitor_id) as visitors, count(*) as views
          from visits where created_at >= since group by 1
        ) v on v.d = s.d::date
        left join (
          select (created_at at time zone tz)::date as d, count(*) as orders
          from orders where created_at >= since group by 1
        ) o on o.d = s.d::date
      ) x
    ),
    'top_products', (
      select coalesce(json_agg(t), '[]'::json) from (
        select p.id, p.ref, p.name, count(*) as views
        from visits v join products p on p.id = v.product_id
        where v.created_at >= since
        group by p.id, p.ref, p.name order by count(*) desc limit 8
      ) t
    ),
    'sources', (
      select coalesce(json_agg(t), '[]'::json) from (
        select coalesce(nullif(referrer, ''), 'Direct') as source, count(distinct session_id) as sessions
        from visits where created_at >= since and referrer is not null
        group by 1 order by 2 desc limit 8
      ) t
    ),
    'devices', (
      select coalesce(json_agg(t), '[]'::json) from (
        select coalesce(device, 'Inconnu') as device, count(distinct visitor_id) as visitors
        from visits where created_at >= since group by 1 order by 2 desc
      ) t
    ),
    'order_status', (
      select coalesce(json_object_agg(status, n), '{}'::json) from (
        select status, count(*) as n from orders where created_at >= since group by status
      ) s
    )
  );
end $$;
revoke all on function public.admin_stats(int) from public, anon;
grant execute on function public.admin_stats(int) to authenticated;

-- 7) PHOTOS DES PRODUITS (stockage) ------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "admin envoie photos" on storage.objects;
create policy "admin envoie photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admin modifie photos" on storage.objects;
create policy "admin modifie photos" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admin supprime photos" on storage.objects;
create policy "admin supprime photos" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

-- 8) VOTRE COMPTE ADMIN --------------------------------------------------
-- a) Supabase > Authentication > Users > Add user (e-mail + mot de passe,
--    cochez "Auto Confirm User").
-- b) Puis exécutez ceci avec VOTRE e-mail :
--
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'VOTRE-EMAIL@exemple.com'
-- on conflict do nothing;
--
-- c) Supabase > Authentication > Sign In / Providers : désactivez
--    "Allow new users to sign up" (personne d'autre ne peut créer de compte).

-- 9) PRODUITS DE DÉPART (ceux de data.js) -------------------------------
insert into public.products (ref, name, category, subcategory, price, badge) values
('ISO-1001', 'Automate programmable compact 24 E/S', 'Automatisme et contrôle', 'Automates programmables', null, 'Nouveau'),
('ISO-1002', 'Écran tactile HMI 7 pouces', 'Automatisme et contrôle', 'Écrans HMI', null, null),
('ISO-1003', 'Détecteur inductif M18 PNP', 'Automatisme et contrôle', 'Capteurs et détecteurs', null, null),
('ISO-1004', 'Relais temporisé multifonction', 'Automatisme et contrôle', 'Relais', null, null),
('ISO-1005', 'Alimentation 24 V DC 10 A', 'Automatisme et contrôle', 'Alimentations', null, 'Nouveau'),
('ISO-1006', 'Contacteur tripolaire 9 A, bobine 230 V AC', 'Départ moteur', 'Contacteurs', null, 'Populaire'),
('ISO-1007', 'Variateur de vitesse triphasé 0,75 kW', 'Départ moteur', 'Variateurs de vitesse', null, 'Populaire'),
('ISO-1008', 'Démarreur progressif 22 kW', 'Départ moteur', 'Démarreurs progressifs', null, null),
('ISO-1009', 'Disjoncteur moteur 6–10 A', 'Départ moteur', 'Disjoncteurs moteur', null, null),
('ISO-1010', 'Disjoncteur modulaire 3P 32 A courbe C', 'Distribution d’énergie', 'Disjoncteurs', null, 'Populaire'),
('ISO-1011', 'Disjoncteur compact 160 A', 'Distribution d’énergie', 'Disjoncteurs', null, null),
('ISO-1012', 'Coffret métallique 600 × 400 × 200 mm', 'Distribution d’énergie', 'Coffrets et armoires', null, 'Nouveau'),
('ISO-1013', 'Interrupteur sectionneur 63 A', 'Distribution d’énergie', 'Sectionneurs', null, null),
('ISO-1014', 'Bornier de jonction 4 mm²', 'Connectique et outillage', 'Borniers', null, null),
('ISO-1015', 'Cosses à sertir isolées, lot de 100', 'Connectique et outillage', 'Cosses et embouts', null, null),
('ISO-1016', 'Pince à sertir hydraulique', 'Connectique et outillage', 'Outillage', null, null),
('ISO-1017', 'Projecteur LED 50 W IP65', 'Électricité bâtiment', 'Éclairage', null, null),
('ISO-1018', 'Interrupteur différentiel 40 A 30 mA', 'Électricité bâtiment', 'Protection domestique', null, null),
('ISO-1019', 'Câble souple 3G2,5 mm²', 'Câbles', 'Câbles de puissance', null, null),
('ISO-1020', 'Câble blindé LIYCY 4 × 0,75 mm²', 'Câbles', 'Câbles blindés', null, null),
('ISO-1021', 'Câble réseau FTP CAT6', 'Câbles', 'Câbles réseau', null, null),
('ISO-1022', 'Vérin pneumatique ISO cylindrique', 'Pneumatique', 'Vérins', null, 'Populaire'),
('ISO-1023', 'Électrovanne 2/2 voies 230 V', 'Pneumatique', 'Distributeurs et électrovannes', null, null),
('ISO-1024', 'Raccord droit instantané', 'Pneumatique', 'Raccords et tubes', null, null),
('ISO-1025', 'Filtre régulateur lubrificateur', 'Pneumatique', 'Traitement d’air', null, 'Nouveau'),
('ISO-1026', 'Manomètre inox 0–10 bar', 'Mesure et régulation', 'Pression', null, null),
('ISO-1027', 'Transmetteur de pression 4–20 mA', 'Mesure et régulation', 'Pression', null, null),
('ISO-1028', 'Contrôleur de niveau à flotteur', 'Mesure et régulation', 'Niveau et débit', null, null),
('ISO-1029', 'Sonde de température PT100', 'Mesure et régulation', 'Température', null, null)
on conflict (ref) do nothing;
