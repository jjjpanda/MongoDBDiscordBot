const cron = require('node-cron');
const processing = require('./earningsProcessing.js');
const appendLogs = require('./appendLogs.js')

const Earnings = require('./models/Earnings');

const daemonFunction = () => {
  /*
  appendLogs('./text/logs.txt', '---DB REQUESTED CRON JOB---');
  appendLogs('./text/logs.txt', 'TITLE: UPDATE EARNINGS');
  let date = new Date();
  const days = 6;
  let iterations = 0;

  const loop = setInterval(() => {
    processing.getERCalendar(date, (company, d) => {
      Earnings.findOne({ company }).then((earnings) => {
        if (earnings) {
          if (d.getFullYear() == earnings.date.getFullYear()
            && d.getMonth() == earnings.date.getMonth()
            && d.getDate() == earnings.date.getDate()) {

          } else {
            earnings.date = new Date(d);
            earnings.save();
          }
        } else {
          const NewEarnings = new Earnings({
            date: new Date(d),
            company,
          });
          NewEarnings.save();
        }
      });
    });
    iterate();
  }, 1500);
  var iterate = () => {
    date = new Date(date.setDate(date.getDate() + 1));
    iterations++;
    if (iterations >= days) {
      clearInterval(loop);
    }
  };

  Earnings.deleteMany({ date: { $lt: new Date() } })
    .then((e) => {
      if (!e.ok) {
        appendLogs('./text/logs.txt', 'UPDATE EARNINGS: Previous Dates Removed');
      }
    });
    */
   
  appendLogs('./text/logs.txt', '---DB REQUESTED JOB DISABLED---');
}

const daemon = cron.schedule(  //'*/30 * * * * *',
  '0 0-11 * * *',
  daemonFunction, {
    scheduled: false,
    timezone: 'America/New_York',
  },
);

module.exports = {
  start: daemon.start,
  stop: daemon.stop,
  destroy: daemon.destroy,
  daemon: daemonFunction
};
