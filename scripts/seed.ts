import { hash } from "bcryptjs";
import postgres from "postgres";
import { COLOURS, products } from "../src/lib/catalog";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required.");

const sql = postgres(url, { max: 1 });
const colourHex = new Map(COLOURS.map((colour) => [colour.name, colour.hex]));

for (const product of products) {
  const rows = await sql<{ id: string }[]>`
    INSERT INTO products (
      slug, name, subtitle, category, kind, fit, gsm, base_price, compare_at_price,
      audience, methods, featured, is_new
    ) VALUES (
      ${product.slug}, ${product.name}, ${product.subtitle}, ${product.category}, ${product.kind},
      ${product.fit}, ${product.gsm}, ${product.price}, ${product.mrp},
      ${sql.json(product.audience)}, ${sql.json(product.methods)}, ${Boolean(product.bestseller)}, ${Boolean(product.isNew)}
    )
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name, subtitle = EXCLUDED.subtitle, category = EXCLUDED.category,
      kind = EXCLUDED.kind, fit = EXCLUDED.fit, gsm = EXCLUDED.gsm,
      base_price = EXCLUDED.base_price, compare_at_price = EXCLUDED.compare_at_price,
      audience = EXCLUDED.audience, methods = EXCLUDED.methods,
      featured = EXCLUDED.featured, is_new = EXCLUDED.is_new, updated_at = now()
    RETURNING id
  `;
  const productId = rows[0].id;
  for (const colour of product.colours) {
    for (const size of product.sizes) {
      const sku = `PE-${product.slug}-${colour}-${size}`.toUpperCase().replace(/[^A-Z0-9]+/g, "-");
      await sql`
        INSERT INTO product_variants (product_id, sku, colour, colour_hex, size, stock)
        VALUES (${productId}, ${sku}, ${colour}, ${colourHex.get(colour) ?? "#000000"}, ${size}, ${product.stock ?? 25})
        ON CONFLICT (product_id, colour, size) DO UPDATE SET
          sku = EXCLUDED.sku, colour_hex = EXCLUDED.colour_hex
      `;
    }
  }
}

await sql`INSERT INTO discounts (name, type, value, minimum_quantity, active, combinable) SELECT 'Buy 2, save 10%', 'percentage', 10, 2, true, false WHERE NOT EXISTS (SELECT 1 FROM discounts WHERE name='Buy 2, save 10%' AND code IS NULL)`;

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;
if (adminEmail && adminPassword) {
  await sql`
    INSERT INTO users (email, name, password_hash, role)
    VALUES (${adminEmail}, 'Store administrator', ${await hash(adminPassword, 12)}, 'admin')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin', active = true
  `;
  console.log(`Admin ready: ${adminEmail}`);
} else {
  console.warn("ADMIN_EMAIL/ADMIN_PASSWORD not supplied; catalogue seeded without an admin user.");
}

await sql.end();
console.log(`Seeded ${products.length} products and their variants.`);
