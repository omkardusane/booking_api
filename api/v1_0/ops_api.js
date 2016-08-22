/**
 * Created by Omkar Dusane on 25-Feb-16.
 */
var express = require('express');
var router = express.Router();
var async = require('async');

var conn = require('./schema/ops');
var db = new conn();
var df =require('dateformat');
//console.log(df("dd/mm/yyyy:hh:MM:s"));



// geocoding api
var geocoderProvider = 'google';
var httpAdapter = 'https';
var enableGeoCoding = true;
var extra = {
    apiKey: 'AIzaSyBhX2hq2RLjs3cnW7mtUiv4i0sd5f8UvqI', // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
};

var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);


/************    SELECTIONS and PROJECTIONS    **********/

router.get('/getRestaurantAdderForm',function(){
    // return all fields required their regex and multi valued fields and dropdowns
});

router.get('/getTables',function(){
 // for app user  params : restr_id
});

 /*************  MIDDLEWARE ***************/

var enableTokenAuth = false;
var tokenAuthRequired = function (req,res,next){
    if(!enableTokenAuth){
        next();
    }
    else {
        if (req.headers.hasOwnProperty("token")) {
            db.ops_users.findOne({token: req.headers.token}, {}, function (rslt, doc) {
                if (doc.hasOwnProperty("username")) {
                    next();
                }
                else {
                    res.json({status: "fail", message: "wrong token"});
                }
            });
        }
        else {
            res.json({status: "fail", message: "token absent"});
        }
    }
}



/***********   INSERTIONS     **********/
// to add a restraunt
router.post('/addR',tokenAuthRequired,function(req,res){
    db.seqIdMaker(function(newid) {
        var item ={_id:newid};
        var reslt = {"restaurant_id":newid};

        var paramsList = [
            'name'
            ,'contact'
            ,'descr'
            ,'spisetables'
            ,'totaltables'
            ,'min_spisetables'
            ,'email'
            ,'manager_name'
            ,'manager_mail'
            ,'manager_contact'
            ,'image_url'
            ,'logo_url'
            ,'long'
            ,'lat'
            ,'f_addr'
            ,'up_days'
            ,'generalcost'
        ];
        var refVals =[
             'categories'
            ,'location_area'
            ,'spise_hours'
            ,'up_hours'
        ];

        var item_catMap = [];
        var item_areaMap = [];

        var missing = "";
        for (var i =0;i<paramsList.length;i++){
            var key =  paramsList[i];
            if( req.headers.hasOwnProperty(key) ){
                item[key] = req.headers[key];
            }
            else{
                missing += " '"+key+"'";
            }
        }
            key = refVals[0];
            if(req.headers.hasOwnProperty(key)){
                var multivals = JSON.parse(req.headers[key]) ;
                for (var y=0;y<multivals.length;y++){
                    item_catMap[y] = {r_id:newid,cat_id:multivals[y]};
                }
                //console.log("did cat "+JSON.stringify(item_catMap));
            }
            else{
                missing += " '"+key+"'";
            }
            key = refVals[1];
            if(req.headers.hasOwnProperty(key)){
                var multivals = JSON.parse(req.headers[key]) ;

                for (var y=0;y<multivals.length;y++){
                    item_areaMap[y] ={r_id:newid,area_id:multivals[y]};
                }
                //console.log("did area"+JSON.stringify(item_areaMap));
            }else{
                 missing += " '"+key+"'";
            }

        key = refVals[2]; // ,'spise_hours'
        if(req.headers.hasOwnProperty(key)){
            var multivals = JSON.parse(req.headers[key]) ;
            item.spise_hours = multivals ;
            //console.log("did area"+JSON.stringify(item_areaMap));
        }else{
            missing += " '"+key+"'";
        }

        key = refVals[3]; // up_hours
        if(req.headers.hasOwnProperty(key)){
            var multivals = JSON.parse(req.headers[key]) ;
            item.up_hours =multivals;

            //console.log("did area"+JSON.stringify(item_areaMap));
        }else{
            missing += " '"+key+"'";
        }

        if (missing == ""){

                db.r_Profiles.insert(item,function(err,docs){
                if (!err) {

                var seq =
                    [
                        function(cb){ // cb means callback its useless in this case but to handle flow its there
                            if(item_areaMap.length==0){
                                cb();
                                return ;
                            }
                            else{
                            db.area_map.insertMany(item_areaMap).
                                then(function(result,docs){
                            if(result){
                               reslt.area ="added successfully : "+JSON.stringify(item_areaMap);
                            }
                            else{
                               reslt.area ="failed to add : "+JSON.stringify(item_areaMap);
                            }
                               cb();
                        })}}
                        ,
                        function(cb2){
                            if(item_catMap.length==0){
                               cb2();
                                return ;
                            }
                            else{
                                db.cat_map.insertMany(item_catMap).
                                    then(function(result,docs){
                            if(result){
                               reslt.categories ="added successfully : "+JSON.stringify(item_catMap);
                            }
                            else{
                               reslt.categories ="failed to add : "+JSON.stringify(item_catMap);
                            }
                               cb2();
                        })}}
                        ,
                        function(cb3){
                            res.statusCode = 201;
                            reslt.status ="success"
                            res.json(reslt );
                            cb3();
                        }
                    ];
                async.series(seq);
                }
                else{
                    console.log(err);
                    res.statusCode = 400;
                    res.send("error")
                }
            });
        }
        else{
            res.statusCode = 400;
            res.json({status:"fail",message:"Missing params : "+missing});
        }
});

});

//add catagory
router.post('/addCategory',tokenAuthRequired,function(req,res)
{
    db.seqIdMaker(function(newid) {
        var item ={_id:newid};
        var paramsList = [
            'category'
        ];

        var missing = "";
        for (var i =0;i<paramsList.length;i++){
            var key =  paramsList[i];
            if( req.headers.hasOwnProperty(key)){
                item[key] = req.headers[key];
            }
            else{
                missing += " '"+key+"'";
            }
        }
        if (missing == ""){

            db.category.insert(item,function(err,docs){
                if (!err) {
                    res.statusCode = 201;
                    res.json({status: 'success'});
                }
                else{
                    //      console.log(err);
                    res.statusCode = 400;
                    res.send("error")
                }
            });
        }
        else{
            res.statusCode = 400;
            res.send("Missing params : "+missing);
        }

    });
});

// add something new sample structure below to use
router.post('/add__________',function(req,res)
{
    db.seqIdMaker(function(newid) { // newid is unique and short


    });
});

// add area
router.post('/addArea',tokenAuthRequired,function(req,res)
{
    db.seqIdMaker(function(newid) {
        var item = {_id: newid};
        var paramsList = [
            'area'
        ];
        var missing = "";
        for (var i = 0; i < paramsList.length; i++) {
            var key = paramsList[i];
            if (req.headers.hasOwnProperty(key)) {
                item[key] = req.headers[key];

            }
            else {
                missing += " '" + key + "'";
            }
        }
        if (missing == "") {
            var seq = [
                function(cb){
                    if(enableGeoCoding){
                        geocoder.geocode(item.area, function(err, resd) {
                            resd = resd[0];
                            console.log(resd.longitude+" "+resd.latitude);
                            item.longitude=""+resd.longitude;
                            item.latitude=""+resd.latitude;
                            cb();
                        });} else{
                        cb();
                    } },
                function(){
                    db.area.insert(item, function (err, docs) {
                    if (!err) {
                        res.statusCode = 201;
                        res.json({status: 'success'});
                    }
                    else {
                        console.log(err);
                        res.statusCode = 400;
                        res.send("error")
                    }
                });}];
            async.series(seq);
        }
        else {
            res.statusCode = 400;
            res.send("Missing params : " + missing);
        }
    });
    });

// disable a deal
router.post('/DisableDeal',tokenAuthRequired,function(req,res)
{
    if(req.headers.hasOwnProperty('deal_id')){
        db.update({_id:req.headers.deal_id},{$set:{active:false}});
    }
});

router.post('/EnableDeal',tokenAuthRequired,function(req,res)
{

});

// adding Deal


router.post('/addDeal',tokenAuthRequired,function(req,res)
{
    db.seqIdMaker(function(newid) { // newid is unique and short
        var item ={_id:newid};
        var paramsList = [
            'name'
            ,'tagline'
            ,'discount_rate'
            ,'r_id'
            ,'valid_from'
            ,'valid_till'
        ];

        var missing = "";
        for (var i =0;i<paramsList.length;i++){
            var key =  paramsList[i];
            if( req.headers.hasOwnProperty(key)){
                item[key] = req.headers[key];
            }
            else{
                missing += " '"+key+"'";
            }
        }
        if (missing == ""){
            item.valid_from = db.dateConverter(item.valid_from);
            item.valid_till = db.dateConverter(item.valid_till);
            item.active= false ;
            if(new Date()>=item.valid_from){
                item.active = true ;
            }

            db.deals.insert(item,function(err,docs){
                if (!err) {
                    res.statusCode = 201;
                    res.json({status: 'success'});
                }
                else{
                    //      console.log(err);
                    res.statusCode = 400;
                    res.send("error")
                }
            });
        }
        else{
            res.statusCode = 400;
            res.send("Missing params : "+missing);
        }


    });
});

// adding table
router.post('/addTable',tokenAuthRequired,function(req,res)
{
    db.seqIdMaker(function(newid) { // newid is unique and short
        var item ={_id:newid};
        var paramsList = [
            'r_id'
            ,'table_number'
            ,'table_descr'
            ,'max_people'
        ];

        var missing = "";
        for (var i =0;i<paramsList.length;i++){
            var key =  paramsList[i];
            if( req.headers.hasOwnProperty(key)){
                item[key] = req.headers[key];
            }
            else{
                missing += " '"+key+"'";
            }
        }
        if (missing == ""){

            db.tables.insert(item,function(err,docs){
                if (!err) {
                    res.statusCode = 201;
                    res.json({status: 'success'});
                }
                else{
                    //      console.log(err);
                    res.statusCode = 400;
                    res.send("error")
                }
            });
        }
        else{
            res.statusCode = 400;
            res.send("Missing params : "+missing);
        }


    });
});

//login
router.post('/login',function(req,res){
    if (req.headers.hasOwnProperty("un") &&req.headers.hasOwnProperty("pw") ){
       db.ops_users.findOne({username :req.headers.un,password:req.headers.pw},{},function(rslt,doc){
            if(doc.hasOwnProperty("username")){
                var token = new ObjectID().toString();
                res.json({status:"success",message:"go ahead and login",token:token});
                db.ops_users.update(doc,{$set:{token:token}});
            }
           else{
                res.json({status:"fail",message:"wrong id and password parameters"});
            }
        });
    }
    else{
         res.json({status:"fail",message:"insufficient post parameters"});
    }
});

router.post('/logout',function(req,res){
    if (req.headers.hasOwnProperty("token") ){
        db.ops_users.findOneAndDelete({token:req.headers.token},{},function(rsltErr){
            if(!rsltErr){
                res.json({status:"success",message:"logout successfull"});
            }
            else{
                res.json({status:"fail",message:"wrong token parameters"});
            }
        });
    }
    else{
        res.json({status:"fail",message:"insufficient post parameters"});
    }
});

// see all restraunts


router.get('/getAllR',tokenAuthRequired,function(req,res){
    var f = {};
    var projections = [
        'name'
        ,'contact'
        ,'image_url'
        ,'long'
        ,'lat'
        ,'f_addr'
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


// sample
router.get('/',function(req,res){
  res.end('get away');
});


module.exports = router;