select sum(laptops.price * product_quantity)
from cart
join laptops on laptops.id = cart.product_id
where customer_id = $1
group by customer_id;