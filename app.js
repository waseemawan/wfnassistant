
//====================
// import
//
var restify = require('restify');
var builder = require('botbuilder');
var fs = require('fs');

//======================
//Entities
//

var employeesData = {
    "Anthony Albrigh": {
        name:"Anthony Albrigh" ,
        employeeId: 123       
    },
    "Anthony Bravo": {
        name:"Anthony Bravo" ,
        employeeId: 456        
    },
    "Waseem Anthony": {
        name:"Waseem Anthony" ,
        employeeId: 789     
    }
};

var defaultEmployees = {
    "Jillian": {
        name:"Jillian Campbell" ,
        employeeId: 123       
    },
    "Shah": {
        name:"Shah Nawaz" ,
        employeeId: 456        
    }
    
};

//=========================================================
// Bot Setup
//

var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3000, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
    appId: process.env.MY_APP_ID,
    appPassword: process.env.MY_APP_SECRET
});

server.post('/api/messages', connector.listen()); 
var bot = new builder.UniversalBot(connector);

var intents = new builder.IntentDialog();
bot.dialog('/', intents);


//================================= INTENTS ========================
intents.matches(/^open my timecard/i, [
    function (session, args, next) {
        session.userData.timecardFor = "you"
        //session.beginDialog('/opentimecard');
        // next() ;
        //sendLink(session, 'http://www.cnn.com');
        var loggedInUser = defaultEmployees['Jillian'];
        console.log('&&&&&&&&&&&&&&& ' + loggedInUser) ;
        var card = getSelectedEmployeeCard(session , loggedInUser);
        var msg = new builder.Message(session).addAttachment(card);
        session.send(msg);
    }
]);

intents.matches(/^open timecard/i, [
    function (session) {
        session.beginDialog('/opentimecard');
    },
    function (session, args, next) {
        //session.send('Ok.. Link of the time card for ' + session.userData.timecardFor);
        if (session.userData.timecardFor == 'Shah') {
            //sendLink(session, 'www.yahoo.com');
            var loggedInUser = defaultEmployees[session.userData.timecardFor];
            var card = getSelectedEmployeeCard(session , loggedInUser);
            var msg = new builder.Message(session).addAttachment(card);
            session.send(msg);
        } else if (session.userData.timecardFor == 'Waseem') {
            //sendLink(session , args , 'Found mutiple users with matching namr : Waseem A , Waseem B' , false) ;            
            session.beginDialog('/checkUserInput') ;     
        } else {
            session.send("Employee not found in system");
        }
    }

    
]);

//================================= END INTENTS ========================
intents.onDefault([
    function (session, args, next) {
        if (!session.userData.name) {         
            var card = new builder.HeroCard(session) 
             .title("WFN Assistant") 
             .text("") 
             .images([ 
                  builder.CardImage.create(session, "http://docs.botframework.com/images/demo_bot_image.png") 
             ]); 
         var msg = new builder.Message(session).attachments([card]); 
         session.send(msg); 
         //session.send("Hi... I'm the WFN Assistant bot for");    
            session.beginDialog('/welcome');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.name);
    }
]);


bot.dialog('/opentimecard', [
    function (session) {

        builder.Prompts.text(session, 'Input the name of the employee');
    },

    function (session, results) {
        session.userData.timecardFor = results.response;
        session.endDialog();
    }
]);

bot.dialog('/welcome', [
    function (session) {
        builder.Prompts.text(session, 'Hi , How may I help you ? Type for example open timecard , open my time card etc.');
    },

    function (session, results) {
        session.userData.userIntent = results.response;
        session.endDialog();
    }
]);


bot.dialog('/checkUserInput', [
    function (session) {        
        /**builder.Prompts.choice(session, "Found multiple Users matching Waseem, which? ", 
        "Waseem A|Waseem B" **/
        builder.Prompts.choice(session, "Found multiple Users matching Waseem, which? ", employeesData);         
    } , 
    function (session, results){
        if(results.response) {
           var responseEntity = results.response.entity ; 
           var selectedEmployee = employeesData[results.response.entity];

           console.log('The prompt response ' + selectedEmployee) ;     
           var card = getSelectedEmployeeCard(session , selectedEmployee);
           var msg = new builder.Message(session).addAttachment(card);
           session.send(msg);
           //session.send('www.adp.com?'+selectedEmployee.employeeId);
        } else {
            session.send("OK");
        }

        session.endDialog();
        /**if(results.response == 'Waseem A' || results.response == 'Waseem B') {
             send
             Link(session, 'www.adp.com');
        } **/
        //session.endDialog();
    }        
]
) ;


function getSelectedEmployeeCard(session , selectedEmployee) {
    return new builder.ReceiptCard(session)
        .title(selectedEmployee.name)
        .facts([
            builder.Fact.create(session, 'ID00016211', 'Position ID'),
            builder.Fact.create(session, 'Active', 'Status')
        ])
        .items([
            builder.ReceiptItem.create(session, '80', 'Total Hours')
                .quantity(368)
                .image(builder.CardImage.create(session, 'https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png')),
            builder.ReceiptItem.create(session, '10', 'PTO Hours')
                .quantity(720)
                .image(builder.CardImage.create(session, 'https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png'))
        ])        
        .total('90')
        .buttons([
            builder.CardAction.openUrl(session, 'javascript:alert("timecard");', 'Full TimeCard')
                .image('https://raw.githubusercontent.com/amido/azure-vector-icons/master/renders/microsoft-azure.png')
        ]);
}


function sendLink(session, siteLink) {    
    session.send(siteLink);    

}
