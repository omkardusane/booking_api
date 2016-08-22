/**
 * Created by Omkar Dusane on 26-Feb-16.
 */

var express = require('express');
var router = express.Router();
var async = require('async');
var df = require('dateformat');

var conn = require('./schema/ops');
var db = new conn();

// bookings

router.get('/getAllMyBookings/:uid',function(req,res) {
    db.bookings.find({uid:req.params.uid},{}).toArray(function(eq,docsArr){
        res.json(docsArr);
    })
});

/***************** SEARCH RESTRAUNTS AND SELECT ****************/

router.get('/getOneR/:id',function(req,res) {
    var id = req.params.id;
    var f = {};
    var projections = [
        'name'
        , 'contact'
        , 'descr'
        , 'email'
        , 'image_url'
        , 'logo_url'
        , 'long'
        , 'lat'
        , 'f_addr'
        , 'spise_hours'
        , 'up_hours'
        , 'up_days'
        , 'generalcost'
    ];

    //    'categories'

    projections.forEach(function (inst) {
        f[inst] = 1;
    });
    db.r_Profiles.findOne({_id: Number(id)}, f, function (rslt, doc) {
        var jsonResp = doc;
        async.series([
            function (nx1) {
                db.deals.find({r_id: id,active:true,valid_till:{$gte: new Date()}} ).toArray(
                    function (rslt2, docsArray) {
                        console.log(docsArray);
                        jsonResp.deals = docsArray;
                        nx1();
                    });
            },
            function (nx2) {
                db.area_map.find({r_id: Number(id)}, {_id: 0, area_id: 1}).toArray(
                    function (rslt2, docsArray) {
                        console.log(docsArray);
                        var arr = [];
                        for (var t = 0; t < docsArray.length; t++) {
                            arr[t] = Number(docsArray[t].area_id);
                        }
                        db.area.find({_id: {$in: arr}}, {}).toArray(function (a, b) {
                            jsonResp.areas = b;
                            nx2();
                        });
                    });
            },
            function (nx3) {
                db.cat_map.find({r_id: Number(id)}, {_id: 0, cat_id: 1}).toArray(
                    function (rslt2, docsArray) {
                        console.log(docsArray);
                        var arr = [];
                        for (var t = 0; t < docsArray.length; t++) {
                            arr[t] = Number(docsArray[t].cat_id);
                        }
                        db.category.find({_id: {$in: arr}}, {}).toArray(function (a, b) {
                            jsonResp.categories = b;
                            res.json(jsonResp);
                            nx3();
                        });
                    });
            }
        ]);

    });
});



router.get('/getAllR',function(req,res){
    var f = {};
    var projections = [
        'name'
        ,'contact'
        ,'image_url'
        ,'logo_url'
        ,'long'
        ,'lat'
        ,'f_addr'
        ,'generalcost'
    ];

    //    'categories'
    //   ,'location_area'

    projections.forEach(function(inst){
        f[inst] = 1;
    });


    db.r_Profiles.find({},f).toArray(function(err, docs) {
        res.json(docs);
    });
});


/******************** sample ****************/
router.get('/',function(req,res){
    res.send("please go away from droid api");

});


module.exports = router;