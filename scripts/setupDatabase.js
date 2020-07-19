const { Pool, Client } = require('pg');
const chalk = require('chalk');
const fs = require('fs');
const { postgresql } = require('../config/amazon.json');

/**
 * You can change these to whatever you want
 * in the config file itself
 */
const {
  user, password, host, port,
} = postgresql;
const postgresConfig = {
  user,
  password,
  host,
  port,
};

/**
 * Creates all the tables, views, extensions, and a function for unique ID generation
 */
async function createTables() {
  try {
    const pool = new Pool({ ...postgresConfig, database: postgresql.database, max: 5 });

    await pool.query('CREATE EXTENSION citext;');
    await pool.query('CREATE EXTENSION pgcrypto;');

    await pool.query(`
            CREATE TABLE customers 
                ( 
                    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY, 
                    google_id   VARCHAR(100), 
                    facebook_id VARCHAR(100), 
                    given_name  VARCHAR(70), 
                    fullname    VARCHAR(70), 
                    email       citext UNIQUE, 
                    password    VARCHAR(200), 
                    phone       VARCHAR(20), 
                    address     VARCHAR(32), 
                    city        VARCHAR(32), 
                    state       CHAR(2), 
                    zip         CHAR(5), 
                    local       BOOLEAN, 
                    date_added  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            `);
    await pool.query(`
            CREATE TABLE os 
                ( 
                    id   SERIAL PRIMARY KEY, 
                    name VARCHAR(100)
                ); 
            `);
    await pool.query(`
            CREATE TABLE processor 
                ( 
                    id   SERIAL PRIMARY KEY, 
                    name VARCHAR(40)
                ); 
            `);
    await pool.query(`
            CREATE TABLE brand 
                ( 
                    id   SERIAL PRIMARY KEY, 
                    name VARCHAR(100)
                );
            `);
    await pool.query(`
            CREATE TABLE storage_type 
                ( 
                    id   SERIAL PRIMARY KEY, 
                    name VARCHAR(100) 
                );
            `);

    // Source - https://blog.andyet.com/2016/02/23/generating-shortids-in-postgres/
    await pool.query(`
            CREATE OR REPLACE FUNCTION unique_short_id()
            RETURNS TRIGGER AS $$

            -- Declare the variables we'll be using.
            DECLARE
              key TEXT;
              qry TEXT;
              found TEXT;
            BEGIN

              -- generate the first part of a query as a string with safely
              -- escaped table name, using || to concat the parts
              qry := 'SELECT id FROM ' || quote_ident(TG_TABLE_NAME) || ' WHERE id=';

              -- This loop will probably only run once per call until we've generated
              -- millions of ids.
              LOOP

                -- Generate our string bytes and re-encode as a base64 string.
                key := encode(gen_random_bytes(6), 'base64');

                -- Base64 encoding contains 2 URL unsafe characters by default.
                -- The URL-safe version has these replacements.
                key := replace(key, '/', '_'); -- url safe replacement
                key := replace(key, '+', '-'); -- url safe replacement

                -- Concat the generated key (safely quoted) with the generated query
                -- and run it.
                -- SELECT id FROM "test" WHERE id='blahblah' INTO found
                -- Now "found" will be the duplicated id or NULL.
                EXECUTE qry || quote_literal(key) INTO found;

                -- Check to see if found is NULL.
                -- If we checked to see if found = NULL it would always be FALSE
                -- because (NULL = NULL) is always FALSE.
                IF found IS NULL THEN

                  -- If we didn't find a collision then leave the LOOP.
                  EXIT;
                END IF;

                -- We haven't EXITed yet, so return to the top of the LOOP
                -- and try again.
              END LOOP;

              -- NEW and OLD are available in TRIGGER PROCEDURES.
              -- NEW is the mutated row that will actually be INSERTed.
              -- We're replacing id, regardless of what it was before
              -- with our key variable.
              NEW.id = key;

              -- The RECORD returned here is what will actually be INSERTed,
              -- or what the next trigger will get if there is one.
              RETURN NEW;
            END;
            $$ language 'plpgsql';
    `);

    await pool.query(`
            CREATE TABLE laptops 
                ( 
                    id              TEXT PRIMARY KEY,
                    name            VARCHAR(300), 
                    os_id           INT REFERENCES os(id), 
                    processor_id    INT REFERENCES processor(id), 
                    brand_id        INT REFERENCES brand(id), 
                    img             VARCHAR(200), 
                    ram             VARCHAR (3), 
                    storage_type_id INT REFERENCES storage_type(id), 
                    STORAGE         INT, 
                    rating          DECIMAL(2, 1), 
                    price           NUMERIC(7, 2), 
                    img_big         VARCHAR(200), 
                    description     TEXT[] 
                );
            `);

    // We name the trigger "trigger_laptops_genid" so that we can remove or replace it later.
    // If an INSERT contains multiple RECORDs, each one will call unique_short_id individually.
    await pool.query('CREATE TRIGGER trigger_laptops_genid BEFORE INSERT ON laptops FOR EACH ROW EXECUTE PROCEDURE unique_short_id();');

    await pool.query('CREATE SCHEMA shard_1;');
    await pool.query('CREATE SEQUENCE shard_1.global_id_sequence;');
    await pool.query(`
            CREATE OR REPLACE FUNCTION shard_1.id_generator(OUT result BIGINT) AS $$
            DECLARE
                our_epoch BIGINT := 1314220021721;
                seq_id BIGINT;
                now_millis BIGINT;
                -- the id of this DB shard, must be set for each
                -- schema shard you have - you could pass this as a parameter too
                shard_id INT := 1;
            BEGIN
                SELECT nextval('shard_1.global_id_sequence') % 1024 INTO seq_id;
            
                SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000) INTO now_millis;
                result := (now_millis - our_epoch) << 23;
                result := result | (shard_id << 10);
                result := result | (seq_id);
            END;
            $$ LANGUAGE PLPGSQL;
            `);
    await pool.query(`
            CREATE TABLE orderline 
                ( 
                    id          BIGINT PRIMARY KEY DEFAULT shard_1.id_generator(),
                    order_total NUMERIC(7, 2), 
                    customer_id UUID NOT NULL REFERENCES customers(id), 
                    date_added  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP 
                ); 
            `);
    await pool.query(`
            CREATE TABLE orders 
                ( 
                    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY, 
                    orderline_id BIGINT REFERENCES orderline(id), 
                    product_id   TEXT REFERENCES laptops(id), 
                    quantity     INTEGER NOT NULL, 
                    fullname     VARCHAR(70), 
                    address      VARCHAR(32), 
                    city         VARCHAR(32), 
                    state        CHAR(2), 
                    zip          CHAR(5) 
                ); 
            `);
    await pool.query(`
            CREATE TABLE cart 
                ( 
                    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY, 
                    product_id       TEXT REFERENCES laptops(id), 
                    product_quantity INTEGER NOT NULL, 
                    customer_id      UUID NOT NULL REFERENCES customers(id), 
                    date_added       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP 
                ); 
            `);
    await pool.query(`
            CREATE view checkoutview 
            AS 
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
                    JOIN customers 
                    ON customers.id = cart.customer_id 
                    JOIN laptops 
                    ON laptops.id = cart.product_id 
                    JOIN brand 
                    ON laptops.brand_id = brand.id;
            `);
    await pool.query(`
            CREATE VIEW cartview 
            AS 
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
                    JOIN laptops 
                    ON laptops.id = cart.product_id 
                    JOIN brand 
                    ON laptops.brand_id = brand.id;
            `);
    await pool.query('CREATE INDEX ON laptops ((lower(name)));');
    await pool.query('CREATE INDEX ON laptops (rating);');
    await pool.query('CREATE INDEX ON laptops (price);');

    console.log(chalk.green('Successfully created all the tables...'));
    console.log(chalk.blue('Now initializing the tables with seeds...'));

    const inserts = fs.readFileSync(`${__dirname}/schema/inserts.sql`, { encoding: 'utf8' });

    const insertsArray = inserts.split('--statement--');

    for (let idx = 0; idx < insertsArray.length; idx += 1) {
      // eslint-disable-next-line no-await-in-loop
      await pool.query(insertsArray[idx]);
    }
    console.log(chalk.green('Successfully seeded the database..'));
    console.log(chalk.green('Process complete with no errors.'));
    process.exit(0);
  } catch (err) {
    console.log(chalk.red(err));
  }
}

/**
 * Script Entry
 * Creates the database, and calls createTables function
 */
(async function main() {
  try {
    console.log(chalk.green('Setting up the database...'));

    const client = new Client(postgresConfig);

    await client.connect();

    console.log(chalk.green('Creating database:', postgresql.database));

    await client.query(`CREATE DATABASE ${postgresql.database};`);
    await client.end();

    console.log(chalk.green('Successfully created database: ', postgresql.database));

    console.log(chalk.blue('Now creating all the tables...'));

    await createTables();
  } catch (err) {
    console.log(chalk.red(err));
  }
}());
