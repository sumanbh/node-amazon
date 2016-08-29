SELECT laptops.id, laptops.img, laptops.price, laptops.rating, laptops.name FROM laptops
join brand on laptops.brand_id = brand.id
join os on laptops.os_id = os.id
join processor on laptops.processor_id = processor.id
join storage_type on laptops.storage_type_id = storage_type.id
WHERE ($1 = '' OR brand.name = ANY(STRING_TO_ARRAY($1, ',')))
AND ($2 = '' OR os.name = ANY(STRING_TO_ARRAY($2, ',')))
AND ($3 = '' OR laptops.ram = ANY(STRING_TO_ARRAY($3, ',')))
AND ($4 = '' OR processor.name = ANY(STRING_TO_ARRAY($4, ',')))
AND ($5 = '' OR storage_type.name = ANY(STRING_TO_ARRAY($5, ',')));