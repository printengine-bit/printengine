CREATE TEMP TABLE pe_catalog_expansion ON COMMIT DROP AS
SELECT * FROM jsonb_to_recordset($catalog$
[
 {"slug":"oversized-black","name":"Oversized Black t-shirt","subtitle":"240 gsm premium combed cotton","category":"t-shirts","kind":"oversized","fit":"Oversized","gsm":240,"price":799,"mrp":1099,"audience":["Men","Women"],"methods":["Custom print"],"colours":["Black"],"sizes":["S","M","L","XL","XXL"],"is_new":true},
 {"slug":"oversized-off-white","name":"Oversized Off-white t-shirt","subtitle":"240 gsm premium combed cotton","category":"t-shirts","kind":"oversized","fit":"Oversized","gsm":240,"price":799,"mrp":1099,"audience":["Men","Women"],"methods":["Custom print"],"colours":["Off-white"],"sizes":["S","M","L","XL","XXL"],"is_new":true},
 {"slug":"oversized-grey","name":"Oversized Grey t-shirt","subtitle":"240 gsm premium combed cotton","category":"t-shirts","kind":"oversized","fit":"Oversized","gsm":240,"price":799,"mrp":1099,"audience":["Men","Women"],"methods":["Custom print"],"colours":["Grey melange"],"sizes":["S","M","L","XL","XXL"],"is_new":true},
 {"slug":"oversized-olive","name":"Oversized Olive t-shirt","subtitle":"240 gsm premium combed cotton","category":"t-shirts","kind":"oversized","fit":"Oversized","gsm":240,"price":799,"mrp":1099,"audience":["Men","Women"],"methods":["Custom print"],"colours":["Olive"],"sizes":["S","M","L","XL","XXL"],"is_new":true},
 {"slug":"oversized-brown","name":"Oversized Brown t-shirt","subtitle":"240 gsm premium combed cotton","category":"t-shirts","kind":"oversized","fit":"Oversized","gsm":240,"price":849,"mrp":1149,"audience":["Men","Women"],"methods":["Custom print"],"colours":["Brown"],"sizes":["S","M","L","XL","XXL"],"is_new":true},
 {"slug":"oversized-navy","name":"Oversized Navy t-shirt","subtitle":"240 gsm premium combed cotton","category":"t-shirts","kind":"oversized","fit":"Oversized","gsm":240,"price":799,"mrp":1099,"audience":["Men","Women"],"methods":["Custom print"],"colours":["Navy"],"sizes":["S","M","L","XL","XXL"],"is_new":true},
 {"slug":"vintage-washed-tee","name":"Vintage Washed t-shirt","subtitle":"260 gsm mineral-washed cotton","category":"t-shirts","kind":"oversized","fit":"Oversized","gsm":260,"price":999,"mrp":1399,"audience":["Men","Women"],"methods":["Custom print"],"colours":["Charcoal"],"sizes":["S","M","L","XL","XXL"],"featured":true},
 {"slug":"minimal-logo-tee","name":"Minimal Logo Tee","subtitle":"200 gsm compact cotton, chest mark","category":"t-shirts","kind":"tee-half","fit":"Regular","gsm":200,"price":749,"mrp":999,"audience":["Men","Women"],"methods":["Custom print"],"colours":["Navy"],"sizes":["S","M","L","XL","XXL"],"is_new":true},
 {"slug":"streetwear-oversized-hoodie","name":"Oversized hoodie","subtitle":"420 gsm heavyweight brushed fleece","category":"streetwear","kind":"hoodie","fit":"Oversized","gsm":420,"price":1699,"mrp":2299,"audience":["Men","Women"],"methods":["Custom print","Embroidery"],"colours":["Bottle green","Black","Olive"],"sizes":["S","M","L","XL","XXL"],"featured":true},
 {"slug":"boxy-sweatshirt","name":"Boxy sweatshirt","subtitle":"360 gsm structured loopback cotton","category":"streetwear","kind":"sweatshirt","fit":"Boxy","gsm":360,"price":1399,"mrp":1899,"audience":["Men","Women"],"methods":["Custom print","Embroidery"],"colours":["Mustard","Black","Olive","Grey melange"],"sizes":["S","M","L","XL","XXL"],"is_new":true},
 {"slug":"cargo-pants","name":"Cargo pants","subtitle":"Relaxed utility twill with six pockets","category":"streetwear","kind":"cargo","fit":"Relaxed","gsm":280,"price":1499,"mrp":1999,"audience":["Men","Women"],"methods":["Embroidery"],"colours":["Olive"],"sizes":["S","M","L","XL","XXL"],"is_new":true},
 {"slug":"varsity-jacket","name":"Varsity jacket","subtitle":"Wool-touch body with contrast sleeves","category":"streetwear","kind":"varsity","fit":"Regular","gsm":420,"price":2499,"mrp":3299,"audience":["Men","Women"],"methods":["Embroidery"],"colours":["Black"],"sizes":["S","M","L","XL","XXL"],"is_new":true},
 {"slug":"pro-football-jersey","name":"Football jersey","subtitle":"140 gsm breathable match mesh","category":"sports","kind":"jersey","fit":"Athletic","gsm":140,"price":899,"mrp":1199,"audience":["Men","Women","Kids"],"methods":["Custom print"],"colours":["Navy","Black","Mustard"],"sizes":["S","M","L","XL","XXL"]},
 {"slug":"basketball-jersey","name":"Basketball jersey","subtitle":"Breathable mesh jersey and shorts set","category":"sports","kind":"basketball","fit":"Athletic","gsm":150,"price":1099,"mrp":1499,"audience":["Men","Women","Kids"],"methods":["Custom print"],"colours":["Navy"],"sizes":["S","M","L","XL","XXL"],"is_new":true},
 {"slug":"oversized-sports-tee","name":"Oversized sports tee","subtitle":"180 gsm quick-dry performance knit","category":"sports","kind":"oversized","fit":"Oversized","gsm":180,"price":849,"mrp":1149,"audience":["Men","Women"],"methods":["Custom print"],"colours":["Olive","Black","Navy"],"sizes":["S","M","L","XL","XXL"]},
 {"slug":"dry-fit-gym-tee","name":"Dry-fit gym tee","subtitle":"160 gsm moisture-wicking performance mesh","category":"sports","kind":"tee-half","fit":"Athletic","gsm":160,"price":699,"mrp":949,"audience":["Men","Women"],"methods":["Custom print"],"colours":["Navy","Black","Bottle green"],"sizes":["S","M","L","XL","XXL"]},
 {"slug":"premium-cap","name":"Premium cap","subtitle":"Six-panel cotton cap with adjustable strap","category":"accessories","kind":"cap","fit":"Adjustable","gsm":0,"price":499,"mrp":699,"audience":["Men","Women"],"methods":["Embroidery"],"colours":["Black"],"sizes":["One size"],"is_new":true},
 {"slug":"tote-bag","name":"Tote bag","subtitle":"Heavy natural canvas with reinforced handles","category":"accessories","kind":"tote","fit":"One size","gsm":320,"price":449,"mrp":649,"audience":["Men","Women"],"methods":["Custom print","Embroidery"],"colours":["Natural"],"sizes":["One size"]},
 {"slug":"crossbody-bag","name":"Sling / crossbody bag","subtitle":"Water-resistant compact everyday bag","category":"accessories","kind":"sling","fit":"Adjustable","gsm":0,"price":799,"mrp":1099,"audience":["Men","Women"],"methods":["Custom print","Embroidery"],"colours":["Black"],"sizes":["One size"]},
 {"slug":"crew-socks","name":"Crew socks","subtitle":"Cushioned combed-cotton crew socks","category":"accessories","kind":"socks","fit":"Stretch","gsm":0,"price":299,"mrp":449,"audience":["Men","Women"],"methods":["Embroidery"],"colours":["White"],"sizes":["M","L"]},
 {"slug":"piped-medical-tunic","name":"Piped medical tunic","subtitle":"Short-sleeve poly-cotton tunic with navy piping","category":"doctor-aprons","kind":"medical-tunic","fit":"Regular","gsm":190,"price":899,"mrp":1199,"audience":["Men"],"methods":["Embroidery"],"colours":["White"],"sizes":["S","M","L","XL","XXL"],"is_new":true},
 {"slug":"side-button-medical-tunic","name":"Side-button medical tunic","subtitle":"Asymmetric nurse tunic with contrast piping","category":"doctor-aprons","kind":"medical-wrap-tunic","fit":"Regular","gsm":190,"price":999,"mrp":1349,"audience":["Women"],"methods":["Embroidery"],"colours":["White"],"sizes":["S","M","L","XL","XXL"],"is_new":true},
 {"slug":"mens-short-lab-coat","name":"Men's short lab coat","subtitle":"Short-sleeve three-pocket clinical coat","category":"doctor-aprons","kind":"mens-short-lab-coat","fit":"Regular","gsm":200,"price":1049,"mrp":1399,"audience":["Men"],"methods":["Embroidery"],"colours":["White"],"sizes":["S","M","L","XL","XXL"]},
 {"slug":"womens-short-lab-coat","name":"Women's short lab coat","subtitle":"Tailored short coat with two patch pockets","category":"doctor-aprons","kind":"womens-short-lab-coat","fit":"Regular","gsm":200,"price":1049,"mrp":1399,"audience":["Women"],"methods":["Embroidery"],"colours":["White"],"sizes":["S","M","L","XL","XXL"]},
 {"slug":"maroon-scrub-set","name":"Maroon scrub set","subtitle":"V-neck scrub top with straight-leg trousers","category":"doctor-aprons","kind":"scrub-set","fit":"Regular","gsm":180,"price":1399,"mrp":1899,"audience":["Men","Women"],"methods":["Embroidery"],"colours":["Maroon"],"sizes":["S","M","L","XL","XXL"],"featured":true}
]
$catalog$::jsonb) AS entry(
  slug text, name text, subtitle text, category text, kind text, fit text,
  gsm integer, price integer, mrp integer, audience jsonb, methods jsonb,
  colours jsonb, sizes jsonb, featured boolean, is_new boolean
);

INSERT INTO products (
  slug, name, subtitle, category, kind, fit, gsm, base_price,
  compare_at_price, audience, methods, featured, is_new, status
)
SELECT slug, name, subtitle, category, kind, fit, gsm, price, mrp,
  audience, methods, coalesce(featured, false), coalesce(is_new, false), 'active'
FROM pe_catalog_expansion
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  category = EXCLUDED.category,
  kind = EXCLUDED.kind,
  fit = EXCLUDED.fit,
  gsm = EXCLUDED.gsm,
  base_price = EXCLUDED.base_price,
  compare_at_price = EXCLUDED.compare_at_price,
  audience = EXCLUDED.audience,
  methods = EXCLUDED.methods,
  featured = EXCLUDED.featured,
  is_new = EXCLUDED.is_new,
  status = 'active',
  updated_at = now();

INSERT INTO product_variants (product_id, sku, colour, colour_hex, size, stock, active)
SELECT p.id,
  upper(regexp_replace('PE-' || e.slug || '-' || colour.value || '-' || size.value, '[^A-Za-z0-9]+', '-', 'g')),
  colour.value,
  CASE colour.value
    WHEN 'Black' THEN '#0a0a0a' WHEN 'White' THEN '#ffffff'
    WHEN 'Navy' THEN '#1f2a44' WHEN 'Grey melange' THEN '#9aa0a6'
    WHEN 'Olive' THEN '#4b5320' WHEN 'Maroon' THEN '#6b1f2a'
    WHEN 'Bottle green' THEN '#14532d' WHEN 'Mustard' THEN '#c8951a'
    WHEN 'Off-white' THEN '#f2efe6' WHEN 'Brown' THEN '#654236'
    WHEN 'Charcoal' THEN '#333333' WHEN 'Natural' THEN '#e7dfcf'
    ELSE '#cccccc'
  END,
  size.value,
  25,
  true
FROM pe_catalog_expansion e
JOIN products p ON p.slug = e.slug
CROSS JOIN LATERAL jsonb_array_elements_text(e.colours) colour(value)
CROSS JOIN LATERAL jsonb_array_elements_text(e.sizes) size(value)
ON CONFLICT (product_id, colour, size) DO UPDATE SET
  sku = EXCLUDED.sku,
  colour_hex = EXCLUDED.colour_hex,
  active = true,
  updated_at = now();
