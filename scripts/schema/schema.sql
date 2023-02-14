CREATE DATABASE "node_amazon_dev";

CREATE EXTENSION citext;
CREATE EXTENSION pgcrypto;

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

CREATE TABLE os 
  ( 
     id   SERIAL PRIMARY KEY,
     name VARCHAR(100) 
  ); 

CREATE TABLE processor 
  ( 
     id   SERIAL PRIMARY KEY,
     name VARCHAR(40) 
  ); 

CREATE TABLE brand 
  ( 
     id   SERIAL PRIMARY KEY,
     name VARCHAR(100) 
  ); 

CREATE TABLE storage_type 
  ( 
     id   SERIAL PRIMARY KEY,
     name VARCHAR(100) 
  );

-- Create a trigger function that takes no arguments.
-- Trigger functions automatically have OLD, NEW records
-- and TG_TABLE_NAME as well as others.
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

CREATE TABLE laptops 
  ( 
     id              TEXT PRIMARY KEY, 
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
     date_added      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP 
  );

-- We name the trigger "trigger_laptops_genid" so that we can remove
-- or replace it later.
-- If an INSERT contains multiple RECORDs, each one will call
-- unique_short_id individually.
CREATE TRIGGER trigger_laptops_genid BEFORE INSERT ON laptops FOR EACH ROW EXECUTE PROCEDURE unique_short_id();

CREATE INDEX ON laptops ((lower(name)));
CREATE INDEX ON laptops (rating);
CREATE INDEX ON laptops (price);

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
     customer_id UUID REFERENCES customers(id), 
     date_added  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP 
  ); 

CREATE TABLE orders 
  ( 
     id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
     id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     product_id       INTEGER NOT NULL REFERENCES laptops(id), 
     product_quantity INTEGER NOT NULL, 
     customer_id      UUID REFERENCES customers(id), 
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

-- CREATE TABLE google_account 
--   ( 
--      customer_id UUID REFERENCES customers(id), 
--      google_id   VARCHAR (100) 
--   ); 

-- CREATE TABLE facebook_account 
--   ( 
--      customer_id UUID REFERENCES customers(id), 
--      google_id   VARCHAR (100) 
--   ); 

-- CREATE TABLE user_account 
--   ( 
--      customer_id UUID REFERENCES customers(id), 
--      password    VARCHAR(200) 
--   ); 