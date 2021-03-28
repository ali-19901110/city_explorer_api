'use strict'
const express = require('express') 
const cors = require('cors'); 
const app = express(); 
app.use(cors());
const port = 7000; 
app.listen( port , ()=>{console.log('conected server .......')});
function CityExpoler(search_query, formatted_query, latitude, longitude) {
    this.search_query = search_query,
    this.formatted_query = formatted_query,
    this.latitude = latitude,
    this.longitude = longitude
}
app.get('/location',getLocation);
function getLocation(requst , response ){
const loc = require('./data/location.json');
const search_query = requst.query.city; 
    const formatted_query = loc[0].display_name;
    const latitude = loc[0].lat;
    const longitude = loc[0].lon;
    let cityLocation = new CityExpoler(search_query, formatted_query, latitude, longitude);
    response.send(cityLocation); 
}
function Weathercity(time, description) {
    this.time = time,
    this.description = description
}
app.get('/weather' , getWeather);
function getWeather (requst , response){
    const weth = require('./data/weather.json');
    let array = [];
    let data = weth.data;
    data.forEach(((item) => {
        
        let weather = new Weathercity(item.datetime,item.weather.description);
        array.push({ 'time': item.datetime, 'forecast': item.weather.description })
    }))
    response.send(array);
}

app.use('*', (requst, response) => {
    let status = 404;
    response.status(status).send({status:status , msg:'Not found'});
  });