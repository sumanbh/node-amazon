import { Request, Response } from 'express';
import { db } from './connection';

const operatingSystems = {
  'Mac OS X': 1,
  'Chrome OS': 2,
  'Windows 10': 3,
  'Windows 8.1': 4,
  'Windows 7 Home': 5,
} as const;

const processors = {
  'Intel Core i7': 1,
  'Intel Core i5': 2,
  'Intel Core i3': 3,
  'Intel Core 2': 4,
  AMD: 5,
} as const;

const brands = {
  Apple: 1,
  Microsoft: 2,
  HP: 3,
  Dell: 4,
  Asus: 5,
  Acer: 6,
  Samsung: 7,
  Lenovo: 8,
  Toshiba: 9,
} as const;

const storageTypes = { SSD: 1, 'Hard Disk': 2 } as const;

function isImage(uri: string): boolean {
  try {
    const [cleanedUri] = uri.split('?');
    const parts = cleanedUri.split('.');
    const extension = parts[parts.length - 1]?.toLowerCase();
    const imageTypes = ['jpg', 'jpeg', 'tiff', 'png', 'gif', 'bmp'];
    if (imageTypes.indexOf(extension) === -1) {
      return false;
    }
    if (uri.startsWith('/')) {
      return true;
    }
    const parsed = new URL(uri);
    const allowedDomains = [
      'images-na.ssl-images-amazon.com',
      'media.amazonapi.com',
      'localhost',
      '127.0.0.1',
    ];
    return allowedDomains.some((domain) =>
      parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

interface LaptopInput {
  title?: string;
  description?: string[];
  image?: string;
  os?: string;
  processor?: string;
  storageType?: string;
  brand?: string;
  ram?: string;
  storage?: string;
  price?: string;
  rating?: string;
  limit?: unknown;
}

export async function newLaptop(req: Request, res: Response): Promise<void> {
  const laptop = req.body.laptop as LaptopInput | undefined;
  const validatedLaptop: {
    title?: string;
    description?: string[];
    image?: string;
    os?: string;
    processor?: string;
    storageType?: string;
    brand?: string;
    ram?: number | null;
    storage?: number | null;
    price?: number | null;
    rating?: number | null;
  } = {};
  const errors: string[] = [];

  if (laptop) {
    for (const key of Object.keys(laptop)) {
      switch (key) {
        case 'title': {
          if (laptop.title) validatedLaptop.title = laptop.title.trim();
          else errors.push('Laptop Name');
          break;
        }
        case 'description': {
          const description: string[] = [];
          if (Array.isArray(laptop.description)) {
            laptop.description.forEach((value: string) => {
              if (value.trim()) {
                description.push(value);
              }
            });
          }
          if (description.length > 0) {
            validatedLaptop.description = description;
          } else {
            errors.push('Laptop Description');
          }
          break;
        }
        case 'image': {
          if (laptop.image) {
            const isTrue = isImage(laptop.image.trim());
            if (isTrue) validatedLaptop.image = laptop.image.trim();
            else errors.push('Image URL');
          } else errors.push('Image URL');
          break;
        }
        case 'os': {
          if (laptop.os && laptop.os.trim() in operatingSystems) {
            validatedLaptop.os = laptop.os.trim();
          } else {
            errors.push('OS Name');
          }
          break;
        }
        case 'processor': {
          if (laptop.processor && laptop.processor in processors) {
            validatedLaptop.processor = laptop.processor;
          } else {
            errors.push('Processor');
          }
          break;
        }
        case 'storageType': {
          if (laptop.storageType && laptop.storageType in storageTypes) {
            validatedLaptop.storageType = laptop.storageType;
          } else {
            errors.push('Storage Type');
          }
          break;
        }
        case 'brand': {
          if (laptop.brand && laptop.brand in brands) {
            validatedLaptop.brand = laptop.brand;
          } else {
            errors.push('Brand Name');
          }
          break;
        }
        case 'ram': {
          const ram = parseInt(laptop.ram || '', 10) || null;
          if (ram) validatedLaptop.ram = ram;
          else errors.push('RAM');
          break;
        }
        case 'storage': {
          const storage = parseInt(laptop.storage || '', 10) || null;
          if (storage) validatedLaptop.storage = storage;
          else errors.push('Storage Size');
          break;
        }
        case 'price': {
          const price = parseFloat(laptop.price || '') || null;
          if (price) validatedLaptop.price = price;
          else errors.push('Price');
          break;
        }
        case 'rating': {
          const rating = parseFloat(laptop.rating || '') || null;
          if (rating && (rating <= 5 && rating >= 1)) validatedLaptop.rating = rating;
          else errors.push('Rating');
          break;
        }
        case 'limit': {
          /* do nothing */
          break;
        }
        default: {
          errors.push('Invalid entry sent');
        }
      }
    }

    if (errors.length === 0) {
      const { title, ram, storage } = validatedLaptop;
      if (title === undefined || ram === null || ram === undefined || storage === null || storage === undefined) {
        res.status(400).json({ success: false, errors: ['Required fields are missing.'] });
        return;
      }
      try {
        const insert = await db.insertInto('laptops')
          .values({
            id: undefined,
            name: title,
            os_id: operatingSystems[validatedLaptop.os as keyof typeof operatingSystems],
            processor_id: processors[validatedLaptop.processor as keyof typeof processors],
            brand_id: brands[validatedLaptop.brand as keyof typeof brands],
            img: validatedLaptop.image,
            ram: ram,
            storage_type_id: storageTypes[validatedLaptop.storageType as keyof typeof storageTypes],
            storage: storage,
            rating: String(validatedLaptop.rating),
            price: String(validatedLaptop.price),
            img_big: validatedLaptop.image,
            description: validatedLaptop.description,
            date_added: undefined,
          })
          .returning('id')
          .executeTakeFirstOrThrow();

        res.status(200).json({
          success: true,
          id: insert.id,
        });
      } catch {
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
}
