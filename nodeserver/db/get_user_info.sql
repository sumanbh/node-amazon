select customers.given_name, customers.fullname, customers.address, customers.city, customers.state, customers.zip, customers.phone, customers.date_added from customers
where customers.id = $1
limit 1;