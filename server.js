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


// Set the view engine for server-side templating
app.set( 'view engine', 'ejs' );

// listen for requests
app.listen( PORT, () => {
  seedDatabase()
  console.log( 'Listening on port:', PORT ) });

// API Routes
app.get('/', (request, response) => {
  response.render('pages/index');
});

app.get('/results', (request, response) => {
  response.render('pages/results');
})

app.get('/about', (request, response) => {
  response.render('pages/about');
})

app.post('/', getLatLong, getDistances, addWeatherData)

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

// app.get('/parks', (request, response) => {
//   try {
//     const parkData = require('./data/dark_parks.json');

//     const newData = parkData.map(parkObj => {

//       const park = new Park(parkObj);
//       park.save();
//       return park;
//     })

//     response.send(newData);
//   }
//   catch (error) {
//     response.status(400).send({'error': error});
//   }
// });

Park.prototype.save = function() {
  let SQL = `INSERT INTO dark_parks (park_name, location_name, lat, long, img_url, learn_more_url, idsa_desig) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;`;

  let values = [this.park_name, this.location_name, this.lat, this.long, this.img_url, this.learn_more_url, this.idsa_desig]

  return client.query(SQL, values);
};


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

function fetchAllParks( request ){

  request.body.parkData = {};

  let SQL = 'SELECT * FROM dark_parks;';

  return client.query(SQL)
    .then( results => {
      if( results.rowCount === 0 ){
        console.log( 'no parks?' )
      } else {
        request.body.parkData.locations = results.rows.map( park => {
          let newPark = {};
          newPark.id = park.id;
          newPark.park_name = park.park_name;
          return newPark;
        });
        request.body.parkData.url = createURL( results.rows );
        return request;
      }
    }).catch( error => console.log( error, 'Database query from createURL!' ) );
}

function createURL( queriedArray ){
  return queriedArray.reduce( ( accumArr, park ) => {
    accumArr.push(`${park.lat},${park.long}`);
    return accumArr;
  }, []).join('|');
}

function getDistances( request, response, next ){
  fetchAllParks( request )
    .then( request => {
      let url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${request.body.lat},${request.body.long}&destinations=${request.body.parkData.url}&key=${process.env.GEOCODE_API_KEY}`;
      return superagent.get(url)
        .then( results => {
          results.body.rows[0].elements.forEach( (destination, index) => {
            if(destination.status === 'OK') {
              request.body.parkData.locations[index].distance = destination.distance.value;
            } else {
              request.body.parkData.locations[index].distance = destination.status;
            }
          })
          request.body.parkData.locations = request.body.parkData.locations.filter( destination => typeof(destination.distance) === 'number' );
          sortByDistance( request.body.parkData.locations );
          request.body.parkData.locations.splice(3);

          const promises = [];

          request.body.parkData.locations.forEach(location => {
            promises.push(fetchOnePark(location));
          });

          Promise.all(promises)
            .then( parkDetails => {
              request.body.parkData.locations = parkDetails;
              next();
            }).catch( err => console.log( err, 'getDistances-Promise.all') )
        }).catch( error => console.log( error, 'getDistances-createDistanceURL' ) );
    }).catch( error => console.log( error, 'getDistances' ) );
}

function sortByDistance( locations ){
  locations.sort( (a,b) => {
    return a.distance - b.distance;
  })
}

function fetchOnePark(park) {
  let SQL = `SELECT * FROM dark_parks WHERE id=${park.id};`;
  return client.query(SQL)
    .then( Result => {
      if ( Result.rowCount > 0 ){
        park.lat = Result.rows[0].lat;
        park.long = Result.rows[0].long;
        park.img_url = Result.rows[0].img_url;
        park.learn_more_url = Result.rows[0].learn_more_url;
        return park;
      }
    }).catch( error => console.log( error, 'fetchOnePark' ) );
}

function addWeatherData( request, response ){

  const promises = [];

  request.body.parkData.locations.forEach( location => {
    promises.push(getWeatherData(location));
  });

  Promise.all(promises)
    .then( forecasts => {
      request.body.parkData.locations.forEach( ( park, index ) => {
        park.forecasts = forecasts[index];
      });
      console.log(request.body.parkData.locations[0].forecasts);
      response.render('pages/results', {data: request.body});
    }).catch( err => console.log( err, 'getDistances-Promise.all') )

}

function getWeatherData( park ){

  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${park.lat},${park.long}`;

  return superagent.get(url)
    .then( rawData => {
      return rawData.body.daily.data.map( day => {
        let newDay = {};
        newDay.time = day.time;
        newDay.summary = day.summary;
        newDay.icon = day.icon;
        newDay.moonPhase = getPhaseName(day.moonPhase);
        newDay.outlook = getOutlook(newDay.moonPhase, newDay.icon);
        return newDay;
      });
    }).catch( error => console.log( error ) );
}

function getPhaseName(phase) {
  switch(true) {
  case (phase < .125):
    return 'new-moon';
  case (phase < .25):
    return 'waxing-crescent';
  case (phase < .375):
    return 'first-quarter';
  case (phase < .49):
    return 'waxing-gibbous';
  case (phase < .52):
    return 'full-moon';
  case (phase < .75):
    return 'waning-gibbous';
  case (phase < .875):
    return 'last-quarter';
  case (phase < .100):
    return 'waning-crescent';
  }
}

function seedDatabase () {
  let SQL = `SELECT * FROM dark_parks;`;

  client.query(SQL)
    .then(results => {
      if(results.rowCount === 0) {
        const parkData = require('./data/dark_parks.json');

        const newData = parkData.map(parkObj => {

          const park = new Park(parkObj);
          park.save();
          return park;
        });
      }
    }).catch( err => console.log( err, 'getDistances-Promise.all') )
}

function getOutlook (moonphase, weather) {

  let goodWeather = ['clear-day', 'clear-night'];
  let mehWeather = ['wind', 'partly-cloudy-day', 'partly-cloudy-night'];
  let notIdealWeather = ['rain', 'snow', 'sleet', 'cloudy', 'fog'];

  let crescentMoon = ['waxing-crescent', 'waning-crescent'];

  if ((goodWeather.includes(weather)) && (moonphase === 'new-moon')) {
    return 'ideal';
  }
  else if ((goodWeather.includes(weather)) && (moonphase !== 'new-moon')) {
    return 'go'
  }
  else if (mehWeather.includes(weather)) {
    return 'meh';
  }
  else if (notIdealWeather.includes(weather)) {
    return 'no-go';
  }
  else {
    return 'meh';
  }
}
