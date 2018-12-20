const express = require('express');
const client = require('../db-client');
const Router = express.Router;
const router = Router(); //eslint-disable-line new-cap

router
  .get('/', (req, res) => {
    client.query(`
      SELECT
        profile.id,
        profile.username,
        artist.artist,
        album.album
      FROM 
        profile
      INNER JOIN artist ON artist.profile_id = profile.id
      INNER JOIN album ON album.artist_id = artist.id
    `)
      .then(result => res.json(result.rows[0]));
  });

module.exports = router;