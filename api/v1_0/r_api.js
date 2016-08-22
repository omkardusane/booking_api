/**
 * Created by Omkar Dusane on 25-Feb-16.
 */

var express = require('express');
var router = express.Router();
var async = require('async');

var conn = require('./schema/ops');
var db = new conn();

/************    SELECTIONS and PROJECTIONS    **********/

router.get('/getAreas',function(req,res){
    var f = {};
    f['area'] = 1;
    db.area.find({},f).toArray(function(err, docs) {
        res.json(docs);
    });
});

router.get('/getCategories',function(req,res){
    var f = {};
    f['category'] = 1;
    db.category.find({},f).toArray(function(err, docs) {
        res.json(docs);
    });
});

/***********  APPROVALS AND UPDATES **********/

// to attach a category with a restaurant
router.post('/attachCategories',function(req,res) {
   var key = 'r_id';
   var  item_catMap = [];
   if (req.headers.hasOwnProperty(key)) {
      var r_id = Number(req.headers[key]);
      key = 'categories';

      if (req.headers.hasOwnProperty(key)) {
          var multivals = JSON.parse(req.headers[key]);
          for (var y = 0; y < multivals.length; y++) {
              item_catMap[y] = {r_id: r_id, cat_id: multivals[y]};
          }
          console.log("did cat "+JSON.stringify(item_catMap));
          if(item_catMap.length==0){
              return ;
          }
          else{
              db.cat_map.insertMany(item_catMap).
                  then(function(result,docs){
                      var reslt ={};
                      if(result){
                          reslt.status ="success";
                          reslt.area ="added successfully : "+JSON.stringify(item_catMap);
                      }
                      else{
                          reslt.status ="problem";
                          reslt.area ="failed to add : "+JSON.stringify(item_catMap);
                      }
                      res.json(reslt);
                  });
          }
      }
      else {
          res.send("missing params : " + key);
      }
   } else{
      res.send("missing params : "+key);
   }



});

// to attach an area with a restaurant
router.post('/attachAreas',function(req,res) {
    var key = 'r_id';
    var  item_aMap = [];
    if (req.headers.hasOwnProperty(key)) {
        var r_id = Number(req.headers[key]);
        key = 'location_area';
        if (req.headers.hasOwnProperty(key)) {
            var multivals = JSON.parse(req.headers[key]);
            for (var y = 0; y < multivals.length; y++) {
                item_aMap[y] = {r_id: r_id, area_id: multivals[y]};
            }
            console.log("did area "+JSON.stringify(item_aMap));

            if(item_aMap.length==0){
                return ;
            }
            else{
                db.area_map.insertMany(item_aMap).
                    then(function(result,docs){
                        var reslt ={};
                        if(result){
                            reslt.status ="success";
                            reslt.area ="added successfully : "+JSON.stringify(item_aMap);
                        }
                        else{
                            reslt.status ="problem";
                            reslt.area ="failed to add : "+JSON.stringify(item_aMap);
                        }
                        res.json(reslt);
                    });
              }
        }
        else {
            res.send("missing params : " + key);
        }
    } else{
        res.send("missing params : "+key);
    }


});

/******************** sample ****************/
router.get('/',function(req,res){
    res.send("please go away");

});

module.exports = router;