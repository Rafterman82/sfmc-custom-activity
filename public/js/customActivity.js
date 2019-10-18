define([
    'postmonger'
], function(
    Postmonger
) {
    'use strict';

    var debug = true;
    var connection = new Postmonger.Session();
    var payload = {};
    var steps = [ // initialize to the same value as what's set in config.json for consistency
        { "label": "Step 1", "key": "step1" },
        { "label": "Step 2", "key": "step2" }
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

    function getInputValue(selector, type) {
        if ( type == 'value') {
            console.log($(selector).val().trim());
            return $(selector).val().trim();
        }
    }

    function onRender() {
        var debug = true;
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('ready');

        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');

        // access promotions and build select input
        $.ajax({url: "/dataextension/lookup", success: function(result){
            console.log('lookup executed');
            console.log(result.items);
            var i;
            for (i = 0; i < result.items.length; ++i) {
                // do something with `substr[i]
                $("#promotion").append("<option value=" + encodeURI(result.items[i].keys.discountid) + ">" + result.items[i].keys.discountid + "</option>");
            }
        }});

        // hide tooltips
        $("#promotion__help__block").hide();
        $("#campaign__help__block").hide();
        $("#activity__help__block").hide();
        $("#channel__help__block").hide();

        // hide error message
        $("#form-error__promotion").hide();
        $("#form-error__campaign").hide();
        $("#form-error__activity").hide();
        $("#form-error__channel").hide();

        // error logic

        $('#campaign').blur(function() {
            if ( debug ) {
                console.log("Blur changed for campaign name");
            }
            
            var campaignValue = getInputValue('#campaign', 'value');

            if ( !campaignValue ) {

                $('#form_element__campaign').addClass('slds-has-error');
                $('#form-error__campaign').show();

            } else {

                $('#form_element__campaign').removeClass('slds-has-error');
                $('#form-error__campaign').hide();
                $('#campaignSummary').html(campaignValue);

                if ( debug ) {
                    console.log("campaign name changed" + campaignValue);
                }
            }
        });

        $('#promotion').blur(function() {
            if ( debug ) {
                console.log("Blur changed for promotions");
            }
            
            var promotionValue = getInputValue('#promotion', 'value');

            if ( !promotionValue || promotionValue == 'notselected') {

                $('#form_element__promotion').addClass('slds-has-error');
                $('#form-error__promotion').show();

            } else {

                $('#form_element__promotion').removeClass('slds-has-error');
                $('#form-error__promotion').hide();
                $('#promotionSummary').html(promotionValue);

                if ( debug ) {
                    console.log("promotions changed" + promotionValue);
                }
            }
        });

        $('#channel').blur(function() {
            if ( debug ) {
                console.log("Blur changed for channel");
            }
            
            var channelValue = getInputValue('#channel', 'value');

            if ( !channelValue  || channelValue == 'notselected') {

                $('#form_element__channel').addClass('slds-has-error');
                $('#form-error__channel').show();

            } else {

                $('#form_element__channel').removeClass('slds-has-error');
                $('#form-error__channel').hide();
                $('#channelSummary').html(channelValue);

                if ( debug ) {
                    console.log("channel changed" + channelValue);
                }
            }
        });

        $('#activity').blur(function() {
            if ( debug ) {
                console.log("Blur changed for activity");
            }
            
            var activityValue = getInputValue('#activity', 'value');

            if ( !activityValue ) {

                $('#form_element__activity').addClass('slds-has-error');
                $('#form-error__activity').show();

            } else {

                $('#form_element__activity').removeClass('slds-has-error');
                $('#form-error__activity').hide();
                $('#activitySummary').html(activityValue);

                if ( debug ) {
                    console.log("activity changed" + activityValue);
                }
            }
        });

        // hide all tooltips
        $('.slds-popover_tooltip').hide();

        // tool tip controls
        $("#promotion__help__button").click(function(e) {
            $('.slds-popover_tooltip').hide();
            $("#promotion__help__block").show();
            e.stopPropagation(); //stops click event from reaching document
        });

        $("#campaign__help__button").click(function(e) {
            $('.slds-popover_tooltip').hide();
            $("#campaign__help__block").show();
            e.stopPropagation(); //stops click event from reaching document
        });


        $("#activity__help__button").click(function(e) {
            $('.slds-popover_tooltip').hide();
            $("#activity__help__block").show();
            e.stopPropagation(); //stops click event from reaching document
        });


        $("#channel__help__button").click(function(e) {
            $('.slds-popover_tooltip').hide();
            $("#channel__help__block").show();
            e.stopPropagation(); //stops click event from reaching document
        });

        $("body").click(function() {
            $('.slds-popover_tooltip').hide();
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
            
            $('#keySummary').html(campaignKey);
            showStep(null, 2);

        }

    }

    /*
     * Function add data to data extension
     */

    function saveToDataExtension() {
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
                //console.log(data);
            }
            , error: function(jqXHR, textStatus, err){
                console.log(err);
            }
        });        
    }

    function updateSummaryPage() {

        var campaign    = getInputValue('#campaign', 'value');
        var channel     = getInputValue('#channel', 'value');
        var activity    = getInputValue('#activity', 'value');
        var promotion   = getInputValue('#promotion', 'value');
        var id          = campaign + "-" + activity + "-" + channel + "-" + promotion;
        $("#keySummary").html(decodeURI(id));     
       
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
        if ( currentStep.key === 'step2' ) {
            save();
        } else {
            saveToDataExtension();
            updateSummaryPage();
            connection.trigger('nextStep');
        }
    }

    function onClickedBack () {
        connection.trigger('prevStep');
    }

    function onGotoStep (step) {
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
            case 'step1':
                $('#step1').show();
                connection.trigger('updateButton', {
                    button: 'next',
                    enabled: true
                });
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: false
                });
                break;
            case 'step2':
                $('#step2').show();
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: true
                });
                connection.trigger('updateButton', {
                    button: 'next',
                    text: 'done',
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
