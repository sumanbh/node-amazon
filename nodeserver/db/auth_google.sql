select * from customers
where customers.google_id = $1 OR customers.email = $2
limit 1;