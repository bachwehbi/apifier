var express = require("express");
var http = require('http');
var app = express();
var server = http.createServer(app);

/* Configuration */

app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set("views", __dirname + "/views");
  app.set("view engine", "ejs");
  app.use(express.logger());
  app.use(express.json());
  app.use(express.urlencoded());
  //app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + "/public"));
  app.use(app.router);
});

app.get("/", function(req, res) {
  res.render("apifier");
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});
