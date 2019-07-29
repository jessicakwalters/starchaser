'use strict'

// Application Dependencies
const express = require('express');
const pg = require('pg');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL)
client.connect();
client.on('err', err => console.log(err));


// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));
// Specify a directory for static resources
app.use(express.static('./public'));

// Database Setup: if you've got a good DATABASE_URL
if (process.env.DATABASE_URL) {
  const client = new pg.Client(process.env.DATABASE_URL);
  client.connect();
  client.on('error', err => console.error(err));
}

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// listen for requests
app.listen(PORT, () => console.log('Listening on port:', PORT));

// API Routes
app.get('/', (request, response) => {
  // test out your routes, perhaps ejs views or database stuff
  response.render('pages/index');
});

//Populate database table with dark_parks json data

function Park(parkData) {
  this.park_name = parkData.park_name;
  this.location_name = parkData.location_name;
  this.lat = parkData.lat;
  this.long = parkData.long;
  this.img_url = parkData.img_url;
  this.learn_more_url = parkData.learn_more_url;
  this.idsa_desig = parkData.idsa_desig;
}

app.get('/parks', (request, response) => {
  try {
    const parkData = require('./data/dark_parks.json');

    const newcrap = parkData.map(parkObj => {

      const park = new Park(parkObj);
      park.save();

    })

    response.send(newcrap);
  }
  catch (error) {
    response.status(400).send({'error': error});
  }
});

Park.prototype.save = function() {
  let SQL = `INSERT INTO dark_parks (park_name, location_name, lat, long, img_url, learn_more_url, idsa_desig) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;`;

  let values = [this.park_name, this.location_name, this.lat, this.long, this.img_url, this.learn_more_url, this.idsa_desig]

  return client.query(SQL, values);
}
