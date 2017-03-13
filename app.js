
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
    "Adams AA": {
        name:"Adams AA" ,
        employeeId: "ID00001",
        regularHours : 50 ,
        ptoHours : 10 ,
        totalHours : 60 , 
        jobTitle : 'Cashier'

    },
    "Adams BB": {
        name:"Adams BB" ,
        employeeId: "ID00002",
        regularHours : 60 ,
        ptoHours : 10 ,
        totalHours : 70,
        jobTitle : 'Sales'
    },
    "Adams CC": {
        name:"Adams CC" ,
        employeeId: "ID00003" ,
        regularHours : 70 ,
        ptoHours : 20 ,
        totalHours : 90,
        jobTitle : 'Manager'
    },
    "Adams Maud": {
        name:"Adams Maud" ,
        employeeId: "ID00004" ,
        regularHours : 80 ,
        ptoHours : 15 ,
        totalHours : 95,
        jobTitle : 'Assistant'
    },
    "Adams Richard": {
        name:"Adams Richard" ,
        employeeId: "ID00005" ,
        regularHours : 30 ,
        ptoHours : 20 ,
        totalHours : 50,
        jobTitle : 'Manager'
    }
};

var defaultEmployees = {
    "Waseem": {
        name:"Waseem Awan" ,
        employeeId: "ID00006" ,
        regularHours : 75 ,
        ptoHours : 20 ,
        totalHours : 95,
        jobTitle : 'Manager' 
    },
    "Shah": {
        name:"Shah Nawaz" ,
        employeeId: "ID00007" ,
        regularHours : 40 ,
        ptoHours : 30 ,
        totalHours : 70,
        jobTitle : 'Cashier'        
    }
    
};

//=========================================================
// Bot Setup
//=========================================================

var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3000, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
    appId: process.env.MY_APP_ID,
    appPassword: process.env.MY_APP_SECRET 
});

server.post('/api/messages', connector.listen());

server.get('/logo', function(req, res, next) {
  fs.readFile('./static/logo_ADP_assist.jpg', function(err, file) {
    if (err) {
      res.send(500);
      return next();
    }
    res.write(file);
    res.send({
      code: 200,
      noEnd: true
    });
    
    res.end();
    return next();
  });
});

server.get('/profile', function(req, res, next) {
  fs.readFile('./static/profileAdam.png', function(err, file) {
    if (err) {
      res.send(500);
      return next();
    }
    res.write(file);
    res.send({
      code: 200,
      noEnd: true
    });
    
    res.end();
    return next();
  });
});

var bot = new builder.UniversalBot(connector);

var intents = new builder.IntentDialog();
bot.dialog('/', intents);


//================================= INTENTS ========================
intents.matches(/^open my timecard/i, [
    function (session, args, next) {
        session.userData.timecardFor = "you"
        var loggedInUser = defaultEmployees['Waseem'];
        console.log('&&&&&&&&&&&&&&& ' + loggedInUser) ;
        var card = getSelectedEmployeeCard(session , loggedInUser);
        var msg = new builder.Message(session).addAttachment(card);
        session.send(msg);
    }
]);
intents.matches(/^show my timecard/i, [
    function (session, args, next) {
        session.userData.timecardFor = "you"
        var loggedInUser = defaultEmployees['Waseem'];
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
        } else if (session.userData.timecardFor == 'Adams') {
            //sendLink(session , args , 'Found mutiple users with matching namr : Waseem A , Waseem B' , false) ;            
            session.beginDialog('/checkUserInput') ;     
        } else {
            session.send("Employee not found in system");
        }
    }

    
]);

intents.onDefault([
    function (session, args, next) {
        if (!session.userData.name) {         
            var card = new builder.HeroCard(session) 
             .title("") 
             .text("Hi! How can I help today? \n You can ask me questions such as open my timecard or access employee profile.") 
             .images([ 
                  builder.CardImage.create(session, "https://wfnassistantbot.azurewebsites.net/logo" ) 
             ]); 
             //"http://www.masseyconsulting.net/wp-content/uploads/2016/03/ADPRedLogowTag_RGB_Left_updated.jpg"
         var msg = new builder.Message(session).attachments([card]); 
         session.send(msg); 
         //session.send("Hi... I'm the WFN Assistant bot for");    
            session.beginDialog('/welcome');
       } else {
            next();
        }
    },
    function (session, results) {
        session.send('Ooops, didnt get you , please try again');
    }
]);

//================================= END INTENTS ========================

bot.dialog('/welcome', [
    function (session) {
        builder.Prompts.text(session, '');
    },
    function (session, results) {
        session.userData.userIntent = results.response;
        session.endDialog();
    }
]);


bot.dialog('/opentimecard', [
    function (session) {

        builder.Prompts.text(session, 'OK, Which employee\'s timecard?');
    },

    function (session, results) {
        session.userData.timecardFor = results.response;
        session.endDialog();
    }
]);

bot.dialog('/checkUserInput', [
    function (session) {                
        builder.Prompts.choice(session, "We found more than one matches", employeesData , {
            maxRetries: 3, 
        retryPrompt: 'Ooops, what you entered is not an option, please try again' 
        });         
    } , 
    function (session, results){
        if(results.response) {
           var responseEntity = results.response.entity ; 
           var selectedEmployee = employeesData[results.response.entity];

           console.log('The prompt response ' + selectedEmployee) ;     
           var card = getSelectedEmployeeCard(session , selectedEmployee);
           var msg = new builder.Message(session).addAttachment(card);
           session.send(msg);
        } else {
            session.send("OK");
        }

        session.endDialog();        
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
            builder.ReceiptItem.create(session, selectedEmployee.regularHours, 'Worked Hours')
                .quantity(368)
                .image(builder.CardImage.create(session, 'https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png')),
            builder.ReceiptItem.create(session, selectedEmployee.ptoHours, 'PTO Hours')
                .quantity(720)
                .image(builder.CardImage.create(session, 'https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png'))
        ])        
        .total(selectedEmployee.totalHours)
        .buttons([
            builder.CardAction.openUrl(session, 'javascript:alert("timecard");', 'Full TimeCard')
                .image('https://raw.githubusercontent.com/amido/azure-vector-icons/master/renders/microsoft-azure.png')
        ]);
}

// ========================= The code related to empployee profile ========================================
intents.matches(/^access employee profile/i, [
    function (session) {
        session.beginDialog('/openemployeeprofile');
    },
    function (session, args, next) {
        //session.send('Ok.. Link of the time card for ' + session.userData.timecardFor);
        if (session.userData.timecardFor == 'Shah') {
            //sendLink(session, 'www.yahoo.com');
            var loggedInUser = defaultEmployees[session.userData.timecardFor];
            var card = getSelectedEmployeeProfile(session , loggedInUser);
            var msg = new builder.Message(session).addAttachment(card);
            session.send(msg);
        } else if (session.userData.timecardFor == 'Adams') {
            //sendLink(session , args , 'Found mutiple users with matching namr : Waseem A , Waseem B' , false) ;            
            session.beginDialog('/checkEmployeeProfileInput') ;     
        } else {
            session.send("Employee not found in system");
        }
    }

    
]);

bot.dialog('/openemployeeprofile', [
    function (session) {

        builder.Prompts.text(session, 'Input the name of the employee');
    },

    function (session, results) {
        session.userData.timecardFor = results.response;
        session.endDialog();
    }
]);

bot.dialog('/checkEmployeeProfileInput', [
    function (session) {                
        builder.Prompts.choice(session, "Found following matching records ", employeesData , {
            maxRetries: 3, 
        retryPrompt: 'Ooops, what you wrote is not a valid option, please try again' 
        });         
    } , 
    function (session, results){
        if(results.response) {
           var responseEntity = results.response.entity ; 
           var selectedEmployee = employeesData[results.response.entity];

           console.log('The prompt response ' + selectedEmployee) ;     
           var card = getSelectedEmployeeProfileCard(session , selectedEmployee);
           var msg = new builder.Message(session).addAttachment(card);
           session.send(msg);
        } else {
            session.send("OK");
        }

        session.endDialog();        
    }        
]
) ;

function getSelectedEmployeeProfileCard(session , selectedEmployee) {
    return new builder.ThumbnailCard(session) 
         .title(selectedEmployee.name) 
         .subtitle('Job Title : ' + selectedEmployee.jobTitle) 
         .text('Position ID : ' + selectedEmployee.employeeId) 
         .images([ 
             builder.CardImage.create(session, 'https://wfnassistantbot.azurewebsites.net/profile') 
         ]) 
         .buttons([ 
             builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', 'Full Profile') 
         ]); 

}

// ========================= The code related to empployee profile ends here ========================================

function sendLink(session, siteLink) {    
    session.send(siteLink);    

}
