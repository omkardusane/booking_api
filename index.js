var express = require('express');
var app = express();
var path = require("path");


var ops_api = require('./api/v1_0/ops_api');
app.use('/api/v1/ops',ops_api);

var r_api = require('./api/v1_0/r_api');
app.use('/api/v1/r',r_api);

var droid_api = require('./api/v1_0/droid_api');
app.use('/api/v1/droid',droid_api);

var bookings_api = require('./api/v1_0/booking_api');
app.use('/api/v1/book',bookings_api);


app.get('/', function(req, res) {
    res.send('You are not invited here, Please Leave');
});

app.post('/maps/:place', function(req, res) {


    // res.send('You are not invited here, Please Leave')
 });


app.listen(3300,function(){
console.log("listening");
});

