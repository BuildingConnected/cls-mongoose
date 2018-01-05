'use strict';

var cls = require('continuation-local-storage');
var clsns = cls.createNamespace('app');

var mongoose = require('mongoose');

var clsMongoose = require('./index.js');
clsMongoose(clsns);

var tap = require('tap');

var getMongooseVersion = function() {
    var fs = require('fs');
    var file = 'node_modules/mongoose/package.json';
    file = fs.readFileSync(file, 'utf8');
    var json = JSON.parse(file);
    var version = json.version;
    return(version);
};



tap.test("mongoose with cls", function (t) {
    
    var mongooseVersion = getMongooseVersion();
    console.log("testing mongoose version " + mongooseVersion);
    //connect mongoose to some mongo instance
    mongoose.Promise = Promise;
    var connectOptions = {};
    var majorMongooseVersion = mongooseVersion.split(".")[0];
    if (parseInt(majorMongooseVersion) < 5) {
        connectOptions = {useMongoClient: true}
    }
    var promise = mongoose.connect('mongodb://localhost/mongoose-cls-test', connectOptions);
    promise.then(function (db) {

        //define a mongoose Model
        var TestModel = mongoose.model('test_model', mongoose.Schema({value: String}));
        
        
        t.test("setTimeout - mongoose " + mongooseVersion, function(tt) {
            //initialise a cls, apply the cls-mongoose shim then .run() the rest of the test within it
            clsns.run(function() {
                clsns.set("nsvalue", "set");
    
                t.equals(clsns.get("nsvalue"), "set");
    
                setTimeout(function() {
                    //prove that the cls-stored value is available across setTimeout()
                    tt.equals(clsns.get("nsvalue"), "set");
    
                    tt.end();
                }, 500);
            });
        });
        
        t.test("find - mongoose " + mongooseVersion, function(tt) {
            clsns.run(function() {
                clsns.set("nsvalue", "set");
                TestModel.find({}, function (err, findResult) {
                    tt.equals(clsns.get("nsvalue"), "set");
                    tt.end();
                });
            });
        });
        
        t.test("update - mongoose " + mongooseVersion, function(tt) {
            clsns.run(function() {
                clsns.set("nsvalue", "set");
                TestModel.update( {"nonexistent_field": "nonexistent_value"}, {$set: {value: "modified entry"}}, {}, function(err, updateResult) {
                    tt.equals(clsns.get("nsvalue"), "set");
                    tt.end();
                });
            });
        });

        t.test("findOneAndUpdate - mongoose " + mongooseVersion, function(tt) {
            clsns.run(function() {
                clsns.set("nsvalue", "set");
                const testModel = new TestModel({'value': "nonexistent_value"});
                testModel.save(function (error, testModel) {
                    TestModel.findOneAndUpdate({'value': "nonexistent_value"}, {'value': "existent_value"}, {upsert: true,'new': true}, function (error, updatedValue) {
                        tt.equals(clsns.get("nsvalue"), "set");
                        tt.end();
                    });
                });
            });
        });

        t.test("distinct - mongoose " + mongooseVersion, function(tt) {
            clsns.run(function() {
                clsns.set("nsvalue", "set");
                TestModel.distinct('doesntExist', function (err, findResult) {
                    tt.equals(clsns.get("nsvalue"), "set");
                    tt.end();
                });
            });
        });
        
        t.test("count - mongoose " + mongooseVersion, function(tt) {
            clsns.run(function() {
                clsns.set("nsvalue", "set");
                TestModel.count({}, function (err, findResult) {
                    tt.equals(clsns.get("nsvalue"), "set");
                    tt.end();
                });
            });
        });

        t.test("aggregate - mongoose " + mongooseVersion, function(tt) {
            clsns.run(function() {
                clsns.set("nsvalue", "set");
                TestModel.aggregate({$match: {"nonexistent_field": "nonexistent_value"}})
                    .exec(function(err, aggregateResult) {
                        tt.equals(clsns.get("nsvalue"), "set");
                        tt.end();
                    }
                );
            });
        });
        t.end();
    });  //mongoose.connect()

});

tap.tearDown(function(){
    mongoose.disconnect();
});

