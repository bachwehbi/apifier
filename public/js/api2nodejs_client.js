function appDepends(opts) {
  var str = 
  "var request = require('request'),\n" +
  "    querystring = require('querystring'),\n" +
  "    url = require('url'),\n" +
  "    joi = require('joi');\n" +
  "\n" +
  "var hostname = " + (opts.hostname || "'localhost'") + ",\n"+
  "    protocol = " + (opts.protocol || "'http'") + ",\n";
  if(opts.port) {
    str += "    port = " + opts.port + ";\n";
  }else {
    if(opts.protocol === 'https') {
      str += "    port = 443;\n";
    }else {
      str += "    port = 80;\n";
    }
  }
  str += "\n\n";
  return str;
}

function appConstructorStr(opts) {
  var appname = opts.appname || 'APIfier';
  var str = appname +
  " = function(options) {\n" +
  "\n" +
  "    this.protocol = options.protocol || protocol;\n" +
  "    if(this.protocol.toLowerCase() !== 'http' && this.protocol.toLowerCase() !== 'https') throw new Error('Unsupported protocol ' + this.protocol);\n" +
  "    this.hostname = options.hostname || hostname;\n" +
  "    this.port = options.port || port;\n" +
  "\n" +
  "    this.validateData = function(params, schema, validator) {\n" +
  "        var err = null;\n" +
  "        if(validator) {\n" +
  "            err = validator(params, schema);\n" +
  "            if(err) return err;\n" +
  "        }else {\n" +
  "            err = joi.validate(params, schema);\n" +
  "            if(err) return err;\n" +
  "        }\n" +
  "\n" +
  "        return null;\n" +
  "    }\n" +
  "\n" +
  "    this.postData = function(uri, query, body, callback) {\n" +
  "        var url_str = this.protocol + '://' + this.hostname + ':' + this.port.toString() + uri;\n" +
  "        if(query) url_str = url_str + '?' + querystring.stringify(query);\n" +
  "\n" +
  "        options = {\n" +
  "            url: url.parse(url_str),\n" +
  "            method: 'POST',\n" +
  "            body: body,\n" +
  "            headers: {\n" +
  "                'Content-Type': 'application/json',\n" +
  "            }\n" +
  "        }\n" +
  "\n" +
  "        request(options, function (error, response, body) {\n" +
  "            if(error) callback(error);\n" +
  "            if (!error && response.statusCode == 200) {\n" +
  "                callback(null, body);\n" +
  "            }else {\n" +
  "                callback(body, '');\n" +
  "            }\n" +
  "        });\n" +
  "    }\n" +
  "\n" +
  "    this.getData = function(uri, query, callback) {\n" +
  "        var url_str = this.protocol + '://' + this.hostname + ':' + this.port.toString() + uri;\n" +
  "        if(query) url_str = url_str + '?' + querystring.stringify(query);\n" +
  "        options = {\n" +
  "            url: url.parse(url_str),\n" +
  "            method: 'GET'\n" +
  "        }\n" +
  "\n" +
  "        request(options, function (error, response, body) {\n" +
  "            if(error) callback(error);\n" +
  "            if (!error && response.statusCode == 200) {\n" +
  "                callback(null, body);\n" +
  "            }else {\n" +
  "                callback(body, '');\n" +
  "            }\n" +
  "        });\n" +
  "    }\n" +
  "}\n\n";
  
  return str;
}

function toPostMethod(appname, opts) {
  var str = 
    appname + ".prototype." + opts.uri + " = function(params, callback) {\n" +
    "  var err = this.validateData(params.body, " + opts.uri + "BodySchema);\n" +
    "  if(err) return callback({error: {message: err.message, code: 11}}); \n" +
    "\n" +
    "  err = this.validateData(params.query, " + opts.uri + "QuerySchema);\n" +
    "  if(err) return callback({error: {message: err.message, code: 11}}); \n" +
    "\n" +
    "  var bodystr = JSON.stringify(params.body);\n" +
    "  this.postData('" + opts.uri + "', params.query, bodystr, callback);\n" + 
    "}\n\n";
  return str;
}

function toGetMethod(appname, opts) {
  var str = 
    appname + ".prototype." + opts.uri + " = function(params, callback) {\n" +
    "  var err = this.validateData(params.query, " + opts.uri + "QuerySchema);\n" +
    "  if(err) return callback({error: {message: err.message, code: 11}}); \n" +
    "\n" +
    "  var bodystr = JSON.stringify(params.body);\n" +
    "  this.getData('" + opts.uri + "', params.query, callback);\n" + 
    "}\n\n";
  return str;
}

function generateAPI(api) {
  var apiCode = appDepends(api) + appConstructorStr(api);
  var appname = api.appname || 'APIfier';
  for(m in api.methods) {
    if(api.methods[m].method === 'get') apiCode += toGetMethod(appname, api.methods[m]);
    else if(api.methods[m].method === 'post') apiCode += toPostMethod(appname, api.methods[m]);
  }
  return apiCode;
}