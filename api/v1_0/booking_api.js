/**
 * Created by Omkar Dusane on 26-Feb-16.
 */

var express = require('express');
var router = express.Router();
var async = require('async');

var conn = require('./schema/ops');
var db = new conn();
var LIMITofSIT = db.limitToSit ;

var df =require('dateformat');
console.log(df("dd/mm/yyyy:hh:MM:s"));

/***************** Book Tables OR cancel ****************/
router.post('/confirm',function(req,res) {
  if(req.headers.hasOwnProperty('booking_id')){
        var bid = req.headers.booking_id ;
        db.bookings.update({_id:db.objectidmaker(bid),confirm:false}, {$set:{ confirm:true }}, function(err, results) {
          //console.log(results);
            if(!err)
            {
                res.json({status:"success"});
                console.log("in success")
            }
            else{
                res.json({status:"failure"});
            }
      });
  }
    else{
      res.json({status:"failure",message:"booking id missing in request"});
  }
});

router.post('/cancel',function(req,res) {
    if(req.headers.hasOwnProperty('booking_id')){
        var bid = req.headers.booking_id ;
        db.bookings.update({_id:db.objectidmaker(bid),confirm:true} , {$set:{ confirm:false }}, function(err, results) {
            console.log(results);
            if(!err)
            {
                res.json({status:"success"});
                console.log("in success")
            }
            else{
                res.json({status:"failure"});
            }
        });
    }
    else{
        res.json({status:"failure",message:"booking id missing in request"});
    }
});


router.post('/bookTable',function(req,res){
    /*
    params in bookings wala dbcollection :

    1. r_id
    2. uid
    3. number_of_people
    4. time_slot
    5. Date

    later 7. payment

    */

    var obj = {};

    obj.r_id = req.headers.r_id ;
    obj.number_of_people = req.headers.number_of_people ;
    obj.uid = req.headers.uid ;
    obj.time_slot = req.headers.time_slot ;
    obj.date = req.headers.booking_date ;
    obj.payment = 0;

    /* obj.r_id = 101;
     obj.number_of_people = 5;
     obj.uid = 201;
     obj.time_slot = "1900" ;
     obj.date = "17/07/2015";
     obj.payment = 0;
       */

    /*

     sample booking data =
     {
     table_id : 1102
     time slot : 1430
     date: 17/07/2015
     }
     sample open hours and up hours data
     {
     spise_hours : ["0900-1000","1500-1930"]
     up_hours : ["0900-1200","1500-2230"]
     }

     now before booking ,the table should be
     1. UnBooked at the date and time
     2. There should be Spise hours Or Up Hours ON ind if yes what are they.

      */

    // check if restraunt is open or not , and then
    var afterBooking = function(){console.log("hush ! long journey")};

    ifRestrOpen(obj,res); // has 5 nested functions in logic


});


function ifRestrOpen(obj,res){
    db.r_Profiles.findOne({_id: Number(obj.r_id)},{},function(rslt,doc){
        if(!doc ){
            console.log("problem");
            res.json({status:'failure',message:"no such restaurant"});
        }else{
            /*
             sample booking data =
             {
             r_id : 1102
             time slot : 1430
             date: 17/07/2015
             }
             sample open hours and up hours data
             {
             spise_hours : ["0900-1000","1500-1930"]
             up_hours : ["0900-1200","1500-2230"]
             }*/
            var resOpen = false ;
            obj.spiseHoursOn = false ;
            obj.up_hours = doc.up_hours ;
           // obj.spise_hours =
            console.log(doc.spise_hours[0]);
        //    obj.spise_hours = new Array( doc.spise_hours);
         //   console.log(obj.spise_hours);
            doc.spise_hours.forEach(function(j){
                var strt = Number(j.substring(0,4));
                var end = Number(j.substring(5,9));
                var toCheck = Number(obj.time_slot);
                if( (strt<=toCheck) && (end>=toCheck) ){
                    resOpen = true;
                    obj.spiseHoursOn = true ;
                    ifTableAvailableForDayAndThatTime(obj,res);
                }
            });
            if(!resOpen){
                doc.up_hours.forEach(function(j){
                    var strt = Number(j.substring(0,4));
                    var end = Number(j.substring(5,9));
                    var toCheck = Number(obj.time_slot);
                    if( (strt<=toCheck) && (end>=toCheck) ){
                        resOpen = true;
                        ifTableAvailableForDayAndThatTime(obj,res);
                    }
                    else{
                        // restraunt will be closed at given time of slot
                        // lets check for another timeslot if present there
                    }
                });
            }
            if(!resOpen){
                res.json({status:'failure',message:"restaurant is closed at requested time"});
            }

        }

    });
}

function ifTableAvailableForDayAndThatTime(obj,res){
    db.tables.find({r_id:obj.r_id},{_id:1}).toArray(function(rslt,docs){
        var arr = [];
        for(var t=0;t<docs.length;t++){
            arr[t]= Number(docs[t]._id) ;
        }
        console.log("Om here lokk ");
        console.log(arr);
       // console.log(" tdate "+db.dateConverter(obj.date) );
        db.bookings.find({table_id:{$in:arr},date:{$gte:db.dateConverter(obj.date),$lte:db.dateConverter(obj.date)},confirm:true}).toArray(function(rslt_2,docs_2){
            var arr2 = [];
            var diff = [];
            var mxl = 0 ;
            for(var t=0;t<docs_2.length;t++){
                arr2[t]= Number(docs_2[t].table_id) ;
            }
            console.log(arr2);
            if(arr2.length > arr.length){
                mxl = arr2.length;
                for(var t=0;t<mxl;t++) {
                    if(-1==arr.indexOf(arr2[t])){
                        var nxtInd =  diff.length ;
                        diff[nxtInd] = {table_id:arr2[t],avail_time:obj.time_slot} ;
                    }
                }
            }
            else{
                mxl = arr.length ;
                for(var t=0;t<mxl;t++) {
                    console.log(arr2.indexOf(arr[t]));
                    if(-1==arr2.indexOf(arr[t])){
                        var nxtInd =  diff.length ;
                        diff[nxtInd] = {table_id:arr[t],avail_time:obj.time_slot} ;
                    }
                }
            }
            console.log("array diff");
            console.log(diff);
            if(arr2.length==arr.length){
                // diffarray is still empty
                console.log(docs_2);
                checkIfTImeSlotAvailable(obj,docs_2,res);
            }
            else if(diff.length!=0){
             // atleast one table available for today
                obj.diffArr = diff ;
                console.log(" have the difference ");
                bookTable(obj,res);
            }
        });
    });
}


function bookTable(obj,res){
  var diffArr = obj.diffArr ;
    var selectedTable = diffArr[0];
  var booking_obj = {};
    booking_obj._id = db.idMaker();
    booking_obj.table_id = selectedTable.table_id ;
    booking_obj.uid = obj.uid ;
    booking_obj.time_slot = selectedTable.avail_time ;
    booking_obj.date = db.dateConverter(obj.date) ;
    //booking_obj.deal_id = ;
    booking_obj.number_of_people = obj.number_of_people ;
    booking_obj.confirm = false ;
    async.series([
        function(nx1){
        if(obj.spiseHoursOn){
            console.log("searching for deals");
            // there are deals
            db.deals.find({r_id:booking_obj.r_id,valid_till:{$gte: booking_obj.date},valid_from:{$lte: booking_obj.date} },
                {_id:1}).toArray(function(rsltErr,docsArray){
                    var arr =[];
                    docsArray.forEach(function(g){
                        arr[arr.length] = docsArray._id;
                    });
                    booking_obj.deal_id = arr ;
                    nx1();
                });
            }
        else{
                booking_obj.deal_id = [] ;
                nx1();
                // no deals
            }
        },
        function(nx2){
            db.bookings.insert(booking_obj,function(err,docs){
                res.json({status:"success",message:"table is available and partial booking is done, please confirm to complete booking"
                    ,booking_id:booking_obj._id,booking_obj:booking_obj});
                nx2();
            });
        }
    ]);
}

function checkIfTImeSlotAvailable(obj,allTables,res){
    var availableTablesOnTime= [] ;
    var nowChecking = [0,20,40,100,120,140,200] ;
    var i_now =0;
    while(i_now<nowChecking.length) {
        var reqTime = goofyAdd(Number(obj.time_slot) ,nowChecking[i_now]) ;

        obj.up_hours.forEach(function(j){
            var strt = Number(j.split('-')[0]);
            var end = Number(j.split('-')[1]);

            if( (strt<=reqTime) && (end>=reqTime) ){
                //console.log("____got one matchtime in the up time");
                allTables.forEach(function (h) {
                    var iskaTime = Number(h.time_slot);

                    if ( (goofyAdd( iskaTime , LIMITofSIT ) <= reqTime) || ( iskaTime >= goofyAdd(reqTime,LIMITofSIT) )) {
                      //  console.log("**** match in ");
                        var nxtIndex = availableTablesOnTime.length;
                        availableTablesOnTime[nxtIndex] = {table_id:h.table_id,avail_time:reqTime};
                    }
                });
            }
        });
        if(i_now==0){
            if(availableTablesOnTime.length !=0){
                obj.diffArr = availableTablesOnTime ;
                bookTable(obj,res);

                i_now = nowChecking.length +19;
            }
        }
        i_now++;
    }
    if(i_now < nowChecking.length +1) {
        obj.diffArr = availableTablesOnTime;
        suggestAnotherTimes(obj, availableTablesOnTime, res);
    }
}

function goofyAdd(a,b){
  var a1 = parseInt(a/100);
  var a2 = a%100;
  var b1 = parseInt(b/100);
  var b2 = b%100;

    var f1 = a1+b1;
    var f2 = b2+a2;
    if(f2>60){
        f1 = f1 + parseInt(f2/60);
    }
    f2 = f2%60;
    f1=f1*100;

    var f = f1+f2 ;
    return f;
}

function suggestAnotherTimes(obj,availableTablesOnTime,res){
    res.json({status:"failure",message:"No table available at the specific time",suggested_times:availableTablesOnTime});
}

// shut


/******************** sample ****************/


module.exports = router;