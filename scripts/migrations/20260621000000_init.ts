import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // Create extensions
  await sql`CREATE EXTENSION IF NOT EXISTS citext;`.execute(db);
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`.execute(db);

  // Auto-update trigger function for updated_at columns
  await sql`
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  // Case-insensitive nanoid generator (single-pass, lowercase alphanumeric)
  await sql`
    CREATE OR REPLACE FUNCTION nanoid(size int DEFAULT 12)
    RETURNS text AS $$
    SELECT string_agg(
      substr('0123456789abcdefghijklmnopqrstuvwxyz',
             (get_byte(gen_random_bytes(size), i) % 36) + 1, 1), '')
    FROM generate_series(0, size - 1) AS i
    $$ LANGUAGE SQL VOLATILE;
  `.execute(db);

  // Customers table
  await db.schema.createTable('customers')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('google_id', 'varchar(100)')
    .addColumn('facebook_id', 'varchar(100)')
    .addColumn('given_name', 'varchar(150)')
    .addColumn('fullname', 'varchar(150)')
    .addColumn('email', sql`citext`, (col) => col.unique())
    .addColumn('password', 'varchar(200)')
    .addColumn('phone', 'varchar(20)')
    .addColumn('address', 'varchar(255)')
    .addColumn('city', 'varchar(100)')
    .addColumn('state', 'char(2)')
    .addColumn('zip', 'char(5)', (col) => col.check(sql`zip ~ '^\d{5}$'`))
    .addColumn('local', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('date_added', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Partial unique indexes for OAuth provider IDs (only index non-null values)
  await sql`CREATE UNIQUE INDEX customers_google_id_idx ON customers (google_id) WHERE google_id IS NOT NULL;`.execute(db);
  await sql`CREATE UNIQUE INDEX customers_facebook_id_idx ON customers (facebook_id) WHERE facebook_id IS NOT NULL;`.execute(db);

  // Trigger for customers.updated_at
  await sql`
    CREATE TRIGGER trigger_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
  `.execute(db);

  // OS table
  await db.schema.createTable('os')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(100)', (col) => col.notNull().unique())
    .execute();

  // Processor table
  await db.schema.createTable('processor')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(100)', (col) => col.notNull().unique())
    .execute();

  // Brand table
  await db.schema.createTable('brand')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(100)', (col) => col.notNull().unique())
    .execute();

  // Storage Type table
  await db.schema.createTable('storage_type')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(100)', (col) => col.notNull().unique())
    .execute();

  // Laptops table
  await db.schema.createTable('laptops')
    .addColumn('id', 'text', (col) => col.primaryKey().defaultTo(sql`nanoid()`))
    .addColumn('name', 'varchar(300)', (col) => col.notNull())
    .addColumn('os_id', 'integer', (col) => col.notNull().references('os.id').onDelete('restrict'))
    .addColumn('processor_id', 'integer', (col) => col.notNull().references('processor.id').onDelete('restrict'))
    .addColumn('brand_id', 'integer', (col) => col.notNull().references('brand.id').onDelete('restrict'))
    .addColumn('img', 'varchar(200)')
    .addColumn('ram', 'smallint', (col) => col.notNull())
    .addColumn('storage_type_id', 'integer', (col) => col.notNull().references('storage_type.id').onDelete('restrict'))
    .addColumn('storage', 'integer', (col) => col.notNull().check(sql`storage > 0`))
    .addColumn('rating', 'decimal(2, 1)', (col) => col.check(sql`rating >= 0 AND rating <= 5`))
    .addColumn('price', 'numeric(10, 2)', (col) => col.notNull().check(sql`price > 0`))
    .addColumn('img_big', 'varchar(200)')
    .addColumn('description', sql`text[]`)
    .addColumn('date_added', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Indexes for laptops
  await db.schema.createIndex('laptops_name_lower_idx').on('laptops').expression(sql`lower(name)`).execute();
  await db.schema.createIndex('laptops_rating_idx').on('laptops').column('rating').execute();
  await db.schema.createIndex('laptops_price_idx').on('laptops').column('price').execute();
  await db.schema.createIndex('laptops_brand_id_idx').on('laptops').column('brand_id').execute();
  await db.schema.createIndex('laptops_processor_id_idx').on('laptops').column('processor_id').execute();
  await db.schema.createIndex('laptops_storage_type_id_idx').on('laptops').column('storage_type_id').execute();
  await db.schema.createIndex('laptops_os_id_idx').on('laptops').column('os_id').execute();
  await db.schema.createIndex('laptops_ram_idx').on('laptops').column('ram').execute();
  await db.schema.createIndex('laptops_storage_idx').on('laptops').column('storage').execute();

  // Trigger for laptops.updated_at
  await sql`
    CREATE TRIGGER trigger_laptops_updated_at
    BEFORE UPDATE ON laptops
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
  `.execute(db);

  // Orders table
  await sql`
    CREATE TABLE orders (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      order_total numeric(10, 2) NOT NULL CHECK (order_total >= 0),
      customer_id integer NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
      date_added timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `.execute(db);

  await db.schema.createIndex('orders_customer_id_idx').on('orders').column('customer_id').execute();

  // Order items table
  await db.schema.createTable('order_items')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('order_id', 'bigint', (col) => col.notNull().references('orders.id').onDelete('cascade'))
    .addColumn('product_id', 'text', (col) => col.notNull().references('laptops.id').onDelete('restrict'))
    .addColumn('quantity', 'integer', (col) => col.notNull().check(sql`quantity > 0`))
    .addColumn('fullname', 'varchar(150)', (col) => col.notNull())
    .addColumn('address', 'varchar(255)', (col) => col.notNull())
    .addColumn('city', 'varchar(100)', (col) => col.notNull())
    .addColumn('state', 'char(2)', (col) => col.notNull())
    .addColumn('zip', 'char(5)', (col) => col.notNull())
    .execute();

  await db.schema.createIndex('order_items_order_id_idx').on('order_items').column('order_id').execute();

  // Cart table
  await db.schema.createTable('cart')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('product_id', 'text', (col) => col.notNull().references('laptops.id').onDelete('cascade'))
    .addColumn('product_quantity', 'integer', (col) => col.notNull().check(sql`product_quantity > 0`))
    .addColumn('customer_id', 'integer', (col) => col.notNull().references('customers.id').onDelete('cascade'))
    .addColumn('date_added', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addUniqueConstraint('cart_customer_product_unique', ['customer_id', 'product_id'])
    .execute();

  // Trigger for cart.updated_at
  await sql`
    CREATE TRIGGER trigger_cart_updated_at
    BEFORE UPDATE ON cart
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
  `.execute(db);

  // Create views
  await sql`
    CREATE VIEW checkoutview AS
    SELECT cart.customer_id,
            customers.fullname,
            customers.address,
            customers.city,
            customers.state,
            customers.zip,
            customers.phone,
            cart.product_quantity,
            laptops.id AS laptops_id,
            laptops.price,
            laptops.img,
            brand.name AS brand_name,
            laptops.name,
            cart.date_added
    FROM    cart
            JOIN customers ON customers.id = cart.customer_id
            JOIN laptops ON laptops.id = cart.product_id
            JOIN brand ON laptops.brand_id = brand.id;
  `.execute(db);

  await sql`
    CREATE VIEW cartview AS
    SELECT cart.customer_id,
            cart.id AS unique_id,
            cart.product_quantity,
            laptops.id AS laptops_id,
            laptops.price,
            laptops.img,
            brand.name AS brand_name,
            laptops.name,
            cart.date_added
    FROM    cart
            JOIN laptops ON laptops.id = cart.product_id
            JOIN brand ON laptops.brand_id = brand.id;
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Drop views
  await sql`DROP VIEW IF EXISTS cartview;`.execute(db);
  await sql`DROP VIEW IF EXISTS checkoutview;`.execute(db);

  // Drop tables (order matters due to FK dependencies)
  await db.schema.dropTable('cart').execute();
  await db.schema.dropTable('order_items').execute();
  await db.schema.dropTable('orders').execute();
  await db.schema.dropTable('laptops').execute();
  await db.schema.dropTable('storage_type').execute();
  await db.schema.dropTable('brand').execute();
  await db.schema.dropTable('processor').execute();
  await db.schema.dropTable('os').execute();
  await db.schema.dropTable('customers').execute();

  // Drop functions
  await sql`DROP FUNCTION IF EXISTS nanoid(int) CASCADE;`.execute(db);
  await sql`DROP FUNCTION IF EXISTS update_updated_at() CASCADE;`.execute(db);
}
