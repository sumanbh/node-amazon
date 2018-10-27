/**
 * Connection Pooling
 */

const { Pool } = require('pg');
const config = require('../config/amazon.json');

// Create pool with a max of 15 connections
const pool = new Pool(Object.assign({}, config.postgresql, { max: 15 }));

module.exports = pool;
