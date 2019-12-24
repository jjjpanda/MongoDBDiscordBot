const env = require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const modelsDir = './db/models/';
const fs = require('fs');

const database = require('./db/database.js')
database.connect('dev', () => {})

let schema = {}
fs.readdirSync(modelsDir).forEach(fileName => {
    schema[fileName.split('.')[0].toLocaleLowerCase()] = require(modelsDir+fileName)
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {

    let content = msg.content.toLocaleLowerCase()
    let self = client.user.id
    
    if(msg.channel.name === 'the-ai-realm' && msg.author.id != self){

        let channel = client.channels.get(msg.channel.id)
        let something = (e, d) => {
            console.log(e, d)
            channel.send(JSON.stringify(e, null, 1))
        }
        let somethingBad = e => {
            console.log(e)
            channel.send(JSON.stringify(e, null, 1))
        }
    
        if (content === 'hi' || content === 'hey' || content === 'hello') {
            channel.send('What up cutie 😉')
        }
        else if( content === 'help' || content === 'h' ){
            channel.send('Need help, huh? Here are the commands:\n'+
                'db : Show current database\n'+
                'show dbs : List databases\n'+
                'use <db> : Switch databases\n'+
                'show collections : List collections in the current database\n'+
                'show schemas : List schemas supported by the database\n'+
                '<schema>.<function>(<parameters>) : Find something in database. Use \'functions\' to get a list of Mongo functions.'
            );
        }
        else if( content === 'functions' || content === 'function'){
            channel.send('Here are the functions you can use:\n'+
                '<schema>.create()\n'+
                '<schema>.find()\n'+
                '<schema>.findOne()\n'+
                '<schema>.findById()\n'+
                '<schema>.findOneAndDelete()\n'+
                '<schema>.findByIdAndDelete()\n'+
                '<schema>.deleteOne()\n'+
                '<schema>.deleteMany()\n'+
                'Example: users.findOne({\'email\': \'bruh@moment.com\'})\n'+
                'This bot only allows the listed functions, go to\n'+
                'https://mongoosejs.com/docs/models.html to do some research.'
            );
        }
        else if( content.split(' ')[0] === 'use'){
            if(content.split(' ')[1] != undefined && content.split(' ')[1].length > 0){
                database.disconnect(() => {
                    database.connect(content.split(' ')[1], (success) => {
                        if(success){
                            channel.send('Switched to ' + content.split(' ')[1]);
                        }
                        else {
                            channel.send("Something went wrong with connecting to " + content.split(' ')[1]);
                        }
                        
                    })
                })
            }
            else {
                channel.send('Usage: use <DB Name>\nUse "show dbs" to list all databases.')
            }
        }
        else if(content === 'db'){
            channel.send('Current Database: '+database.connection.name)
        }
        else if(content === 'show dbs'){
            new database.admin(database.connection.db).listDatabases((err, result) => {
                if(!err){
                    channel.send(JSON.stringify(result.databases.map( d => d.name ), null, 1))
                }
                else{
                    channel.send("Couldn't find databases. That's really weird. 🤷‍♀️")
                }
            })
        }
        else if( content === 'show collections' || content === 'show collection'){
            database.connection.db.listCollections().toArray(function (err, names) {
                if(!err){
                    channel.send(JSON.stringify(names.map( c => c.name ), null, 1))
                }
                else if(names == []){
                    channel.send('This database is empty.')
                }
                else{
                    channel.send("Uhh, sorry. I didn't find any. 😬")
                }
            });
        }
        else if( content === 'show schemas' || content === 'show schema'){
            channel.send(JSON.stringify(Object.keys(schema), null, 1))
        }
        else if( content.search(/[a-zA-Z]*\.[a-zA-Z]*\([a-zA-Z]*\)/) != -1){
            //Schema exists
            let scheme = schema[content.split('.')[0]]

            if(scheme != undefined){

                let query = content.split('.')[1].split('(')[0];
                let parameters = content.split('.')[1].split('(')[1].substr(0,content.split('.')[1].split('(')[1].length-1)
                if (! (parameters instanceof Object) ){
                    if(parameters.length == 0){
                        parameters = {}
                    }
                    else{
                        parameters = JSON.parse(parameters)
                    }
                }
                let req;

                if( query === 'create'){
                    req = scheme.create(parameters)
                }
                else if( query === 'find'){
                    req = scheme.find(parameters)
                }
                else if( query === 'findone'){
                    req = scheme.findOne(parameters)
                }
                else if( query === 'findbyid'){
                    req = scheme.findById(parameters)
                }
                else if( query === 'findoneanddelete'){
                    req = scheme.findOneAndDelete(parameters)
                }
                else if( query === 'findbyidanddelete'){
                    req = scheme.findByIdAndDelete(parameters)
                }
                else if( query === 'deleteone'){
                    req = scheme.deleteOne(parameters)
                }
                else if( query === 'deletemany'){
                    req = scheme.deleteMany(parameters)
                }
                req.then(something, somethingBad)
            }
            else{
                channel.send('Schema not found')
            }
            
        }
    }
});

client.login(process.env.TOKEN);