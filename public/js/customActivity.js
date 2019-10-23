define([
    'postmonger'
], function(
    Postmonger
) {
    'use strict';

    var debug                       = true;
    var connection                  = new Postmonger.Session();
    var payload                     = {};
    var onlineSetupStepEnabled      = false;
    var instoreSetupStepEnabled     = false;
    var steps                       = [
        { "label": "Promotion Type", "key": "step0" },
        { "label": "Online Voucher Setup", "key": "step1", "active": false },
        { "label": "Instore Voucher Setup", "key": "step2", "active": false },
        { "label": "Summary", "key": "step3" }
    ];
    var currentStep = steps[0].key;

    if ( debug ) {
        console.log("Current Step is: " + currentStep);
    }

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);

    connection.on('clickedNext', onClickedNext);
    connection.on('clickedBack', onClickedBack);
    connection.on('gotoStep', onGotoStep);

    function onRender() {
        var debug = true;
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('ready');

        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');

        // access promotions and build select input
        $.ajax({url: "/dataextension/lookup/offer_types", success: function(result){

            if ( debug ) {
                console.log('lookup offers executed');
                console.log(result.items);                
            }

            var i;

            for (i = 0; i < result.items.length; ++i) {
                // do something with `substr[i]
                $("#offer_type_online").append("<option value=" + result.items[i].keys.offertype.replace(/ /g,"_") + ">" + result.items[i].keys.offertype + "</option>");
            }
        }});

        // access offer types and build select input
        $.ajax({url: "/dataextension/lookup/promotions", success: function(result){

            if ( debug ) {
                console.log('lookup promotions executed');
                console.log(result.items);               
            }

            var i;
            for (i = 0; i < result.items.length; ++i) {
                // do something with `substr[i]
                $("#instore_code").append("<option value=" + encodeURI(result.items[i].keys.discountid) + ">" + result.items[i].keys.discountid + "</option>");
            }
        }});

        $('.promotion_type').click(function() {

            var promotionType = $("input[name='promotionType']:checked").val();

            if ( debug ) {

                console.log(promotionType);

            }
            

            if ( promotionType === 'online' ) {

                if ( debug ) {
                    console.log("trigger step 1");   
                }
                
                onlineSetupStepEnabled = true; // toggle status
                steps[1].active = true; // toggle active
                instoreSetupStepEnabled = false; // toggle status
                steps[2].active = false; // toggle active

                if ( debug ) {
                    console.log(onlineSetupStepEnabled);
                    console.log(instoreSetupStepEnabled);
                    console.log(steps);                    
                }

                connection.trigger('updateSteps', steps);

            } else if ( promotionType === 'instore' ) {

                if ( debug ) {
                    console.log("trigger step 2");   
                }
                
                onlineSetupStepEnabled = false; // toggle status
                steps[1].active = false; // toggle active
                instoreSetupStepEnabled = true; // toggle status
                steps[2].active = true; // toggle active

                if ( debug ) {
                    console.log(onlineSetupStepEnabled);
                    console.log(instoreSetupStepEnabled);
                    console.log(steps);                    
                }

                connection.trigger('updateSteps', steps);

            } else if ( promotionType === 'online_instore' ) {

                if ( debug ) {
                    console.log("trigger step 1 & 2");                    
                }

                onlineSetupStepEnabled = true; // toggle status
                steps[1].active = true; // toggle active

                if ( debug ) {
                    console.log(steps);                    
                }

                instoreSetupStepEnabled = true; // toggle status
                steps[2].active = true; // toggle active

                if ( debug ) {
                    console.log(steps);
                    console.log(onlineSetupStepEnabled);
                    console.log(instoreSetupStepEnabled);
                }
                connection.trigger('updateSteps', steps);


            }

        });

        // hide the tool tips on page load
        $('.slds-popover_tooltip').hide();

        // hide error messages
        $('.slds-form-element__help').hide();

        // locate and show relevant tooltip
        $('.slds-button_icon').on("click",function(e){

            // make sure any opened tooltips are closed
            //$('.slds-popover_tooltip').hide();
            var clickedElement = $(this).attr('id').split("__");

            if ( debug ) {
                console.log(clickedElement);
            }
            
            var helpBlock = "#" + clickedElement[0] + "__help";

            if ( debug ) {
                console.log(helpBlock);    
            }
            
            $(helpBlock).show();
            setTimeout(function() {
                $(helpBlock).fadeOut();
                }, 5000);

            });

        $('#test-api-insert').click(function() {

            // comms history
            var communicationCellCodeOnline = $("#step1 .slds-form-element__control #communication_cell_code_online").val();
            var cellCodeOnline              = $("#step1 .slds-form-element__control #cell_code_online").val();
            var cellNameOnline              = $("#step1 .slds-form-element__control #cell_name_online").val();
            var campaignNameOnline          = $("#step1 .slds-form-element__control #campaign_name_online").val();
            var campaignIdOnline            = $("#step1 .slds-form-element__control #campaign_id_online").val();

            // online code setup
            var offerType                   = $("#step1 .slds-form-element__control #offer_type_online").val();
            var printAtTillOnline           = $("#step1 .slds-form-element__control #print_at_till_online").val();
            var instantInWinOnline          = $("#step1 .slds-form-element__control #instant_win_online").val();
            var mediumOnline                = $("#step1 .slds-form-element__control #medium_online").val();
            var promotionIdOnline           = $("#step1 .slds-form-element__control #promotion_id_online").val();
            var promotionGroupIdOnline      = $("#step1 .slds-form-element__control #promotion_group_id_online").val();
            var mcUniquePromotionIdOnline   = $("#step1 .slds-form-element__control #mc_unique_promotion_id_online").val();

            var row = {
                "promotion_type": "online",
                "communication_cell_code": communicationCellCodeOnline,
                "cell_code": cellCodeOnline,
                "cell_name": cellNameOnline,
                "camapign_name": campaignNameOnline,
                "campaign_id": campaignIdOnline,
                "offer_type": offerType,
                "print_at_till": printAtTillOnline,
                "instant_win": instantInWinOnline,
                "offer_channel": "Online",
                "offer_medium": mediumOnline,
                "promotion_id": promotionIdOnline,
                "promotion_group_id": promotionGroupIdOnline,
                "mc_unique_promotion_id" : mcUniquePromotionIdOnline
            }

            console.log(row);

            $.ajax({ 
                url: '/dataextension/add',
                type: 'POST',
                cache: false, 
                data: row, 
                success: function(data){
                    //console.log(data);
                }
                , error: function(jqXHR, textStatus, err){
                    console.log(err);
                }
            });

        });
    }

    function initialize (data) {
        if (data) {
            payload = data;
        }

        if ( debug ) {
            console.log("Payload is: " + payload);
        }

        var campaignKey;
        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        if ( debug ) {
            console.log("Payload arguements are: " + payload['arguements']);
        }

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        $.each(inArguments, function(index, inArgument) {
            if ( debug ) {
                console.log(inArgument);
            }
            $.each(inArgument, function(key, val) {

                if ( debug ) {
                    console.log("The key for this row is: " + key + ". The value for this row is: " + val);
                }
                if (key === 'campaignKey') {
                    campaignKey = val;
                }
            });
        });

        // If there is no message selected, disable the next button
        if ( debug ) {
            console.log("key is: " + campaignKey);
        }
        
        if (!campaignKey) {

            //showStep(null, 0);
            //connection.trigger('updateButton', { button: 'next', enabled: true });

            if ( debug ) {
                console.log("key is false " + campaignKey);
            }

        } else {

            if ( debug ) {
                console.log("Key in else is: " + campaignKey);
            }
            
            // update other summary values
            //$('#keySummary').html(campaignKey);
            //showStep(null, 2);

        }
        

    }

    /*
     * Function add data to data extension
     */

    function saveToDataExtension() {

        var promotionType = $("#step0 .slds-radio input[name='promotionType']:checked").val();
        $('#promotion_type_summary').html(promotionType);

        // specific promo data
        if ( promotionType == 'online' || promotionType == 'online_instore' ) {


            if ( debug ) {
                console.log("hit promotype online/online_instore");    
            }
            
            // comms history
            var communicationCellCodeOnline = $("#step1 .slds-form-element__control #communication_cell_code_online").val();
            var cellCodeOnline              = $("#step1 .slds-form-element__control #cell_code_online").val();
            var cellNameOnline              = $("#step1 .slds-form-element__control #cell_name_online").val();
            var campaignNameOnline          = $("#step1 .slds-form-element__control #campaign_name_online").val();
            var campaignIdOnline            = $("#step1 .slds-form-element__control #campaign_id_online").val();

            // online code setup
            var offerType                   = $("#step1 .slds-form-element__control #offer_type_online").val();
            var printAtTillOnline           = $("#step1 .slds-form-element__control #print_at_till_online").val();
            var instantWinOnline            = $("#step1 .slds-form-element__control #instant_win_online").val();
            var mediumOnline                = $("#step1 .slds-form-element__control #medium_online").val();
            var promotionIdOnline           = $("#step1 .slds-form-element__control #promotion_id_online").val();
            var promotionGroupIdOnline      = $("#step1 .slds-form-element__control #promotion_group_id_online").val();
            var mcUniquePromotionIdOnline   = $("#step1 .slds-form-element__control #mc_unique_promotion_id_online").val();

            var rowOnline = {
                "promotion_type": promotionType,
                "communication_cell_code": communicationCellCodeOnline,
                "cell_code": cellCodeOnline,
                "cell_name": cellNameOnline,
                "campaign_name": campaignNameOnline,
                "campaign_id": campaignIdOnline,
                "offer_type": offerType,
                "instore_code": "-",
                "print_at_till": printAtTillOnline,
                "instant_win": instantWinOnline,
                "offer_channel": "Online",
                "offer_medium": mediumOnline,
                "promotion_id": promotionIdOnline,
                "promotion_group_id": promotionGroupIdOnline,
                "mc_unique_promotion_id" : mcUniquePromotionIdOnline
            }

            if ( debug ) {
                console.log(rowOnline);
            }

            addRow(rowOnline);

        }

        if ( promotionType == 'instore' || promotionType == 'online_instore' ) {

            if ( debug ) {
                console.log("hit promotype instore/online_instore");
            }

            // comms instore history
            var communicationCellCodeInstore    = $("#step2 .slds-form-element__control #communication_cell_code_instore").val();
            var cellCodeInstore                 = $("#step2 .slds-form-element__control #cell_code_instore").val();
            var cellNameInstore                 = $("#step2 .slds-form-element__control #cell_name_instore").val();
            var campaignNameInstore             = $("#step2 .slds-form-element__control #campaign_name_instore").val();
            var campaignIdInstore               = $("#step2 .slds-form-element__control #campaign_id_instore").val();

            // instore voucher setup
            var printAtTillInstore              = $("#step2 .slds-form-element__control #print_at_till_instore").val();
            var instantWinInstore               = $("#step2 .slds-form-element__control #instant_win_instore").val();
            var mediumInstore                   = $("#step2 .slds-form-element__control #medium_instore").val();
            var instoreCode                     = $("#step2 .slds-form-element__control #instore_code").val();
            var promotionGroupIdInstore         = $("#step2 .slds-form-element__control #promotion_group_id_instore").val();
            var mcUniquePromotionIdInstore      = $("#step2 .slds-form-element__control #mc_unique_promotion_id_instore").val();
            
            var rowInstore = {
                "promotion_type": promotionType,
                "communication_cell_code": communicationCellCodeInstore,
                "cell_code": cellCodeInstore,
                "cell_name": cellNameInstore,
                "campaign_name": campaignNameInstore,
                "campaign_id": campaignIdInstore,
                "offer_type": "-",
                "instore_code": instoreCode,
                "print_at_till": printAtTillInstore,
                "instant_win": instantWinInstore,
                "offer_channel": "Instore",
                "offer_medium": mediumInstore,
                "promotion_id": instoreCode,
                "promotion_group_id": promotionGroupIdInstore,
                "mc_unique_promotion_id" : mcUniquePromotionIdInstore
            }

            if ( debug ) {
                console.log(rowInstore);
            }

            addRow(rowInstore);

        }    

    }

    function addRow(row) {

        try {
            $.ajax({ 
                url: '/dataextension/add',
                type: 'POST',
                cache: false, 
                data: row, 
                success: function(data){
                    if ( debug ) {
                        //console.log(data);    
                    }
                }
                , error: function(jqXHR, textStatus, err){
                    if ( debug ) {
                        console.log(err);
                    }
                }
            }); 
        } catch(e) {
            console.log(e);
        }

    }

    function updateSummaryPage() {

         // main promo data
        var promotionType = $("#step0 .slds-radio input[name='promotionType']:checked").val();
        $('#promotion_type_summary').html(promotionType);

        // specific promo data
        if ( promotionType == 'online' || promotionType == 'online_instore' ) {


            if ( debug ) {
                console.log("hit promotype online/online_instore");    
            }
            
            // comms history
            var communicationCellCodeOnline = $("#step1 .slds-form-element__control #communication_cell_code_online").val();
            var cellCodeOnline              = $("#step1 .slds-form-element__control #cell_code_online").val();
            var cellNameOnline              = $("#step1 .slds-form-element__control #cell_name_online").val();
            var campaignNameOnline          = $("#step1 .slds-form-element__control #campaign_name_online").val();
            var campaignIdOnline            = $("#step1 .slds-form-element__control #campaign_id_online").val();

            // online code setup
            var offerType                   = $("#step1 .slds-form-element__control #offer_type_online").val();
            var printAtTillOnline           = $("#step1 .slds-form-element__control #print_at_till_online").val();
            var instantWinOnline            = $("#step1 .slds-form-element__control #instant_win_online").val();
            var mediumOnline                = $("#step1 .slds-form-element__control #medium_online").val();
            var promotionIdOnline           = $("#step1 .slds-form-element__control #promotion_id_online").val();
            var promotionGroupIdOnline      = $("#step1 .slds-form-element__control #promotion_group_id_online").val();
            var mcUniquePromotionIdOnline   = $("#step1 .slds-form-element__control #mc_unique_promotion_id_online").val();

            // update online comms history summary
            $('#communication_cell_code_online_summary').html(communicationCellCodeOnline);
            $('#cell_code_online_summary').html(cellCodeOnline);
            $('#cell_name_online_summary').html(cellNameOnline);
            $('#campaign_name_online_summary').html(campaignNameOnline);
            $('#campaign_id_online_summary').html(campaignIdOnline);

            // update online voucher setup summary
            $('#offer_type_summary').html(offerType);
            $('#print_at_till_online_summary').html(printAtTillOnline);
            $('#instant_win_online_summary').html(instantInWinOnline);
            $('#medium_online_summary').html(mediumOnline);
            $('#promotion_id_online_summary').html(promotionIdOnline);
            $('#promotion_group_id_online_summary').html(promotionGroupIdOnline);
            $('#mc_unique_promotion_id_online_summary').html(mcUniquePromotionIdOnline);

            if ( promotionType == 'online' ) {

                $('#communication_cell_code_instore_summary').html("-");
                $('#cell_code_instore_summary').html("-");
                $('#cell_name_instore_summary').html("-");
                $('#campaign_name_instore_summary').html("-");
                $('#campaign_id_instore_summary').html("-");

                $('#communication_cell_code_instore_summary').html("-");            
                $('#print_at_till_instore_summary').html("-");
                $('#instant_win_instore_summary').html("-");
                $('#medium_instore_summary').html("-");
                $('#instore_code_summary').html("-");
                $('#promotion_group_id_instore_summary').html("-");
                $('#mc_unique_promotion_id_instore_summary').html("-");

            }

        } else {

        }

        if ( promotionType == 'instore' || promotionType == 'online_instore' ) {

            if ( debug ) {
                console.log("hit promotype instore/online_instore");
            }

            // comms instore history
            var communicationCellCodeInstore    = $("#step2 .slds-form-element__control #communication_cell_code_instore").val();
            var cellCodeInstore                 = $("#step2 .slds-form-element__control #cell_code_instore").val();
            var cellNameInstore                 = $("#step2 .slds-form-element__control #cell_name_instore").val();
            var campaignNameInstore             = $("#step2 .slds-form-element__control #campaign_name_instore").val();
            var campaignIdInstore               = $("#step2 .slds-form-element__control #campaign_id_instore").val();

            // instore voucher setup
            var printAtTillInstore              = $("#step2 .slds-form-element__control #print_at_till_instore").val();
            var instantWinInstore               = $("#step2 .slds-form-element__control #instant_win_instore").val();
            var mediumInstore                   = $("#step2 .slds-form-element__control #medium_instore").val();
            var instoreCode                     = $("#step2 .slds-form-element__control #instore_code").val();
            var promotionGroupIdInstore         = $("#step2 .slds-form-element__control #promotion_group_id_instore").val();
            var mcUniquePromotionIdInstore      = $("#step2 .slds-form-element__control #mc_unique_promotion_id_instore").val();

            // update instore comms history summary
            $('#communication_cell_code_instore_summary').html(communicationCellCodeInstore);
            $('#cell_code_instore_summary').html(cellCodeInstore);
            $('#cell_name_instore_summary').html(cellNameInstore);
            $('#campaign_name_instore_summary').html(campaignNameInstore);
            $('#campaign_id_instore_summary').html(campaignIdInstore);

            // update instore setup
            $('#communication_cell_code_instore_summary').html(communicationCellCodeInstore);            
            $('#print_at_till_instore_summary').html(printAtTillInstore);
            $('#instant_win_instore_summary').html(instantWinInstore);
            $('#medium_instore_summary').html(mediumInstore);
            $('#instore_code_summary').html(instoreCode);
            $('#promotion_group_id_instore_summary').html(promotionGroupIdInstore);
            $('#mc_unique_promotion_id_instore_summary').html(mcUniquePromotionIdInstore);

            //update key
            $("#onlineKeySummary").html(mcUniquePromotionIdOnline);
            $("#instoreKeySummary").html(mcUniquePromotionIdInstore);

            if ( promotionType == 'instore' ) {

                // update online comms history
                $('#communication_cell_code_online_summary').html("-");
                $('#cell_code_online_summary').html("-");
                $('#cell_name_online_summary').html("-");
                $('#campaign_name_online_summary').html("-");
                $('#campaign_id_online_summary').html("-");

                // update online voucher summary
                $('#offer_type_summary').html("-");
                $('#print_at_till_online_summary').html("-");
                $('#instant_win_online_summary').html("-");
                $('#medium_online_summary').html("-");
                $('#promotion_id_online_summary').html("-");
                $('#promotion_group_id_online_summary').html("-");
                $('#mc_unique_promotion_id_online_summary').html("-");

            }

        } else {

        }           
       
    }

    function onGetTokens (tokens) {
        // Response: tokens == { token: <legacy token>, fuel2token: <fuel api token> }
        // console.log(tokens);
    }

    function onGetEndpoints (endpoints) {
        // Response: endpoints == { restHost: <url> } i.e. "rest.s1.qa1.exacttarget.com"
        // console.log(endpoints);
    }

    function onGetSchema (payload) {
        // Response: payload == { schema: [ ... ] };
        // console.log('requestedSchema payload = ' + JSON.stringify(payload, null, 2));
    }

    function onGetCulture (culture) {
        // Response: culture == 'en-US'; culture == 'de-DE'; culture == 'fr'; etc.
        // console.log('requestedCulture culture = ' + JSON.stringify(culture, null, 2));
    }

    function onClickedNext () {

        var promotionType = $("#step0 .slds-radio input[name='promotionType']:checked").val();

        if ( debug ) {
            console.log(promotionType);
            console.log(currentStep.key);            
        }

        if ( promotionType == 'online' ) {

            if ( currentStep.key === 'step1' ) {

                updateSummaryPage();
                connection.trigger('nextStep');

            } else if ( currentStep.key === 'step2' ) {

                console.log("save to de");
                saveToDataExtension();
                setTimeout(function() {
                    save();
                }, 3000);

            } else {

                connection.trigger('nextStep');

            }

        } else if ( promotionType == 'instore' ) {

            if ( currentStep.key === 'step1' ) {

                updateSummaryPage();
                connection.trigger('nextStep');

            } else if ( currentStep.key === 'step2' ) {

                console.log("save to de");
                saveToDataExtension();
                setTimeout(function() {
                    save();
                }, 3000);
                

            } else {

                connection.trigger('nextStep');
            }

        } else if ( promotionType == 'online_instore' ) {
            
            if ( currentStep.key === 'step2') {

                updateSummaryPage();
                connection.trigger('nextStep');

            } else if ( currentStep.key === 'step3' ) {

                console.log("save to de");
                saveToDataExtension();
                setTimeout(function() {
                    save();
                }, 3000);

            } else {

                connection.trigger('nextStep');

            }

        } else {

            connection.trigger('nextStep');
        }
    }

    function onClickedBack () {
        connection.trigger('prevStep');
    }

    function onGotoStep (step) {

        if ( debug ) {
            console.log(step);
        }
        
        showStep(step);
        connection.trigger('ready');

    }

    function showStep(step, stepIndex) {

        if (stepIndex && !step) {
            step = steps[stepIndex-1];
        }

        currentStep = step;

        $('.step').hide();

        switch(currentStep.key) {
            case 'step0':
                $('#step0').show();
                connection.trigger('updateButton', {
                    button: 'next',
                    //enabled: Boolean(getMessage())
                });
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: false
                });
                break;
            case 'step1':
                $('#step1').show();
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: true
                });
                if (onlineSetupStepEnabled) {
                    connection.trigger('updateButton', {
                        button: 'next',
                        text: 'next',
                        visible: true
                    });
                } else {
                    connection.trigger('updateButton', {
                        button: 'next',
                        text: 'next',
                        visible: true
                    });
                }
                break;
            case 'step2':
                $('#step2').show();
                connection.trigger('updateButton', {
                     button: 'back',
                     visible: true
                });
                if (instoreSetupStepEnabled) {
                    connection.trigger('updateButton', {
                        button: 'next',
                        text: 'next',
                        visible: true
                    });
                } else {
                    connection.trigger('updateButton', {
                        button: 'next',
                        text: 'next',
                        visible: true
                    });
                }
                break;
            case 'step3':
                $('#step3').show();
                connection.trigger('updateButton', {
                    button: 'next',
                    text: 'done'
                    //enabled: Boolean(getMessage())
                });
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: true
                });
                break;
        }
    }

    function save() {

         // main promo data
        var promotionType = $("#step0 .slds-radio input[name='promotionType']:checked").val();
        $('#promotion_type_summary').html(promotionType);

        // specific promo data
        if ( promotionType == 'online' ) {


            if ( debug ) {
                console.log("hit promotype online/online_instore");    
            }
            
            // comms history
            var communicationCellCodeOnline = $("#step1 .slds-form-element__control #communication_cell_code_online").val();
            var cellCodeOnline              = $("#step1 .slds-form-element__control #cell_code_online").val();
            var cellNameOnline              = $("#step1 .slds-form-element__control #cell_name_online").val();
            var campaignNameOnline          = $("#step1 .slds-form-element__control #campaign_name_online").val();
            var campaignIdOnline            = $("#step1 .slds-form-element__control #campaign_id_online").val();

            // online code setup
            var offerType                   = $("#step1 .slds-form-element__control #offer_type_online").val();
            var printAtTillOnline           = $("#step1 .slds-form-element__control #print_at_till_online").val();
            var instantWinOnline            = $("#step1 .slds-form-element__control #instant_win_online").val();
            var mediumOnline                = $("#step1 .slds-form-element__control #medium_online").val();
            var promotionIdOnline           = $("#step1 .slds-form-element__control #promotion_id_online").val();
            var promotionGroupIdOnline      = $("#step1 .slds-form-element__control #promotion_group_id_online").val();
            var mcUniquePromotionIdOnline   = $("#step1 .slds-form-element__control #mc_unique_promotion_id_online").val();

            payload['arguments'].execute.inArguments = [{
                "mc_unique_promotion_id_online"     : mcUniquePromotionIdOnline,
                "communication_cell_code_online"    : communicationCellCodeOnline,
                "cell_code_online"                  : cellCodeOnline,
                "cell_name_online"                  : cellNameOnline,
                "campaign_name_online"              : campaignNameOnline,
                "campaign_id_online"                : campaignIdOnline,
                "offer_type_online"                 : offerType,
                "instore_code_online"               : "-",
                "print_at_till_online"              : printAtTillOnline,
                "instant_win_online"                : instantWinOnline,
                "offer_channel_online"              : "Online",
                "offer_medium_online"               : mediumOnline,
                "promotion_id_online"               : promotionIdOnline,
                "promotion_group_id_online"         : promotionGroupIdOnline,
                "promotion_type_online"             : promotionType
            }];

            payload.name = mcUniquePromotionIdOnline;

        } else if ( promotionType == 'instore' ) {

            if ( debug ) {
                console.log("hit promotype instore/online_instore");
            }

            // comms instore history
            var communicationCellCodeInstore    = $("#step2 .slds-form-element__control #communication_cell_code_instore").val();
            var cellCodeInstore                 = $("#step2 .slds-form-element__control #cell_code_instore").val();
            var cellNameInstore                 = $("#step2 .slds-form-element__control #cell_name_instore").val();
            var campaignNameInstore             = $("#step2 .slds-form-element__control #campaign_name_instore").val();
            var campaignIdInstore               = $("#step2 .slds-form-element__control #campaign_id_instore").val();

            // instore voucher setup
            var printAtTillInstore              = $("#step2 .slds-form-element__control #print_at_till_instore").val();
            var instantWinInstore               = $("#step2 .slds-form-element__control #instant_win_instore").val();
            var mediumInstore                   = $("#step2 .slds-form-element__control #medium_instore").val();
            var instoreCode                     = $("#step2 .slds-form-element__control #instore_code").val();
            var promotionGroupIdInstore         = $("#step2 .slds-form-element__control #promotion_group_id_instore").val();
            var mcUniquePromotionIdInstore      = $("#step2 .slds-form-element__control #mc_unique_promotion_id_instore").val();

            payload['arguments'].execute.inArguments = [{
                "mc_unique_promotion_id_instore"    : mcUniquePromotionIdInstore,
                "communication_cell_code_instore"   : communicationCellCodeInstore,
                "cell_code_instore"                 : cellCodeInstore,
                "cell_name_instore"                 : cellNameInstore,
                "campaign_name_instore"             : campaignNameInstore,
                "campaign_id_instore"               : campaignIdInstore,
                "offer_type_instore"                : "-",
                "instore_code_instore"              : instoreCode,
                "print_at_till_instore"             : printAtTillInstore,
                "instant_win_instore"               : instantWinInstore,
                "offer_channel_instore"             : "Instore",
                "offer_medium_instore"              : mediumInstore,
                "promotion_id_instore"              : instoreCode,
                "promotion_group_id_instore"        : promotionGroupIdInstore,
                "promotion_type_instore"            : promotionType
            }];

            payload.name = mcUniquePromotionIdInstore;

        } else if ( promotionType == 'online_instore' ) {

            // comms history
            var communicationCellCodeOnline = $("#step1 .slds-form-element__control #communication_cell_code_online").val();
            var cellCodeOnline              = $("#step1 .slds-form-element__control #cell_code_online").val();
            var cellNameOnline              = $("#step1 .slds-form-element__control #cell_name_online").val();
            var campaignNameOnline          = $("#step1 .slds-form-element__control #campaign_name_online").val();
            var campaignIdOnline            = $("#step1 .slds-form-element__control #campaign_id_online").val();

            // online code setup
            var offerType                   = $("#step1 .slds-form-element__control #offer_type_online").val();
            var printAtTillOnline           = $("#step1 .slds-form-element__control #print_at_till_online").val();
            var instantWinOnline          = $("#step1 .slds-form-element__control #instant_win_online").val();
            var mediumOnline                = $("#step1 .slds-form-element__control #medium_online").val();
            var promotionIdOnline           = $("#step1 .slds-form-element__control #promotion_id_online").val();
            var promotionGroupIdOnline      = $("#step1 .slds-form-element__control #promotion_group_id_online").val();
            var mcUniquePromotionIdOnline   = $("#step1 .slds-form-element__control #mc_unique_promotion_id_online").val();

            // comms instore history
            var communicationCellCodeInstore    = $("#step2 .slds-form-element__control #communication_cell_code_instore").val();
            var cellCodeInstore                 = $("#step2 .slds-form-element__control #cell_code_instore").val();
            var cellNameInstore                 = $("#step2 .slds-form-element__control #cell_name_instore").val();
            var campaignNameInstore             = $("#step2 .slds-form-element__control #campaign_name_instore").val();
            var campaignIdInstore               = $("#step2 .slds-form-element__control #campaign_id_instore").val();

            // instore voucher setup
            var printAtTillInstore              = $("#step2 .slds-form-element__control #print_at_till_instore").val();
            var instantWinInstore               = $("#step2 .slds-form-element__control #instant_win_instore").val();
            var mediumInstore                   = $("#step2 .slds-form-element__control #medium_instore").val();
            var instoreCode                     = $("#step2 .slds-form-element__control #instore_code").val();
            var promotionGroupIdInstore         = $("#step2 .slds-form-element__control #promotion_group_id_instore").val();
            var mcUniquePromotionIdInstore      = $("#step2 .slds-form-element__control #mc_unique_promotion_id_instore").val();

            payload['arguments'].execute.inArguments = [{
                "mc_unique_promotion_id_instore"    : mcUniquePromotionIdInstore,
                "communication_cell_code_instore"   : communicationCellCodeInstore,
                "cell_code_instore"                 : cellCodeInstore,
                "cell_name_instore"                 : cellNameInstore,
                "campaign_name_instore"             : campaignNameInstore,
                "campaign_id_instore"               : campaignIdInstore,
                "offer_type_instore"                : "-",
                "instore_code_instore"              : instoreCode,
                "print_at_till_instore"             : printAtTillInstore,
                "instant_win_instore"               : instantWinInstore,
                "offer_channel_instore"             : "Instore",
                "offer_medium_instore"              : mediumInstore,
                "promotion_id_instore"              : instoreCode,
                "promotion_group_id_instore"        : promotionGroupIdInstore,
                "promotion_type_instore"            : promotionType,
                "mc_unique_promotion_id_online"     : mcUniquePromotionIdOnline,
                "communication_cell_code_online"    : communicationCellCodeOnline,
                "cell_code_online"                  : cellCodeOnline,
                "cell_name_online"                  : cellNameOnline,
                "campaign_name_online"              : campaignNameOnline,
                "campaign_id_online"                : campaignIdOnline,
                "offer_type_online"                 : offerType,
                "instore_code_online"               : "-",
                "print_at_till_online"              : printAtTillOnline,
                "instant_win_online"                : instantWinOnline,
                "offer_channel_online"              : "Online",
                "offer_medium_online"               : mediumOnline,
                "promotion_id_online"               : promotionIdOnline,
                "promotion_group_id_online"         : promotionGroupIdOnline,
                "promotion_type_online"             : promotionType
            }];

            payload.name = mcUniquePromotionIdOnline + "_" + mcUniquePromotionIdInstore;

        } 

        // 'payload' is initialized on 'initActivity' above.
        // Journey Builder sends an initial payload with defaults
        // set by this activity's config.json file.  Any property
        // may be overridden as desired.

        payload['metaData'].isConfigured = true;

        connection.trigger('updateActivity', payload);

        if ( debug ) {
            console.log(payload); 
        }
    }

});
