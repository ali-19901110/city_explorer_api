'use strict'
require('dotenv').config();// Load Environment Variables from the .env file

// Application Dependencies
const express = require('express') 
const cors = require('cors'); 
const superagent = require('superagent');
const pg = require('pg'); // add 
const { response } = require('express');

let lon ;
let lat;
const PORT = process.env.PORT;
const app = express(); 
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.log("PG PROBLEM!!!") );
app.use(cors());
app.use(errorHandler);
function errorHandler(err, request, response, next) {
    response.status(500).send('something is wrong in server');
  }


  app.get('/locations', (request, response)=> {
    let SQL = 'SELECT * FROM locations';
    client.query(SQL).then(result=> {
        console.log(result.rows);
        response.send(result.rows);
    });
});


function CityExpoler(search_query, formatted_query, latitude, longitude) {
    this.search_query = search_query,
    this.formatted_query = formatted_query,
    this.latitude = latitude,
    this.longitude = longitude
    // myLocalLocations.push(this);
}
// app.get('/location',getLocation);
// app.get('/',(requst,response)=>{
//   let SQL ='SELECT * FROM locations';
//   client.query(SQL).then((res)=>{
//     response.send(res.rows);
//   })
// })
app.get('/location',locationHandler);

const myLocalLocations = {};
function locationHandler(request, response) {  
    let city = request.query.city;
    let SQL = 'SELECT * FROM locations where search_query = $1';
    let key = process.env.YOUR_ACCESS_TOKEN;

    client.query(SQL, [city]).then(result=> {
      if(result.rowCount > 0){
        console.log(result.rows);
        response.send(result.rows[0]);
      }else{
      const url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
      superagent.get(url).then(res=> {
        // console.log(res.body[0]);
        const formatted_query = res.body[0].display_name;
        const latitude = res.body[0].lat;
        const longitude = res.body[0].lon;
           lat = res.body[0].lat;
           lon = res.body[0].lon;
           let SQL = 'INSERT INTO locations (search_query, formatted_query,latitude,longitude) VALUES($1, $2,$3,$4) RETURNING *';
           let values = [city, formatted_query,latitude,longitude];
            let cityLocation = new CityExpoler(city, formatted_query, latitude, longitude);
            client.query(SQL, values) 
            response.send(cityLocation);
                      // response.send(); 
      });

      }
   
  });
      
    
 
  }


  function Weather(item) {
    this.time = item.datetime,
    this.forecast = item.weather.description
}

app.get('/weather' , getWeather);
function getWeather (req , response){
    const query =req.query.city;
  
      const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${process.env.WEATHER_API_KEY}`;
    superagent.get(url).then(res=> {
      let curtWeather = [];
      // console.log(res.body.data);

    res.body.data.forEach(item => {
      curtWeather.push(new Weather(item));
        return curtWeather;
    })
    response.send(curtWeather);

    });
}


function Park(park) {
  this.name =park.fullName,
  this.park_url=park.url,
  this.fee='0',
  this.description=park.description
}
app.get('/parks', handelPark);

function handelPark(request, response) {
 
  const url = `https://developer.nps.gov/api/v1/parks?parkCode=la&limit=10&api_key=${process.env.park_API_KEY}`;
  superagent.get(url)
      .then(res => {
          let parks = [];
          res.body.data.map(item=>{
              parks.push(new Park(item))
              return parks;
          })
          response.send(parks)
      })
   
}


app.use('*', (requst, response) => {
    let status = 404;
    response.status(status).send({status:status , msg:'Not found'});
  });

//check is the database is connected
client.connect().then(()=> {
  console.log("connected yessssssssssssss");
  app.listen(process.env.PORT || 6009, ()=> console.log(`App is running on `));
});
