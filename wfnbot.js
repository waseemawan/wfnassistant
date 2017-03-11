// Add your requirements
var restify = require('restify'); 
var builder = require('botbuilder'); 

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.PORT || 3000, function() 
{
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat bot
var connector = new builder.ChatConnector
({ appId: process.env.MY_APP_ID || 'abde18d4-4da3-4be8-86a0-e3c423db64db' || '', appPassword: process.env.MY_APP_SECRET || '4Q6fkkFLUrO2xsER1CP5y3Q' }); 
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

console.log(process.env.NODE_ENV);

server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html'
}));
// Create bot dialogs
bot.dialog('/', function (session) {
    session.send("Hello World");
});