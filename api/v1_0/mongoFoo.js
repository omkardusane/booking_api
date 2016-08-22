var express = require('express');
var app = express();

var mongov = require('mongodb');
var MongoClient = mongov.MongoClient;
var url = 'mongodb://localhost:27017/raitDB';
var assert = require('assert');

function mongoFoo() {

}

mongoFoo.prototype.Srr = "val";
// class methods

mongoFoo.prototype.accMongo = function(callback) {
MongoClient.connect(url, callback);
};

// export the class
module.exports = mongoFoo;