'use strict'

// Application Dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');

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

  const client = new pg.Client(process.env.DATABASE_URL);
  client.connect();
  client.on('error', err => console.error(err));


// Set the view engine for server-side templating
app.set( 'view engine', 'ejs' );

// listen for requests
app.listen( PORT, () => console.log( 'Listening on port:', PORT ) );

// API Routes
app.get('/', (request, response) => {
  // test out your routes, perhaps ejs views or database stuff
  response.render('pages/index');
});

app.post('/', getLatLong, getWeather, getDistances)
// app.get('/')


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
};


function getLatLong(request, response) {

  let url= `https://maps.googleapis.com/maps/api/geocode/json?address=${request.body.search}&key=${process.env.GEOCODE_API_KEY}`;

  return superagent.get(url)
    .then( rawData => {
      request.body.formatted_address = rawData.body.results[0].formatted_address;
      request.body.lat = rawData.body.results[0].geometry.location.lat;
      request.body.long = rawData.body.results[0].geometry.location.lng;
      next();
    })
    .catch( error => console.log( error ) );

}

function getWeather( request, response, next ){

  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.body.lat},${request.body.long}`;

  return superagent.get(url)
    .then( rawData => {
      request.body.forecast = rawData.body.daily.data.map( day => {
        let newDay = {};
        newDay.time = day.time;
        newDay.summary = day.summary;
        newDay.icon = day.icon;
        newDay.moonPhase = day.moonPhase;
        return newDay;
      })
      console.log('hello from weather!', request.body);
      next();
    }).catch( error => console.log( error ) );
}


function createDistanceURL( request ){

  let SQL = 'SELECT * FROM dark_parks;';

  return client.query(SQL)
    .then( results => {
      if( results.rowCount === 0 ){
        console.log( 'no parks?' )
      } else {
        let url = '';
        results.rows.forEach( park => {
          // request.body.locationData.locationKey = id;
          if( url.length ){
            url += '|';
          }
          url += park.lat + ',' + park.long;
        });
        request.body.locationData.url = url;
        return request;
      }
    })
    .catch( error => console.log( error, 'Database query from createURL!' ) );
}

function getDistances( request, response ){
  createDistanceURL( request )
    .then( request => {
      let url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${request.body.lat},${request.body.long}&destinations=${request.body.locationData.url}&key=${process.env.GEOCODE_API_KEY}`;
      return superagent.get(url)
        .then( results => {
          console.log(destinations, results.body)
          response.send(results.body.rows[0].elements.map(element => element.distance.text))
        });
    })
    .catch( error => console.log( error, 'getDistances' ) );
}

