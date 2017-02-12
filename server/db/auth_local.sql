select customers.id, customers.given_name, customers.fullname, customers.address, customers.city, customers.state, customers.zip from customers
where customers.email = $1
AND customers.local = true
limit 1;