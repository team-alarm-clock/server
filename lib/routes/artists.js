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
      .then(result => res.json(result.rows));
  })
  .post('/', (req, res) => {
    const body = req.body;
    client.query(`
    INSERT INTO artist(artist, profile_id)
    VALUES ($1, $2)
    RETURNING id;
    `, [body.artist, req.userId])
      .then(result => {
        const id = result.rows[0].id;
        client.query(`
          INSERT INTO album(album, rating, artist_id)
          VALUES ($1, $2, $3)
          RETURNING id;
      `, [body.album, body.rating, id])
          .then(result => {
            const id = result.rows[0].id;
            return client.query(`
            SELECT
            artist.id,
            artist.artist,
            artist.profile_id,
            album.album,
            album.rating,
            album.artist_id
            FROM album
            JOIN artist
            ON album.artist_id = artist.id
            WHERE album.id = $1
            `, [id])
              .then(result => {
                res.json(result.rows[0]);
              });
          });
      });
  })
  .delete('/:id', (req, res) => {
    client.query(`
    DELETE from album WHERE id = $1;
    `, [req.params.id]).then(result => {
      res.json({ removed: result.rowCount === 1 });
    });
  });
module.exports = router;