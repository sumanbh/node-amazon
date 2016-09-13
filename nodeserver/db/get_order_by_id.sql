select laptops.id as laptop_id, laptops.name as laptop_name, laptops.img, laptops.price, orderline.id, orderline.order_total, orderline.date_added, orderline.order_total, orderline.date_added, orders.quantity, orders.fullname, orders.address, orders.city, orders.state, orders.zip
from orders
join laptops on laptops.id = orders.product_id
join orderline on orderline.id = orders.orderline_id
where orderline.customer_id = $1
and orders.orderline_id = $2;