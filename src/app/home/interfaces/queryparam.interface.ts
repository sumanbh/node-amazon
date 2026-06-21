export interface QueryParam {
  keys: string[];
  params?: {
    brand?: string;
    os?: string;
    page?: string;
    price?: string;
    ram?: string;
    processor?: string;
    storage?: string;
    customprice?: string;
  };
}
