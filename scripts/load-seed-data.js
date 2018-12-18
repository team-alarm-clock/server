require('dotenv').config();
const client = require('../lib/db-client');
const bcrypt = require('bcryptjs');

client.query(`
  INSERT INTO profile (username, hash, first, last, email)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING id;
`,
['paigegorry', bcrypt.hashSync('password', 8), 'paige', 'gorry', 'yesihaveanemail@email.me']
)
  .then(
    () => console.log('seed data load complete'),
    err => console.log(err)
  )
  .then(() => {
    client.end();
  });