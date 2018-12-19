require('dotenv').config();
const client = require('../lib/db-client');

client.query(`
  DROP TABLE IF EXISTS profile;
  DROP TABLE IF EXISTS artist;
`)
  .then(
    () => console.log('drop tables complete'),
    err => console.log(err)
  )
  .then(() => {
    client.end();
  });