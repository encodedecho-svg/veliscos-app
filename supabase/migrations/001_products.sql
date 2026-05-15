-- =====================================================================
-- Veliscos — Phase 1: Products schema + seed
-- =====================================================================
-- Run this once in the Supabase SQL Editor.
-- Idempotent: safe to re-run (DROP TABLE + recreate).
-- =====================================================================

drop table if exists public.products cascade;

create table public.products (
  id            text primary key,
  name          text not null,
  category      text not null,
  type          text,
  size          text,
  price         integer not null check (price >= 0),
  cost_price    integer check (cost_price is null or cost_price >= 0),
  currency      text not null default 'PKR',
  key_actives   text[] not null default '{}',
  description   text,
  how_to_use    text,
  skin_type     text[] not null default '{}',
  badges        text[] not null default '{}',
  ingredients   text,
  image         text,
  featured      boolean not null default false,
  status        text not null default 'active' check (status in ('active','draft')),
  stock         integer not null default 100 check (stock >= 0),
  sold          integer not null default 0 check (sold >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index products_category_idx on public.products(category);
create index products_featured_idx on public.products(featured) where featured = true;
create index products_status_idx   on public.products(status);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.products enable row level security;

-- Public can read active products (storefront)
drop policy if exists "Public read active products" on public.products;
create policy "Public read active products"
  on public.products for select
  using (status = 'active');

-- Admin writes will be added in Phase 3 once auth is in place.

-- ---------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Seed: 14 Phase 1 hero products (PKR pricing)
-- ---------------------------------------------------------------------
insert into public.products
  (id, name, category, type, size, price, cost_price, key_actives, description, how_to_use, skin_type, badges, ingredients, image, featured)
values
  ('vitamin-c-serum',
   'Vitamin C 10% Serum',
   'serums', 'Brightening / Antioxidant', '30ml', 2500, 1575,
   ARRAY['Ethyl Ascorbic Acid 10%', 'Hyaluronic Acid'],
   'A stabilized Vitamin C formulation that delivers potent antioxidant protection while brightening uneven skin tone. Ethyl Ascorbic Acid provides superior stability compared to L-Ascorbic Acid, ensuring consistent efficacy.',
   'Apply 3-4 drops to clean skin every morning. Allow to absorb, then follow with moisturizer and SPF 50 sunscreen.',
   ARRAY['All Skin Types', 'Dull Skin', 'Hyperpigmentation'],
   ARRAY['Fragrance-Free', 'Stabilized Formula', 'Cruelty-Free'],
   'Aqua, Ethyl Ascorbic Acid, Hyaluronic Acid, Propanediol, Phenoxyethanol, Sodium Hydroxide, Xanthan Gum',
   '/images/vitamin-c-serum.png', true),

  ('brightening-serum',
   'Brightening Serum',
   'serums', 'Pigmentation / Glow', '30ml', 2500, 1575,
   ARRAY['Ethyl Ascorbic Acid', 'Alpha-Arbutin', 'Niacinamide'],
   'A triple-action brightening serum combining three powerful brightening agents to target pigmentation, dark spots, and uneven skin tone for a radiant, glowing complexion.',
   'Apply 2-3 drops to clean skin morning and evening. Follow with moisturizer and sunscreen (AM).',
   ARRAY['All Skin Types', 'Hyperpigmentation', 'Dull Skin'],
   ARRAY['Fragrance-Free', 'Non-Comedogenic', 'Cruelty-Free'],
   'Aqua, Ethyl Ascorbic Acid, Alpha-Arbutin, Niacinamide, Propanediol, Phenoxyethanol, Xanthan Gum',
   '/images/vitamin-c-serum.png', false),

  ('niacinamide-serum',
   'Niacinamide 10% + Zinc 1% Serum',
   'serums', 'Anti-Acne / Oil Control', '30ml', 2000, 1260,
   ARRAY['Niacinamide 10%', 'Zinc PCA 1%'],
   'A high-strength vitamin and mineral formula that targets blemishes, controls excess oil, and minimizes pores. Niacinamide works synergistically with Zinc PCA to regulate sebum production.',
   'Apply 2-3 drops to clean, dry skin morning and evening. Follow with moisturizer and sunscreen (AM).',
   ARRAY['Oily', 'Combination', 'Acne-Prone'],
   ARRAY['Fragrance-Free', 'Non-Comedogenic', 'Cruelty-Free'],
   'Aqua, Niacinamide, Zinc PCA, Pentylene Glycol, Phenoxyethanol, Chlorphenesin, Xanthan Gum, Sodium Hydroxide',
   '/images/niacinamide-serum.png', true),

  ('retinol-serum',
   'Retinol 0.3% Serum',
   'serums', 'Anti-Aging / Cell Renewal', '30ml', 2800, 1764,
   ARRAY['Retinyl Palmitate 0.3%', 'Squalane'],
   'A gentle yet effective retinol serum for anti-aging and cell renewal. Retinyl Palmitate offers retinol benefits with reduced irritation, while Squalane keeps skin hydrated and calm.',
   'Apply 2-3 drops to clean skin at night only. Start 2-3 times per week, gradually increasing. Always use SPF 50 the next morning.',
   ARRAY['Mature', 'Fine Lines', 'All Skin Types'],
   ARRAY['Fragrance-Free', 'Night Use Only', 'Cruelty-Free'],
   'Aqua, Retinyl Palmitate, Squalane, Caprylic/Capric Triglyceride, Phenoxyethanol, Tocopherol',
   '/images/niacinamide-serum.png', false),

  ('hyaluronic-serum',
   'Hyaluronic Acid 2% Serum',
   'serums', 'Hydration', '30ml', 1800, 1134,
   ARRAY['Hyaluronic Acid 2%', 'D-Panthenol (B5)'],
   'Multi-weight Hyaluronic Acid serum for intense, multi-layer hydration. Low and high molecular weight HA penetrate different skin layers, while D-Panthenol soothes and strengthens the barrier.',
   'Apply 2-3 drops to damp skin morning and evening. Best on slightly wet skin for maximum hydration. Follow with moisturizer.',
   ARRAY['All Skin Types', 'Dry', 'Dehydrated'],
   ARRAY['Fragrance-Free', 'Non-Comedogenic', 'Cruelty-Free'],
   'Aqua, Sodium Hyaluronate, Panthenol, Pentylene Glycol, Phenoxyethanol, Sodium Hydroxide',
   '/images/hyaluronic-serum.png', true),

  ('spf60-sunscreen',
   'SPF 60 Sunscreen',
   'sunscreen', 'Broad Spectrum', '50ml', 3000, 1890,
   ARRAY['Titanium Dioxide', 'Zinc Oxide', 'Octyl Methoxycinnamate'],
   'Maximum broad-spectrum UVA/UVB protection with SPF 60. Combines mineral and chemical filters for the highest level of sun defense, suitable for extended outdoor exposure.',
   'Apply generously as the last step of your morning routine, 15 minutes before sun exposure. Reapply every 2 hours.',
   ARRAY['All Skin Types'],
   ARRAY['Non-Greasy', 'Water-Resistant', 'Cruelty-Free'],
   'Aqua, Titanium Dioxide, Zinc Oxide, Octyl Methoxycinnamate, Glycerin, Dimethicone, Phenoxyethanol',
   '/images/spf50-sunscreen.png', false),

  ('spf50-sunscreen',
   'Daily UV Shield SPF 50',
   'sunscreen', 'Broad-Spectrum UVA/UVB', '50ml', 2800, 1764,
   ARRAY['Titanium Dioxide', 'Zinc Oxide', 'Tinosorb S'],
   'Broad-spectrum protection with a lightweight, non-greasy formula that leaves no white cast. Combines mineral and chemical filters for superior protection.',
   'Apply generously as the last step of your morning routine, 15 minutes before sun exposure. Reapply every 2 hours.',
   ARRAY['All Skin Types'],
   ARRAY['No White Cast', 'Non-Greasy', 'Water-Resistant', 'Cruelty-Free'],
   'Aqua, Titanium Dioxide, Zinc Oxide, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Glycerin, Dimethicone, Phenoxyethanol',
   '/images/spf50-sunscreen.png', true),

  ('anti-acne-cream',
   'Anti-Acne Cream',
   'creams', 'Acne Treatment', '30ml', 2000, 1260,
   ARRAY['Niacinamide', 'Zinc', 'Salicylic Acid'],
   'A targeted acne treatment cream combining Niacinamide for oil control, Zinc for antimicrobial action, and Salicylic Acid for pore clearing. Designed for active breakouts.',
   'Apply a thin layer to affected areas after cleansing. Use morning and evening. Follow with sunscreen during the day.',
   ARRAY['Oily', 'Acne-Prone', 'Combination'],
   ARRAY['Fragrance-Free', 'Non-Comedogenic', 'Cruelty-Free'],
   'Aqua, Niacinamide, Zinc PCA, Salicylic Acid, Glycerin, Cetearyl Alcohol, Phenoxyethanol',
   '/images/brightening-cream.png', false),

  ('brightening-cream',
   'Brightening Cream',
   'creams', 'Glow / Pigmentation', '30ml', 2200, 1386,
   ARRAY['Vitamin C (SAP)', 'Kojic Acid', 'Alpha-Arbutin', 'Niacinamide'],
   'A multi-active brightening cream combining four powerful agents for comprehensive pigmentation care. Fades dark spots and restores radiance.',
   'Apply a pea-sized amount to clean skin every evening. Can be used AM & PM. Follow with sunscreen during the day.',
   ARRAY['All Skin Types', 'Hyperpigmentation', 'Melasma'],
   ARRAY['Fragrance-Free', 'Non-Comedogenic', 'Cruelty-Free'],
   'Aqua, Sodium Ascorbyl Phosphate, Kojic Acid, Alpha-Arbutin, Niacinamide, Hyaluronic Acid, Glycerin, Cetearyl Alcohol, Phenoxyethanol',
   '/images/brightening-cream.png', true),

  ('vitamin-b5-moisturizer',
   'Vitamin B5 10% Moisturizer',
   'moisturizers', 'Hydration & Repair', '50g', 2200, 1386,
   ARRAY['Panthenol (B5) 10%', 'Zinc', 'Copper & Magnesium', 'Biosaccharide Gum'],
   'An intensive hydration and repair moisturizer powered by 10% Panthenol. Enriched with minerals and Biosaccharide Gum for deep, long-lasting moisture and barrier repair.',
   'Apply to clean skin morning and evening as the last step before sunscreen (AM). Suitable for daily use.',
   ARRAY['Dry', 'Dehydrated', 'Sensitive', 'All Skin Types'],
   ARRAY['Fragrance-Free', 'Non-Comedogenic', 'Cruelty-Free'],
   'Aqua, Panthenol, Zinc PCA, Copper Gluconate, Magnesium Aspartate, Biosaccharide Gum-1, Glycerin, Squalane, Phenoxyethanol',
   '/images/brightening-cream.png', false),

  ('ceramide-moisturizer',
   'Ceramide Moisturizer',
   'moisturizers', 'Barrier Repair', '50g', 2500, 1575,
   ARRAY['Ceramides', 'Hyaluronic Acid', 'Vitamin E', 'Squalane', 'Shea Butter'],
   'A rich barrier repair moisturizer formulated with essential Ceramides, Hyaluronic Acid, and nourishing oils. Restores and strengthens the skin barrier for healthy, resilient skin.',
   'Apply generously to clean skin morning and evening. Ideal after serums. Follow with sunscreen during the day.',
   ARRAY['Dry', 'Sensitive', 'Compromised Barrier', 'All Skin Types'],
   ARRAY['Fragrance-Free', 'Non-Comedogenic', 'Cruelty-Free'],
   'Aqua, Ceramide NP, Ceramide AP, Ceramide EOP, Sodium Hyaluronate, Tocopherol, D-Panthenol, Squalane, Butyrospermum Parkii Butter, Phenoxyethanol',
   '/images/brightening-cream.png', false),

  ('vitamin-c-facewash',
   'Vitamin C 2% Face Wash',
   'cleansers', 'Brightening Cleanser', '100ml', 1500, 945,
   ARRAY['Vitamin C 2%', 'Niacinamide', 'Alpha-Arbutin'],
   'A gentle brightening cleanser that combines Vitamin C with Niacinamide and Alpha-Arbutin to cleanse while targeting dullness and uneven skin tone.',
   'Massage onto wet skin in circular motions for 30-60 seconds. Rinse with lukewarm water. Use morning and evening.',
   ARRAY['All Skin Types', 'Dull Skin'],
   ARRAY['Fragrance-Free', 'pH-Balanced', 'Cruelty-Free'],
   'Aqua, Sodium Ascorbyl Phosphate, Niacinamide, Alpha-Arbutin, Cocamidopropyl Betaine, Glycerin, Phenoxyethanol',
   '/images/vitamin-c-facewash.png', true),

  ('salicylic-facewash',
   'Salicylic 2% Face Wash',
   'cleansers', 'Anti-Acne Cleanser', '100ml', 1500, 945,
   ARRAY['Salicylic Acid 2%', 'Saniskin', 'Zinc'],
   'A deep-cleansing anti-acne face wash with 2% Salicylic Acid to unclog pores and reduce breakouts. Saniskin and Zinc provide antimicrobial action for clearer skin.',
   'Massage onto wet skin for 30-60 seconds, focusing on oily areas. Rinse thoroughly. Use morning and evening.',
   ARRAY['Oily', 'Acne-Prone', 'Combination'],
   ARRAY['Fragrance-Free', 'pH-Balanced', 'Cruelty-Free'],
   'Aqua, Salicylic Acid, Zinc PCA, Cocamidopropyl Betaine, Glycerin, Phenoxyethanol',
   '/images/vitamin-c-facewash.png', false),

  ('aha-bha-exfoliant',
   'AHA/BHA Clinical Exfoliant',
   'exfoliants', 'Treatment / Exfoliating', '30ml', 2200, 1386,
   ARRAY['Glycolic Acid (AHA) 5%', 'Lactic Acid (AHA)', 'Salicylic Acid (BHA) 2%'],
   'A clinical-strength exfoliating solution combining AHA and BHA for dual-action exfoliation. Glycolic and Lactic Acids resurface skin while Salicylic Acid clears pores from within.',
   'Apply to clean skin 2-3 times per week in the evening. Leave on for 10 minutes, then follow with moisturizer. Do not use with retinol.',
   ARRAY['All Skin Types', 'Textured Skin', 'Congested Pores'],
   ARRAY['Fragrance-Free', 'Clinical Strength', 'Cruelty-Free'],
   'Aqua, Glycolic Acid, Lactic Acid, Salicylic Acid, Propanediol, Sodium Hydroxide, Pentylene Glycol, Phenoxyethanol',
   '/images/niacinamide-serum.png', false);

-- Done. 14 products seeded. Verify with: select count(*) from public.products;
