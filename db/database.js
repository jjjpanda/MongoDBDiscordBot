const env = require('dotenv').config();
const cron = require('node-cron');
const mongoose = require('mongoose');
const daemon = require('./earningsDaemon.js');
const appendLogs = require('./appendLogs.js')

const resetDaemon = cron.schedule( '58 0-2 * * *', () => {
  module.exports.connect('dev', () => {})
  appendLogs('', 'Reconnecting to DEV')
}, {
  scheduled: true,
  timezone: 'America/New_York',
})

mongoose.connection.once('connected', () => {
  appendLogs('./text/logs.txt', '~MongoDB Database Connected~');
  daemon.start()
});
mongoose.connection.once('error', () => {
  appendLogs('./text/logs.txt', '~MongoDB Database Error~');
  daemon.stop()
});
mongoose.connection.once('disconnected', () => {
  appendLogs('./text/logs.txt', '~MongoDB Database Disconnected~');
  daemon.stop()  
});

module.exports = {

  connection : mongoose.connection, 

  admin : mongoose.mongo.Admin,

  updateEarnings: daemon.daemon,

  connect: (url, callback) => mongoose.connect(process.env.MONGODB_URI,
    //`mongodb://${process.env.dbIP}:${process.env.dbPORT}/${url}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      /* auth: {
        authSource: 'admin',
        user: process.env.dbNAME,
        password: process.env.dbPWD,
      }, */
    })
    .then(
      () => {
        appendLogs('./text/logs.txt', 'Database Connect Callback Received');
        callback(true);
      },
      (error) => {
        appendLogs('./text/logs.txt', 'Error')
        try { callback(false) } catch (error) { 
          appendLogs('./text/logs.txt', 'Error')
        }
      },
    ),

  disconnect: (callback) => mongoose.disconnect()
    .then(
      () => {
        appendLogs('./text/logs.txt', 'Database Disconnect Callback Received');
        callback(true);
      },
      (error) => {
        appendLogs('./text/logs.txt', 'Error')
        try { callback(false) } catch (error) { 
          appendLogs('./text/logs.txt', 'Error')
        }
      },
    ),

};
