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
		authUrl: 								process.env.authUrl,
		clientId: 								process.env.clientId,
		clientSecret: 							process.env.clientSecret,
		restUrl: 								process.env.restUrl,
		promotionsListDataExtension: 			process.env.promotionsListDataExtension,
		controlGroupsDataExtension: 			process.env.controlGroupsDataExtension,
		voucherPotsDataExtension: 				process.env.voucherPotsDataExtension,
		insertDataExtension: 					process.env.insertDataExtension,
		productionVoucherPot: 					process.env.productionVoucherPot,
		promotionIncrementExtension:  			process.env.promotionIncrementExtension,
		communicationCellDataExtension: 		process.env.communicationCellDataExtension,
		promotionDescriptionDataExtension: 		process.env.promotionDescriptionDataExtension,
		baseUrl: 								process.env.baseUrl,
		templateDataExtension: 					process.env.templateDataExtension
	};
	console.dir(marketingCloud);
}

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

var incrementsRequest = require('request');
var incrementOptions = {
    url : marketingCloud.baseUrl + '/dataextension/lookup/increments'
};
incrementsRequest.get(incrementOptions, function (error, response, body) {
    //Handle error, and body
});


//Fetch used templates
/*
app.get("/dataextension/lookup/usedtemplates", (req, res, next) => {

	axios({
		method: 'post',
		url: marketingCloud.authUrl,
		data:{
			"grant_type": "client_credentials",
			"client_id": marketingCloud.clientId,
			"client_secret": marketingCloud.clientSecret
		}
	})
	.then(function (response) {
		//console.dir(response.data.access_token);
		const oauth_access_token = response.data.access_token;
		//return response.data.access_token;
		console.dir(oauth_access_token);
		const authToken = 'Bearer '.concat(oauth_access_token);
	    var templatesUrl = marketingCloud.restUrl + "data/v1/customobjectdata/key/" + marketingCloud.templateDataExtension + "/rowset";
	    console.dir(templatesUrl);
	    axios.get(templatesUrl, { headers: { Authorization: authToken } }).then(response => {
	        // If request is good...
	        
			res.json(response.data);

	    }).catch((error) => {
	        console.dir('error 1 is ' + error);
	    });		

	})
	.catch(function (error) {
		console.dir(error);
		return error;
	});

});*/

//Fetch increment values
app.get("/dataextension/lookup/increments", (req, res, next) => {

	axios({
		method: 'post',
		url: marketingCloud.authUrl,
		data:{
			"grant_type": "client_credentials",
			"client_id": marketingCloud.clientId,
			"client_secret": marketingCloud.clientSecret
		}
	})
	.then(function (response) {
		//console.dir(response.data.access_token);
		const oauth_access_token = response.data.access_token;
		//return response.data.access_token;
		console.dir(oauth_access_token);
		const authToken = 'Bearer '.concat(oauth_access_token);
	    var incrementsUrl = marketingCloud.restUrl + "data/v1/customobjectdata/key/" + marketingCloud.promotionIncrementExtension + "/rowset";
	    console.dir(incrementsUrl);
	    axios.get(incrementsUrl, { headers: { Authorization: authToken } }).then(response => {
	        // If request is good...
	        
			res.json(response.data);

	    }).catch((error) => {
	        console.dir('error 1 is ' + error);
	    });		

	})
	.catch(function (error) {
		console.dir(error);
		return error;
	});

});

//Fetch rows from promotions data extension
app.get("/dataextension/lookup/promotions", (req, res, next) => {
	axios({
		method: 'post',
		url: marketingCloud.authUrl,
		data:{
			"grant_type": "client_credentials",
			"client_id": marketingCloud.clientId,
			"client_secret": marketingCloud.clientSecret
		}
	})
	.then(function (response) {
		//console.dir(response.data.access_token);
		const oauth_access_token = response.data.access_token;
		//return response.data.access_token;
		console.dir(oauth_access_token);
		const authToken = 'Bearer '.concat(oauth_access_token);
	    const getUrl = marketingCloud.restUrl + "data/v1/customobjectdata/key/" + marketingCloud.promotionsListDataExtension + "/rowset?$filter=globalCampaignID%20eq%20'GC'";
	    console.dir(getUrl);
	    axios.get(getUrl, { headers: { Authorization: authToken } }).then(response => {
	        // If request is good...
	        //console.dir(response.data);
	        res.json(response.data);
	    }).catch((error) => {
	        console.dir('error 3 is ' + error);
	    });		

	})
	.catch(function (error) {
		console.dir(error);
		return error;
	});
});

//Fetch rows from promotions data extension
app.get("/dataextension/lookup/globalcodes", (req, res, next) => {
	axios({
		method: 'post',
		url: marketingCloud.authUrl,
		data:{
			"grant_type": "client_credentials",
			"client_id": marketingCloud.clientId,
			"client_secret": marketingCloud.clientSecret
		}
	})
	.then(function (response) {
		//console.dir(response.data.access_token);
		const oauth_access_token = response.data.access_token;
		//return response.data.access_token;
		console.dir(oauth_access_token);
		const authToken = 'Bearer '.concat(oauth_access_token);
	    var productionVoucherPotUrl = marketingCloud.restUrl + "data/v1/customobjectdata/key/" + marketingCloud.productionVoucherPot + "/rowset";
	    console.dir(productionVoucherPotUrl);
	    axios.get(productionVoucherPotUrl, { headers: { Authorization: authToken } }).then(response => {
	        // If request is good...
	        //console.dir(response.data);
	        res.json(response.data);
	    }).catch((error) => {
	        console.dir('error 4 is ' + error);
	    });		

	})
	.catch(function (error) {
		console.dir(error);
		return error;
	});
});

//Fetch rows from control group data extension
app.get("/dataextension/lookup/controlgroups", (req, res, next) => {
	axios({
		method: 'post',
		url: marketingCloud.authUrl,
		data:{
			"grant_type": "client_credentials",
			"client_id": marketingCloud.clientId,
			"client_secret": marketingCloud.clientSecret
		}
	})
	.then(function (response) {
		//console.dir(response.data.access_token);
		const oauth_access_token = response.data.access_token;
		//return response.data.access_token;
		console.dir(oauth_access_token);
		const authToken = 'Bearer '.concat(oauth_access_token);
	    var controlGroupsUrl = marketingCloud.restUrl + "data/v1/customobjectdata/key/" + marketingCloud.controlGroupsDataExtension + "/rowset";
	    console.dir(controlGroupsUrl);
	    axios.get(controlGroupsUrl, { headers: { Authorization: authToken } }).then(response => {
	        // If request is good...
	        //console.dir(response.data);
	        res.json(response.data);
	    }).catch((error) => {
	        console.dir('error 5 is ' + error);
	    });		

	})
	.catch(function (error) {
		console.dir(error);
		return error;
	});
});

//Fetch rows from voucher data extension
app.get("/dataextension/lookup/voucherpots", (req, res, next) => {
	axios({
		method: 'post',
		url: marketingCloud.authUrl,
		data:{
			"grant_type": "client_credentials",
			"client_id": marketingCloud.clientId,
			"client_secret": marketingCloud.clientSecret
		}
	})
	.then(function (response) {
		//console.dir(response.data.access_token);
		const oauth_access_token = response.data.access_token;
		//return response.data.access_token;
		console.dir(oauth_access_token);
		const authToken = 'Bearer '.concat(oauth_access_token);
	    var voucherPotsUrl = marketingCloud.restUrl + "data/v1/customobjectdata/key/" + marketingCloud.voucherPotsDataExtension + "/rowset";
	    console.dir(voucherPotsUrl);
	    axios.get(voucherPotsUrl, { headers: { Authorization: authToken } }).then(response => {
	        // If request is good...
	        //console.dir(response.data);
	        res.json(response.data);
	    }).catch((error) => {
	        console.dir('error 6 is ' + error);
	    });		

	})
	.catch(function (error) {
		console.dir(error);
		return error;
	});
});

//Fetch email templates
app.get("/dataextension/lookup/templates", (req, res, next) => {

	var templatePayload = {
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
		            "value":"BAU"
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
		        { "property":"id", "direction":"ASC" }
		    ],

		    "fields":
		    [
		        "name"
		    ]
		};

	axios({
		method: 'post',
		url: marketingCloud.authUrl,
		data:{
			"grant_type": "client_credentials",
			"client_id": marketingCloud.clientId,
			"client_secret": marketingCloud.clientSecret
		}
	})
	.then(function (response) {
		//console.dir(response.data.access_token);
		const oauth_access_token = response.data.access_token;
		//return response.data.access_token;
		console.dir(oauth_access_token);
		const authToken = 'Bearer '.concat(oauth_access_token);
	    const postTemplateUrl = marketingCloud.restUrl + "asset/v1/content/assets/query";
	    console.dir(postTemplateUrl);

	   	axios({
			method: 'post',
			url: postTemplateUrl,
			headers: {'Authorization': authToken},
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
	.catch(function (error) {
		console.dir(error);
		return error;
	});
});


//lookup voucher pot DE
app.post("/dataextension/lookup/voucherpots", urlencodedparser, function (req, res){ 
	
	console.dir(req.body);

	var externalKey = req.body.voucher_pot;

	console.dir(row);
   	console.dir('req received');
   	res.redirect('/');

   	axios({
		method: 'post',
		url: marketingCloud.authUrl,
		data:{
		"grant_type": "client_credentials",
		"client_id": marketingCloud.clientId,
		"client_secret": marketingCloud.clientSecret
	}
	})
	.then(function (response) {
		//console.dir(response.data.access_token);
		const oauth_access_token = response.data.access_token;
		//return response.data.access_token;
		console.dir(oauth_access_token);
		const authToken = 'Bearer '.concat(oauth_access_token);
	    const voucherUrl = marketingCloud.restUrl + "data/v1/customobjectdata/key/" + externalKey + "/rowset?$filter=IsClaimer%20eq%20'False'";
	    console.dir(voucherUrl);
	    axios.get(voucherUrl, { headers: { Authorization: authToken } }).then(response => {
	        // If request is good...
	        console.dir(response.data);
	        console.dir(response.data.length);
	        res.json(response.data);
	    }).catch((error) => {
	        console.dir('error 7 is ' + error);
	    });		

	})
	.catch(function (error) {
		console.dir(error);
		return error;
	});

});
// insert data into data extension
app.post('/dataextension/add', urlencodedparser, function (req, res){ 
	
	console.dir("Request Body is ");
	console.dir(req.body);

	var communicationCellData = {

    	"cell_code"					: req.body.cell_code,
    	"cell_name"					: req.body.cell_name,
        "campaign_name"				: req.body.campaign_name,
        "campaign_id"				: req.body.campaign_id,
        "campaign_code"				: req.body.campaign_code,
        "cell_type"					: "1",
        "channel"					: "2",
        "is_putput_flag"			: "0"
	};

	var communicationCellControlData = {

    	"cell_code"					: req.body.cell_code,
    	"cell_name"					: req.body.cell_name,
        "campaign_name"				: req.body.campaign_name,
        "campaign_id"				: req.body.campaign_id,
        "campaign_code"				: req.body.campaign_code,
        "cell_type"					: "2",
        "channel"					: "2",
        "is_putput_flag"			: "0"
	};

	var promotionDescriptionData = {

		"promotions": {
			"promotion_1": {
				"offer_channel"					: "Online",
				"offer_description"				: req.body.campaign_name,
				"ts_and_cs"						: "-",
				"global_code"					: req.body.global_code_1,
				"voucher_pot"					: req.body.voucher_pot_1,
				"print_at_till"      			: req.body.print_at_till_online,
        		"instant_win"        			: req.body.instant_win_online,
        		"offer_medium"       			: req.body.offer_medium_online,
        		"promotion_id"       			: req.body.promotion_id_online,
        		"promotion_group_id" 			: req.body.promotion_group_id_online
			},
			"promotion_2": {
				"offer_channel"					: "Online",
				"offer_description"				: req.body.campaign_name,
				"ts_and_cs"						: "-",
				"global_code"					: req.body.global_code_2,
				"voucher_pot"					: req.body.voucher_pot_2,
				"print_at_till"      			: req.body.print_at_till_online,
        		"instant_win"        			: req.body.instant_win_online,
        		"offer_medium"       			: req.body.offer_medium_online,
        		"promotion_id"       			: req.body.promotion_id_online,
        		"promotion_group_id" 			: req.body.promotion_group_id_online
			},
			"promotion_3": {
				"offer_channel"					: "Online",
				"offer_description"				: req.body.campaign_name,
				"ts_and_cs"						: "-",
				"global_code"					: req.body.global_code_3,
				"voucher_pot"					: req.body.voucher_pot_3,
				"print_at_till"      			: req.body.print_at_till_online,
        		"instant_win"        			: req.body.instant_win_online,
        		"offer_medium"       			: req.body.offer_medium_online,
        		"promotion_id"       			: req.body.promotion_id_online,
        		"promotion_group_id" 			: req.body.promotion_group_id_online
			},			
			"promotion_4": {
				"offer_channel"					: "Store",
				"offer_description"				: req.body.campaign_name,
				"ts_and_cs"						: "-",
				"barcode"            			: req.body.instore_code_1,
				"number_of_redemptions_allowed" : "999",
		        "print_at_till"     			: req.body.print_at_till_instore,
		        "instant_win"       			: req.body.instant_win_instore,
		        "offer_medium" 			     	: req.body.offer_medium_instore,
		        "promotion_id"      			: req.body.promotion_id_instore,
		        "promotion_group_id"			: req.body.promotion_group_id_instore
			},
			"promotion_5": {
				"offer_channel"					: "Store",
				"offer_description"				: req.body.campaign_name,
				"ts_and_cs"						: "-",
				"barcode"            			: req.body.instore_code_2,
				"number_of_redemptions_allowed" : "999",
		        "print_at_till"			     	: req.body.print_at_till_instore,
		        "instant_win"       			: req.body.instant_win_instore,
		        "offer_medium"      			: req.body.offer_medium_instore,
		        "promotion_id"      			: req.body.promotion_id_instore,
		        "promotion_group_id"			: req.body.promotion_group_id_instore
			},
			"promotion_6": {
				"offer_channel"					: "Store",
				"offer_description"				: req.body.campaign_name,
				"ts_and_cs"						: "-",
				"barcode"            			: req.body.instore_code_3,
				"number_of_redemptions_allowed" : "999",
		        "print_at_till"     			: req.body.print_at_till_instore,
		        "instant_win"       			: req.body.instant_win_instore,
		        "offer_medium"      			: req.body.offer_medium_instore,
		        "promotion_id"      			: req.body.promotion_id_instore,
		        "promotion_group_id"			: req.body.promotion_group_id_instore

			}	
		}

	};

	var campaignPromotionAssociationData = {

        "promotion_type"            : req.body.promotion_type,
        "control_group"             : req.body.control_group,
        "email_template"            : req.body.email_template,

    	"cell_code"					: req.body.cell_code,
    	"cell_name"					: req.body.cell_name,
        "campaign_name"				: req.body.campaign_name,
        "campaign_id"				: req.body.campaign_id,
        "campaign_code"				: req.body.campaign_code,

        "global_code_1"				: req.body.global_code_1,
        "global_code_2"				: req.body.global_code_2,
        "global_code_3"				: req.body.global_code_3,

        "voucher_pot_1"				: req.body.voucher_pot_1,
        "voucher_pot_2"				: req.body.voucher_pot_2,
        "voucher_pot_3"				: req.body.voucher_pot_3,

    	"re_use_voucher_pot_1" 		: req.body.re_use_voucher_pot_1,
		"re_use_voucher_pot_2" 		: req.body.re_use_voucher_pot_2,
    	"re_use_voucher_pot_3" 		: req.body.re_use_voucher_pot_3,

    	"instore_code_1"            : req.body.instore_code_1,
    	"instore_code_2"            : req.body.instore_code_2,
    	"instore_code_3"            : req.body.instore_code_3,

        "print_at_till_online"      : req.body.print_at_till_online,
        "instant_win_online"        : req.body.instant_win_online,
        "offer_medium_online"       : req.body.offer_medium_online,
        "promotion_id_online"       : req.body.promotion_id_online,
        "promotion_group_id_online" : req.body.promotion_group_id_online,

        "print_at_till_instore"     : req.body.print_at_till_instore,
        "instant_win_instore"       : req.body.instant_win_instore,
        "offer_medium_instore"      : req.body.offer_medium_instore,
        "promotion_id_instore"      : req.body.promotion_id_instore,
        "promotion_group_id_instore": req.body.promotion_group_id_instore

	};



	

	//res.json({"success": true, "finalResSend": true, "promotion_key": campaignPromotionAssociationData.promotion_key});
}).catch((error) => {
        console.dir('error 10 is ' + error);
        //res.json({"success": false});
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