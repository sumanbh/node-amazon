import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, '../config/amazon.json');
const { postgresql } = JSON.parse(fs.readFileSync(configPath, 'utf8'));

function mapPostgresType(udtName: string, dataType: string): string {
  switch (dataType) {
    case 'integer':
    case 'smallint':
    case 'real':
    case 'double precision':
      return 'number';
    case 'numeric':
    case 'decimal':
    case 'bigint':
      return 'string | number';
    case 'boolean':
      return 'boolean';
    case 'timestamp with time zone':
    case 'timestamp without time zone':
    case 'date':
      return 'Date';
    case 'ARRAY':
      return 'string[]';
    default:
      if (udtName === '_text') return 'string[]';
      return 'string';
  }
}

function toPascalCase(str: string, isView: boolean): string {
  if (isView) {
    if (str === 'cartview') return 'CartView';
    if (str === 'checkoutview') return 'CheckoutView';
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
      .replace(/\s+/g, '')
      .replace(/_/g, '') + 'View';
  }
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/_/g, '') + 'Table';
}

export async function generateTypes() {
  const client = new Client({
    user: postgresql.user,
    password: postgresql.password,
    host: postgresql.host,
    port: postgresql.port,
    database: postgresql.database,
  });

  await client.connect();

  // 1. Get all tables and views
  const tablesRes = await client.query(`
    SELECT table_name, table_type 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);

  const tableTypesMap = new Map<string, string>();
  for (const row of tablesRes.rows) {
    tableTypesMap.set(row.table_name, row.table_type);
  }

  // 2. Get all columns
  const columnsRes = await client.query(`
    SELECT 
      table_name, 
      column_name, 
      data_type, 
      udt_name, 
      is_nullable, 
      column_default
    FROM 
      information_schema.columns 
    WHERE 
      table_schema = 'public' 
    ORDER BY 
      table_name, 
      ordinal_position;
  `);

  await client.end();

  interface ColumnRow {
    table_name: string;
    column_name: string;
    data_type: string;
    udt_name: string;
    is_nullable: string;
    column_default: string | null;
  }

  const tablesColumns: Record<string, ColumnRow[]> = {};
  for (const row of columnsRes.rows as ColumnRow[]) {
    if (!tablesColumns[row.table_name]) {
      tablesColumns[row.table_name] = [];
    }
    tablesColumns[row.table_name].push(row);
  }

  let fileContent = `// This file is auto-generated. Do not edit manually.

`;

  // Generate individual interfaces
  for (const tableName of Object.keys(tablesColumns)) {
    const isView = tableTypesMap.get(tableName) === 'VIEW';
    const interfaceName = toPascalCase(tableName, isView);

    fileContent += `export interface ${interfaceName} {\n`;

    for (const col of tablesColumns[tableName]) {
      const typeStr = mapPostgresType(col.udt_name, col.data_type);
      const isNullable = col.is_nullable === 'YES';
      const hasDefault = col.column_default !== null;

      // For views, we keep it simple since we only select from them
      if (isView) {
        const nullability = isNullable ? ' | null' : '';
        fileContent += `  ${col.column_name}: ${typeStr}${nullability};\n`;
      } else {
        // For tables, support optionality on inserts
        const isOptional = isNullable || hasDefault || col.column_name === 'id';
        const optionalModifier = isOptional ? '?' : '';
        const nullability = isNullable ? ' | null' : '';
        fileContent += `  ${col.column_name}${optionalModifier}: ${typeStr}${nullability};\n`;
      }
    }

    fileContent += `}\n\n`;
  }

  // Generate Database interface
  fileContent += `export interface Database {\n`;
  for (const tableName of tableTypesMap.keys()) {
    const isView = tableTypesMap.get(tableName) === 'VIEW';
    const interfaceName = toPascalCase(tableName, isView);
    fileContent += `  ${tableName}: ${interfaceName};\n`;
  }
  fileContent += `}\n`;

  const outputPath = path.resolve(__dirname, '../server/database.types.ts');
  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log(`Generated types successfully at ${outputPath}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateTypes().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
