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
            console.log('lookup offers executed');
            console.log(result.items);
            var i;
            for (i = 0; i < result.items.length; ++i) {
                // do something with `substr[i]
                $("#offer_type_online").append("<option value=" + encodeURI(result.items[i].keys.offertype) + ">" + result.items[i].keys.offertype + "</option>");
            }
        }});

        // access offer types and build select input
        $.ajax({url: "/dataextension/lookup/promotions", success: function(result){
            console.log('lookup promotions executed');
            console.log(result.items);
            var i;
            for (i = 0; i < result.items.length; ++i) {
                // do something with `substr[i]
                $("#instore_code").append("<option value=" + encodeURI(result.items[i].keys.discountid) + ">" + result.items[i].keys.discountid + "</option>");
            }
        }});

        $('.promotion_type').click(function() {

            var promotionType = $("input[name='promotionType']:checked").val();

            console.log(promotionType);

            if ( promotionType === 'online' ) {

                console.log("trigger step 1");
                onlineSetupStepEnabled = true; // toggle status
                steps[1].active = true; // toggle active
                instoreSetupStepEnabled = false; // toggle status
                steps[2].active = false; // toggle active
                console.log(onlineSetupStepEnabled);
                console.log(instoreSetupStepEnabled);
                console.log(steps);
                connection.trigger('updateSteps', steps);

            } else if ( promotionType === 'instore' ) {

                console.log("trigger step 2");
                onlineSetupStepEnabled = false; // toggle status
                steps[1].active = false; // toggle active
                instoreSetupStepEnabled = true; // toggle status
                steps[2].active = true; // toggle active
                console.log(onlineSetupStepEnabled);
                console.log(instoreSetupStepEnabled);
                console.log(steps);
                connection.trigger('updateSteps', steps);

            } else if ( promotionType === 'online_instore' ) {

                console.log("trigger step 1 & 2");
                onlineSetupStepEnabled = true; // toggle status
                steps[1].active = true; // toggle active
                console.log(steps);
                instoreSetupStepEnabled = true; // toggle status
                steps[2].active = true; // toggle active
                console.log(steps);
                console.log(onlineSetupStepEnabled);
                console.log(instoreSetupStepEnabled);
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
            console.log(clickedElement);
            var helpBlock = "#" + clickedElement[0] + "__help";
            console.log(helpBlock);
            $(helpBlock).show();
            setTimeout(function() {
                $(helpBlock).fadeOut();
                }, 5000);

            });

        $('#test-api-insert').click(function() {

            var campaign    = getInputValue('#campaign', 'value');
            var channel     = getInputValue('#channel', 'value');
            var activity    = getInputValue('#activity', 'value');
            var promotion   = getInputValue('#promotion', 'value');
            var id          = campaign + "-" + activity + "-" + channel + "-" + promotion;

            console.log("campaign = " + campaign +", channel = " + channel + ", activity = " + activity + ", promotion = " + promotion + ", id = " + id);
            
            var row = {
                "id": id,
                "campaign": campaign,
                "channel": channel,
                "activity": activity,
                "promotion": promotion
            };

            console.log(row);

            $.ajax({ 
                url: '/dataextension/add',
                type: 'POST',
                cache: false, 
                data: row, 
                success: function(data){
                    console.log(data);
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
        
        /**
        if (!campaignKey) {

            showStep(null, 1);
            connection.trigger('updateButton', { button: 'next', enabled: true });

            if ( debug ) {
                console.log("You should be dumped on step1 and be forced to input values");
            }

        } else {

            if ( debug ) {
                console.log("Key in else is: " + campaignKey);
            }
            
            // update other summary values
            $('#keySummary').html(campaignKey);
            showStep(null, 2);

        }
        */

    }

    /*
     * Function add data to data extension
     */

    function saveToDataExtension() {

        // main promo data
        var promotionType       = $("#step0 .slds-radio input[name='promotionType']:checked").val();
        var targetDataExtension = $("#step0 #target_data_extension").val();

        // specific promo data
        if ( promotionType == 'online' || promotionType == 'online_instore' ) {

            var communicationCellCodeOnline = $("#step1 input[name='promotionType']:checked").val();
            var offerType                   = $("#step1 .slds-form-element__control #offer_type").val();
            var printAtTillOnline           = $("#step1 .slds-form-element__control #print_at_till_online").val();
            var instantInWinOnline          = $("#step1 .slds-form-element__control #instant_win_online").val();
            var mediumOnline                = $("#step1 .slds-form-element__control #medium_online").val();
            var promotionIdOnline           = $("#step1 .slds-form-element__control #promotion_id_online").val();
            var promotionGroupIdOnline      = $("#step1 .slds-form-element__control #promotion_group_id_online").val();
            var mcUniquePromotionIdOnline   = $("#step1 .slds-form-element__control #mc_unique_promotion_id_online").val();

            row = {
                "promotion_type": promotionType,
                "target_data_extension": targetDataExtension,
                "communication_cell_code": communicationCellCodeOnline,
                "offer_type": offerType,
                "print_at_till": printAtTillOnline,
                "instant_win": instantInWinOnline,
                "offer_channel": 'Online',
                "offer_medium": medium_online,
                "promotion_id": promotion_id_online,
                "promotion_group_id": promotionGroupIdOnline,
                "mc_unique_promotion_id" : mcUniquePromotionIdOnline
            }

            console.log(row);

            addRow(row);

        } else if ( promotionType == 'instore' || promotionType == 'online_instore' ) {

            var communicationCellCodeInstore    = $("#step2 .slds-form-element__control #communication_cell_code_instore").val();
            var printAtTillInstore              = $("#step2 .slds-form-element__control #print_at_till_instore").val();
            var instantWinInstore               = $("#step2 .slds-form-element__control #instant_win_instore").val();
            var mediumInstore                   = $("#step2 .slds-form-element__control #medium_instore").val();
            var instoreCode                     = $("#step2 .slds-form-element__control #instore_code").val();
            var promotionGroupIdInstore         = $("#step2 .slds-form-element__control #promotion_group_id_instore").val();
            var mcUniquePromotionIdInstore      = $("#step2 .slds-form-element__control #mc_unique_promotion_id_instore").val();

            row = {
                "promotion_type": promotionType,
                "target_data_extension": targetDataExtension,
                "communication_cell_code": communicationCellCodeInstore,
                "print_at_till": printAtTillInstore,
                "instant_win": instantInWinInstore,
                "offer_channel": 'Store',
                "offer_medium": mediumInstore,
                "instore_code": instoreCode,
                "promotion_group_id": promotionGroupIdInstore,
                "mc_unique_promotion_id": mcUniquePromotionIdInstore
            }

            console.log(row);

            addRow(row);
        }
    }

    function addRow(row) {
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
    }

    function updateSummaryPage() {

         // main promo data
        var promotionType       = $("#step0 .slds-radio input[name='promotionType']:checked").val();
        var targetDataExtension = $("#step0 #target_data_extension").val();
        $('#promotion_type_summary').html(promotionType);
        $('#target_data_extension_summary').html(targetDataExtension);

        // specific promo data
        if ( promotionType == 'online' || promotionType == 'online_instore' ) {

            var communicationCellCodeOnline = $("#step1 input[name='promotionType']:checked").val();
            var offerType                   = $("#step1 .slds-form-element__control #offer_type").val();
            var printAtTillOnline           = $("#step1 .slds-form-element__control #print_at_till_online").val();
            var instantInWinOnline          = $("#step1 .slds-form-element__control #instant_win_online").val();
            var mediumOnline                = $("#step1 .slds-form-element__control #medium_online").val();
            var promotionIdOnline           = $("#step1 .slds-form-element__control #promotion_id_online").val();
            var promotionGroupIdOnline      = $("#step1 .slds-form-element__control #promotion_group_id_online").val();
            var mcUniquePromotionIdOnline   = $("#step1 .slds-form-element__control #mc_unique_promotion_id_online").val();

            $('#communication_cell_code_online_summary').html(communicationCellCodeOnline);            
            $('#offer_type_summary').html(offerType);
            $('#print_at_till_online_summary').html(printAtTillOnline);
            $('#instant_win_online_summary').html(instantInWinOnline);
            $('#medium_online_summary').html(mediumOnline);
            $('#promotion_id_online_summary').html(promotionIdOnline);
            $('#promotion_group_id_online_summary').html(promotionGroupIdOnline);
            $('#mc_unique_promotion_id_online_summary').html(mcUniquePromotionIdOnline);

            if ( promotionType == 'online' ) {

                $('#communication_cell_code_instore_summary').html("-");            
                $('#print_at_till_instore_summary').html("-");
                $('#instant_win_instore_summary').html("-");
                $('#medium_instore_summary').html("-");
                $('#instore_code_summary').html("-");
                $('#promotion_group_id_instore_summary').html("-");
                $('#mc_unique_promotion_id_instore_summary').html("-");

            }

        } else if ( promotionType == 'instore' || promotionType == 'online_instore' ) {

            var communicationCellCodeInstore    = $("#step2 .slds-form-element__control #communication_cell_code_instore").val();
            var printAtTillInstore              = $("#step2 .slds-form-element__control #print_at_till_instore").val();
            var instantWinInstore               = $("#step2 .slds-form-element__control #instant_win_instore").val();
            var mediumInstore                   = $("#step2 .slds-form-element__control #medium_instore").val();
            var instoreCode                     = $("#step2 .slds-form-element__control #instore_code").val();
            var promotionGroupIdInstore         = $("#step2 .slds-form-element__control #promotion_group_id_instore").val();
            var mcUniquePromotionIdInstore      = $("#step2 .slds-form-element__control #mc_unique_promotion_id_instore").val();

            $('#communication_cell_code_instore_summary').html(communicationCellCodeInstore);            
            $('#print_at_till_instore_summary').html(printAtTillInstore);
            $('#instant_win_instore_summary').html(instantInWinInstore);
            $('#medium_instore_summary').html(mediumInstore);
            $('#instore_code_summary').html(instoreCode);
            $('#promotion_group_id_instore_summary').html(promotionGroupIdInstore);
            $('#mc_unique_promotion_id_instore_summary').html(mcUniquePromotionIdInstore);

            if ( promotionType == 'instore' ) {

                $('#communication_cell_code_online_summary').html("-");            
                $('#offer_type_summary').html("-");
                $('#print_at_till_online_summary').html("-");
                $('#instant_win_online_summary').html("-");
                $('#medium_online_summary').html("-");
                $('#promotion_id_online_summary').html("-");
                $('#promotion_group_id_online_summary').html("-");
                $('#mc_unique_promotion_id_online_summary').html("-");
                
            }

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

        if ( steps[2].active && !steps[3].active ) {
            if ( currentStep.key === 'step1') {
                updateSummaryPage();
            } else if ( currentStep.key === 'step2') {
                saveToDataExtension();
                save();               
            } else {
                connection.trigger('nextStep');
            }
        } else if ( steps[2].active && steps[3].active ) {
            if ( currentStep.key === 'step2') {
                updateSummaryPage();
            } else if ( currentStep.key === 'step3') {
                saveToDataExtension();
                save();
            } else {
                connection.trigger('nextStep');
            }

        }
    }

    function onClickedBack () {
        connection.trigger('prevStep');
    }

    function onGotoStep (step) {
        console.log(step)
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

        var campaign    = getInputValue('#campaign', 'value');
        var channel     = getInputValue('#channel', 'value');
        var activity    = getInputValue('#activity', 'value');
        var promotion   = getInputValue('#promotion', 'value');
        var id          = campaign + "-" + activity + "-" + channel + "-" + promotion;
        var name = id;
        var value = id;

        // 'payload' is initialized on 'initActivity' above.
        // Journey Builder sends an initial payload with defaults
        // set by this activity's config.json file.  Any property
        // may be overridden as desired.
        payload.name = name;

        payload['arguments'].execute.inArguments = [{ "campaignKey": value }];

        payload['metaData'].isConfigured = true;

        connection.trigger('updateActivity', payload);

        if ( debug ) {
            console.log(payload); 
        }
    }

});
