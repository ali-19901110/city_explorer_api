'use strict'
require('dotenv').config();// Load Environment Variables from the .env file

// Application Dependencies
const express = require('express') 
const superagent = require('superagent');
const cors = require('cors'); 

// Application Setup
// const port =process.env.PORT ; 
const PORT = process.env.PORT;
const app = express(); 
app.use(cors());
app.use(errorHandler);
function errorHandler(err, request, response, next) {
    response.status(500).send('something is wrong in server');
  }
// app.use('*', notFoundHandler); // 404 not found url

// GET https://eu1.locationiq.com/v1/search.php?key=YOUR_ACCESS_TOKEN&q=SEARCH_STRING&format=json

// let myLocalLocations =[];
function CityExpoler(search_query, formatted_query, latitude, longitude) {
    this.search_query = search_query,
    this.formatted_query = formatted_query,
    this.latitude = latitude,
    this.longitude = longitude
    // myLocalLocations.push(this);
}
// app.get('/location',getLocation);
app.get('/location',locationHandler);
// function getLocation(requst , response ){
// const loc = require('./data/location.json');
// const search_query = requst.query.city; 
// // console.log(loc[0]);
//     const formatted_query = loc[0].display_name;
//     const latitude = loc[0].lat;
//     const longitude = loc[0].lon;
//     let cityLocation = new CityExpoler(search_query, formatted_query, latitude, longitude);
//     response.send(cityLocation); 
// }
const myLocalLocations = {};
function locationHandler(request, response) {
    // causing an error by purpose to run the error handler
    // let x;
    // x.push("asd");
    let city = request.query.city;
    if (myLocalLocations[city]) {
        console.log("2.from my local data")
        response.send(myLocalLocations[city]);
      
      }else{
    console.log("request.query:", request.query)
    // instead of reading from .json file
    // we will be requesting data from another external API
    // if (myLocalLocations(url))
    // caching locally in a variable, to avoid some extra work
    console.log("1.from the location API")
      let key = process.env.YOUR_ACCESS_TOKEN;
    //   const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
      const url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
      superagent.get(url).then(res=> {
        // use response.body to get the response data itself
        console.log(res.body[0]);
        const formatted_query = res.body[0].display_name;
            const latitude = res.body[0].lat;
            const longitude = res.body[0].lon;
            let cityLocation = new CityExpoler(city, formatted_query, latitude, longitude);
            response.send(cityLocation); 
      
        // console.log(location); // give me the first object in array
        myLocalLocations[city] = cityLocation;
    
  
      });
    }
  }


function Weathercity(time, description) {
    this.time = time,
    this.description = description
}

// https://api.weatherbit.io/v2.0/forecast/daily?city=Raleigh,NC&key=API_KEY

app.get('/weather' , getWeather);
function getWeather (req , response){
    // const weth = require('./data/weather.json');
    // console.log(weth);
    // let city = req.query.city;
    const query =req.query.search_query;
    
    // console.log("1.from the wether API")
    // let key = process.env.API_KEY;
    // let key = process.env.GEOCODE_API_KEY;
    // // const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
    // const url =`https://api.weatherbit.io/v2.0/forecast/daily?city=${weth},NC&key=${key}` ;

    // const url= `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${location[0]}&lon=${location[1]}&key=${key}`
    // `https://api.weatherbit.io/v2.0/forecast/daily?city=${query}&country=US&key=${process.env.WEATHER_API_KEY}`
//    const url=`https://api.weatherbit.io/v2.0/forecast/daily?city=${weth}&country=US&key=${process.env.API_KEY}`
       const url =`https://api.weatherbit.io/v2.0/forecast/daily?city=${query}&country=US&key=${process.env.WEATHER_API_KEY}`
    superagent.get(url).then(res=> {
      // use response.body to get the response data itself
    //   console.log('doneeeeeeeeeeeeeeeee');
      console.log(res.body['data'][0]);
    //   const locationData = res.body[0];
    //   const weathernew = new Location(city, locationData);
    //   // console.log(location); // give me the first object in array
    //   myLocalLocations[city] = location;
    //   response.send(location);

    });
    // let array = [];
    // let data = weth.data;
    // data.forEach(((item) => {
        
    //     let weather = new Weathercity(item.datetime,item.weather.description);
    //     array.push({ 'time': item.datetime, 'forecast': item.weather.description })
    // }))
    // response.send(array);
}

// app.use('*', (requst, response) => {
//     let status = 404;
//     response.status(status).send({status:status , msg:'Not found'});
//   });


app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
// app.listen(PORT, ()=>{console.log('conected server .......')});