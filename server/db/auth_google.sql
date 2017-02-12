select customers.id, customers.given_name, customers.fullname, customers.address, customers.city, customers.state, customers.zip from customers
where customers.google_id = $1 OR customers.email = $2
limit 1;