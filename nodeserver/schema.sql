CREATE EXTENSION citext;

create table customers (
    id serial primary key not null,
    google_id varchar(100) not null,
    given_name varchar(70),
    fullname varchar(70),
    email citext UNIQUE,
    phone varchar(20),
    address varchar(32),
    city varchar(32),
    state char(2),
    zip char(5)
);

create table os (
    id serial not null primary key,
    name varchar(100)
);
create table processor (
    id serial primary key,
    name varchar(40)
);
create table brand(
    id serial not null primary key,
    name varchar(100)
);
create table storage_type(
    id serial not null primary key,
    name varchar(100)
);

create table laptops (
    id serial not null primary key,
    name VARCHAR(300),
    os_id int not null references os(id),
    processor_id int not null references processor(id),
    brand_id int not null references brand(id),
    img VARCHAR(200),
    ram int not null,
    storage_type_id int not null references storage_type(id),
    storage int,
    rating decimal(2,1),
    price numeric(7,2),
    img_big VARCHAR(200),
    description text[]
);

create table orderline (
    id varchar(20) primary key not null,
    order_total numeric(7,2),
    customer_id integer not null references customers(id),
    date_added timestamp with time zone default current_timestamp
);

create table orders (
    id serial primary key not null,
    orderline_id varchar(20) references orderline(id),
    product_id integer not null references laptops(id),
    quantity integer not null,
    address varchar(32),
    city varchar(32),
    state char(2),
    zip char(5)
);

create table cart (
    id serial primary key not null,
    product_id integer not null references laptops(id),
    product_quantity integer not null,
    customer_id integer not null references customers(id),
    date_added timestamp with time zone default current_timestamp
);


create view checkoutview AS
  SELECT cart.customer_id, customers.fullname, customers.address, customers.state, customers.zip, customers.phone,

    cart.product_quantity,

    laptops.id AS laptops_id,

    laptops.price,

    laptops.img,

    brand.name AS brand_name,

    laptops.name,

    cart.date_added

   FROM cart
   	 JOIN customers on customers.id = cart.customer_id

     JOIN laptops ON laptops.id = cart.product_id

     JOIN brand ON laptops.brand_id = brand.id;


create view cartview AS
  SELECT cart.customer_id,
  cart.id as unique_id,

    cart.product_quantity,

    laptops.id AS laptops_id,

    laptops.price,

    laptops.img,

    brand.name AS brand_name,

    laptops.name,

    cart.date_added

   FROM cart

     JOIN laptops ON laptops.id = cart.product_id

     JOIN brand ON laptops.brand_id = brand.id;


create view ordersview as
SELECT 
orders.quantity,

    orders.address,
    orders.city,
    orders.state,
    orders.zip,

    laptops.id AS laptops_id,

    laptops.price,

    laptops.img,

    brand.name AS brand_name,

    laptops.name

   FROM orders

     JOIN laptops ON laptops.id = orders.product_id

     JOIN brand ON laptops.brand_id = brand.id;