const Pool = require('pg').Pool;
const config = require('../config/amazon.json');

const pool = new Pool(Object.assign({}, config.postgresql, { max: 5 }));

// Just for demo purpose. You should not be hard-coding IDs here
const operatingSystems = { 'Mac OS X': 1, 'Chrome OS': 2, 'Windows 10': 3, 'Windows 8.1': 4, 'Windows 7 Home': 5 };
const processors = { 'Intel Core i7': 1, 'Intel Core i5': 2, 'Intel Core i3': 3, 'Intel Core 2': 4, AMD: 5 };
const brands = { Apple: 1, Microsoft: 2, HP: 3, Dell: 4, Asus: 5, Acer: 6, Samsung: 7, Lenovo: 8, Toshiba: 9 };
const storageTypes = { SSD: 1, 'Hard Disk': 2 };

function isImage(uri) {
    // remove params
    uri = uri.split('?')[0];
    const parts = uri.split('.');
    const extension = parts[parts.length - 1];
    const imageTypes = ['jpg', 'jpeg', 'tiff', 'png', 'gif', 'bmp'];
    if (imageTypes.indexOf(extension) !== -1) {
        return true;
    }
    return false;
}

const routes = {
    newLaptop: async (req, res) => {
        const laptop = req.body.laptop;
        const result = {};
        const errors = [];
        if (laptop) {
            const keys = Object.keys(laptop);
            for (let idx = 0; idx < keys.length; idx += 1) {
                switch (keys[idx]) {
                    case 'title': {
                        if (laptop.title) result.title = laptop.title.trim();
                        else errors.push('Laptop Name');
                        break;
                    }
                    case 'description': {
                        const description = [];
                        laptop.description.forEach((value) => {
                            if (value.trim()) {
                                description.push(value);
                            }
                        });
                        if (description.length > 0) {
                            result.description = description;
                        } else {
                            errors.push('Laptop Description');
                        }
                        break;
                    }
                    case 'image': {
                        if (laptop.image) {
                            const isTrue = isImage(laptop.image.trim());
                            if (isTrue) result.image = laptop.image.trim();
                            else errors.push('Image URL');
                        } else errors.push('Image URL');
                        break;
                    }
                    case 'os': {
                        if (laptop.os) result.os = laptop.os.trim();
                        else errors.push('OS Name');
                        break;
                    }
                    case 'processor': {
                        if (laptop.processor) result.processor = laptop.processor;
                        else errors.push('Processor');
                        break;
                    }
                    case 'storageType': {
                        if (laptop.storageType) result.storageType = laptop.storageType;
                        else errors.push('Storage Type');
                        break;
                    }
                    case 'brand': {
                        if (laptop.brand) result.brand = laptop.brand;
                        else errors.push('Brand Name');
                        break;
                    }
                    case 'ram': {
                        const ram = parseInt(laptop.ram, 10) || null;
                        if (ram) result.ram = ram;
                        else errors.push('RAM');
                        break;
                    }
                    case 'storage': {
                        const storage = parseInt(laptop.storage, 10) || null;
                        if (storage) result.storage = storage;
                        else errors.push('Storage Size');
                        break;
                    }
                    case 'price': {
                        const price = parseFloat(laptop.price) || null;
                        if (price) result.price = price;
                        else errors.push('Price');
                        break;
                    }
                    case 'rating': {
                        const rating = parseFloat(laptop.rating) || null;
                        if (rating && (rating <= 5 && rating >= 1)) result.rating = rating;
                        else errors.push('Rating');
                        break;
                    }
                    case 'limit': {
                        /* do nothing */
                        break;
                    }
                    default: {
                        errors.push('Inavlid entry sent');
                    }
                }
            }
            if (errors.length === 0) {
                const query = `INSERT INTO laptops (name, os_id, processor_id, brand_id, img, ram, storage_type_id, storage, rating, price, img_big, description)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id;`;
                try {
                    const insert = await pool.query(query, [result.title, operatingSystems[result.os], processors[result.processor], brands[result.brand], result.image, result.ram, storageTypes[result.storageType], result.storage, result.rating, result.price, result.image, result.description]); // eslint-disable-line
                    res.status(200).json({
                        success: true,
                        id: insert.rows[0].id,
                    });
                } catch (err) {
                    errors.push('Internal Server Error');
                    res.status(500).json({
                        success: false,
                        errors,
                    });
                }
            } else {
                res.status(400).json({
                    success: false,
                    errors,
                });
            }
        } else {
            errors.push('Invalid data sent by the client');
            res.status(400).json({
                success: false,
                errors,
            });
        }
    },
};

module.exports = routes;
