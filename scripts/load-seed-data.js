require('dotenv').config();
const client = require('../lib/db-client');
const bcrypt = require('bcryptjs');

const artists = [
  { artist: 'Ariana Grande', profile_id: 1 },
  { artist: 'Muse', profile_id: 1 }
];

const albums = [
  { album: 'dangerous woman', artist_id: 1 },
  { album: 'sweetener', artist_id: 1 },
  { album: 'drones', artist_id: 2 }
];


client.query(`
    INSERT INTO profile (username, hash, first, last, email)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id;
  `,
['paigegorry', bcrypt.hashSync('password', 8), 'paige', 'gorry', 'yesihaveanemail@email.me'])
  .then(() => {
    return Promise.all(
      artists.map(artist => {
        return client.query(`
            INSERT INTO artist(artist, profile_id)
            VALUES($1, $2) 
        `,
        [artist.artist, artist.profile_id]);
      })
    );
  })  
  .then(() => {
    return Promise.all(
      albums.map(album =>{
        return client.query(`
                INSERT INTO album(album, artist_id)
                VALUES ($1, $2)
              `, [album.album, album.artist_id]);
      })
    );
  })
  .then(
    () => console.log('seed data load complete'),
    err => console.log(err)
  )
  .then(() => {
    client.end();
  });