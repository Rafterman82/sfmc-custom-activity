'use strict';

// Module Dependencies
const axios 			= require('axios');
var express     		= require('express');
var bodyParser  		= require('body-parser');
var errorhandler 		= require('errorhandler');
var http        		= require('http');
var path        		= require('path');
var request     		= require('request');
var routes      		= require('./routes');
var activity    		= require('./routes/activity');
var urlencodedparser 	= bodyParser.urlencoded({extended:false});
var app 				= express();
var local       		= true;

// access Heroku variables
var marketingCloud = {
  authUrl: process.env.authUrl,
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  restUrl: process.env.restUrl,
  fetchDataExtension: process.env.fetchDataExtension,
  insertDataExtension: process.env.insertDataExtension
};

// define Data Extension External ID's
var targetDataExtensionPromotionsFetch = marketingCloud.fetchDataExtension;
var targetDataExtensionPromotionsInsert = marketingCloud.insertDataExtension;

// Configure Express
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.raw({type: 'application/jwt'}));
//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.methodOverride());
//app.use(express.favicon());
app.use(express.static(path.join(__dirname, 'public')));

// Express in Development Mode
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

//Fetch rows from data extension
app.get("/dataextension/lookup", (req, res, next) => {
	axios({
		method: 'post',
		url: authUrl,
		data:{
		"grant_type": "client_credentials",
		"client_id": clientId,
		"client_secret": clientSecret
	}
	})
	.then(function (response) {
		//console.dir(response.data.access_token);
		const oauth_access_token = response.data.access_token;
		//return response.data.access_token;
		console.dir(oauth_access_token);
		const authToken = 'Bearer '.concat(oauth_access_token);
	    const getUrl = restUrl + "data/v1/customobjectdata/key/" + targetDataExtensionPromotionsFetch + "/rowset?$filter=globalCampaignID%20eq%20'GC'";
	    console.dir(getUrl);
	    axios.get(getUrl, { headers: { Authorization: authToken } }).then(response => {
	        // If request is good...
	        //console.dir(response.data);
	        res.json(response.data);
	    }).catch((error) => {
	        console.dir('error is ' + error);
	    });		

	})
	.catch(function (error) {
		console.dir(error);
		return error;
	});
});


// insert data into data extension
app.post('/dataextension/add', urlencodedparser, function (req, res){  
	
	console.log(req.body);
	var id = decodeURI(req.body.id);
	var campaign = req.body.campaign;
	var channel = req.body.channel;
	var activity = req.body.activity;
	var promotion = decodeURI(req.body.promotion);

	var row = [
	    {
	        "keys": {
	            "id": id
	        },
	        "values": {
	            "campaign": campaign,
	            "channel": channel,
	            "activity": activity,
	            "promotion": promotion
	        }
	    }
	];
	console.log(row);
   	console.log('req received');
   	res.redirect('/');

   	axios({
		method: 'post',
		url: authUrl,
		data:{
		"grant_type": "client_credentials",
		"client_id": clientId,
		"client_secret": clientSecret
	}
	})
	.then(function (response) {
		//console.dir(response.data.access_token);
		const oauth_access_token = response.data.access_token;
		//return response.data.access_token;
		console.dir(oauth_access_token);
		const authToken = 'Bearer '.concat(oauth_access_token);
	    const postUrl = restUrl + "hub/v1/dataevents/key:" + targetDataExtensionPromotionsInsert + "/rowset";
	    console.dir(postUrl);
	   	
	   	axios({
			method: 'post',
			url: postUrl,
			headers: {'Authorization': authToken},
			data: row
		})
		.then(function (response) {
			console.dir(response.data);
		})
		.catch(function (error) {
			console.dir(error);
			return error;
		});	

	})
	.catch(function (error) {
		console.dir(error);
		return error;
	});

});

// Custom Hello World Activity Routes
app.post('/journeybuilder/save/', activity.save );
app.post('/journeybuilder/validate/', activity.validate );
app.post('/journeybuilder/publish/', activity.publish );
app.post('/journeybuilder/execute/', activity.execute );

// listening port
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
