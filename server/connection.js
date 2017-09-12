// Connection pooling

const Pool = require('pg').Pool;
const config = require('../config/amazon.json');

const pool = new Pool(Object.assign({}, config.postgresql, { max: 15 }));

module.exports = pool;
