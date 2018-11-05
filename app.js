var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');

mongoose.connect('mongodb://hande:netas123@ds145083.mlab.com:45083/chatapp', {
  useCreateIndex: true,
  useNewUrlParser: true
} );
//var db = mongoose.connection();

var routes = require('./routes/index');
var users = require('./routes/users');

// Init App
var app = express(); //bu degiskenle express frameworkun sağladığı tum altyapı kullanılabilinir

// View Engine
app.set('views', path.join(__dirname, 'views')); //confg ayarları
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public'))); //safer to use the absolute path of the directory

// Express Session
app.use(session({
    secret: 'secret',  //for use this modul we must be passed this parameters
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.use('/', routes);
app.use('/users', users);

// Set Port
/*app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});*/

const WebSocket = require('ws');
var http = require('http');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      console.log('received: %s', message);
      message = JSON.parse(message);
      if(message.type == "name"){
          ws.personName = message.data;//hande
          ws.othername = message.other;//enes
          return;
      }
      if(message.type == "read"){ //okundu
          console.log(ws.othername);
          console.log(ws.personName);
          wss.clients.forEach(function e (client){
              if(client != ws)
                  client.send(JSON.stringify({
                      type: "forwarded",
                      name: ws.othername,
                      other: ws.personName
                  }));
          })
          return;
      }
      if(message.type == "viewed"){
          console.log("Görüldü");
          wss.clients.forEach(function e (client){
              if(client != ws)
                  client.send(JSON.stringify({
                      type: "viewedinfo",
                      name: ws.othername,
                      other: ws.personName
                  }));
          })
          return;
      }
    
      if(message.type == "typing"){
          wss.clients.forEach(function e (client){
              if(client != ws)
                  client.send(JSON.stringify({
                      type: "typing",
                      name: ws.othername,
                      other: ws.personName
                  }));
          })
          return;
      }
    
      console.log("Received: " + message);
    
      wss.clients.forEach(function e(client){
          if(client != ws && message.type == "message")
              client.send(JSON.stringify({
                  name: ws.personName,
                  data: message.data,
                  other: message.other,
                  type: "message"
              }));
      });
    });
   
    ws.on('close', function(){
      console.log("I lost a client");
    });
    
    console.log("one more client connected");
  });

//start our server
server.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${server.address().port} `);
});