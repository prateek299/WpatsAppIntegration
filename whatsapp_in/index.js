const express=require("express")
const body_parser=require("body-parser")
const axios=require("axios")
const mongoose=require('mongoose');
const multer = require('multer');
const mongoConnect = require('./database').mongoConnect;
const getDB = require('./database').getDB;

const fs = require('fs');
const util = require('util');
const log_file = fs.createWriteStream(__dirname + '/log/debug.log', {flags : 'w'});
const log_stdout = process.stdout;

const app=express().use(body_parser.json())
const port = 3000;
const sentCollectionName = "sentMessages";
const rcvdCollectionName  = "messages"
const verify_token="token";

//Overloaded console.log to log into a file
//Log  to file, for debugging comment this function
console.log = function(d) {

  log_file.write(Date.now() + " --- " + util.format(d) + '\n');
//  log_stdout.write(Date.now() + " --- " + util.format(d) + '\n');                     // COMMENT/UNCOMMENT this line to hide/see logs on the console

};

//used in multer to upload teh file from client to this server
const fileStorage = multer.diskStorage({
        destination: (req, file, callback)=>{
                callback(null,'./uploads');
        },
        filename: (req, file, callback)=>{
                callback(null,Date.now() +"_"+  file.originalname);
        },
})

//used in multer to upload teh file from client to this server
const upload = multer({storage: fileStorage})

//message schema
const DocSentSchema = new mongoose.Schema({
    messaging_product: {
        type: String,
        required: true
    },
    display_phone_number: {
        type: String,
        required: true
    },
    phone_number_id: {
        type: String,
        required: true
    },
    wa_mid: {
        type: String,
        required: true
    },
    message_text:{
        type: String,
        required: false
    },
    to: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        required: true
    },
    media_id:{
        type: String,
        required: false,
        default:""
    },
    filename:{
        type: String,
        required: false,
        default:""
    },
    status:{
      type: String,
      required:true
    }
  });


//message schema
const MsgSchema = new mongoose.Schema({
    object:{
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    messaging_product: {
        type: String,
        required: true
    },
    display_phone_number: {
        type: String,
        required: true
    },
    phone_number_id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    wa_id: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    timestamp: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    field: {
        type: String,
        required: true
    }
  });

//Connect to Database DB and connection stringf defined in database.js
mongoConnect(() =>{

  app.listen(port,function(req,res){
    console.log("listening on port " + port);
  });

});

//Used for subcription wiht Whats App cloud API
app.get("/webhook",function(req,res){

  //console.log("in webhook verify");
  let mode=req.query["hub.mode"];
  let challenge=req.query["hub.challenge"];
  let token=req.query["hub.verify_token"];

  if(mode=="subscribe" && token==verify_token){
    res.status(200).send(challenge);
  }
  else{
    res.status(403);
  }
});

//Used fro text messages, will not be used, CAN BE DELETED
app.post("/v2.0",function(req,res){
  let body_param=req.body;
  // console.log(JSON.stringify(body_param,null,2));

  if(body_param.phone_number_id &&
      body_param.to &&
      body_param.access_token
      ){
        let phone_number_id=body_param.phone_number_id;
        let to_phone_number=body_param.to;
        let text_message=body_param.text_message;
        let access_token=body_param.access_token;
        var data = JSON.stringify({
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to":to_phone_number,
            "type": "text",
            "text": {
              "preview_url": false,
              "body": text_message
            }
        });

        var config = {
          method: 'post',
          url: 'https://graph.facebook.com/v14.0/' + phone_number_id +'/messages',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token
          },
          data : data
        };

        axios(config)
        .then((response)=> {
            //console.log(JSON.stringify(response.data));

            if(response.data){
                //store message into the database

              const dataToSave={
                  messaging_product : "whatsapp",
                  display_phone_number : to_phone_number,
                  phone_number_id : phone_number_id,
                  wa_mid : response.data.messages[0].id,
                  to : to_phone_number,
                  type : "text",
                  message_text: text_message,
              }

              const db= getDB();
              db.collection(sentCollectionName)
              .insertOne(dataToSave)
              .then(result => {
                 // console.log(result);
              })
              .catch(err => {
                  console.log(err);
              } );
            }
        })
        .catch(function (error) {
          console.log(error);
        });

      res.sendStatus(200);
  }
  else{
      res.sendStatus(404);
  }
});

//TODO change end point to /document or / (if  called from https://sendmessage.indiaglasscraft.com
//Used for caling from product, updates message sent to the DB
app.post("/v3.0",function(req,res){
  let body_param=req.body;

  if(body_param.phone_number_id &&
    body_param.to &&
    body_param.access_token &&
    body_param.document.id){
        let phone_number_id=body_param.phone_number_id;
        let to_phone_number=body_param.to;
        let access_token=body_param.access_token;
        let msgtype=body_param.type;
        let mediaid=body_param.document.id;
        let filename=body_param.document.filename;

        var data = JSON.stringify({
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to_phone_number,
        "type": "document",
        "document": {
            "id": mediaid,
            "filename": filename
        }
    });

    var config = {

      method: 'post',
      url: 'https://graph.facebook.com/v14.0/' + phone_number_id +'/messages',
      headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + access_token
      },
      data : data

    };

    axios(config)
    .then((response)=> {
      if(response.data){
        //console.log(response.data);

        //store message into the database
        const dataToSave={

          messaging_product : "whatsapp",
          display_phone_number : to_phone_number,
          phone_number_id : phone_number_id,
          wa_mid : response.data.messages[0].id,
          to : to_phone_number,
          type : "document",
          message_text : "",
          message_type : msgtype,
          media_id : mediaid,
          file_name : filename,
          converstaion_id : "",
          status:"dispatched",

        }

        const db = getDB();
        db.collection(sentCollectionName)
        .insertOne(dataToSave)
        .then(result => {
         //   console.log(result);
        })
        .catch(err => {
            console.log(err);
        });
      }

      res.sendStatus(200);
    })
    .catch(function (error) {

      console.log(error);
      res.status(error.response.status).send(error);

    });
  }
  else{
      res.sendStatus(404);
  }
});

//Called from WhatsApp cloud API and updates the status of messages sent to from product
app.post('/webhook', (req, res) => {

    const db = getDB();
    let body_param = req.body;
    console.log('webhook request body:', JSON.stringify(body_param.entry[0]));

    if(typeof body_param.entry[0].changes[0].value.statuses != "undefined"){

      let statuses = body_param.entry[0].changes[0].value.statuses[0];
      let wa_mid = statuses.id;
      let status = statuses.status;
      let converstaion_id = ""

      if (status!="read"){
        converstaion_id = statuses.conversation.id;
      }

      //console.log("=============" + converstaion_id );

      dataToSave = {
         converstaion_id : converstaion_id,
         status : status,
       }

       objectQuery={wa_mid : wa_mid}

       db.collection(sentCollectionName)
       .updateOne(objectQuery,{$set : dataToSave})
       .then(result => {
           console.log(result);
       })
       .catch(err => {
           console.log(err);
       });

      }
    else if(typeof body_param.entry[0].changes[0].value.messages != "undefined"){

      let changes =  req.body.entry[0].changes[0];
      //console.log("=============" + JSON.stringify(changes));

      //store message into the database
       objToInsert={
           object : req.body.object,
           id : req.body.entry[0].id,
           messaging_product : changes.value.messaging_product,
           display_phone_number : changes.value.metadata.display_phone_number,
           phone_number_id : changes.value.metadata.phone_number_id,
           name : changes.value.contacts[0].profile.name,
           wa_id : changes.value.contacts[0].wa_id,
           from : changes.value.messages[0].from,
           //id : changes.value.messages[0].id,
           timestamp : changes.value.messages[0].timestamp,
           body : changes.value.messages[0].text.body,
           type : changes.value.messages[0].type,
           field : changes.field
       }

       db.collection(rcvdCollectionName)
       .insertOne(objToInsert)
       .then(result => {
           console.log(result);
       })
       .catch(err => {
           console.log(err);
       });

      }

    res.sendStatus(200);

  });

// GET  to be calles from browser to confirn the service is running
app.get("/",function(req,res){
        console.log("GET / called");
        res.status(200).send("Get from webhook");
});

// to uplaod file from client to this server then to cloud API
app.post('/uploadmedia',upload.single('file'),async(req,res)=>{

    let uploadResponse = {};
    let uploadStatus = 0;

    console.log(req.file);
    let body_param=req.body;

    let phone_number_id=body_param.phone_number_id;
    let access_token=body_param.access_token;
    let file_name = req.file.destination + "/" + req.file.filename;

    //console.log("-----------" +phone_number_id);
    //console.log("-----------" +access_token);
    //console.log("-----------" +file_name);

    if(body_param.phone_number_id &&
      body_param.access_token){

        var FormData = require('form-data');
        var data = new FormData();

        data.append('messaging_product', 'whatsapp');
        data.append('file', fs.createReadStream(file_name));

        var config = {
            method: 'post',
            url: 'https://graph.facebook.com/v14.0/' + phone_number_id + '/media',
            headers: {
            'Authorization': 'Bearer ' + access_token,
            ...data.getHeaders()
            },
            data : data
        };

      await axios(config)
      .then(async (response)=> {
        uploadStatus = 200;
        uploadResponse = response.data;
      })
      .catch(function (error) {

        uploadStatus=error.response.status;
        uploadResponse = error.response.data;
      });

    }

   console.log(file_name);
   fs.unlink(file_name,function(err){
    if(err && err.code == 'ENOENT') {
        // file doens't exist
        console.info("File doesn't exist");
        console.log(err);
    } else if (err) {
        // other errors, e.g. maybe we don't have enough permission
        console.error("Error occurred while trying to delete file");
        console.log(err);
    } else {
        console.log("removed -- " + file_name );
    }
   });

   res.status(uploadStatus).send(uploadResponse);

});