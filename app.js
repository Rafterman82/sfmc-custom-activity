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
	  promotionsListDataExtension: 				process.env.promotionsListDataExtension,
	  controlGroupsDataExtension: 				process.env.controlGroupsDataExtension,
	  voucherPotsDataExtension: 				process.env.voucherPotsDataExtension,
	  insertDataExtension: 						process.env.insertDataExtension,
	  productionVoucherPot: 					process.env.productionVoucherPot,
	  promotionIncrementExtension:  			process.env.promotionIncrementExtension,
	  communicationCellDataExtension: 			process.env.communicationCellDataExtension,
	  promotionDescriptionDataExtension: 		process.env.promotionDescriptionDataExtension
	};
	console.dir(marketingCloud);
}

// Configure Express master
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

var instoreResponse;
var globalResponse;

getGlobalCodes();
getInstoreCodes();

function getInstoreCodes() {
	console.dir("populate instore array");

	var instoreCodesUrl = "https://mc-jb-custom-activity-ca.herokuapp.com/dataextension/lookup/promotions";
	axios.get("https://mc-jb-custom-activity-ca.herokuapp.com/dataextension/lookup/promotions").then(pcresponse => {


		console.dir("RESPONSE FROM LOOKUP PROMO CODES");
		//console.dir(pcresponse.data.items);

		instoreResponse = pcresponse;

		console.dir(instoreResponse.data);

		return instoreResponse;


	}).catch((error) => {
		console.dir('error looking up promotion codes in add statement ' + error);
		//res.json({"success": false});
	});
}

function getGlobalCodes() {

	
	// lookup global voucher pot and get date
	var globalCodesUrl = "https://mc-jb-custom-activity-ca.herokuapp.com/dataextension/lookup/globalcodes";
	axios.get("https://mc-jb-custom-activity-ca.herokuapp.com/dataextension/lookup/globalcodes").then(gcresponse => {

		console.dir("RESPONSE FROM LOOKUP GLOBAL CODES");
		//console.dir(gcresponse.data.items);

		globalResponse = gcresponse;

		console.dir(globalResponse.data);
		return globalResponse;


	}).catch((error) => {
		console.dir('error getting global codes in add statement ' + error);
		//res.json({"success": false});
	});
}

var incrementsRequest = require('request');
var incrementOptions = {
    url : 'https://mc-jb-custom-activity-ca.herokuapp.com/dataextension/lookup/increments'
};
incrementsRequest.get(incrementOptions, function (error, response, body) {
    //Handle error, and body

});


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
	        console.dir('error is ' + error);
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
	        instoreResponse = response;
	        res.json(response.data);
	    }).catch((error) => {
	        console.dir('error getting promotions' + error);
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
	        globalResponse = response;
	        res.json(response.data);

	    }).catch((error) => {
	        console.dir('error getting global codes ' + error);
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
	        console.dir('error getting control groups ' + error);
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
	        console.dir('error getting voucher pots ' + error);
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
   	//res.redirect('/');

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
	        console.dir('error getting voucher pot data ' + error);
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

	console.dir("executing lookups");
	
	instoreResponse = getInstoreCodes();
	globalResponse = getGlobalCodes();

	var communicationCellData = {

    	"cell_code"					: req.body.cell_code,
    	"cell_name"					: req.body.cell_name,
        "campaign_name"				: req.body.campaign_name,
        "campaign_id"				: req.body.campaign_id,
        "campaign_code"				: req.body.campaign_code,
        "cell_type"					: "1",
        "channel"					: "2",
        "is_putput_flag"			: "1"
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

        "online_code_date_override_1"       : req.body.online_code_date_override_1,
        "online_code_date_override_2"       : req.body.online_code_date_override_2,
        "online_code_date_override_3"       : req.body.online_code_date_override_3,

        "online_voucher_date_override_1_days" : parseInt(req.body.online_voucher_date_override_1_days),
        "online_voucher_date_override_2_days" : parseInt(req.body.online_voucher_date_override_2_days),
        "online_voucher_date_override_3_days" : parseInt(req.body.online_voucher_date_override_3_days),


    	"instore_code_1"            : req.body.instore_code_1,
    	"instore_code_2"            : req.body.instore_code_2,
    	"instore_code_3"            : req.body.instore_code_3,

        "instore_code_date_override_1"       : req.body.instore_code_date_override_1,
        "instore_code_date_override_2"       : req.body.instore_code_date_override_2,
        "instore_code_date_override_3"       : req.body.instore_code_date_override_3,

        "instore_voucher_date_override_1_days" : parseInt(req.body.instore_voucher_date_override_1_days),
        "instore_voucher_date_override_2_days" : parseInt(req.body.instore_voucher_date_override_2_days),
        "instore_voucher_date_override_3_days" : parseInt(req.body.instore_voucher_date_override_3_days),

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

   	axios.get("https://mc-jb-custom-activity-ca.herokuapp.com/dataextension/lookup/increments").then(response => {
        
        // If request is good...
        console.dir(response.data.items);
        console.dir(response.data.items[0].values);
        //res.json(response.data.items.values);

        var incrementObject = response.data.items[0].values;

        var mc_unique_promotion_id_increment = incrementObject.mc_unique_promotion_id_increment;
        var communication_cell_code_id_increment = incrementObject.communication_cell_code_id_increment;
        var promotion_key = incrementObject.promotion_key;

        res.json({"promotion_key": promotion_key});

        // set promotion_key in json object
        campaignPromotionAssociationData.promotion_key = promotion_key;

        console.dir(campaignPromotionAssociationData);

        // increment promotion key up 1 and save new increment in DE
        var newPromotionKey = parseInt(promotion_key) + 1;

        // store new promotion key in increments object
        incrementObject.promotion_key = parseInt(newPromotionKey);

        console.dir(incrementObject);

        // loop through codes and count required mc ids
        var mcLoopIncrement = mc_unique_promotion_id_increment;

        for ( var i = 1; i <= 6; i++) {

        	if ( promotionDescriptionData.promotions["promotion_" + i].global_code === "no-code" 
        		&& promotionDescriptionData.promotions["promotion_" + i].voucher_pot === "no-code"
        			|| promotionDescriptionData.promotions["promotion_" + i].barcode === "no-code" ) {

        		// this row has no code
        		// set as hyphen
        		promotionDescriptionData.promotions["promotion_" + i].mc_unique_promotion_id = "-";
        		promotionDescriptionData.promotions["promotion_" + i].communication_cell_id = "-";
        		campaignPromotionAssociationData["mc_id_" + i] = "-";

        	} else {

        		// this row has a code

        		console.dir("THE CURRENT PROMOTION OBJECT BEFORE DATE ALTERATION IS");
        		console.dir(promotionDescriptionData.promotions["promotion_" + i]);

        		if ( promotionDescriptionData.promotions["promotion_" + i].global_code != "no-code" && promotionDescriptionData.promotions["promotion_" + i].voucher_pot === "no-code") {

        			// global code selected

        			// lookup global voucher pot and get date
        			console.dir("CURRENT GLOBAL RESPONSE");
        			console.dir(globalResponse);


    				for ( var j = 0; j < globalResponse.data.items.length; j++ ) {

    					if ( globalResponse.data.items[j].keys.couponcode == promotionDescriptionData.promotions["promotion_" + i].global_code ) {

    						var splitGlobalValidFrom = globalResponse.data.items[j].values.validfrom.split(" ");
    						var splitGlobalValidTo = globalResponse.data.items[j].values.validfrom.split(" ");

    						// set valid from and to
    						promotionDescriptionData.promotions["promotion_" + i].valid_from_datetime = splitGlobalValidFrom.split("/").reverse().join("-");
    						promotionDescriptionData.promotions["promotion_" + i].valid_to_datetime = splitGlobalValidTo.split("/").reverse().join("-");
    						promotionDescriptionData.promotions["promotion_" + i].visible_from_datetime = splitGlobalValidFrom.split("/").reverse().join("-");
    						promotionDescriptionData.promotions["promotion_" + i].visible_to_datetime = splitGlobalValidTp.oplit("/").reverse().join("-");

    						console.dir("PROMOTION DATA AFTER GLOBAL CODE PASS");
    						console.dir(promotionDescriptionData);


    					}

    				}

        			// update barcode 
        			promotionDescriptionData.promotions["promotion_" + i].barcode = promotionDescriptionData.promotions["promotion_" + i].global_code;
        			promotionDescriptionData.promotions["promotion_" + i].number_of_redemptions_allowed = "999";
        			delete promotionDescriptionData.promotions["promotion_" + i].global_code;
        			delete promotionDescriptionData.promotions["promotion_" + i].voucher_pot;


        		} else if ( promotionDescriptionData.promotions["promotion_" + i].voucher_pot != "no-code" && promotionDescriptionData.promotions["promotion_" + i].global_code === "no-code") {

        			// voucher pot selected

        			// get one row voucher pot for date

        			promotionDescriptionData.promotions["promotion_" + i].barcode = "-";
        			promotionDescriptionData.promotions["promotion_" + i].number_of_redemptions_allowed = "1";
        			delete promotionDescriptionData.promotions["promotion_" + i].voucher_pot;
        			delete promotionDescriptionData.promotions["promotion_" + i].global_code;

        		} else if ( promotionDescriptionData.promotions["promotion_" + i].barcode != "no-code" ) {

        			// instore code selected

        			console.dir("CURRENT INSTORE RESPONSE");
        			setTimeout(function(){ 
        				console.dir(instoreResponse);
        			}, 3000);
        			

    				for ( var n = 0; n < instoreResponse.data.items.length; n++ ) {

    					if ( instoreResponse.data.items[n].keys.discountmediaid == promotionDescriptionData.promotions["promotion_" + i].barcode ) {

    						var instoreValidFromDate = instoreResponse.data.items[n].values.datefrom.split("/").reverse().join("-");
    						var instoreValidToDate = instoreResponse.data.items[n].values.dateto.split("/").reverse().join("-");

    						// set valid from and to
    						promotionDescriptionData.promotions["promotion_" + i].valid_from_datetime = instoreValidFromDate + " " + instoreResponse.data.items[n].values.timefrom;
    						promotionDescriptionData.promotions["promotion_" + i].valid_to_datetime = instoreValidToDate + " " + instoreResponse.data.items[n].values.timeto;
    						promotionDescriptionData.promotions["promotion_" + i].visible_from_datetime = instoreValidFromDate + " " + instoreResponse.data.items[n].values.timefrom;
    						promotionDescriptionData.promotions["promotion_" + i].visible_to_datetime = instoreValidToDate + " " + instoreResponse.data.items[n].values.timeto;

    						console.dir("PROMOTION DATA AFTER INSTORE CODE PASS");
    						console.dir(promotionDescriptionData);


    					}

    				}

        			promotionDescriptionData.promotions["promotion_" + i].barcode = promotionDescriptionData.promotions["promotion_" + i].barcode;

        		}

        		promotionDescriptionData.promotions["promotion_" + i].mc_unique_promotion_id = parseInt(mcLoopIncrement);
        		promotionDescriptionData.promotions["promotion_" + i].communication_cell_id = parseInt(communication_cell_code_id_increment);
        		campaignPromotionAssociationData["mc_id_" + i] = parseInt(mcLoopIncrement);
        		mcLoopIncrement++;

        	}

        }

        console.dir(promotionDescriptionData.promotions);

        var new_mc_unique_promotion_id_increment = parseInt(mcLoopIncrement) + 1;

        // set mc increment in DE
        incrementObject.mc_unique_promotion_id_increment = parseInt(new_mc_unique_promotion_id_increment);

        // update communication cell json
        communicationCellData.communication_cell_id 		= parseInt(communication_cell_code_id_increment);
        campaignPromotionAssociationData.communication_cell_id = parseInt(communication_cell_code_id_increment);
        communicationCellControlData.communication_cell_id 	= parseInt(communication_cell_code_id_increment) + 1;
        campaignPromotionAssociationData.communication_cell_id_control = parseInt(communication_cell_code_id_increment) + 1;

        var newCommunicationCellCodeIncrement = parseInt(communication_cell_code_id_increment) + 2;

        console.dir("COMM CELL DATA");
        console.dir(communicationCellData);

        console.dir("COMM CELL DATA CONTROL");
        console.dir(communicationCellControlData);

        // update increments object
        incrementObject.communication_cell_code_id_increment = parseInt(newCommunicationCellCodeIncrement);

        console.dir("INCREMENT OBJECT");
        console.dir(incrementObject);

        console.dir("CAMPAIGN ASSOCIATION");
        console.dir(campaignPromotionAssociationData);

		var campaignAssociationUrl = marketingCloud.restUrl + "hub/v1/dataevents/key:" + marketingCloud.insertDataExtension + "/rowset";
		var incrementUrl = marketingCloud.restUrl + "hub/v1/dataevents/key:" + marketingCloud.promotionIncrementExtension + "/rowset";
		var descriptionUrl = marketingCloud.restUrl + "hub/v1/dataevents/key:" + marketingCloud.promotionDescriptionDataExtension + "/rowset";
		var communicationCellUrl = marketingCloud.restUrl + "hub/v1/dataevents/key:" + marketingCloud.communicationCellDataExtension + "/rowset";
		console.dir(campaignAssociationUrl);

		var associationKey = campaignPromotionAssociationData.promotion_key;
		delete campaignPromotionAssociationData.promotion_key;

		var associationPayload = [{
	        "keys": {
	            "promotion_key": parseInt(associationKey)
	        },
	        "values": campaignPromotionAssociationData
	    }];

	    console.dir("ASSOCIATION PAYLOAD");
	    console.dir(associationPayload);

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

			// association insert
		   	axios({
				method: 'post',
				url: campaignAssociationUrl,
				headers: {'Authorization': authToken},
				data: associationPayload
			})
			.then(function (response) {
				console.dir(response.data);
				//res.json({"success": true});
			})
			.catch(function (error) {
				console.dir("error posting campaign association data");
				console.dir(error);
				//res.json({"success": false});
			});

			var incrementPayload = [{
		        "keys": {
		            "increment_key": 1
		        },
		        "values": incrementObject
	    	}];

	    	console.dir(incrementPayload);

	    	// increments insert
		   	axios({
				method: 'post',
				url: incrementUrl,
				headers: {'Authorization': authToken},
				data: incrementPayload
			})
			.then(function (response) {
				console.dir(response.data);
				//res.json({"success": true});
			})
			.catch(function (error) {
				console.dir("error posting increment data");
				console.dir(error);
				//res.json({"success": false});
			});

			// promo descriptions insert
	    	for ( var x = 1; x <=6; x++ ) {

	    		if ( promotionDescriptionData.promotions["promotion_" + x].barcode != "no-code" ) {

					var descriptionKey = promotionDescriptionData.promotions["promotion_" + x].mc_unique_promotion_id;
					delete promotionDescriptionData.promotions["promotion_" + x].mc_unique_promotion_id;

					var descriptionPayload = [{
				        "keys": {
				            "mc_unique_promotion_id": parseInt(descriptionKey)
				        },
				        "values": promotionDescriptionData.promotions["promotion_" + x]
			    	}];

			    	console.dir(descriptionPayload);

				   	axios({
						method: 'post',
						url: descriptionUrl,
						headers: {'Authorization': authToken},
						data: descriptionPayload
					})
					.then(function (response) {
						console.dir(response.data);
						//res.json({"success": true});
					})
					.catch(function (error) {
						console.dir("error posting description data");
						console.dir(error);
						//res.json({"success": false});
					});

	    		}

	    	}
	    	
        	var communicationCellKey = communicationCellData.communication_cell_id;
        	delete communicationCellData.communication_cell_id;
	    	// communication cell insert
			var communicationPayload = [{
		        "keys": {
		            "communication_cell_id": parseInt(communicationCellKey)
		        },
		        "values": communicationCellData
	    	}];

	    	console.dir(communicationPayload);

	    	// increments insert
		   	axios({
				method: 'post',
				url: communicationCellUrl,
				headers: {'Authorization': authToken},
				data: communicationPayload
			})
			.then(function (response) {
				console.dir(response.data);
				//res.json({"success": true});
			})
			.catch(function (error) {
				console.dir("error posting comm cell data");
				console.dir(error);
				//res.json({"success": false});
			});	

        	var communicationCellControlKey = communicationCellControlData.communication_cell_id;
        	delete communicationCellControlData.communication_cell_id;
	    	// communication cell insert
			var communicationControlPayload = [{
		        "keys": {
		            "communication_cell_id": parseInt(communicationCellControlKey)
		        },
		        "values": communicationCellControlData
	    	}];

	    	console.dir(communicationControlPayload);

	    	// increments insert
		   	axios({
				method: 'post',
				url: communicationCellUrl,
				headers: {'Authorization': authToken},
				data: communicationControlPayload
			})
			.then(function (response) {
				console.dir(response.data);
				//res.json({"success": true});
			})
			.catch(function (error) {
				console.dir("error posting comm cell data");
				console.dir(error);
				//res.json({"success": false});
			});	    	

		})	
		.catch(function (error) {
			console.dir(error);
			return error;
		});

	}).catch((error) => {
        console.dir('error is ' + error);
        //res.json({"success": false});
	});
	
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