const mongodb = require('mongodb')


var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://prateek:qwertyasdfgh@cluster1.8dcb9po.mongodb.net/?retryWrites=true&w=majority";

let _db;

const mongoConnect = callback => {
  MongoClient.connect(url)
    .then(client => {
      console.log("DB connected");
      _db=client.db('WA_messages');
      callback();
    })
    .catch(err => {
      console.log(err);
      throw(err);
    });
};

const getDB = () => {
    if (_db){
        return(_db);
    }
    throw 'NoDtabase found';
};

//module.exports = mongoConnect;
exports.mongoConnect = mongoConnect;
exports.getDB = getDB;