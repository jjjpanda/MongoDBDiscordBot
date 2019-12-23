const env = require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const modelsDir = './db/models/';
const fs = require('fs');

const database = require('./db/database.js')
database.connect('dev', () => {})

let schemas = {}
fs.readdirSync(modelsDir).forEach(fileName => {
    schemas[fileName.split('.')[0]] = require(modelsDir+fileName);
    console.log(fileName)
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    let content = msg.content.toLocaleLowerCase()
    if(msg.channel.name === 'the-ai-realm'){
        let channel = client.channels.get(msg.channel.id)
        if (content === 'hi' || content === 'hey' || content === 'hello') {
            channel.send('What up cutie 😉')
        }
        else if( content === 'help' || content === 'h' ){
            channel.send('Need help, huh?\n'+
                '1. show dbs : List databases.\n'+
                '2. show collections : List collections in the current database\n'+
                '3. show schema : List schemas supported by the database\n'+
                '4. use <DB Name> : Switch Databases\n'
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
        else if( content === 'show collections'){
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
        else if( content === 'show schemas'){
            channel.send(JSON.stringify(Object.keys(schemas), null, 1))
        }
    }
});

client.login(process.env.TOKEN);