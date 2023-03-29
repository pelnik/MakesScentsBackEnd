const { Pool } = require('pg');

const connectionString =
  process.env.DATABASE_URL || 'postgresql://pelnik:v2_42bmT_kwGEGUQ8p2M3kKhkJrTX5G7@db.bit.io:5432/pelnik/grace-dev';

console.log('connection up', connectionString);

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
