import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // Create extensions
  await sql`CREATE EXTENSION IF NOT EXISTS citext;`.execute(db);
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`.execute(db);

  // Customers table
  await db.schema.createTable('customers')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()` ))
    .addColumn('google_id', 'varchar(100)')
    .addColumn('facebook_id', 'varchar(100)')
    .addColumn('given_name', 'varchar(70)')
    .addColumn('fullname', 'varchar(70)')
    .addColumn('email', sql`citext`, (col) => col.unique())
    .addColumn('password', 'varchar(200)')
    .addColumn('phone', 'varchar(20)')
    .addColumn('address', 'varchar(32)')
    .addColumn('city', 'varchar(32)')
    .addColumn('state', 'char(2)')
    .addColumn('zip', 'char(5)')
    .addColumn('local', 'boolean')
    .addColumn('date_added', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // OS table
  await db.schema.createTable('os')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(100)')
    .execute();

  // Processor table
  await db.schema.createTable('processor')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(40)')
    .execute();

  // Brand table
  await db.schema.createTable('brand')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(100)')
    .execute();

  // Storage Type table
  await db.schema.createTable('storage_type')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(100)')
    .execute();

  // Trigger function unique_short_id
  await sql`
    CREATE OR REPLACE FUNCTION unique_short_id()
    RETURNS TRIGGER AS $$
    DECLARE
      key TEXT;
      qry TEXT;
      found TEXT;
    BEGIN
      qry := 'SELECT id FROM ' || quote_ident(TG_TABLE_NAME) || ' WHERE id=';
      LOOP
        key := encode(gen_random_bytes(6), 'base64');
        key := replace(key, '/', '_');
        key := replace(key, '+', '-');
        EXECUTE qry || quote_literal(key) INTO found;
        IF found IS NULL THEN
          EXIT;
        END IF;
      END LOOP;
      NEW.id = key;
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `.execute(db);

  // Laptops table
  await db.schema.createTable('laptops')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('name', 'varchar(300)')
    .addColumn('os_id', 'integer', (col) => col.references('os.id'))
    .addColumn('processor_id', 'integer', (col) => col.references('processor.id'))
    .addColumn('brand_id', 'integer', (col) => col.references('brand.id'))
    .addColumn('img', 'varchar(200)')
    .addColumn('ram', 'varchar(3)')
    .addColumn('storage_type_id', 'integer', (col) => col.references('storage_type.id'))
    .addColumn('storage', 'integer')
    .addColumn('rating', 'decimal(2, 1)')
    .addColumn('price', 'numeric(7, 2)')
    .addColumn('img_big', 'varchar(200)')
    .addColumn('description', sql`text[]`)
    .addColumn('date_added', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Trigger trigger_laptops_genid
  await sql`
    CREATE TRIGGER trigger_laptops_genid
    BEFORE INSERT ON laptops
    FOR EACH ROW
    EXECUTE FUNCTION unique_short_id();
  `.execute(db);

  // Create indexes
  await db.schema.createIndex('laptops_name_lower_idx').on('laptops').expression(sql`lower(name)`).execute();
  await db.schema.createIndex('laptops_rating_idx').on('laptops').column('rating').execute();
  await db.schema.createIndex('laptops_price_idx').on('laptops').column('price').execute();

  // Schema shard_1 and sequence
  await sql`CREATE SCHEMA shard_1;`.execute(db);
  await sql`CREATE SEQUENCE shard_1.global_id_sequence;`.execute(db);
  await sql`
    CREATE OR REPLACE FUNCTION shard_1.id_generator(OUT result BIGINT) AS $$
    DECLARE
        our_epoch BIGINT := 1314220021721;
        seq_id BIGINT;
        now_millis BIGINT;
        shard_id INT := 1;
    BEGIN
        SELECT nextval('shard_1.global_id_sequence') % 1024 INTO seq_id;
        SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000) INTO now_millis;
        result := (now_millis - our_epoch) << 23;
        result := result | (shard_id << 10);
        result := result | (seq_id);
    END;
    $$ LANGUAGE PLPGSQL;
  `.execute(db);

  // Orderline table
  await db.schema.createTable('orderline')
    .addColumn('id', 'bigint', (col) => col.primaryKey().defaultTo(sql`shard_1.id_generator()` ))
    .addColumn('order_total', 'numeric(7, 2)')
    .addColumn('customer_id', 'uuid', (col) => col.references('customers.id'))
    .addColumn('date_added', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Orders table
  await db.schema.createTable('orders')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()` ))
    .addColumn('orderline_id', 'bigint', (col) => col.references('orderline.id'))
    .addColumn('product_id', 'text', (col) => col.references('laptops.id'))
    .addColumn('quantity', 'integer', (col) => col.notNull())
    .addColumn('fullname', 'varchar(70)')
    .addColumn('address', 'varchar(32)')
    .addColumn('city', 'varchar(32)')
    .addColumn('state', 'char(2)')
    .addColumn('zip', 'char(5)')
    .execute();

  // Cart table
  await db.schema.createTable('cart')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()` ))
    .addColumn('product_id', 'text', (col) => col.references('laptops.id'))
    .addColumn('product_quantity', 'integer', (col) => col.notNull())
    .addColumn('customer_id', 'uuid', (col) => col.references('customers.id'))
    .addColumn('date_added', 'timestamptz', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Create views
  await sql`
    CREATE VIEW checkoutview AS
    SELECT cart.customer_id, 
            customers.fullname, 
            customers.address, 
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

  // Drop tables
  await db.schema.dropTable('cart').execute();
  await db.schema.dropTable('orders').execute();
  await db.schema.dropTable('orderline').execute();
  await db.schema.dropTable('laptops').execute();
  await db.schema.dropTable('storage_type').execute();
  await db.schema.dropTable('brand').execute();
  await db.schema.dropTable('processor').execute();
  await db.schema.dropTable('os').execute();
  await db.schema.dropTable('customers').execute();

  // Drop generator function, schema, sequence, unique_short_id
  await sql`DROP FUNCTION IF EXISTS shard_1.id_generator() CASCADE;`.execute(db);
  await sql`DROP SEQUENCE IF EXISTS shard_1.global_id_sequence CASCADE;`.execute(db);
  await sql`DROP SCHEMA IF EXISTS shard_1 CASCADE;`.execute(db);
  await sql`DROP FUNCTION IF EXISTS unique_short_id() CASCADE;`.execute(db);
}
