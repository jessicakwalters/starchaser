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

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));
// Specify a directory for static resources
app.use(express.static('./public'));

// Database Setup: if you've got a good DATABASE_URL
const client = new pg.Client( process.env.DATABASE_URL );
client.connect();
client.on('error', err => console.error( err ));

// Set the view engine for server-side templating
app.set( 'view engine', 'ejs' );

// listen for requests
app.listen( PORT, () => console.log( 'Listening on port:', PORT ) );

// API Routes
app.get('/', (request, response) => {
  response.render('pages/index');
});
app.post('/', getLatLong, getWeather, getDistances)
// app.get('/')

function getLatLong(request, response, next) {
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