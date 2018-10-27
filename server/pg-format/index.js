/**
 * Taken from https://github.com/datalanche/node-pg-format/blob/master/lib/index.js
 * SSR build was failing if this package came from node_modules
 */

// reserved Postgres words
const reservedMap = {
  AES128: true,
  AES256: true,
  ALL: true,
  ALLOWOVERWRITE: true,
  ANALYSE: true,
  ANALYZE: true,
  AND: true,
  ANY: true,
  ARRAY: true,
  AS: true,
  ASC: true,
  AUTHORIZATION: true,
  BACKUP: true,
  BETWEEN: true,
  BINARY: true,
  BLANKSASNULL: true,
  BOTH: true,
  BYTEDICT: true,
  CASE: true,
  CAST: true,
  CHECK: true,
  COLLATE: true,
  COLUMN: true,
  CONSTRAINT: true,
  CREATE: true,
  CREDENTIALS: true,
  CROSS: true,
  CURRENT_DATE: true,
  CURRENT_TIME: true,
  CURRENT_TIMESTAMP: true,
  CURRENT_USER: true,
  CURRENT_USER_ID: true,
  DEFAULT: true,
  DEFERRABLE: true,
  DEFLATE: true,
  DEFRAG: true,
  DELTA: true,
  DELTA32K: true,
  DESC: true,
  DISABLE: true,
  DISTINCT: true,
  DO: true,
  ELSE: true,
  EMPTYASNULL: true,
  ENABLE: true,
  ENCODE: true,
  ENCRYPT: true,
  ENCRYPTION: true,
  END: true,
  EXCEPT: true,
  EXPLICIT: true,
  FALSE: true,
  FOR: true,
  FOREIGN: true,
  FREEZE: true,
  FROM: true,
  FULL: true,
  GLOBALDICT256: true,
  GLOBALDICT64K: true,
  GRANT: true,
  GROUP: true,
  GZIP: true,
  HAVING: true,
  IDENTITY: true,
  IGNORE: true,
  ILIKE: true,
  IN: true,
  INITIALLY: true,
  INNER: true,
  INTERSECT: true,
  INTO: true,
  IS: true,
  ISNULL: true,
  JOIN: true,
  LEADING: true,
  LEFT: true,
  LIKE: true,
  LIMIT: true,
  LOCALTIME: true,
  LOCALTIMESTAMP: true,
  LUN: true,
  LUNS: true,
  LZO: true,
  LZOP: true,
  MINUS: true,
  MOSTLY13: true,
  MOSTLY32: true,
  MOSTLY8: true,
  NATURAL: true,
  NEW: true,
  NOT: true,
  NOTNULL: true,
  NULL: true,
  NULLS: true,
  OFF: true,
  OFFLINE: true,
  OFFSET: true,
  OLD: true,
  ON: true,
  ONLY: true,
  OPEN: true,
  OR: true,
  ORDER: true,
  OUTER: true,
  OVERLAPS: true,
  PARALLEL: true,
  PARTITION: true,
  PERCENT: true,
  PLACING: true,
  PRIMARY: true,
  RAW: true,
  READRATIO: true,
  RECOVER: true,
  REFERENCES: true,
  REJECTLOG: true,
  RESORT: true,
  RESTORE: true,
  RIGHT: true,
  SELECT: true,
  SESSION_USER: true,
  SIMILAR: true,
  SOME: true,
  SYSDATE: true,
  SYSTEM: true,
  TABLE: true,
  TAG: true,
  TDES: true,
  TEXT255: true,
  TEXT32K: true,
  THEN: true,
  TO: true,
  TOP: true,
  TRAILING: true,
  TRUE: true,
  TRUNCATECOLUMNS: true,
  UNION: true,
  UNIQUE: true,
  USER: true,
  USING: true,
  VERBOSE: true,
  WALLET: true,
  WHEN: true,
  WHERE: true,
  WITH: true,
  WITHOUT: true,
};

const fmtPattern = {
  ident: 'I',
  literal: 'L',
  string: 's',
};

// convert to Postgres default ISO 8601 format
function formatDate(date) {
  date = date.replace('T', ' ');
  date = date.replace('Z', '+00');
  return date;
}

function isReserved(value) {
  if (reservedMap[value.toUpperCase()]) {
    return true;
  }
  return false;
}

function arrayToList(useSpace, array, formatter) {
  let sql = '';
  const temp = [];

  sql += useSpace ? ' (' : '(';
  for (let i = 0; i < array.length; i++) {
    sql += (i === 0 ? '' : ', ') + formatter(array[i]);
  }
  sql += ')';

  return sql;
}

// Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
function quoteIdent(value) {
  if (value === undefined || value === null) {
    throw new Error('SQL identifier cannot be null or undefined');
  } else if (value === false) {
    return '"f"';
  } else if (value === true) {
    return '"t"';
  } else if (value instanceof Date) {
    return `"${formatDate(value.toISOString())}"`;
  } else if (value instanceof Buffer) {
    throw new Error('SQL identifier cannot be a buffer');
  } else if (Array.isArray(value) === true) {
    const temp = [];
    for (var i = 0; i < value.length; i++) {
      if (Array.isArray(value[i]) === true) {
        throw new Error('Nested array to grouped list conversion is not supported for SQL identifier');
      } else {
        temp.push(quoteIdent(value[i]));
      }
    }
    return temp.toString();
  } else if (value === Object(value)) {
    throw new Error('SQL identifier cannot be an object');
  }

  const ident = value.toString().slice(0); // create copy

    // do not quote a valid, unquoted identifier
  if (/^[a-z_][a-z0-9_$]*$/.test(ident) === true && isReserved(ident) === false) {
    return ident;
  }

  let quoted = '"';

  for (var i = 0; i < ident.length; i++) {
    const c = ident[i];
    if (c === '"') {
      quoted += c + c;
    } else {
      quoted += c;
    }
  }

  quoted += '"';

  return quoted;
}

// Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
function quoteLiteral(value) {
  let literal = null;
  let explicitCast = null;

  if (value === undefined || value === null) {
    return 'NULL';
  } else if (value === false) {
    return "'f'";
  } else if (value === true) {
    return "'t'";
  } else if (value instanceof Date) {
    return `'${formatDate(value.toISOString())}'`;
  } else if (value instanceof Buffer) {
    return `E'\\\\x${value.toString('hex')}'`;
  } else if (Array.isArray(value) === true) {
    const temp = [];
    for (var i = 0; i < value.length; i++) {
      if (Array.isArray(value[i]) === true) {
        temp.push(arrayToList(i !== 0, value[i], quoteLiteral));
      } else {
        temp.push(quoteLiteral(value[i]));
      }
    }
    return temp.toString();
  } else if (value === Object(value)) {
    explicitCast = 'jsonb';
    literal = JSON.stringify(value);
  } else {
    literal = value.toString().slice(0); // create copy
  }

  let hasBackslash = false;
  let quoted = '\'';

  for (var i = 0; i < literal.length; i++) {
    const c = literal[i];
    if (c === '\'') {
      quoted += c + c;
    } else if (c === '\\') {
      quoted += c + c;
      hasBackslash = true;
    } else {
      quoted += c;
    }
  }

  quoted += '\'';

  if (hasBackslash === true) {
    quoted = `E${quoted}`;
  }

  if (explicitCast) {
    quoted += `::${explicitCast}`;
  }

  return quoted;
}

function quoteString(value) {
  if (value === undefined || value === null) {
    return '';
  } else if (value === false) {
    return 'f';
  } else if (value === true) {
    return 't';
  } else if (value instanceof Date) {
    return formatDate(value.toISOString());
  } else if (value instanceof Buffer) {
    return `\\x${value.toString('hex')}`;
  } else if (Array.isArray(value) === true) {
    const temp = [];
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== null && value[i] !== undefined) {
        if (Array.isArray(value[i]) === true) {
            temp.push(arrayToList(i !== 0, value[i], quoteString));
          } else {
            temp.push(quoteString(value[i]));
          }
      }
    }
    return temp.toString();
  } else if (value === Object(value)) {
    return JSON.stringify(value);
  }

  return value.toString().slice(0); // return copy
}

function config(cfg) {
    // default
  fmtPattern.ident = 'I';
  fmtPattern.literal = 'L';
  fmtPattern.string = 's';

  if (cfg && cfg.pattern) {
    if (cfg.pattern.ident) { fmtPattern.ident = cfg.pattern.ident; }
    if (cfg.pattern.literal) { fmtPattern.literal = cfg.pattern.literal; }
    if (cfg.pattern.string) { fmtPattern.string = cfg.pattern.string; }
  }
}

function formatWithArray(fmt, parameters) {
  let index = 0;
  const params = parameters;

  let re = '%(%|(\\d+\\$)?[';
  re += fmtPattern.ident;
  re += fmtPattern.literal;
  re += fmtPattern.string;
  re += '])';
  re = new RegExp(re, 'g');

  return fmt.replace(re, function (_, type) {
    if (type === '%') {
      return '%';
    }

    let position = index;
    const tokens = type.split('$');

    if (tokens.length > 1) {
      position = parseInt(tokens[0]) - 1;
      type = tokens[1];
    }

    if (position < 0) {
      throw new Error('specified argument 0 but arguments start at 1');
    } else if (position > params.length - 1) {
      throw new Error('too few arguments');
    }

    index = position + 1;

    if (type === fmtPattern.ident) {
      return quoteIdent(params[position]);
    } else if (type === fmtPattern.literal) {
      return quoteLiteral(params[position]);
    } else if (type === fmtPattern.string) {
      return quoteString(params[position]);
    }
  });
}

function format(fmt) {
  let args = Array.prototype.slice.call(arguments);
  args = args.slice(1); // first argument is fmt
  return formatWithArray(fmt, args);
}

module.exports = format;
