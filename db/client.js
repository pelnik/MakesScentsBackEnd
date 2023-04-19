const { Pool } = require('pg');

const connectionString =
  process.env.DATABASE_URL || 'https://localhost:5432/grace-dev';

console.log('connection up', connectionString);
console.log('NODE_ENV', process.env.NODE_ENV);

let client = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined,
  idleTimeoutMillis: 30000,
});

client.on('error', (e) => {
  console.error('Database error', e);
  client = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : undefined,
    idleTimeoutMillis: 30000,
  });
});

module.exports = client;
