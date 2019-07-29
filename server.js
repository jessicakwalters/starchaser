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
if ( process.env.DATABASE_URL ) {
  const client = new pg.Client( process.env.DATABASE_URL );
  client.connect();
  client.on('error', err => console.error( err ));
}

// Set the view engine for server-side templating
app.set( 'view engine', 'ejs' );

// listen for requests
app.listen( PORT, () => console.log( 'Listening on port:', PORT ) );

// API Routes
app.get('/', (request, response) => {
  response.render('pages/index');
});
app.post('/', getLatLong)
// app.get('/')

function getLatLong(request, response) {
  let url= `https://maps.googleapis.com/maps/api/geocode/json?address=${request.body.search}&key=${process.env.GEOCODE_API_KEY}`;

  return superagent.get(url)
    .then( rawData => {
      request.body.formatted_address = rawData.body.results[0].formatted_address;
      request.body.lat = rawData.body.results[0].geometry.location.lat;
      request.body.long = rawData.body.results[0].geometry.location.lng;
      // response.send(request.body);
      getWeather ( request, response );
    })
    .catch( error => console.log( error ) );

}

function getWeather( request, response ){

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
      response.send( request.body );
    }).catch( error => console.log( error ) );
}

// const location = new Location ( request.query.data , rawData );
// function Location( query, data ){

//   this.search_query = query;
//   this.formatted_address = data.body.results[0].formatted_address;
//   this.latitude = data.body.results[0].geometry.location.lat;
//   this.longitude = data.body.results[0].geometry.location.lng;

// }

// function getWeather( location, response ){
//   const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

// }