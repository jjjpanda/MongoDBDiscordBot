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

        let send = (str) => {
            for (let i = 0; i < str.length; i += 2000){
                client.channels.get(msg.channel.id).send(
                    str.substring(i, Math.min(str.length, i + 2000))
                )
            }
        }
        let callbackResolved = (d) => {
            send('G: '+JSON.stringify(d, null, 1))
        }

        let callbackRejected = (e) => {
            send('E: '+JSON.stringify(e, null, 1))
        }
    
        if (content === 'hi' || content === 'hey' || content === 'hello') {
            send('What up cutie 😉')
        }
        else if( content === 'help' || content === 'h' || msg.isMemberMentioned(client.user) ){
            send('Need help, huh? Here are the commands:\n'+
                'db : Show current database\n'+
                'show dbs : List databases\n'+
                'use <db> : Switch databases\n'+
                'drop db : Deletes current database\'s contents.\n' +
                'show collections : List collections in the current database\n'+
                'show schemas : List schemas supported by the database\n'+
                '<schema>.<function>(<parameters>) : Find something in database. Use \'functions\' to get a list of Mongo functions.'
            );
        }
        else if( content === 'functions' || content === 'function'){
            send('Here are the functions you can use:\n'+
                '<schema>.create()\n'+
                '<schema>.find()\n'+
                '<schema>.findOne()\n'+
                '<schema>.findById()\n'+
                '<schema>.findOneAndDelete()\n'+
                '<schema>.findByIdAndDelete()\n'+
                '<schema>.deleteOne()\n'+
                '<schema>.deleteMany()\n'+
                '<schema>.drop()\n'+
                'Example: users.findOne({\"email\": \"bruh@moment.com\"})\n'+
                'This bot only allows the listed functions, go to\n'+
                'https://mongoosejs.com/docs/models.html to do some research.'
            );
        }
        else if( content.split(' ')[0] === 'use'){
            if(content.split(' ')[1] != undefined && content.split(' ')[1].length > 0){
                database.disconnect(() => {
                    database.connect(content.split(' ')[1], (success) => {
                        if(success){
                            send('Switched to ' + content.split(' ')[1]);
                        }
                        else {
                            send("Something went wrong with connecting to " + content.split(' ')[1]);
                        }
                        
                    })
                })
            }
            else {
                send('Usage: use <DB Name>\nUse "show dbs" to list all databases.')
            }
        }
        else if( content === 'drop db'){
            let dbName = database.connection.name
            database.connection.db.dropDatabase( (err, result) => {
                if(!err){
                    send(dbName + ' erased.')
                }
                else{
                    send(dbName + " could not be erased.")
                }
            })
        }
        else if(content === 'db'){
            send('Current Database: '+database.connection.name)
        }
        else if(content === 'show dbs'){
            new database.admin(database.connection.db).listDatabases((err, result) => {
                if(!err){
                    send(JSON.stringify(result.databases.map( d => d.name ), null, 1))
                }
                else{
                    send("Couldn't find databases. That's really weird. 🤷‍♀️")
                }
            })
        }
        else if( content === 'show collections' || content === 'show collection'){
            database.connection.db.listCollections().toArray(function (err, names) {
                if(!err){
                    send(JSON.stringify(names.map( c => c.name ), null, 1))
                }
                else if(names == []){
                    send('This database is empty.')
                }
                else{
                    send("Uhh, sorry. I didn't find any. 😬")
                }
            });
        }
        else if( content === 'show schemas' || content === 'show schema'){
            send(JSON.stringify(Object.keys(schema), null, 1))
        }
        else if( content.search(/[a-zA-Z]*\.[a-zA-Z]*\(.*\)/) != -1){
            //Schema exists
            let scheme = schema[content.split('.')[0]]

            if(scheme != undefined){

                let query = content.split('.')[1].split('(')[0];
                let parameters = msg.content.split('(')[1].substr(0,content.split('(')[1].length-1)
                if (! (parameters instanceof Object) ){
                    console.log(parameters)
                    if(parameters.length === 0){
                        parameters = {}
                    }
                    else{
                        try {
                            parameters = JSON.parse(parameters)
                        }
                        catch(error){
                            send("Bruv, that parameter ain't right.")
                            return
                        }
                    }
                }
                let req;
                console.log(parameters)
                

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
                else if( query === 'drop'){
                    req = database.connection.db.dropCollection(content.split('.')[0])
                }
                if(req != undefined) {
                    req.then(callbackResolved, callbackRejected)
                }
            }
            else{
                send('Schema not found')
            }
            
        }
        else if( content.search(/[a-zA-Z]*\.[a-zA-Z]*/) != -1){
            let scheme = schema[content.split('.')[0]]
            if(scheme != undefined){
                if(scheme.schema.paths[ content.split('.')[1]] != undefined){
                    send(JSON.stringify(scheme.schema.paths[ content.split('.')[1] ], null, 1))
                }
                else{
                    send('Not a property of '+ content.split('.')[0] + ". Try running just "+ content.split('.')[0])
                }   
            }
            else{
                send(schema + ' not a schema')
            }
        }
        else if( Object.keys(schema).includes(content)){
            let scheme = schema[content.split('.')[0]]
            if(scheme != undefined){
                send(JSON.stringify(Object.keys(scheme.schema.paths), null, 1))
            }
            else{
                send('Uhh, something messed up. IDK what. Maybe the schema is incorrect')
            }
        }
    }
});

client.login(process.env.TOKEN);