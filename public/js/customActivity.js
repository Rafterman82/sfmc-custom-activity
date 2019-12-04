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
            }
            // argument data present, pre pop and redirect to summary page
            var prepopPromotionType = argumentsSummaryPayload.buildPayload.promotion_type;

            if ( debug ) {
                console.log("prepopPromotionType is");
                console.log(prepopPromotionType);
            }

            var prePop;

            if ( prepopPromotionType == 'online' ) {
                prePop = 'online';
                prePopulateFields(prePop, argumentsSummaryPayload);
                updateSummaryPage(argumentsSummaryPayload.buildPayload);
                steps[1].active = true;
                steps[3].active = true;
                connection.trigger('updateSteps', steps);
                setTimeout(function() {
                    connection.trigger('nextStep');
                }, 10);
                setTimeout(function() {
                    connection.trigger('nextStep');
                }, 20);
                setTimeout(function() {
                    showStep(null, 3);
                }, 100);
            } else if ( prepopPromotionType == 'instore' ) {
                prePop = 'instore';
                prePopulateFields(prePop, argumentsSummaryPayload);
                updateSummaryPage(argumentsSummaryPayload.buildPayload);
                steps[2].active = true;
                steps[3].active = true;
                connection.trigger('updateSteps', steps);
                setTimeout(function() {
                    connection.trigger('nextStep');
                }, 10);
                setTimeout(function() {
                    connection.trigger('nextStep');
                }, 20);
                setTimeout(function() {
                    showStep(null, 3);
                }, 100);
            } else  if ( prepopPromotionType == 'online_instore' ) {
                prePop = 'online_instore';
                prePopulateFields(prePop, argumentsSummaryPayload);
                updateSummaryPage(argumentsSummaryPayload.buildPayload);
                steps[1].active = true;
                steps[2].active = true;
                steps[3].active = true;
                connection.trigger('updateSteps', steps);
                setTimeout(function() {
                    connection.trigger('nextStep');
                }, 10);
                setTimeout(function() {
                    connection.trigger('nextStep');
                }, 20);
                setTimeout(function() {
                    connection.trigger('nextStep');
                }, 30);
                setTimeout(function() {
                    showStep(null, 3);
                }, 100);
            } else{
                prePop = 'not-set';
                if ( debug ) {
                    console.log('nothing to pre-pop setting step 0 and first radio checked');
                }
                $("#radio-1").prop("checked", true).trigger("click");
            }
            if ( debug ) {
                console.log(prePop);
            }

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

            }

        });

        $('.online_promotion_type').click(function() {

            var onlinePromotionType = $("input[name='onlinePromotionType']:checked").val();
            if ( onlinePromotionType == 'global' ) {

                $("#show_unique_codes").hide();
                // set voucher pots to no-code
                $("#voucher_pot_1").val("no-code");
                $("#voucher_pot_2").val("no-code");
                $("#voucher_pot_3").val("no-code");

                $("#show_global_codes").show();

            } else {

                // set global codes to no-code
                $("#global_code_1").val("no-code");
                $("#global_code_2").val("no-code");
                $("#global_code_3").val("no-code");
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
                $("#form-error__email_template").hide();                
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

        $("#reuse_voucher_pot_1").val(false);
        $("#reuse_voucher_pot_2").val(false);
        $("#reuse_voucher_pot_3").val(false);

        $("#reuse_voucher_pot_1").on('change', function(){
            $(this).val(this.checked ? true : false);
        });

        $("#reuse_voucher_pot_2").on('change', function(){
            $(this).val(this.checked ? true : false);
        });

        $("#reuse_voucher_pot_3").on('change', function(){
            $(this).val(this.checked ? true : false);
        });

        $("#online_code_date_override_1").val(false);
        $("#online_code_date_override_2").val(false);
        $("#online_code_date_override_3").val(false);

        $("#online_code_date_override_1").on('change', function(){
            $(this).val(this.checked ? true : false);
        });

        $("#online_code_date_override_2").on('change', function(){
            $(this).val(this.checked ? true : false);
        });

        $("#online_code_date_override_3").on('change', function(){
            $(this).val(this.checked ? true : false);
        });



        $("#instore_code_date_override_1").val(false);
        $("#instore_code_date_override_2").val(false);
        $("#instore_code_date_override_3").val(false);

        $("#instore_code_date_override_1").on('change', function(){
            $(this).val(this.checked ? true : false);
        });

        $("#instore_code_date_override_2").on('change', function(){
            $(this).val(this.checked ? true : false);
        });

        $("#instore_code_date_override_3").on('change', function(){
            $(this).val(this.checked ? true : false);
        });



        $("#voucher_pot_1").on('change', function(){
            if ( debug ) {
                console.log($(this));
            }

            var vp1count = $($(this)).find(':selected').attr("data-attribute-count");
            $("#pot_1_count").html("Vouchers in pot 1:" + vp1count);

        });
        $("#voucher_pot_2").on('change', function(){
            if ( debug ) {
                console.log($(this));
            }
            var vp2count = $($(this)).find(':selected').attr("data-attribute-count");
            $("#pot_2_count").html("Vouchers in pot 2:" + vp2count);
        });
        $("#voucher_pot_3").on('change', function(){
            if ( debug ) {
                console.log($(this));
            }
            var vp3count = $($(this)).find(':selected').attr("data-attribute-count");
            $("#pot_3_count").html("Vouchers in pot 3:" + vp3count);
        });

    }

    function prePopulateFields(prePop, argumentsSummaryPayload) {

        if ( debug) {
            console.log("payload sent to prepop function");
            console.log(argumentsSummaryPayload);
            console.log("promotion type is ");
            console.log(argumentsSummaryPayload.buildPayload.promotion_type);
            console.log(prePop);
            console.log("voucher pot 1");
            console.log(argumentsSummaryPayload.buildPayload.voucher_pot_1);
            console.log("global code 1");
            console.log(argumentsSummaryPayload.buildPayload.global_code_1);
            console.log("instore code 1");
            console.log(argumentsSummaryPayload.buildPayload.instore_code_1);
            console.log("reuse vp 1 value");
            console.log(argumentsSummaryPayload.buildPayload.reuse_voucher_pot_1);
            console.log("online date override");
            console.log(argumentsSummaryPayload.buildPayload.online_code_date_override_1);
            console.log("instore date override");
            console.log(argumentsSummaryPayload.buildPayload.instore_code_date_override_1);

        }

        if ( argumentsSummaryPayload.buildPayload.promotion_type ) {
            if ( argumentsSummaryPayload.buildPayload.promotion_type == "online" ) {
                $("#radio-1").prop("checked", true);
            } else if ( argumentsSummaryPayload.buildPayload.promotion_type == "instore" ) {
                $("#radio-2").prop("checked", true);
            } else if ( argumentsSummaryPayload.buildPayload.promotion_type == "online_instore" ) {
                $("#radio-3").prop("checked", true);
            }
        }

        setTimeout(function(){ 
            if ( argumentsSummaryPayload.buildPayload.email_template ) {
                $("#email_template").val(encodeURIComponent(argumentsSummaryPayload.buildPayload.email_template));
            }
        }, 4000);

        if ( argumentsSummaryPayload.buildPayload.control_group ) {
            $("#control_group").val(argumentsSummaryPayload.buildPayload.control_group);
        }

        if ( argumentsSummaryPayload.buildPayload.cell_code ) {
            $("#cell_code").val(argumentsSummaryPayload.buildPayload.cell_code);
        }

        if ( argumentsSummaryPayload.buildPayload.cell_name ) {
            $("#cell_name").val(argumentsSummaryPayload.buildPayload.cell_name);
        }

        if ( argumentsSummaryPayload.buildPayload.campaign_name ) {
            $("#campaign_name").val(argumentsSummaryPayload.buildPayload.campaign_name);
        }

        if ( argumentsSummaryPayload.buildPayload.campaign_id ) {
            $("#campaign_id").val(argumentsSummaryPayload.buildPayload.campaign_id);
        }

        if ( argumentsSummaryPayload.buildPayload.campaign_code ) {
            $("#campaign_code").val(argumentsSummaryPayload.buildPayload.campaign_code);
        }
        setTimeout(function(){ 

            if ( argumentsSummaryPayload.buildPayload.voucher_pot_1) {
                $("#show_global_codes").hide();
                $("#show_unique_codes").show();
                $("#voucher_pot_1").val(argumentsSummaryPayload.buildPayload.voucher_pot_1);
                console.log("voucher pot 1 had a value");


            }

            if ( argumentsSummaryPayload.buildPayload.voucher_pot_2) {
                $("#voucher_pot_2").val(argumentsSummaryPayload.buildPayload.voucher_pot_2);


            }

            if ( argumentsSummaryPayload.buildPayload.voucher_pot_3) {
                $("#voucher_pot_3").val(argumentsSummaryPayload.buildPayload.voucher_pot_3);


            }

            if ( argumentsSummaryPayload.buildPayload.instore_code_1 ) {
                $("#instore_code_1_instore").val(argumentsSummaryPayload.buildPayload.instore_code_1);

            }

            if ( argumentsSummaryPayload.buildPayload.instore_code_2 ) {
                $("#instore_code_2_instore").val(argumentsSummaryPayload.buildPayload.instore_code_2);

            }

            if ( argumentsSummaryPayload.buildPayload.instore_code_3 ) {
                $("#instore_code_3_instore").val(argumentsSummaryPayload.buildPayload.instore_code_3);

            }

            if ( argumentsSummaryPayload.buildPayload.global_code_1 ) {
                $("#global_code_1").val(argumentsSummaryPayload.buildPayload.global_code_1);
                $("#show_global_codes").show();
                $("#show_unique_codes").hide();

            }

            if ( argumentsSummaryPayload.buildPayload.global_code_2 ) {
                $("#global_code_2").val(argumentsSummaryPayload.buildPayload.global_code_2);
            }

            if ( argumentsSummaryPayload.buildPayload.global_code_3 ) {
                $("#global_code_3").val(argumentsSummaryPayload.buildPayload.global_code_3);

            }

            if ( argumentsSummaryPayload.buildPayload.reuse_voucher_pot_1) {
                $("#reuse_voucher_pot_1").val(true);
                $("#reuse_voucher_pot_1").prop('checked', true);
            }

            if ( argumentsSummaryPayload.buildPayload.reuse_voucher_pot_2) {
                $("#reuse_voucher_pot_2").val(true);
                $("#reuse_voucher_pot_2").prop('checked', true);
            }

            if ( argumentsSummaryPayload.buildPayload.reuse_voucher_pot_3) {
                $("#reuse_voucher_pot_3").val(true);
                $("#reuse_voucher_pot_3").prop('checked', true);
            }


        }, 4000);

        // date override checkboxes

        if ( argumentsSummaryPayload.buildPayload.online_code_date_override_1) {
            $("#online_code_date_override_1").val(true);
            $("#online_code_date_override_1").prop('checked', true);
        }

        if ( argumentsSummaryPayload.buildPayload.online_code_date_override_2) {
            $("#online_code_date_override_2").val(true);
            $("#online_code_date_override_2").prop('checked', true);
        }

        if ( argumentsSummaryPayload.buildPayload.online_code_date_override_3) {
            $("#online_code_date_override_3").val(true);
            $("#online_code_date_override_3").prop('checked', true);
        }

        // data override days to add
        if ( argumentsSummaryPayload.buildPayload.online_voucher_date_override_1_days && argumentsSummaryPayload.buildPayload.online_voucher_date_override_1_days != 0 || argumentsSummaryPayload.buildPayload.online_voucher_date_override_1_days != '0' ) {
            $("#online_voucher_date_override_1_days").val(argumentsSummaryPayload.buildPayload.online_voucher_date_override_1_days);
        }

        if ( argumentsSummaryPayload.buildPayload.online_voucher_date_override_2_days && argumentsSummaryPayload.buildPayload.online_voucher_date_override_2_days != 0 || argumentsSummaryPayload.buildPayload.online_voucher_date_override_2_days != '0' ) {
            $("#online_voucher_date_override_2_days").val(argumentsSummaryPayload.buildPayload.online_voucher_date_override_2_days);
        }

        if ( argumentsSummaryPayload.buildPayload.online_voucher_date_override_3_days && argumentsSummaryPayload.buildPayload.online_voucher_date_override_3_days != 0 || argumentsSummaryPayload.buildPayload.online_voucher_date_override_3_days != '0') {
            $("#online_voucher_date_override_3_days").val(argumentsSummaryPayload.buildPayload.online_voucher_date_override_3_days);
        }


        if ( argumentsSummaryPayload.buildPayload.instore_code_date_override_1) {
            $("#instore_code_date_override_1").val(true);
            $("#instore_code_date_override_1").prop('checked', true);
        }

        if ( argumentsSummaryPayload.buildPayload.instore_code_date_override_2) {
            $("#instore_code_date_override_2").val(true);
            $("#instore_code_date_override_2").prop('checked', true);
        }

        if ( argumentsSummaryPayload.buildPayload.instore_code_date_override_3) {
            $("#instore_code_date_override_3").val(true);
            $("#instore_code_date_override_3").prop('checked', true);
        }

        // data override days to add
        if ( argumentsSummaryPayload.buildPayload.instore_voucher_date_override_1_days && argumentsSummaryPayload.buildPayload.instore_voucher_date_override_1_days != "0" || argumentsSummaryPayload.buildPayload.instore_voucher_date_override_1_days != 0 ) {
            $("#instore_voucher_date_override_1_days").val(argumentsSummaryPayload.buildPayload.instore_voucher_date_override_1_days);
        }

        if ( argumentsSummaryPayload.buildPayload.instore_voucher_date_override_2_days && argumentsSummaryPayload.buildPayload.instore_voucher_date_override_2_days != "0" || argumentsSummaryPayload.buildPayload.instore_voucher_date_override_2_days != 0 ) {
            $("#instore_voucher_date_override_2_days").val(argumentsSummaryPayload.buildPayload.instore_voucher_date_override_2_days);
        }

        if ( argumentsSummaryPayload.buildPayload.instore_voucher_date_override_3_days  && argumentsSummaryPayload.buildPayload.instore_voucher_date_override_3_days != "0" || argumentsSummaryPayload.buildPayload.instore_voucher_date_override_3_days != 0 ) {
            $("#instore_voucher_date_override_3_days").val(argumentsSummaryPayload.buildPayload.instore_voucher_date_override_3_days);
        }




        if ( argumentsSummaryPayload.buildPayload.print_at_till_online ) {
            $("#print_at_till_online").val(argumentsSummaryPayload.buildPayload.print_at_till_online);
        }

        if ( argumentsSummaryPayload.buildPayload.print_at_till_instore ) {
            $("#print_at_till_instore").val(argumentsSummaryPayload.buildPayload.print_at_till_instore);
        }

        if ( argumentsSummaryPayload.buildPayload.instant_win_online ) {
            $("#instant_win_online").val(argumentsSummaryPayload.buildPayload.instant_win_online);
        }

        if ( argumentsSummaryPayload.buildPayload.instant_win_instore) {
            $("#instant_win_instore").val(argumentsSummaryPayload.buildPayload.instant_win_instore);
        }

        if ( argumentsSummaryPayload.buildPayload.offer_medium_instore) {
            $("#offer_medium_instore").val(argumentsSummaryPayload.buildPayload.offer_medium_instore);
        }

        if ( argumentsSummaryPayload.buildPayload.offer_medium_online) {
            $("#offer_medium_online").val(argumentsSummaryPayload.buildPayload.offer_medium_online);
        }

        if ( argumentsSummaryPayload.buildPayload.promotion_id_online) {
            $("#promotion_id_online").val(argumentsSummaryPayload.buildPayload.promotion_id_online);
        }

        if ( argumentsSummaryPayload.buildPayload.promotion_id_instore) {
            $("#promotion_id_instore").val(argumentsSummaryPayload.buildPayload.promotion_id_instore);
        }

        if ( argumentsSummaryPayload.buildPayload.promotion_group_id_online) {
            $("#promotion_group_id_online").val(argumentsSummaryPayload.buildPayload.promotion_group_id_online);
        }

        if ( argumentsSummaryPayload.buildPayload.promotion_group_id_instore) {
            $("#promotion_group_id_instore").val(argumentsSummaryPayload.buildPayload.promotion_group_id_instore);
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

            if ( 
                !$("#email_template").val() || 
                !$("#cell_code").val() || 
                !$("#cell_name").val() || 
                !$("#campaign_id").val() || 
                !$("#campaign_name").val() || 
                !$("#campaign_code").val() 
                ) {

                return false;

            } else {

                return true;
            }

        } else if ( stepToValidate == 1 ) {

            if ( 
                !$("#global_code_1").val() && !$("#voucher_pot_1").val() || 
                $("#global_code_1").val() == 'no-code' && $("#voucher_pot_1").val() == 'no-code' || 
                !$("#promotion_id_online").val() || 
                !$("#promotion_group_id_online").val() ) {

                return false;

            } else {

                return true;
            }

        } else if ( stepToValidate == 2 ) {

            if ( 
                !$("#instore_code_1_instore").val() || 
                $("#instore_code_1_instore").val() == 'no-code' || 
                !$("#promotion_id_instore").val() || 
                !$("#promotion_group_id_instore").val() ) {

                return false;
            
            } else {

                return true;
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

        if ( elementId == "promotion_id_online" ) {

            $("#promotion_group_id_online").val(elementValue);

        } else if ( elementId == "promotion_id_instore" ) {

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

    function lookupGlobalCodes() {

        // access offer types and build select input
        $.ajax({url: "/dataextension/lookup/globalcodes", success: function(result){

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
                $("#global_code_1").append("<option value=" + encodeURI(result.items[i].keys.couponcode) + ">" + result.items[i].keys.couponcode + "</option>");
                $("#global_code_2").append("<option value=" + encodeURI(result.items[i].keys.couponcode) + ">" + result.items[i].keys.couponcode + "</option>");
                $("#global_code_3").append("<option value=" + encodeURI(result.items[i].keys.couponcode) + ">" + result.items[i].keys.couponcode + "</option>");
            }
        }});
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
                    console.log(result.items[i].keys);
                }
                // do something with `substr[i]
                $("#instore_code_1_instore").append("<option value=" + encodeURI(result.items[i].keys.discountmediaid) + ">" + result.items[i].keys.discountmediaid + " - " + result.items[i].values.name + " - " + result.items[i].values.discountid +"</option>");
                $("#instore_code_2_instore").append("<option value=" + encodeURI(result.items[i].keys.discountmediaid) + ">" + result.items[i].keys.discountmediaid + " - " + result.items[i].values.name + " - " + result.items[i].values.discountid +"</option>");
                $("#instore_code_3_instore").append("<option value=" + encodeURI(result.items[i].keys.discountmediaid) + ">" + result.items[i].keys.discountmediaid + " - " + result.items[i].values.name + " - " + result.items[i].values.discountid +"</option>");
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
                $('#email_template option[value="loading"]').remove();
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
                $("#voucher_pot_1").append("<option data-attribute-count="+ result.items[i].values.count +" value=" + result.items[i].values.dataextensionname + ">" + result.items[i].values.dataextensionname + "</option>");
                $("#voucher_pot_2").append("<option data-attribute-count="+ result.items[i].values.count +" value=" + result.items[i].values.dataextensionname + ">" + result.items[i].values.dataextensionname + "</option>");
                $("#voucher_pot_3").append("<option data-attribute-count="+ result.items[i].values.count +" value=" + result.items[i].values.dataextensionname + ">" + result.items[i].values.dataextensionname + "</option>");
            }
        }});
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
                    updateSummaryPage(buildActivityPayload());
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
                        console.log("step 0 validated");           
                    }                    

                    toggleStepError(2, "hide");
                    updateSummaryPage(buildActivityPayload());
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
                        console.log("step 0 validated");           
                    }                    

                    updateSummaryPage(buildActivityPayload());
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
                saveToDataExtension(buildActivityPayload());
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

        var step0Selector = "#step0 .slds-form-element__control";
        var step1Selector = "#step1 .slds-form-element__control";
        var step2Selector = "#step2 .slds-form-element__control";

        // main promo data
        var promotionType               = $("#step0 .slds-radio input[name='promotionType']:checked").val();

        // control group
        var controlGroup                = $("#control_group").val();

        // email template
        var emailTemplate               = $("#email_template").find(":selected").text();
            
        // comms history
        var cellCode                    = $(step0Selector +  " #cell_code").val();
        var cellName                    = $(step0Selector +  " #cell_name").val();
        var campaignName                = $(step0Selector +  " #campaign_name").val();
        var campaignId                  = $(step0Selector +  " #campaign_id").val();
        var campaignCode                = $(step0Selector +  " #campaign_code").val();

        // online unique code setup
        var voucherPot1                 = $(step1Selector +  " #voucher_pot_1").val();
        var voucherPot2                 = $(step1Selector +  " #voucher_pot_2").val();
        var voucherPot3                 = $(step1Selector +  " #voucher_pot_3").val();

        // reuse old online unique codes
        var reUseVoucherPot1            = $("#reuse_voucher_pot_1").val();
        var reUseVoucherPot2            = $("#reuse_voucher_pot_2").val();
        var reUseVoucherPot3            = $("#reuse_voucher_pot_3").val();

        // online global code setup
        var globalCode1                 = $(step1Selector +  " #global_code_1").val();
        var globalCode2                 = $(step1Selector +  " #global_code_2").val();
        var globalCode3                 = $(step1Selector +  " #global_code_3").val();

        // online override dates
        var overrideOnlineDatesCode1          = $(step1Selector +  " #online_code_date_override_1").val();
        var overrideOnlineDatesCode2          = $(step1Selector +  " #online_code_date_override_2").val();
        var overrideOnlineDatesCode3          = $(step1Selector +  " #online_code_date_override_3").val();

        // online override days to add
        var overrideOnlineDatesCode1days      = $(step1Selector +  " #online_voucher_date_override_1_days").val();
        var overrideOnlineDatesCode2days      = $(step1Selector +  " #online_voucher_date_override_2_days").val();
        var overrideOnlineDatesCode3days      = $(step1Selector +  " #online_voucher_date_override_3_days").val();


        // online meta data
        var printAtTillOnline           = $(step1Selector +  " #print_at_till_online").val();
        var instantWinOnline            = $(step1Selector +  " #instant_win_online").val();
        var mediumOnline                = $(step1Selector +  " #offer_medium_online").val();
        var promotionIdOnline           = $(step1Selector +  " #promotion_id_online").val();
        var promotionGroupIdOnline      = $(step1Selector +  " #promotion_group_id_online").val();

        // online global code setup
        var instoreCode1                = $(step2Selector +  " #instore_code_1_instore").val();
        var instoreCode2                = $(step2Selector +  " #instore_code_2_instore").val();
        var instoreCode3                = $(step2Selector +  " #instore_code_3_instore").val();

        // instore override dates
        var overrideInstoreDatesCode1          = $(step2Selector +  " #instore_code_date_override_1").val();
        var overrideInstoreDatesCode2          = $(step2Selector +  " #instore_code_date_override_2").val();
        var overrideInstoreDatesCode3          = $(step2Selector +  " #instore_code_date_override_3").val();

        // instore override days to add
        var overrideInstoreDatesCode1days      = $(step2Selector +  " #instore_voucher_date_override_1_days").val();
        var overrideInstoreDatesCode2days      = $(step2Selector +  " #instore_voucher_date_override_2_days").val();
        var overrideInstoreDatesCode3days      = $(step2Selector +  " #instore_voucher_date_override_3_days").val();

        // instore meta data
        var printAtTillInstore          = $(step2Selector +  " #print_at_till_instore").val();
        var instantWinInstore           = $(step2Selector +  " #instant_win_instore").val();
        var mediumInstore               = $(step2Selector +  " #offer_medium_instore").val();
        var promotionIdInstore          = $(step2Selector +  " #promotion_id_instore").val();
        var promotionGroupIdInstore     = $(step2Selector +  " #promotion_group_id_instore").val();

        payloadNode = {

            "promotion_type"                    : promotionType,

            "control_group"                     : controlGroup,

            "email_template"                    : emailTemplate,

            "cell_code"                         : cellCode,
            "cell_name"                         : cellName,
            "campaign_name"                     : campaignName,
            "campaign_id"                       : campaignId,
            "campaign_code"                     : campaignCode,

            "voucher_pot_1"                     : voucherPot1,
            "voucher_pot_2"                     : voucherPot2,
            "voucher_pot_3"                     : voucherPot3,

            "re_use_voucher_pot_1"              : reUseVoucherPot1,
            "re_use_voucher_pot_2"              : reUseVoucherPot2,
            "re_use_voucher_pot_3"              : reUseVoucherPot3,

            "global_code_1"                     : globalCode1,
            "global_code_2"                     : globalCode2,
            "global_code_3"                     : globalCode3,

            "online_code_date_override_1"       : overrideOnlineDatesCode1,
            "online_code_date_override_2"       : overrideOnlineDatesCode2,
            "online_code_date_override_3"       : overrideOnlineDatesCode3,

            "online_voucher_date_override_1_days" : overrideOnlineDatesCode1days,
            "online_voucher_date_override_2_days" : overrideOnlineDatesCode2days,
            "online_voucher_date_override_3_days" : overrideOnlineDatesCode3days,

            "print_at_till_online"              : printAtTillOnline,
            "instant_win_online"                : instantWinOnline,
            "offer_medium_online"               : mediumOnline,
            "promotion_id_online"               : promotionIdOnline,
            "promotion_group_id_online"         : promotionGroupIdOnline,

            "instore_code_1"                    : instoreCode1,
            "instore_code_2"                    : instoreCode2,
            "instore_code_3"                    : instoreCode3,

            "instore_code_date_override_1"       : overrideInstoreDatesCode1,
            "instore_code_date_override_2"       : overrideInstoreDatesCode2,
            "instore_code_date_override_3"       : overrideInstoreDatesCode3,

            "instore_voucher_date_override_1_days" : overrideInstoreDatesCode1days,
            "instore_voucher_date_override_2_days" : overrideInstoreDatesCode2days,
            "instore_voucher_date_override_3_days" : overrideInstoreDatesCode3days,

            "print_at_till_instore"             : printAtTillInstore,
            "instant_win_instore"               : instantWinInstore,
            "offer_medium_instore"              : mediumInstore,
            "promotion_id_instore"              : promotionIdInstore,
            "promotion_group_id_instore"        : promotionGroupIdInstore

        };

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
            $("<p>" + key + "</p>").appendTo("#summary_json_key");
            $("<p>" + summaryPayload[key] + "</p>").appendTo("#summary_json_value");
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