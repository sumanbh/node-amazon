select laptops.id, laptops.name as laptop_name, laptops.img, laptops.ram, laptops.storage, laptops.img_big, laptops.price, laptops.rating, laptops.description, os.name as os_name, brand.name as brand_name, storage_type.name as storage_name from laptops
join brand on laptops.brand_id = brand.id
join os on laptops.os_id = os.id
join storage_type on laptops.storage_type_id = storage_type.id
where laptops.id = $1;