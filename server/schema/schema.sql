CREATE EXTENSION citext;

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

CREATE TABLE os 
  ( 
     id   SERIAL NOT NULL PRIMARY KEY, 
     name VARCHAR(100) 
  ); 

CREATE TABLE processor 
  ( 
     id   SERIAL PRIMARY KEY, 
     name VARCHAR(40) 
  ); 

CREATE TABLE brand 
  ( 
     id   SERIAL NOT NULL PRIMARY KEY, 
     name VARCHAR(100) 
  ); 

CREATE TABLE storage_type 
  ( 
     id   SERIAL NOT NULL PRIMARY KEY, 
     name VARCHAR(100) 
  ); 

CREATE TABLE laptops 
  ( 
     id              SERIAL NOT NULL PRIMARY KEY, 
     name            VARCHAR(300), 
     os_id           INT NOT NULL REFERENCES os(id), 
     processor_id    INT NOT NULL REFERENCES processor(id), 
     brand_id        INT NOT NULL REFERENCES brand(id), 
     img             VARCHAR(200), 
     ram             INT NOT NULL, 
     storage_type_id INT NOT NULL REFERENCES storage_type(id), 
     STORAGE         INT, 
     rating          DECIMAL(2, 1), 
     price           NUMERIC(7, 2), 
     img_big         VARCHAR(200), 
     description     TEXT[] 
  );

CREATE SCHEMA shard_1;
CREATE SEQUENCE shard_1.global_id_sequence;
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

CREATE TABLE orderline 
  ( 
     id          BIGINT PRIMARY KEY NOT NULL DEFAULT shard_1.id_generator(), 
     order_total NUMERIC(7, 2), 
     customer_id INTEGER NOT NULL REFERENCES customers(id), 
     date_added  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP 
  ); 

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

CREATE TABLE cart 
  ( 
     id               SERIAL PRIMARY KEY NOT NULL, 
     product_id       INTEGER NOT NULL REFERENCES laptops(id), 
     product_quantity INTEGER NOT NULL, 
     customer_id      INTEGER NOT NULL REFERENCES customers(id), 
     date_added       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP 
  ); 

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
  FROM   cart 
         JOIN customers 
           ON customers.id = cart.customer_id 
         JOIN laptops 
           ON laptops.id = cart.product_id 
         JOIN brand 
           ON laptops.brand_id = brand.id;

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
  FROM   cart 
         JOIN laptops 
           ON laptops.id = cart.product_id 
         JOIN brand 
           ON laptops.brand_id = brand.id;

ALTER TABLE laptops ALTER COLUMN ram type VARCHAR (3);

-- CREATE TABLE google_account 
--   ( 
--      customer_id INT NOT NULL PRIMARY KEY REFERENCES customers(id), 
--      google_id   VARCHAR (100) 
--   ); 

-- CREATE TABLE facebook_account 
--   ( 
--      customer_id INT NOT NULL PRIMARY KEY REFERENCES customers(id), 
--      google_id   VARCHAR (100) 
--   ); 

-- CREATE TABLE user_account 
--   ( 
--      customer_id INT NOT NULL PRIMARY KEY REFERENCES customers(id), 
--      password    VARCHAR(200) 
--   ); 