const env = require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connection.once('connected', () => {
  console.log('~MongoDB Database Connected~');
});
mongoose.connection.once('error', () => {
  console.log('~MongoDB Database Error~');
});
mongoose.connection.once('disconnected', () => {
  console.log('~MongoDB Database Disconnected~');
});

module.exports = {

  connection : mongoose.connection, 

  admin : mongoose.mongo.Admin,

  connect: (url, callback) => mongoose.connect(`mongodb://${process.env.dbIP}:${process.env.dbPORT}/${url}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      auth: {
        authSource: 'admin',
        user: process.env.dbNAME,
        password: process.env.dbPWD,
      },
    })
    .then(
      () => {
        console.log('Database Connect Callback Received');
        callback(true);
      },
      (error) => {
        console.log(error);
        try { callback(false) } catch (error) { console.log(error); }
      },
    ),

  disconnect: (callback) => mongoose.disconnect()
    .then(
      () => {
        console.log('Database Disconnect Callback Received');
        callback(true);
      },
      (error) => {
        console.log(error);
        try { callback(false) } catch (error) { console.log(error); }
      },
    ),

};
