select laptops.id, laptops.name as laptop_name, laptops.rating, laptops.img, laptops.price, laptops.ram, laptops.storage, os.name as os_name, brand.name as brand_name, storage_type.name as storage_name from laptops
join brand on laptops.brand_id = brand.id
join os on laptops.os_id = os.id
join storage_type on laptops.storage_type_id = storage_type.id
where laptops.price <= ($1 + 150) AND laptops.price >= ($1 - 250)
AND laptops.id <> $2;
