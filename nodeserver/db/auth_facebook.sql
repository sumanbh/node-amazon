select * from customers
where customers.facebook_id = $1 OR customers.email = $2
limit 1;