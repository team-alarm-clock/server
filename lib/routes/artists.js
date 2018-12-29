const express = require('express');
const client = require('../db-client');
const Router = express.Router;
const router = Router(); //eslint-disable-line new-cap

router
  .get('/', (req, res) => {
    // considering you already know the user (profile),
    // do you really need to return info from that table?
    client.query(`
      SELECT
        artist.id,
        artist.artist,
        album.album
      FROM artist 
      -- INNER JOIN is default JOIN
      JOIN album 
      ON album.artist_id = artist.id
      WHERE artist.profile_id = $1;
    `, [req.userId])
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
        const artistId = result.rows[0].id;

        return client.query(`
          INSERT INTO album(album, year, artist_id)
          VALUES ($1, $2, $3)
          RETURNING id;
        `, [body.title, body.year, artistId])
      })
      .then(result => {
        const albumId = result.rows[0].id;

        return client.query(`
          SELECT
            artist.id,
            artist.artist,
            artist.profile_id,
            album.album,
            album.year,
            album.artist_id
          FROM album
          JOIN artist
          ON album.artist_id = artist.id
          WHERE album.id = $1
        `, [albumId])
          .then(result => {
            res.json(result.rows[0]);
          });
      });
  })

  .delete('/:id', (req, res) => {
    // a bit more esoteric, but here is how to 
    // enforce ownership when profile id is another 
    // table!
    client.query(`
      DELETE from album  
      WHERE id = $1
      AND album.artist_id IN (
        SELECT id
        FROM artist
        WHERE profile_id = $2
      );
    `, [req.params.id, req.userId]).then(result => {
      res.json({ removed: result.rowCount === 1 });
    });
  });

module.exports = router;