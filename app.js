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
var local       		= false;

// access Heroku variables
if ( !local ) {
	var marketingCloud = {
	  authUrl: 									process.env.authUrl,
	  clientId: 								process.env.clientId,
	  clientSecret: 							process.env.clientSecret,
	  restUrl: 									process.env.restUrl,
	  appUrl: 									process.env.baseUrl,
	  promotionsListDataExtension: 				process.env.promotionsListDataExtension,
	  controlGroupsDataExtension: 				process.env.controlGroupsDataExtension,
	  voucherPotsDataExtension: 				process.env.voucherPotsDataExtension,
	  insertDataExtension: 						process.env.insertDataExtension,
	  globalVoucherPot: 						process.env.globalVoucherPot,
	  promotionIncrementExtension:  			process.env.promotionIncrementExtension,
	  communicationCellDataExtension: 			process.env.communicationCellDataExtension,
	  promotionDescriptionDataExtension: 		process.env.promotionDescriptionDataExtension,
	  templateFilter: 							process.env.templateFilter 
	};
	console.dir(marketingCloud);
}

// url constants
const promotionsUrl 			= marketingCloud.restUrl + "data/v1/customobjectdata/key/" 	+ marketingCloud.promotionsListDataExtension 		+ "/rowset?$filter=ExecutedBy%20eq%20'TpAdmin'";
const incrementsUrl 			= marketingCloud.restUrl + "data/v1/customobjectdata/key/" 	+ marketingCloud.promotionIncrementExtension 		+ "/rowset";
const globalCodesUrl 			= marketingCloud.restUrl + "data/v1/customobjectdata/key/" 	+ marketingCloud.globalVoucherPot 					+ "/rowset";
const controlGroupsUrl 			= marketingCloud.restUrl + "data/v1/customobjectdata/key/" 	+ marketingCloud.controlGroupsDataExtension 		+ "/rowset";
const voucherPotsUrl 			= marketingCloud.restUrl + "data/v1/customobjectdata/key/" 	+ marketingCloud.voucherPotsDataExtension 			+ "/rowset";
const campaignAssociationUrl 	= marketingCloud.restUrl + "hub/v1/dataevents/key:" 		+ marketingCloud.insertDataExtension 				+ "/rowset";
const descriptionUrl 			= marketingCloud.restUrl + "hub/v1/dataevents/key:" 		+ marketingCloud.promotionDescriptionDataExtension 	+ "/rowset";
const communicationCellUrl 		= marketingCloud.restUrl + "hub/v1/dataevents/key:" 		+ marketingCloud.communicationCellDataExtension 	+ "/rowset";
const templatesUrl 				= marketingCloud.restUrl + "asset/v1/content/assets/query";

// json template payload
const templatePayload = {
    "page":
    {
        "page":1,
        "pageSize":1000
    },

    "query":
    {
        "leftOperand":
        {
            "property":"name",
            "simpleOperator":"contains",
            "value": marketingCloud.templateFilter
        },
        "logicalOperator":"AND",
        "rightOperand":
        {
            "property":"assetType.name",
            "simpleOperator":"equal",
            "value":"templatebasedemail"
        }
    },

    "sort":
    [
        { "property":"name", "direction":"ASC" }
    ],

    "fields":
    [
        "name"
    ]
};

// Configure Express master
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.raw({type: 'application/jwt'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Express in Development Mode
if ('development' == app.get('env')) {
	app.use(errorhandler());
}

const getOauth2Token = () => new Promise((resolve, reject) => {
	axios({
		method: 'post',
		url: marketingCloud.authUrl,
		data:{
			"grant_type": "client_credentials",
			"client_id": marketingCloud.clientId,
			"client_secret": marketingCloud.clientSecret
		}
	})
	.then(function (oauthResponse) {
		console.dir('Bearer '.concat(oauthResponse.data.access_token));
		return resolve('Bearer '.concat(oauthResponse.data.access_token));
	})
	.catch(function (error) {
		console.dir("Error getting Oauth Token");
		return reject(error);
	});
});

const getIncrements = () => new Promise((resolve, reject) => {
	getOauth2Token().then((tokenResponse) => {

		axios.get(incrementsUrl, { 
			headers: { 
				Authorization: tokenResponse
			}
		})
		.then(response => {
			// If request is good... 
			return resolve(response.data);
		})
		.catch((error) => {
		    console.dir("Error getting increments");
		    return reject(error);
		});
	})
});

const saveToDataExtension = (targetUrl, payload) => new Promise((resolve, reject) => {
	getOauth2Token().then((tokenResponse) => {
	   	axios({
			method: 'post',
			url: targetUrl,
			headers: {'Authorization': tokenResponse},
			data: payload
		})
		.then(function (response) {
			console.dir(response.data);
			return resolve(response.data);
		})
		.catch(function (error) {
			console.dir(error);
			return reject(error);
		});
	})
});

//Fetch increment values
app.get("/dataextension/lookup/increments", (req, res, next) => {

	getOauth2Token().then((tokenResponse) => {

		axios.get(incrementsUrl, { 
			headers: { 
				Authorization: tokenResponse
			}
		})
		.then(response => {
			// If request is good... 
			res.json(response.data);
		})
		.catch((error) => {
		    console.dir("Error getting increments");
		    console.dir(error);
		});
	})
});

//Fetch rows from promotions data extension
app.get("/dataextension/lookup/promotions", (req, res, next) => {

	getOauth2Token().then((tokenResponse) => {

		axios.get(promotionsUrl, { 
			headers: { 
				Authorization: tokenResponse
			}
		})
		.then(response => {
			// If request is good... 
			res.json(response.data);
		})
		.catch((error) => {
		    console.dir("Error getting promotions");
		    console.dir(error);
		});
	})	
});

//Fetch rows from promotions data extension
app.get("/dataextension/lookup/globalcodes", (req, res, next) => {

	getOauth2Token().then((tokenResponse) => {

		axios.get(globalCodesUrl, { 
			headers: { 
				Authorization: tokenResponse
			}
		})
		.then(response => {
			// If request is good... 
			res.json(response.data);
		})
		.catch((error) => {
		    console.dir("Error getting global code");
		    console.dir(error);
		});
	})		
});

//Fetch rows from control group data extension
app.get("/dataextension/lookup/controlgroups", (req, res, next) => {

	getOauth2Token().then((tokenResponse) => {

		axios.get(controlGroupsUrl, { 
			headers: { 
				Authorization: tokenResponse
			}
		})
		.then(response => {
			// If request is good... 
			res.json(response.data);
		})
		.catch((error) => {
		    console.dir("Error getting control groups");
		    console.dir(error);
		});
	})		

});

//Fetch rows from voucher data extension
app.get("/dataextension/lookup/voucherpots", (req, res, next) => {

	getOauth2Token().then((tokenResponse) => {

		axios.get(voucherPotsUrl, { 
			headers: { 
				Authorization: tokenResponse
			}
		})
		.then(response => {
			// If request is good... 
			res.json(response.data);
		})
		.catch((error) => {
		    console.dir("Error getting voucher pots");
		    console.dir(error);
		});
	})		
});

//Fetch email templates
app.get("/dataextension/lookup/templates", (req, res, next) => {

	getOauth2Token().then((tokenResponse) => {

	   	axios({
			method: 'post',
			url: templatesUrl,
			headers: {'Authorization': tokenResponse},
			data: templatePayload
		})
		.then(function (response) {
			//console.dir(response.data);
			res.json(response.data);
		})
		.catch(function (error) {
			console.dir(error);
			return error;
		});
	})	

});

function buildAssociationPayload(payload) {
	var campaignPromotionAssociationData = {};
	for ( var i = 0; i < payload.length; i++ ) {
		console.dir("Step is: " + payload[i].step + ", Key is: " + payload[i].key + ", Value is: " + payload[i].value + ", Type is: " + payload[i].type);
		campaignPromotionAssociationData[payload[i].key] = payload[i].value;
	}
	console.dir(campaignPromotionAssociationData);
	return campaignPromotionAssociationData;
}

function buildCommunicationCellPayload(payload) {
	var communicationCellData = {
			"not_control": {
		    	"cell_code"					: payload["cell_code"],
		    	"cell_name"					: payload["cell_name"],
		        "campaign_name"				: payload["campaign_name"],
		        "campaign_id"				: payload["campaign_id"],
		        "campaign_code"				: payload["campaign_code"],
		        "cell_type"					: "1",
		        "channel"					: "2",
		        "is_putput_flag"			: "1"				
			},
			"control": {
		    	"cell_code"					: payload["cell_code"],
		    	"cell_name"					: payload["cell_name"],
		        "campaign_name"				: payload["campaign_name"],
		        "campaign_id"				: payload["campaign_id"],
		        "campaign_code"				: payload["campaign_code"],
		        "cell_type"					: "2",
		        "channel"					: "2",
		        "is_putput_flag"			: "0"				
			}
	};
	console.dir(communicationCellData);
	return communicationCellData;
}
function buildPromotionDescriptionPayload(payload) {
	var promotionDescriptionData = {};
	promotionDescriptionData = promotionDescriptionData.promotions;
	var instore_id = 1;
	var online_id = 1;
	for ( var i = 1; i <= 10; i++ ) {
		if ( payload.promotionType == "online" ) {
			if ( payload["global_code_" + online_id] != "no-code" || payload["unique_code_" + online_id] != "no-code" ) {
				promotionDescriptionData.promotions["promotion_" + i].offer_channel 			= "Online";
				promotionDescriptionData.promotions["promotion_" + i].offer_description 		= payload.offer_description_online;
				promotionDescriptionData.promotions["promotion_" + i].ts_and_cs 				= "-";
				if ( payload.onlinePromotionType == "Global" ) {
					promotionDescriptionData.promotions["promotion_" + i].bar_code 				= payload["global_code_" + online_id];
					promotionDescriptionData.promotions["promotion_" + i].promotion_id 			= payload["global_code_" + online_id +"_promo_id"];
					promotionDescriptionData.promotions["promotion_" + i].valid_from_datetime 	= payload["global_code_" + online_id +"_valid_from"];
					promotionDescriptionData.promotions["promotion_" + i].valid_to_datetime 	= payload["global_code_" + online_id +"_valid_to"];
					promotionDescriptionData.promotions["promotion_" + i].visiblefrom 			= payload["global_code_" + online_id +"_valid_from"];
					promotionDescriptionData.promotions["promotion_" + i].visibleto 			= payload["global_code_" + online_id +"_valid_to"];
				} else if (payload.onlinePromotionType == "Unique" ) {
					promotionDescriptionData.promotions["promotion_" + i].bar_code 				= "-";
					promotionDescriptionData.promotions["promotion_" + i].promotion_id 			= payload["unique_code_" + online_id +"_promo_id"];
				}
				promotionDescriptionData.promotions["promotion_" + i].print_at_till_flag 		= payload.print_at_till_online;
				promotionDescriptionData.promotions["promotion_" + i].instant_win_flag 			= payload.instant_win_online;
				promotionDescriptionData.promotions["promotion_" + i].offer_medium 				= payload.offer_medium_online;
				promotionDescriptionData.promotions["promotion_" + i].promotion_group_id 		= payload.promotion_group_id_online;
				online_id++;
			}
		} else if ( payload.promotionType == "instore" ) {
			if ( payload.instore_code_1 != "no-code" ) {
				promotionDescriptionData.promotions["promotion_" + i].offer_channel 		= "Instore";
				promotionDescriptionData.promotions["promotion_" + i].offer_description 	= payload.offer_description_instore;
				promotionDescriptionData.promotions["promotion_" + i].ts_and_cs 			= "-";
				promotionDescriptionData.promotions["promotion_" + i].bar_code 				= payload["instore_code_" + i];
				promotionDescriptionData.promotions["promotion_" + i].promotion_id 			= payload["instore_code_" + i +"_promo_id"];
				promotionDescriptionData.promotions["promotion_" + i].valid_from_datetime 	= payload["instore_code_" + i +"_valid_from"];
				promotionDescriptionData.promotions["promotion_" + i].valid_to_datetime 	= payload["instore_code_" + i +"_valid_to"];
				promotionDescriptionData.promotions["promotion_" + i].visiblefrom 			= payload["instore_code_" + i +"_valid_from"];
				promotionDescriptionData.promotions["promotion_" + i].visibleto 			= payload["instore_code_" + i +"_valid_to"];
				promotionDescriptionData.promotions["promotion_" + i].number_of_redemptions = payload["instore_code_" + i +"_redemption"];
				promotionDescriptionData.promotions["promotion_" + i].print_at_till_flag 	= payload.print_at_till_instore;
				promotionDescriptionData.promotions["promotion_" + i].instant_win_flag 		= payload.instant_win_instore;
				promotionDescriptionData.promotions["promotion_" + i].offer_medium 			= payload.offer_medium_instore;
				promotionDescriptionData.promotions["promotion_" + i].promotion_group_id 	= payload.promotion_group_id_instore;
				instore_id++;
			}
		}
	}
	console.dir(promotionDescriptionData);
	return promotionDescriptionData;
}

async function buildAndSend(payload) {
	try {
		const associationPayload = await buildAssociationPayload(payload);
		const communicationCellPayload = await buildCommunicationCellPayload(associationPayload);
		const promotionDescriptionPayload = await buildPromotionDescriptionPayload(associationPayload);
		await saveToDataExtension(campaignAssociationUrl, associationPayload);
	} catch(err) {
		console.dir(err);
	}
}

// insert data into data extension
app.post('/dataextension/add', function (req, res){ 

	console.dir("Dump request body");
	console.dir(req.body);
	res.send(JSON.stringify(req.body));
	buildAndSend(req.body);

});

// Custom Hello World Activity Routes
app.post('/journeybuilder/save/', activity.save );
app.post('/journeybuilder/validate/', activity.validate );
app.post('/journeybuilder/publish/', activity.publish );
app.post('/journeybuilder/execute/', activity.execute );
app.post('/journeybuilder/stop/', activity.stop );
app.post('/journeybuilder/unpublish/', activity.unpublish );

// listening port
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});