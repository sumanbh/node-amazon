select customers.password from customers
where customers.email = $1
AND customers.local = true
limit 1;