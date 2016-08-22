
var mongoose = require('mongoose');
//var mrl = 'mongodb://54.254.170.207:27017/spise_sample';
var mrl = 'mongodb://127.0.0.1:27017/spise_sample';

var db ;
mongoose.connect(mrl);
db = mongoose.connection ;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    console.log('got db connection');
});
var counters = db.collection('seq_counts');
counters.count({},{'generalcount':1},function(err, result) {
    if(result == 0){
       counters.insert({'generalcount':1});
    }
});


function opsFoo(){
    console.log("glowing_ops");
};

opsFoo.prototype.ops_users = db.collection('ops_users');
opsFoo.prototype.deals = db.collection('deals');
opsFoo.prototype.r_users = db.collection('r_users');
opsFoo.prototype.r_Profiles = db.collection('r_profiles');
opsFoo.prototype.tables = db.collection('tables');
opsFoo.prototype.bookings = db.collection('bookings');
opsFoo.prototype.app_users = db.collection('app_users');
opsFoo.prototype.area_map = db.collection('area_map');
opsFoo.prototype.area = db.collection('area');
opsFoo.prototype.cat_map = db.collection('cat_map');
opsFoo.prototype.category = db.collection('category');
opsFoo.prototype.limitToSit = 130;

opsFoo.prototype.idMaker = function(){
  return new mongoose.Types.ObjectId();
};

opsFoo.prototype.dateConverter =  function(ddin){

    var firstSlash = ddin.indexOf('/') ;
    var nextSlash = ddin.lastIndexOf('/') ;

    var d1 = new Date();
    d1.setTime(1);
    d1.setHours(1);
    d1.setSeconds(1);
    d1.setMinutes(1);
    d1.setDate(Number(ddin.substring(0,0+firstSlash)));
    d1.setMonth(Number(ddin.substring(firstSlash+1,nextSlash)) - 1);
    d1.setYear(Number(ddin.substring(nextSlash+1,nextSlash+5)));

    return d1;
};
opsFoo.prototype.objectidmaker = function(t){
    var id = new mongoose.Types.ObjectId(t);
    console.log("mongoid :"+id);
    return id ;
};

opsFoo.prototype.seqIdMaker = function(next){
    counters.find({},{'generalcount':1}).toArray(
    function(err, result) {
        if(result.length == 0){
            counters.insert({'generalcount':0}
                ,function(err,doc){
                next( doc.generalcount) ;
            }
            );
        }
        else{
            var gc=  result[0].generalcount+1 ;
            counters.update(result[0],{$set:{'generalcount':(gc)}}
                ,function(err,dc){
                    next(gc) ;
                }
            );
        }
    });
    return new mongoose.Types.ObjectId();
};

opsFoo.prototype.gmapsKey = "AIzaSyAyfsvHh2aNvdKsXSAe5z1N1BkriUIY6B4";



module.exports = opsFoo ;
