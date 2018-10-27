const { Pool, Client } = require('pg');
const chalk = require('chalk');
const fs = require('fs');
const { postgresql } = require('../config/amazon.json');

/**
 * You can change these to whatever you want
 * in the config file itself
 */
const { user, password, host, port } = postgresql;
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
    const pool = new Pool(Object.assign({}, postgresConfig, { database: postgresql.database, max: 5 }));

    await pool.query('CREATE EXTENSION citext;');
    await pool.query(`
            CREATE TABLE customers 
                ( 
                    id          SERIAL PRIMARY KEY NOT NULL, 
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
                    id   SERIAL NOT NULL PRIMARY KEY, 
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
                    id   SERIAL NOT NULL PRIMARY KEY, 
                    name VARCHAR(100)
                );
            `);
    await pool.query(`
            CREATE TABLE storage_type 
                ( 
                    id   SERIAL NOT NULL PRIMARY KEY, 
                    name VARCHAR(100) 
                );
            `);
    await pool.query(`
            CREATE TABLE laptops 
                ( 
                    id              SERIAL NOT NULL PRIMARY KEY, 
                    name            VARCHAR(300), 
                    os_id           INT NOT NULL REFERENCES os(id), 
                    processor_id    INT NOT NULL REFERENCES processor(id), 
                    brand_id        INT NOT NULL REFERENCES brand(id), 
                    img             VARCHAR(200), 
                    ram             VARCHAR (3), 
                    storage_type_id INT NOT NULL REFERENCES storage_type(id), 
                    STORAGE         INT, 
                    rating          DECIMAL(2, 1), 
                    price           NUMERIC(7, 2), 
                    img_big         VARCHAR(200), 
                    description     TEXT[] 
                );
            `);
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
                    id          BIGINT PRIMARY KEY NOT NULL DEFAULT shard_1.id_generator(), 
                    order_total NUMERIC(7, 2), 
                    customer_id INTEGER NOT NULL REFERENCES customers(id), 
                    date_added  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP 
                ); 
            `);
    await pool.query(`
            CREATE TABLE orders 
                ( 
                    id           SERIAL PRIMARY KEY NOT NULL, 
                    orderline_id BIGINT REFERENCES orderline(id), 
                    product_id   INTEGER NOT NULL REFERENCES laptops(id), 
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
                    id               SERIAL PRIMARY KEY NOT NULL, 
                    product_id       INTEGER NOT NULL REFERENCES laptops(id), 
                    product_quantity INTEGER NOT NULL, 
                    customer_id      INTEGER NOT NULL REFERENCES customers(id), 
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
    console.log(chalk.green('Starting database migration...'));

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
