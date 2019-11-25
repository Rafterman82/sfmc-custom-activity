define([
    'postmonger'
], function(
    Postmonger
) {
    'use strict';

    var debug                       = true;
    var stepToValidate;
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
    var stepValidation = false;

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

        lookupPromos();
        lookupTemplates();
        lookupVoucherPots();
        lookupControlGroups();
        loadEvents();
    }

    function initialize (data) {
        
        if (data) {
            payload = data;
        }

        if ( debug ) {
            console.log("Payload is: " + payload);
        }

        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        if ( debug ) {
            console.log("Payload arguements are: " + payload['arguments']);
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

            });
        });
        
    }

    function loadEvents() {

        // render relevant steps based on input
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

        $('.online_promotion_type').click(function() {

            var onlinePromotionType = $("input[name='onlinePromotionType']:checked").val();
            if ( onlinePromotionType == 'global' ) {

                $("#show_unique_codes").hide();
                $("#show_global_codes").show();

            } else {

                $("#show_unique_codes").show();
                $("#show_global_codes").hide();


            }

        });

        // validate single field
        $("input").blur(function() {

            validateSingleField($(this));

        });
        $("input").change(function() {

            validateSingleField($(this));

        });

        $("#email_template").change(function() {

            if ( $(this).val() == "no-template") {
                $("#email_template_select").addClass("slds-has-error");
                $("#form-error__email_template").html("You must select a template.");
                $("#form-error__email_template").show();
            } else {
                $("#email_template_select").removeClass("slds-has-error");
                $("#form-error__email_template".hide();                
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

        $("#radio-1").click();

    }

    function prePopulateFields(prePop, inArguments) {

        $.each(inArguments, function(index, inArgument) {
            $.each(inArgument, function(key, val) {

            });
        });
    }

    function validateStep(stepToValidate) {

        if (debug) {
            console.log("Step that will be validated");
        }

        if ( $("#step" + stepToValidate).find('.slds-has-error').length > 0 ) {

            return false;

        } else {

            return true;

        }
        
    }

    function validateSingleField(element) {

        // your code
        console.log($(element).val());
        console.log($(element).attr("data-attribute-length"));
        console.log($(element).attr("data-attribute-type"));

        var elementValue = $(element).val();
        var elementId = $(element).attr('id');
        var elementLength = $(element).attr("data-attribute-length");
        var elementType = $(element).attr("data-attribute-type");


        if ( elementType == 'int' ) {

            // value must be number
            if ( !isWholeNumber(elementValue) && elementValue <= 0 && elementValue.length <= elementLength) {

                $(element).parents().eq(1).addClass("slds-has-error");
                $("#form-error__" + elementId).html("This value must be a number. Less than 30 digits and cannot be empty");
                $("#form-error__" + elementId).show();

            } else {

                console.log("hiding error");
                $("#form-error__" + elementId).hide();
                $(element).parents().eq(1).removeClass("slds-has-error");

            }

        } else if ( elementType == 'varchar' ) {

            // value must be varchar
            if ( elementValue.length >= elementLength || isEmpty(elementValue) ) {

                console.log("value is empty or greater than required length")
                // value must be less than length
                $(element).parents().eq(1).addClass("slds-has-error");
                $("#form-error__" + elementId).html("Value must be less than " + elementLength +" characters and cannot be empty");
                $("#form-error__" + elementId).show();
            
            } else {

                console.log("hiding error");
                $("#form-error__" + elementId).hide();
                $(element).parents().eq(1).removeClass("slds-has-error");

            }

        }

    }


    function isEmpty (value) {
        return ((value == null) || 
                (value.hasOwnProperty('length') && 
                value.length === 0) || 
                (value.constructor === Object && 
                Object.keys(value).length === 0) 
            );
    }

    function isWholeNumber(num) {
        return num === Math.round(num);
    }

    function isTwoValuesUsed(voucherPotValue, globalOnlineCodeValue) {
        return voucherPotValue != '' && globalOnlineCodeValue != '';
    }

    function isValidInstoreCode(selectedCode) {
        return selectedCode !== 'Please select a code' && selectedCode != '';
    }

    function lookupPromos() {

        // access offer types and build select input
        $.ajax({url: "/dataextension/lookup/promotions", success: function(result){

            if ( debug ) {
                console.log('lookup promotions executed');
                console.log(result.items);               
            }

            var i;
            for (i = 0; i < result.items.length; ++i) {
                if ( debug ) {
                    console.log(result.items[i].keys.discountid);
                }
                // do something with `substr[i]
                $("#instore_code_1_instore").append("<option value=" + encodeURI(result.items[i].keys.discountid) + ">" + result.items[i].keys.discountid + "</option>");
                $("#instore_code_2_instore").append("<option value=" + encodeURI(result.items[i].keys.discountid) + ">" + result.items[i].keys.discountid + "</option>");
                $("#instore_code_3_instore").append("<option value=" + encodeURI(result.items[i].keys.discountid) + ">" + result.items[i].keys.discountid + "</option>");
            }
        }});
    }

    function lookupTemplates() {

        // access offer types and build select input
        $.ajax({url: "/dataextension/lookup/templates", success: function(result){

            if ( debug ) {
                console.log('lookup templates executed');
                console.log(result.items);               
            }

            var i;
            for (i = 0; i < result.items.length; ++i) {
                if ( debug ) {
                    console.log(result.items[i]);
                }
                // do something with substr[i]
                $("#email_template").append("<option value=" + encodeURI(result.items[i].name) + ">" + result.items[i].name + "</option>");
            }
        }});
    }

    function lookupControlGroups() {

        // access offer types and build select input
        $.ajax({url: "/dataextension/lookup/controlgroups", success: function(result){

            if ( debug ) {
                console.log('lookup control groups executed');
                console.log(result.items);               
            }

            var i;
            for (i = 0; i < result.items.length; ++i) {
                if ( debug ) {
                    console.log(result.items[i]);
                }
                // do something with substr[i]
                $("#control_group").append("<option value=" + encodeURI(result.items[i].values.dataextensionname) + ">" + result.items[i].values.dataextensionname + "</option>");
            }
        }});
    }

    function lookupVoucherPots() {

        // access offer types and build select input
        $.ajax({url: "/dataextension/lookup/voucherpots", success: function(result){

            if ( debug ) {
                console.log('lookup voucher pots executed');
                console.log(result.items);               
            }

            var i;
            for (i = 0; i < result.items.length; ++i) {
                if ( debug ) {
                    console.log(result.items[i]);
                }
                // do something with substr[i]
                $("#voucher_pot_1").append("<option value=" + encodeURI(result.items[i].values.dataextensionname) + ">" + result.items[i].values.dataextensionname + "</option>");
                $("#voucher_pot_2").append("<option value=" + encodeURI(result.items[i].values.dataextensionname) + ">" + result.items[i].values.dataextensionname + "</option>");
                $("#voucher_pot_3").append("<option value=" + encodeURI(result.items[i].values.dataextensionname) + ">" + result.items[i].values.dataextensionname + "</option>");
            }
        }});
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
            var campaignCodeOnline          = $("#step1 .slds-form-element__control #campaign_code_online").val();

            // online code setup
            var globalCodeOnline            = $("#step1 .slds-form-element__control #global_code_online").val();
            var voucherPotOnline            = $("#step1 .slds-form-element__control #voucher_pot_online").val();
            var printAtTillOnline           = $("#step1 .slds-form-element__control #print_at_till_online").val();
            var instantWinOnline            = $("#step1 .slds-form-element__control #instant_win_online").val();
            var mediumOnline                = $("#step1 .slds-form-element__control #offer_medium_online").val();
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
                "campaign_code": campaignCodeOnline,
                "voucher_pot": voucherPotOnline,
                "code": globalCodeOnline,
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
            var campaignCodeInstore             = $("#step2 .slds-form-element__control #campaign_code_instore").val();

            // instore voucher setup
            var printAtTillInstore              = $("#step2 .slds-form-element__control #print_at_till_instore").val();
            var instantWinInstore               = $("#step2 .slds-form-element__control #instant_win_instore").val();
            var mediumInstore                   = $("#step2 .slds-form-element__control #offer_medium_instore").val();
            var instoreCode                     = $("#step2 .slds-form-element__control #instore_code_instore").val();
            var promotionGroupIdInstore         = $("#step2 .slds-form-element__control #promotion_group_id_instore").val();
            var promotionIdInstore              = $("#step2 .slds-form-element__control #promotion_id_instore").val();
            var mcUniquePromotionIdInstore      = $("#step2 .slds-form-element__control #mc_unique_promotion_id_instore").val();
            
            var rowInstore = {
                "promotion_type": promotionType,
                "communication_cell_code": communicationCellCodeInstore,
                "cell_code": cellCodeInstore,
                "cell_name": cellNameInstore,
                "campaign_name": campaignNameInstore,
                "campaign_id": campaignIdInstore,
                "campaign_code": campaignCodeInstore,
                "voucher_pot": "-",
                "code": instoreCode,
                "print_at_till": printAtTillInstore,
                "instant_win": instantWinInstore,
                "offer_channel": "Instore",
                "offer_medium": mediumInstore,
                "promotion_id": promotionIdInstore,
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

    function toggleStepError(errorStep, errorStatus) {

        if ( debug ) {
            console.log("error step is " + errorStep + " and error status is " + errorStatus);
        }

        if ( errorStatus == "show" ) {
            $("#step" + errorStep + "alert").show();
        } else {
            $("#step" + errorStep + "alert").hide();
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
            console.log("next clicked");           
        }

        if ( promotionType == 'online' ) {

            if ( currentStep.key === 'step0') {

                if ( validateStep(0) ) {

                    if ( debug ) {
                        console.log("step 0 validated");           
                    }                    

                    toggleStepError(0, "hide");
                    connection.trigger('nextStep');

                } else {

                    if ( debug ) {
                        console.log("step 0 not validated");           
                    }  

                    connection.trigger('ready');
                    toggleStepError(0, "show");

                }

            } else if ( currentStep.key === 'step1' ) {

                if ( validateStep(1) ) {

                    if ( debug ) {
                        console.log("step 0 validated");           
                    }                    

                    toggleStepError(1, "hide");
                    connection.trigger('nextStep');

                } else {

                    if ( debug ) {
                        console.log("step 0 not validated");           
                    }  

                    connection.trigger('ready');
                    toggleStepError(1, "show");

                }

            } else if ( currentStep.key === 'step3' ) {

                console.log("save to de");
                saveToDataExtension();
                setTimeout(function() {
                    save();
                }, 3000);

            } else {

                connection.trigger('nextStep');

            }

        } else if ( promotionType == 'instore' ) {

            if ( currentStep.key === 'step0') {

                if ( validateStep(0) ) {

                    if ( debug ) {
                        console.log("step 0 validated");           
                    }                    

                    toggleStepError(0, "hide");
                    connection.trigger('nextStep');

                } else {

                    if ( debug ) {
                        console.log("step 0 not validated");           
                    }  

                    connection.trigger('ready');
                    toggleStepError(0, "show");

                }

            } else if ( currentStep.key === 'step2' ) {

                if ( validateStep(2) ) {

                    if ( debug ) {
                        console.log("step 0 validated");           
                    }                    

                    toggleStepError(2, "hide");
                    connection.trigger('nextStep');

                } else {

                    if ( debug ) {
                        console.log("step 0 not validated");           
                    }  

                    connection.trigger('ready');
                    toggleStepError(2, "show");

                }

            } else if ( currentStep.key === 'step3' ) {

                console.log("save to de");
                saveToDataExtension();
                setTimeout(function() {
                    save();
                }, 3000);      

            } else {

                connection.trigger('nextStep');
            }

        } else if ( promotionType == 'online_instore' ) {
            
            
            if ( currentStep.key === 'step0') {

                if ( validateStep(0) ) {

                    if ( debug ) {
                        console.log("step 0 validated");           
                    }                    

                    toggleStepError(0, "hide");
                    connection.trigger('nextStep');

                } else {

                    if ( debug ) {
                        console.log("step 0 not validated");           
                    }  

                    connection.trigger('ready');
                    toggleStepError(0, "show");

                }

            } else if ( currentStep.key === 'step2') {

                if ( validateStep(2) ) {

                    if ( debug ) {
                        console.log("step 0 validated");           
                    }                    

                    toggleStepError(2, "hide");
                    connection.trigger('nextStep');

                } else {

                    if ( debug ) {
                        console.log("step 0 not validated");           
                    }  

                    connection.trigger('ready');
                    toggleStepError(2, "show");

                }

            } else if ( currentStep.key === 'step3' ) {

                console.log("save to de");
                saveToDataExtension();
                setTimeout(function() {
                    save();
                }, 3000);

            } else if ( currentStep.key === 'step1' ) {

                if ( validateStep(1) ) {

                    if ( debug ) {
                        console.log("step 0 validated");           
                    }                    

                    toggleStepError(1, "hide");
                    connection.trigger('nextStep');

                } else {

                    if ( debug ) {
                        console.log("step 0 not validated");           
                    }  

                    connection.trigger('ready');
                    toggleStepError(1, "show");

                }

            } else {

                connection.trigger('nextStep');

            }

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

        if ( debug ) {
            console.log(step);
            console.log(stepIndex);
        }

        if (stepIndex && !step) {
            step = steps[stepIndex];
        }

        currentStep = step;

        if ( debug ) {
            console.log(currentStep);
        }

        $('.step').hide();

        switch(currentStep.key) {
            case 'step0':
                if ( debug ) {
                    console.log("step0 case hit");
                }
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

    function updateSummaryPage() {   
       
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
            var campaignCodeOnline          = $("#step1 .slds-form-element__control #campaign_code_online").val();

            // online code setup
            var voucherPotOnline            = $("#step1 .slds-form-element__control #voucher_pot_online").val();
            var globalCodeOnline            = $("#step1 .slds-form-element__control #global_code_online").val();
            var printAtTillOnline           = $("#step1 .slds-form-element__control #print_at_till_online").val();
            var instantWinOnline            = $("#step1 .slds-form-element__control #instant_win_online").val();
            var mediumOnline                = $("#step1 .slds-form-element__control #offer_medium_online").val();
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
                "campaign_code_online"              : campaignCodeOnline,
                "voucher_pot_online"                : voucherPotOnline,
                "global_code_online"                : globalCodeOnline,
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
            var campaignCodeInstore             = $("#step2 .slds-form-element__control #campaign_code_instore").val();

            // instore voucher setup
            var printAtTillInstore              = $("#step2 .slds-form-element__control #print_at_till_instore").val();
            var instantWinInstore               = $("#step2 .slds-form-element__control #instant_win_instore").val();
            var mediumInstore                   = $("#step2 .slds-form-element__control #offer_medium_instore").val();
            var instoreCode                     = $("#step2 .slds-form-element__control #instore_code_instore").val();
            var promotionIdInstore              = $("#step2 .slds-form-element__control #promotion_id_instore").val();
            var promotionGroupIdInstore         = $("#step2 .slds-form-element__control #promotion_group_id_instore").val();
            var mcUniquePromotionIdInstore      = $("#step2 .slds-form-element__control #mc_unique_promotion_id_instore").val();

            payload['arguments'].execute.inArguments = [{
                "mc_unique_promotion_id_instore"    : mcUniquePromotionIdInstore,
                "communication_cell_code_instore"   : communicationCellCodeInstore,
                "cell_code_instore"                 : cellCodeInstore,
                "cell_name_instore"                 : cellNameInstore,
                "campaign_name_instore"             : campaignNameInstore,
                "campaign_id_instore"               : campaignIdInstore,
                "campaign_code_instore"             : campaignCodeInstore,
                "instore_code_instore"              : instoreCode,
                "print_at_till_instore"             : printAtTillInstore,
                "instant_win_instore"               : instantWinInstore,
                "offer_channel_instore"             : "Instore",
                "offer_medium_instore"              : mediumInstore,
                "promotion_id_instore"              : promotionIdInstore,
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
            var campaignCodeOnline          = $("#step1 .slds-form-element__control #campaign_code_online").val();

            // online code setup
            var voucherPotOnline            = $("#step1 .slds-form-element__control #voucher_pot_online").val();
            var globalCodeOnline            = $("#step1 .slds-form-element__control #global_code_online").val();
            var printAtTillOnline           = $("#step1 .slds-form-element__control #print_at_till_online").val();
            var instantWinOnline            = $("#step1 .slds-form-element__control #instant_win_online").val();
            var mediumOnline                = $("#step1 .slds-form-element__control #offer_medium_online").val();
            var promotionIdOnline           = $("#step1 .slds-form-element__control #promotion_id_online").val();
            var promotionGroupIdOnline      = $("#step1 .slds-form-element__control #promotion_group_id_online").val();
            var mcUniquePromotionIdOnline   = $("#step1 .slds-form-element__control #mc_unique_promotion_id_online").val();

            // comms instore history
            var communicationCellCodeInstore    = $("#step2 .slds-form-element__control #communication_cell_code_instore").val();
            var cellCodeInstore                 = $("#step2 .slds-form-element__control #cell_code_instore").val();
            var cellNameInstore                 = $("#step2 .slds-form-element__control #cell_name_instore").val();
            var campaignNameInstore             = $("#step2 .slds-form-element__control #campaign_name_instore").val();
            var campaignIdInstore               = $("#step2 .slds-form-element__control #campaign_id_instore").val();
            var campaignCodeInstore             = $("#step2 .slds-form-element__control #campaign_code_instore").val();

            // instore voucher setup
            var printAtTillInstore              = $("#step2 .slds-form-element__control #print_at_till_instore").val();
            var instantWinInstore               = $("#step2 .slds-form-element__control #instant_win_instore").val();
            var mediumInstore                   = $("#step2 .slds-form-element__control #offer_medium_instore").val();
            var instoreCode                     = $("#step2 .slds-form-element__control #instore_code_instore").val();
            var promotionIdInstore              = $("#step2 .slds-form-element__control #promotion_id_instore").val();
            var promotionGroupIdInstore         = $("#step2 .slds-form-element__control #promotion_group_id_instore").val();
            var mcUniquePromotionIdInstore      = $("#step2 .slds-form-element__control #mc_unique_promotion_id_instore").val();

            payload['arguments'].execute.inArguments = [{
                "mc_unique_promotion_id_instore"    : mcUniquePromotionIdInstore,
                "communication_cell_code_instore"   : communicationCellCodeInstore,
                "cell_code_instore"                 : cellCodeInstore,
                "cell_name_instore"                 : cellNameInstore,
                "campaign_name_instore"             : campaignNameInstore,
                "campaign_id_instore"               : campaignIdInstore,
                "campaign_code_instore"             : campaignCodeInstore,
                "instore_code_instore"              : instoreCode,
                "print_at_till_instore"             : printAtTillInstore,
                "instant_win_instore"               : instantWinInstore,
                "offer_channel_instore"             : "Instore",
                "offer_medium_instore"              : mediumInstore,
                "promotion_id_instore"              : promotionIdInstore,
                "promotion_group_id_instore"        : promotionGroupIdInstore,
                "promotion_type_instore"            : promotionType,
                "mc_unique_promotion_id_online"     : mcUniquePromotionIdOnline,
                "communication_cell_code_online"    : communicationCellCodeOnline,
                "cell_code_online"                  : cellCodeOnline,
                "cell_name_online"                  : cellNameOnline,
                "campaign_name_online"              : campaignNameOnline,
                "campaign_id_online"                : campaignIdOnline,
                "campaign_code_online"              : campaignCodeOnline,
                "voucher_pot_online"                : voucherPotOnline,
                "global_code_online"                : globalCodeOnline,
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
