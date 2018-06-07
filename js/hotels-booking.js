$(document).ready(function () {
    // Grab the form:
    var $form = $('#gptsRegForm');
    var $stripeForm = $('.stripe-wrapper');

    //called if stripe success
    var submitFormFunction = function(){
        window.scrollTo(0, 0);
        $("#loading").show();
        $("#container").hide();
        var rq = $form.serialize();
        $.ajax({
            type: 'post',
            url: 'book',
            //timeout: 180000,
            data: rq,
            success: function(data) {
                if (data.error) {
                    $("#loading").hide();
                    $("#cancellationContent").empty().append(data.error);
                    $("#container").show();
                    if (data.type == 'stripe') {
                        $(".gptsBtnBook").prop( "disabled", false);
                    }
                    $.magnificPopup.open({
                        removalDelay: 500,
                        preloader: true,
                        closeBtnInside: true,
                        callbacks: {
                            close: function() {
                                $("#cancellationContent").empty();
                            },
                            beforeOpen: function() {
                                this.st.mainClass = 'mfp-zoom-out';
                            }
                        },
                        midClick: true,
                        items: {
                            src: '#cancellationPolicy', // can be a HTML string, jQuery object, or CSS selector
                            type: 'inline'
                        }
                    });
                    //return window.location.reload();
                } else {
                    if (data.redirect) {
                        window.location.href = data.redirect;
                    } else {
                        $("#pageData").empty().append(data);
                        $("#loading").hide();
                        $(".markup-button").hide();
                        $("#container").show();
                    }
                }
            },
            error: function(error) {
                console.log(error);

                $("#loading").hide();
                $("#cancellationContent").empty().append('Booking unknown error');
                $("#container").show();
                $.magnificPopup.open({
                    removalDelay: 500,
                    preloader: true,
                    closeBtnInside: true,
                    callbacks: {
                        close: function() {
                            $("#cancellationContent").empty();
                        },
                        beforeOpen: function() {
                            this.st.mainClass = 'mfp-zoom-out';
                        }
                    },
                    midClick: true,
                    items: {
                        src: '#cancellationPolicy', // can be a HTML string, jQuery object, or CSS selector
                        type: 'inline'
                    }
                });

            }
        });
        return false;
    };


    // STRIPE STUFF
    var stripeActive = false;

    var stripeFormActivate = function () {
        $stripeForm.show();
        $form.unbind('submit', submitFormFunction);
        $form.submit(stripeTokenAttach);
        $stripeForm.find('input').each(function () {
            $(this).prop('disabled', false);
        });
        stripeActive = true;

    };

    var stripeFormDeactivate = function () {
        $stripeForm.hide();
        $form.unbind('submit', stripeTokenAttach);
        $form.submit(submitFormFunction);
        $stripeForm.find('input').each(function () {
            $(this).prop('disabled', true);
        });
        stripeActive = false;
    };

    stripeFormDeactivate();

    var stripeTokenAttach = function(event) {
        // Disable the submit button to prevent repeated clicks:
        $form.find('.gptsBtnBook').prop('disabled', true);

        // Request a token from Stripe:
        Stripe.card.createToken($form, stripeResponseHandler);

        // Prevent the form from being submitted:
        return false;
    };

    function stripeResponseHandler(status, response) {

        if (response.error) { // Problem!

            // Show the errors on the form:
            $form.find('.payment-errors').text(response.error.message);
            $form.find('.gptsBtnBook').prop('disabled', false); // Re-enable submission

        } else { // Token was created!

            // Get the token ID:
            var token = response.id;

            // Insert the token ID into the form so it gets submitted to the server:
            $form.append($('<input type="hidden" name="stripeToken">').val(token));

            // main submit function
            submitFormFunction();
        }
    }

    var stripeFormTirgger = function () {
            if ($(this).is(':checked') && parseInt($(this).val()) == backend.stripeId) {
                stripeFormActivate();
            } else if (stripeActive == true) {
                stripeFormDeactivate();
            }
    };

    Stripe.setPublishableKey(backend.stripe_public);

    $form.find('input:radio[name="paymentMethodId"]').on('ifChecked',stripeFormTirgger);
    $form.find('input:radio[name="paymentMethodId"]').each(stripeFormTirgger);

    // new logic when there is only stripe
    stripeFormActivate();

// STRIPE STUFF END


    $('.regform-child-birthday input').datepicker({ format: 'yyyy-mm-dd' });

    $('.cancellation-policy-btn').magnificPopup({
        removalDelay: 500,
        preloader: true,
        closeBtnInside: true,
        callbacks: {
            beforeOpen: function() {
                this.st.mainClass = this.st.el.attr('data-effect');
            },
            close: function() {
                //$("#cancellationContent").empty();
            }
        },
        midClick: true
    });

    

    $('.i-radio').on('ifClicked',function() {
        if ($(this).val() == "GUEST") {
            $('#gptsRegForm input, select, button[type=submit]').each(function() {
                $(this).prop("disabled", false);
            });
            $('input[name="user[password]"]').prop("disabled", true);
            $('input[name="user[confirmPassword]"]').prop("disabled", true);
            $('input[name="auth[email]"]').prop("disabled", true);
            $('input[name="auth[password]"]').prop("disabled", true);
            $('.passwordWrap').hide();
            $('.authWrap').hide();
        } else if ($(this).val() == "AUTH") {
            $('#gptsRegForm input[type=text], input[type=email], input[type=password], input[name=paymentMethodId], select, button[type=submit]').each(function() {
                $(this).prop("disabled", true);
            });
            $('input[name="auth[email]"]').prop("disabled", false);
            $('input[name="auth[password]"]').prop("disabled", false);
            $('.passwordWrap').hide();
            $('.authWrap').show();
        } else if ($(this).val() == "REGISTER")  {
            $('#gptsRegForm input, select, button[type=submit]').each(function() {
                $(this).prop("disabled", false);
            });
            $('input[name="auth[email]"]').prop("disabled", true);
            $('input[name="auth[password]"]').prop("disabled", true);
            $('.authWrap').hide();
            $('.passwordWrap').show();
        }
        return false;
    });

    $('#authSubmit').click(function() {
          var validErrors = false;
          $('.authWrap input').each(function() {
             if ($(this).val() == '') {
                $(this).css('background', 'pink');
                validErrors = true
             }
          });
          if (validErrors) return false;
          var rq = {
              email: $('.authWrap input[type=email]').val(),
              password: $('.authWrap input[type=password]').val()
          };

          $.ajax({
              type: 'get',
              url: backend.authRoute,
              data: rq,
              success: function(data) {
                  if (data == 'success') {
                      window.location.reload();
                      $form.find('.gptsBtnBook').prop('disabled', false);
                  } else {
                      $('.alert').show();
                      $form.find('.gptsBtnBook').prop('disabled', false);
                  }
              }
          });
          return false;
    });

    // AJAX request for variants of customers
    $('.typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1,
        limit: 10
    }, {
        source: function(q, cb) {
            var rq = {
                pattern: q + '%',
            };
            return $.ajax({
                dataType: 'json',
                type: 'post',
                url: '/getPrivateClients',
                data: rq,
                chache: false,
                success: function(data) {
                    console.log(data);
                    var result = [];
                    $.each(data.persons, function(index, val) {
                        result.push({
                            value: val.firstName + ' ' + val.lastName,
                            firstname: val.firstName,
                            lastname: val.lastName,
                            prefix: val.prefix,
                            citizenshipId: val.citizenshipId,
                            personId: val.personId,
                            phone: val.contactPhone,
                            email: val.email,
                            birthdate: val.birthdate
                        });
                    });
                    cb(result);
                }
            });
        }
    }).on('typeahead:selected', function(object, datum) {
        var wrapperId = $(this).data('guestId');
        var wrapper = $('#' + wrapperId);

        wrapper.find('.guest-firstname').val(datum.firstname);
        wrapper.find('.guest-lastname').val(datum.lastname);
        wrapper.find('.guest-prefix option[value="'+datum.prefix+'"]').attr('selected', 'selected');
        wrapper.find('.guest-citizenship option[value="'+datum.citizenshipId+'"]').attr('selected', 'selected');
        wrapper.find('.person-id').val(datum.personId);
        wrapper.find('.guest-phone').val(datum.phone);
        wrapper.find('.guest-email').val(datum.email);
        wrapper.find('.guest-birthday').val(datum.birthdate);
    });


    

});

// only digits in adjust price input
/*function onlyDigits() {
    if (this.value.match(/[^\d\.]/g)) {
        this.value = this.value.replace(/[^\d\.]/g, '');
    }
    if (this.value.match(/\./g) != null && this.value.match(/\./g).length > 1) {
        this.value = this.value.substr(0, this.value.lastIndexOf("."));
    }
}*/

function sync(fromElement, toElement) {
    $(toElement).val($(fromElement).val());
}

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}
