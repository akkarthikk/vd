const { Pool } = require('pg');

// Replace the connection string with your actual connection string
const connectionString = 'postgres://garchhjc:JdzJYigfGtXgxa4Jc0emxz_BtUKPOYPR@tiny.db.elephantsql.com/garchhjc';

const pool = new Pool({
    connectionString: connectionString,
});

module.exports = pool;
