define([
    'postmonger'
], function(
    Postmonger
) {
    'use strict';

    var debug                       = true;
    var apiWaitTime                 = 1500;
    var stepToValidate;
    var connection                  = new Postmonger.Session();
    var payload                     = {};
    var payloadNode                 = {};
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
    var payloadToSave;
    var summaryPayload;

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
        lookupGlobalCodes();
        lookupTemplates();
        lookupVoucherPots();
        lookupControlGroups();
        loadEvents();
        setGlobalCodeBlock();
    }

    function initialize (data) {
        
        if (data) {
            payload = data;
            var argumentsSummaryPayload = payload.arguments.execute.inArguments[0];
        }

        if ( debug ) {
            console.log("Payload is:");
            console.log(payload.arguments.execute.inArguments[0]);
            console.log("summary payload is:");
            console.log(argumentsSummaryPayload.buildPayload);
        }

        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        if ( debug ) {
            console.log("In arguments object is:");
            console.log(inArguments);
            console.log("promotion type from arg is:");
            console.log(argumentsSummaryPayload.buildPayload);
        }

        if ( argumentsSummaryPayload.buildPayload ) {

            if ( debug ) {
                console.log("inside if statement i.e. promotion key is present")
                console.log(argumentsSummaryPayload.buildPayload);
            }
            // argument data present, pre pop and redirect to summary page

        }      
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

            } else if ( promotionType === 'no_code' ) {

                // do we add another step for just association
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

        // ensure print at till and instant win can never be the same value

        $("#print_at_till_online").change(function() {
            // set instant win to opposite
            if ( $("#print_at_till_online").val() == "true" ) {
                // set instant win to false
                $('#instant_win_online option[value="false"]').prop("selected", "selected");
            }
        });

        $("#instant_win_online").change(function() {
            // set instant win to opposite
            if ( $("#instant_win_online").val() == "true" ) {
                // set instant win to false
                $('#print_at_till_online option[value="false"]').prop("selected", "selected");
            }
        });

        $("#print_at_till_instore").change(function() {
            // set instant win to opposite
            if ( $("#print_at_till_instore").val() == "true" ) {
                // set instant win to false
                $('#instant_win_instore option[value="false"]').prop("selected", "selected");
            }
        });

        $("#instant_win_instore").change(function() {
            // set instant win to opposite
            if ( $("#instant_win_instore").val() == "true" ) {
                // set instant win to false
                $('#print_at_till_instore option[value="false"]').prop("selected", "selected");
            }
        });

        // ensure instore promo id is automatically set and is read-only
        $("#instore_code_1, #instore_code_2, #instore_code_3, #instore_code_4, #instore_code_5").change(function(){
            var instoreCodeIndex = this.id.slice(-1);
            var instoreCodeLoyaltyPromotion = $(this).attr("data-attribute-loyalty");

            // set promo id
            $("#instore_code_"+instoreCodeIndex+"_promo_id").val(this.value);

            // set loyalty promotion
            $("#instore_code_"+instoreCodeIndex+"_loyalty_promotion").val(instoreCodeLoyaltyPromotion);
        });

        // select first input
        $("#radio-1").click();

    }

    function updateApiStatus(endpointSelector, endpointStatus) {

        if ( endpointStatus ) {
            setTimeout(function() {
                $("#" + endpointSelector + " > div > div").removeClass("slds-theme_info");
                $("#" + endpointSelector + " > div > div > span:nth-child(2)").removeClass("slds-icon-utility-info");
                $("#" + endpointSelector + " > div > div").addClass("slds-theme_success");
                $("#" + endpointSelector + " > div > div > span:nth-child(2)").addClass("slds-icon-utility-success");
                $("#" + endpointSelector + " > div > div > span:nth-child(2) svg use").attr("xlink:href","/assets/icons/utility-sprite/svg/symbols.svg#success");
                $("#" + endpointSelector + " > div > div > .slds-notify__content h2").text($("#" + endpointSelector + " > div > div > .slds-notify__content h2").text().replace("Loading", "Successfully Loaded"));
            }, apiWaitTime);
        
        } else {
            setTimeout(function() {
                $("#" + endpointSelector + " > div > div").removeClass("slds-theme_info");
                $("#" + endpointSelector + " > div > div > span:nth-child(2)").removeClass("slds-icon-utility-info");
                $("#" + endpointSelector + " > div > div").addClass("slds-theme_error");
                $("#" + endpointSelector + " > div > div > span:nth-child(2)").addClass("slds-icon-utility-error");
                $("#" + endpointSelector + " > div > div > span:nth-child(2) svg use").attr("xlink:href","/assets/icons/utility-sprite/svg/symbols.svg#error");
                $("#" + endpointSelector + " > div > div > .slds-notify__content h2").text($("#" + endpointSelector + " > div > div > .slds-notify__content h2").text().replace("Loading", "Error Loading"));
            }, apiWaitTime);
        }

        apiWaitTime = apiWaitTime + 500;

    }

    function prePopulateFields(prePop, argumentsSummaryPayload) {

        if ( debug) {
            console.log("payload sent to prepop function");
            console.log(argumentsSummaryPayload);
        }

    }

    function validateStep(stepToValidate) {

        if (debug) {
            console.log("Step that will be validated");
            console.log(stepToValidate);
        }

        if ( $("#step" + stepToValidate).find('.slds-has-error').length > 0 ) {

            return false;

        } else if ( stepToValidate == 0 ) {

            var step0Selectors = ["#email_template", "#cell_code", "#cell_name", "#campaign_id", "#campaign_name", "#campaign_code"];
            var step0ErrorCount = 0;

            for ( var n = 0; n < step0Selectors.length; n++ ) {

                console.log("The selector is " + step0Selectors[n]);

                if ( !$(step0Selectors[n]).val() ) {

                    step0ErrorCount++;
                }
            }

            if ( step0ErrorCount == 0 ) {

                return true;

            } else {

                return false;

            }

        } else if ( stepToValidate == 1 ) {

            var onelineCodeType = $(".online_promotion_type:checked").val();

            var step1Selectors = ["#"+onelineCodeType+"_code_1", "#"+onelineCodeType+"_code_1_promo_id", "#promotion_group_id_online"];
            var step1ErrorCount = 0;

            for ( var l = 0; l < step1Selectors.length; l++ ) {

                console.log("The selector is " + step1Selectors[l]);

                if ( !$(step1Selectors[l]).val() ) {

                    step1ErrorCount++;
                }
            }

            if ( step1ErrorCount == 0 ) {

                return true;

            } else {

                return false;

            }

        } else if ( stepToValidate == 2 ) {

            var step2Selectors = ["#instore_code_1", "#instore_code_1_promo_id", "#promotion_group_id_instore"];
            var step2ErrorCount = 0;

            for ( var m = 0; m < step2Selectors.length; m++ ) {

                console.log("The selector is " + step2Selectors[m]);

                if ( !$(step2Selectors[m]).val() ) {

                    step2ErrorCount++;
                }
            }

            if ( step2ErrorCount == 0 ) {

                return true;

            } else {

                return false;

            }            

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

        if ( elementId == "promotion_id_1" ) {

            $("#promotion_group_id_online").val(elementValue);

        } else if ( elementId == "promotion_id_6" ) {

            $("#promotion_group_id_instore").val(elementValue);

        }

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

    function setGlobalCodeBlock() {
        $("#show_global_codes").show();
    }

    function lookupGlobalCodes() {

        // access offer types and build select input
        $.ajax({
            url: "/dataextension/lookup/globalcodes", 
            error: function() {
                updateApiStatus("onlinecodes-api", false);
            },
            success: function(result){

                if ( debug ) {
                    console.log('lookup global codes executed');
                    console.log(result.items);               
                }

                var i;
                for (i = 0; i < result.items.length; ++i) {
                    if ( debug ) {
                        console.log(result.items[i].keys.couponcode);
                    }
                    // do something with `substr[i]
                    $("#global_code_1").append("<option data-attribute-validfrom='" + result.items[i].values.validfrom + "' data-attribute-validto='" + result.items[i].values.validto + "' value=" + encodeURI(result.items[i].keys.couponcode) + ">" + result.items[i].keys.couponcode + "</option>");
                    $("#global_code_2").append("<option data-attribute-validfrom='" + result.items[i].values.validfrom + "' data-attribute-validto='" + result.items[i].values.validto + "' value=" + encodeURI(result.items[i].keys.couponcode) + ">" + result.items[i].keys.couponcode + "</option>");
                    $("#global_code_3").append("<option data-attribute-validfrom='" + result.items[i].values.validfrom + "' data-attribute-validto='" + result.items[i].values.validto + "' value=" + encodeURI(result.items[i].keys.couponcode) + ">" + result.items[i].keys.couponcode + "</option>");
                    $("#global_code_4").append("<option data-attribute-validfrom='" + result.items[i].values.validfrom + "' data-attribute-validto='" + result.items[i].values.validto + "' value=" + encodeURI(result.items[i].keys.couponcode) + ">" + result.items[i].keys.couponcode + "</option>");
                    $("#global_code_5").append("<option data-attribute-validfrom='" + result.items[i].values.validfrom + "' data-attribute-validto='" + result.items[i].values.validto + "' value=" + encodeURI(result.items[i].keys.couponcode) + ">" + result.items[i].keys.couponcode + "</option>");
                }
                updateApiStatus("onlinecodes-api", true);
            }
        });
    }

    function lookupPromos() {

        // access offer types and build select input
        $.ajax({

            url: "/dataextension/lookup/promotions",
            error: function() {
                updateApiStatus("instorecodes-api", false);
            }, 
            success: function(result){

                if ( debug ) {
                    console.log('lookup promotions executed');
                    console.log(result.items);               
                }

                var i;
                for (i = 0; i < result.items.length; ++i) {
                    if ( debug ) {
                        console.log(result.items[i].keys);
                    }
                    // do something with `substr[i]
                    $("#instore_code_1").append("<option data-attribute-loyalty=" + result.items[i].values.bIsPromotionHeader + " data-attribute-validfrom=" + result.items[i].values.datefrom + " data-attribute-validto=" + result.items[i].values.dateto + " value=" + encodeURI(result.items[i].keys.discountid) + ">" + result.items[i].keys.discountid + " - " + result.items[i].values.name + "</option>");
                    $("#instore_code_2").append("<option data-attribute-loyalty=" + result.items[i].values.bIsPromotionHeader + " data-attribute-validfrom=" + result.items[i].values.datefrom + " data-attribute-validto=" + result.items[i].values.dateto + " value=" + encodeURI(result.items[i].keys.discountid) + ">" + result.items[i].keys.discountid + " - " + result.items[i].values.name + "</option>");
                    $("#instore_code_3").append("<option data-attribute-loyalty=" + result.items[i].values.bIsPromotionHeader + " data-attribute-validfrom=" + result.items[i].values.datefrom + " data-attribute-validto=" + result.items[i].values.dateto + " value=" + encodeURI(result.items[i].keys.discountid) + ">" + result.items[i].keys.discountid + " - " + result.items[i].values.name + "</option>");
                    $("#instore_code_4").append("<option data-attribute-loyalty=" + result.items[i].values.bIsPromotionHeader + " data-attribute-validfrom=" + result.items[i].values.datefrom + " data-attribute-validto=" + result.items[i].values.dateto + " value=" + encodeURI(result.items[i].keys.discountid) + ">" + result.items[i].keys.discountid + " - " + result.items[i].values.name + "</option>");
                    $("#instore_code_5").append("<option data-attribute-loyalty=" + result.items[i].values.bIsPromotionHeader + " data-attribute-validfrom=" + result.items[i].values.datefrom + " data-attribute-validto=" + result.items[i].values.dateto + " value=" + encodeURI(result.items[i].keys.discountid) + ">" + result.items[i].keys.discountid + " - " + result.items[i].values.name + "</option>");
                }
                updateApiStatus("instorecodes-api", true);
            }

        });
    }

    function lookupTemplates() {

        // access offer types and build select input
        $.ajax({

            url: "/dataextension/lookup/templates", 
            error: function() {
                updateApiStatus("email-api", false);
            }, 
            success: function(result){

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
                    $('#email_template option[value="loading"]').remove();
                    $("#email_template").append("<option value=" + encodeURI(result.items[i].name) + ">" + result.items[i].name + "</option>");
                }
                updateApiStatus("email-api", true);
            }
        });
    }

    function lookupControlGroups() {

        // access offer types and build select input
        $.ajax({
            url: "/dataextension/lookup/controlgroups",
            error: function() {
                updateApiStatus("controlgroup-api", false);
            },  
            success: function(result){

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
                updateApiStatus("controlgroup-api", true);
            }
        });
    }

    function lookupVoucherPots() {

        // access offer types and build select input
        $.ajax({
            url: "/dataextension/lookup/voucherpots",
            error: function() {
                updateApiStatus("voucherpot-api", false);
            },  
            success: function(result){

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
                    $("#voucher_pot_1").append("<option data-attribute-count="+ result.items[i].values.count +" value=" + result.items[i].values.dataextensionname + ">" + result.items[i].values.dataextensionname + " - Unclaimed Rows: " + result.items[i].values.count  + "</option>");
                    $("#voucher_pot_2").append("<option data-attribute-count="+ result.items[i].values.count +" value=" + result.items[i].values.dataextensionname + ">" + result.items[i].values.dataextensionname + " - Unclaimed Rows: " + result.items[i].values.count  + "</option>");
                    $("#voucher_pot_3").append("<option data-attribute-count="+ result.items[i].values.count +" value=" + result.items[i].values.dataextensionname + ">" + result.items[i].values.dataextensionname + " - Unclaimed Rows: " + result.items[i].values.count  + "</option>");
                    $("#voucher_pot_4").append("<option data-attribute-count="+ result.items[i].values.count +" value=" + result.items[i].values.dataextensionname + ">" + result.items[i].values.dataextensionname + " - Unclaimed Rows: " + result.items[i].values.count  + "</option>");
                    $("#voucher_pot_5").append("<option data-attribute-count="+ result.items[i].values.count +" value=" + result.items[i].values.dataextensionname + ">" + result.items[i].values.dataextensionname + " - Unclaimed Rows: " + result.items[i].values.count  + "</option>");
                }
                updateApiStatus("voucherpot-api", true);
            }
        });
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
                        console.log("step 1 validated");           
                    }                    

                    toggleStepError(1, "hide");
                    updateSummaryPage(buildActivityPayload());
                    connection.trigger('nextStep');

                } else {

                    if ( debug ) {
                        console.log("step 1 not validated");           
                    }  

                    connection.trigger('ready');
                    toggleStepError(1, "show");

                }

            } else if ( currentStep.key === 'step3' ) {

                console.log("save to de");
                saveToDataExtension(buildActivityPayload());
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
                        console.log("step 2 validated");           
                    }                    

                    toggleStepError(2, "hide");
                    updateSummaryPage(buildActivityPayload());
                    connection.trigger('nextStep');

                } else {

                    if ( debug ) {
                        console.log("step 2 not validated");           
                    }  

                    connection.trigger('ready');
                    toggleStepError(2, "show");

                }

            } else if ( currentStep.key === 'step3' ) {

                console.log("save to de");
                saveToDataExtension(buildActivityPayload());
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
                        console.log("step 2 validated");           
                    }                    

                    updateSummaryPage(buildActivityPayload());
                    toggleStepError(2, "hide");
                    connection.trigger('nextStep');

                } else {

                    if ( debug ) {
                        console.log("step 2 not validated");           
                    }  

                    connection.trigger('ready');
                    toggleStepError(2, "show");

                }

            } else if ( currentStep.key === 'step3' ) {

                console.log("save to de");
                saveToDataExtension(buildActivityPayload());
                setTimeout(function() {
                    save();
                }, 3000);

            } else if ( currentStep.key === 'step1' ) {

                if ( validateStep(1) ) {

                    if ( debug ) {
                        console.log("step 1 validated");           
                    }                    

                    toggleStepError(1, "hide");
                    connection.trigger('nextStep');

                } else {

                    if ( debug ) {
                        console.log("step 1 not validated");           
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

                if ( debug ) {
                    console.log("step 1 case clicked");
                }

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

                if ( debug ) {
                    console.log("step 2 case clicked");
                }

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

                if ( debug ) {
                    console.log("step 3 case clicked");
                }

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

    /*
     * Function add data to data extension
     */

    function saveToDataExtension(payloadToSave) {

        if ( debug ) {
            console.log("Data Object to be saved is: ");
            console.log(payloadToSave);
        }

        try {
            $.ajax({ 
                url: '/dataextension/add',
                type: 'POST',
                cache: false, 
                data: payloadToSave, 
                success: function(data){
                    if ( debug ) {
                        /*console.log(data);*/  
                    }
                    var saveResponseData = data;
                    if ( debug ) {
                        console.log(saveResponseData);
                    }

                    addPromotionKeyToArgs(saveResponseData);
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

    function addPromotionKeyToArgs(saveResponse) {
        if ( debug ){
            console.log("add promokey to args executed");
            console.log(saveResponse);
        }
    }

    function buildActivityPayload() {

        var step1FormInputs = $("#step0").find(":input");
        var step2FormInputs = $("#step1").find(":input");
        var step3FormInputs = $("#step2").find(":input");

        var i;
        var payloadNode = [];

        for ( i = 0; i < step1FormInputs.length; i++ ) {
            if ( step1FormInputs[i].id) {
                if ( step1FormInputs[i].type == "checkbox") {
                    payloadNode.push({
                        key: step1FormInputs[i].id, 
                        value:  step1FormInputs[i].checked
                    });
                } else {
                    payloadNode.push({
                        key: step1FormInputs[i].id, 
                        value:  step1FormInputs[i].value
                    });
                }
            }
        }

        for ( i = 0; i < step2FormInputs.length; i++ ) {
            if ( step2FormInputs[i].id) {
                if ( step2FormInputs[i].type == "checkbox") {
                    payloadNode.push({
                        key: step2FormInputs[i].id, 
                        value:  step2FormInputs[i].checked
                    });
                } else {
                    payloadNode.push({
                        key: step2FormInputs[i].id, 
                        value:  step2FormInputs[i].value
                    });
                }
            }
        }

        for ( i = 0; i < step3FormInputs.length; i++ ) {
            if ( step3FormInputs[i].id) {
                if ( step3FormInputs[i].type == "checkbox") {
                    payloadNode.push({
                        key: step3FormInputs[i].id, 
                        value:  step3FormInputs[i].checked
                    });
                } else {
                    payloadNode.push({
                        key: step3FormInputs[i].id, 
                        value:  step3FormInputs[i].value
                    });
                }
            }
        }

        if ( debug ) {
            console.log(payloadNode);
        }

        return payloadNode;

    }

    function updateSummaryPage(summaryPayload) {

        if ( debug ) {
            console.log("Build Payload for summary update it")
            console.log(summaryPayload);
        }
        
        Object.keys(summaryPayload).forEach(function(key) {
            console.table('Key : ' + key + ', Value : ' + summaryPayload[key]);
        })
        
    }

    function save() {

        var buildPayload = buildActivityPayload();

        // 'payload' is initialized on 'initActivity' above.
        // Journey Builder sends an initial payload with defaults
        // set by this activity's config.json file.  Any property
        // may be overridden as desired.
        payload.name = buildPayload.campaign_name;

        payload['arguments'].execute.inArguments = [{buildPayload}];

        payload['metaData'].isConfigured = true;

        if ( debug ) {
            console.log(payload);
        }

        connection.trigger('updateActivity', payload);
    }

});