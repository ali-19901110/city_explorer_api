'use strict'
require('dotenv').config();// Load Environment Variables from the .env file

// Application Dependencies
const express = require('express') 
const cors = require('cors'); 
const superagent = require('superagent');
const pg = require('pg'); // add 
// const { response } = require('express');
const PORT = process.env.PORT;
const app = express(); 
const client = new pg.Client(process.env.DATABASE_URL);
// client.on('error', err => console.log("PG PROBLEM!!!") );
app.use(cors());
app.use(errorHandler);
function errorHandler(err, request, response, next) {
    response.status(500).send('something is wrong in server');
  }
  let lon="" ;
  let lat="";
  let locationv="";

//   app.get('/locations', (request, response)=> {
//     let SQL = 'SELECT * FROM locations';
//     client.query(SQL).then(result=> {
//         console.log(result.rows);
//         response.send(result.rows);
//     });
// });


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
    locationv = city;
    let SQL = 'SELECT * FROM locations where search_query = $1';
    let key = process.env.YOUR_ACCESS_TOKEN;

    client.query(SQL, [city]).then(result=> {
      if(result.rowCount > 0){
        console.log(result.rows);
        lat = result.rows[0].latitude;
        lon = result.rows[0].longitude;
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
    // const query =req.query.city;
    console.log("tesssssssssssst");
      // const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${process.env.WEATHER_API_KEY}`;
     const url = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}&key=${process.env.WEATHER_API_KEY}`
    superagent.get(url).then(res=> {
      // let curtWeather = [];
      // console.log(res.body);

   response.send(res.body.data.map(item => 
    
    new Weather(item)
      // return curtWeather;
  )) 
    // response.send(newweather);

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


app.get('/movies',handalmovie)
function handalmovie(req, res) {
  let key = process.env.MOVIE_API_KEY;
  let city = req.query.search_query;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${city}`;
  superagent.get(url).then(result => {
      res.send(result.body.results);
  })
}

let flag =0;
let testarr=[]
app.get('/yelp', handelyelp);

function handelyelp(request, response) {
  // console.log(`moveeeeeeeeeeeeees = ${locationv}`);
  let url = `https://api.yelp.com/v3/businesses/search?categories=restaurants&limit=20&latitude=${lat}&longitude=${lon}`;
  superagent.get(url)
  .set('Authorization', 'Bearer j7f_GkVTy4ukGINLVe3Kb_NH-LVNjE3kzTDyGHersSMutFqUMlH3oTMjAYuX5uICbT738zJjLLczs2kth-M2AlDfblZLtzIw8JjsQ1z1ORiVBuMXLN1liD_wtJVkYHYx')
  .then(result => {
    console.log(typeof result.body.businesses)
    const allDres = result.body.businesses;
       response.send(allDres);
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
