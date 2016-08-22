var express = require('express');
var router = express.Router();

var mongoFoo = require('./mongoFoo');
var mong = new mongoFoo();
var assert = require('assert');

router.get('/',function(req,res){
   res.send("in the api route 1");
});

var mongoose = require('mongoose');

// samples below
router.get('/a*',function(req,res) {
    var p = req.params;
    console.log(p);
    console.log("omkar in somefunct BEFORE// ");
    somefunct();
    console.log("omkar in somefunct AFTER// ");
    var jj = {"obj1":"customdata","pobj":p} ;
    res.json(jj);
});

function somefunct() {
    var i = 0;
    while (i < 90) {
    console.log("omkar in somefunct MIDDLE// ");
        i++;
   }

};

    router.get('/deep/:y',function(req,res){
    var p = req.params ;
    var yr = req.params.y ;
	mong.accMongo(
    function(err,db){

	db.collection('attend').find({"year":yr}).toArray(


	function(err, result) {
    assert.equal(err, null);
    //console.log(result);
    //var t = JSON.stringify(result);
    //var ii = JSON.parse(t);
    console.log( "look below");
     //console.log( result[req.params.ink].in);
     var ik = {"arr":result,"extra":p,"req obj":req.params};
	 res.json(ik);
     //res.app(p);
	 db.close();
	});


	}
   );
   
	
//    res.send("in the api route b wala "+JSON.stringify(p));

});

// mongoose example


/*
var mongoose = require('mongoose');
var mrl = 'mongodb://localhost:27017/raitDB';
mongoose.connect(mrl);
var db = mongoose.connection ;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    console.log('got dbconn');
});

*/

/*
var userSchema = mongoose.Schema({
    name: String,
    mobile:String
});

userSchema.methods.speak = function () {
    var greeting = this.name
        ? "neeea "+this.mobile+" : " + this.name
        : "I don't have a name";
    console.log(greeting+", end");
};

userSchema.methods.speak2 = function () {
    var greeting = this.name
        ? "neeea "+this.mobile+" : " + this.name
        : "I don't have a name";
    return greeting;
};

var user = mongoose.model('user',userSchema);


router.post('/a',function(req,res){

    user.find(function(err,users){
        console.log(users[0].speak2());
        res.send("are you kidding me?"
        + users[0].speak2() );
    });

});

*/
var theFoo = require('./schema/ops');
var foo = new theFoo();

router.post('/osam',function(req,res) {

    foo.ops.us.insert({name:"henry",mobile:"1111111"});
    res.send('yes')

});
router.post('/osam2',function(req,res) {

    foo.restraunts.us.insert({name:"kelly",mobile:"22222222222"});
    res.send('yes22')

});

router.post('/one/:n/:m',function(req,res){
    res.send("are you kidding me?");
   // var doc = new user({name:req.params.n,mobile:req.params.m});
  //  doc.speak();
  //  doc.save();
});

router.get('/',function(req,res){
    res.send("Get out of here");
});



module.exports = router;