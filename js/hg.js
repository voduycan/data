$(document).ready(function() {

    $('.auto-height').matchHeight();
    $('.item-height').matchHeight();


    document.getElementById('wrapper3').onclick = function() {
        var className = ' ' + wrapper3.className + ' ';
        this.className = ~className.indexOf(' active ') ?
            className.replace(' active ', ' ') :
            this.className + ' active';
    }

    $('li.dropdown a').on('click', function(event) {
        $(this).parent().toggleClass('open');
    });

    $('.dropdown-menu').click(function() {
        event.stopPropagation();
    });

    $('.submenu').click(function() {
        $('.submenu-list').slideToggle();
    });

    var slider = $('#lightSlider').lightSlider({
        gallery: true,
        item: 1,
        loop: false,
        slideMargin: 0,
        thumbItem: 4,
        controls: false,
        enableTouch: true,
        enableDrag: true,
        responsive: [{
            breakpoint: 767,
            settings: {
                thumbItem: 3
            }
        }]
    });


    $('#goToPrevSlide').on('click', function() {
        slider.goToPrevSlide();
    });
    $('#goToNextSlide').on('click', function() {
        slider.goToNextSlide();
    });


    $('#popup-gallery .gallery-index').on('click', function() {
        slider.destroy();
        var index_gallery = $(this).index();
        if (!slider.lightSlider) {
            slider = $('#lightSlider').lightSlider({
                gallery: true,
                adaptiveHeight: true,
                slideEndAnimation: true,
                item: 1,
                loop: false,
                slideMargin: 0,
                thumbItem: 4,
                controls: false,
                enableTouch: true,
                enableDrag: true,
                keyPress: true,
                responsive: [{
                    breakpoint: 767,
                    settings: {
                        thumbItem: 3
                    }
                }],
                onSliderLoad: function(el) {
                    slider.goToSlide(index_gallery);
                }
            });
        }

    });

    $(function() {
        $(".abcs").slice(0, 12).show();
        $("#load-more").on('click', function(e) {
            e.preventDefault();
            $(".abcs:hidden").slice(0, 8).slideDown();
            if ($(".abcs:hidden").length == 0) {
                $("#load-more").fadeOut('slow');
            }
        });
    });

    $('.hidden-room-choice').change(function() {
        var select_room = $(this);
        if (select_room.is(':checked')) {
            select_room.parent().parent().parent().find('.booking-item').addClass('checked-trust-selection');
        } else {
            select_room.parent().parent().parent().find('.booking-item').removeClass('checked-trust-selection');
        }
    });

    $('.hidden-stars').change(function() {
        var selected_star = $(this);
        if (selected_star.is(':checked')) {
            selected_star.parent().find('.hg-star-selection').addClass('checked-star-selection');
        } else {
            selected_star.parent().find('.hg-star-selection').removeClass('checked-star-selection');
        }
    });

    $('.hidden-trustrate').change(function() {
        var selected_trustrate = $(this);
        if (selected_trustrate.is(':checked')) {
            selected_trustrate.parent().find('.hg-trust-selection').addClass('checked-trust-selection');
        } else {
            selected_trustrate.parent().find('.hg-trust-selection').removeClass('checked-trust-selection');
        }
    });

    $('.hidden-trustrate-filter').change(function() {
        var select_trustrate = $(this);
        if (select_trustrate.is(':checked')) {
            select_trustrate.parent().find('.hg-trust-selection').addClass('checked-trust-selection');
        } else {
            select_trustrate.parent().find('.hg-trust-selection').removeClass('checked-trust-selection');
        }
    });

    function sumAdultGuest() {
        var sum_room_guest_num = 0;
        $('.each-adult-num').each(function() {
            sum_room_guest_num += parseInt($(this).html());
        });
        $('.adult-num').html(sum_room_guest_num);
    };

    function sumChildGuest() {
        var sum_room_child_num = 0;
        $('.each-child-num').each(function() {
            sum_room_child_num += parseInt($(this).html());
            var this_child_num = parseInt($(this).html());
            if (this_child_num == 1) {
                $(this).parent().siblings('.each-age-block-1').show();
                $(this).parent().siblings('.each-age-block-2').hide();
            } else if (this_child_num == 2) {
                $(this).parent().siblings('.each-age-block-2').show();
            } else {
                $(this).parent().siblings('.each-age-block-1').hide();
            }
        });

        $('.child-num').html(sum_room_child_num);
    };

    function roomUpdate() {
        var room_number_update = $('.room-number-update');
        room_number_update.each(function() {
            var field_room_number = $(this).closest('.block-room-update').index();
            $(this).html(field_room_number);
        });
    };

    $('#reduce-room').on('click', function() {
        var room_number_update = $('.room-number-update');
        var room_num = parseInt($('.room-num').html());
        var input_room_num = $('.btn-group-select-num .btn-primary.active input#room-input');
        var block_room = $('.block-room-update');
        room_num = room_num == 1 ? 1 : room_num - 1;
        $('.room-num').html(room_num);
        if (block_room.length > 1) {
            block_room.last().remove();
        }
        roomUpdate();
        sumAdultGuest();
        sumChildGuest();
        input_room_num.val(room_num);
    });

    $('#add-room').on('click', function() {
        var room_num = parseInt($('.room-num').html());
        var input_room_num = $('.btn-group-select-num .btn-primary.active input#room-input');
        var block_room = $('.block-room-update');
        var deep_clone = $('.block-room-update').eq(0).clone();
        var room_dropdown = $('.dropdown-menu.room-guest-dropdown');
        room_num = room_num == 3 ? 3 : room_num + 1;
        $('.room-num').html(room_num);
        if (block_room.length < 3) {
            deep_clone.appendTo(room_dropdown);
        }
        roomUpdate();
        sumAdultGuest();
        sumChildGuest();
        input_room_num.val(room_num);
    });

    $('.dropdown-menu.room-guest-dropdown').on('click', '.reduce-adult', function() {
        var input_adult_num = $('.btn-group-select-num .btn-primary.active input#adult-input');
        var adult_num_current = parseInt($(this).siblings('.each-adult-num').html());
        adult_num_current = adult_num_current == 1 ? 1 : adult_num_current - 1;
        $(this).siblings('.each-adult-num').html(adult_num_current);
        sumAdultGuest();
        var adult_num = parseInt($('.adult-num').html());
        input_adult_num.val(adult_num);
    });

    $('.dropdown-menu.room-guest-dropdown').on('click', '.add-adult', function() {
        var input_adult_num = $('.btn-group-select-num .btn-primary.active input#adult-input');
        var adult_num_current = parseInt($(this).siblings('.each-adult-num').html());
        adult_num_current = adult_num_current == 4 ? 4 : adult_num_current + 1;
        $(this).siblings('.each-adult-num').html(adult_num_current);
        sumAdultGuest();
        var adult_num = parseInt($('.adult-num').html());
        input_adult_num.val(adult_num);
    });

    $('.dropdown-menu.room-guest-dropdown').on('click', '.reduce-child', function() {
        var child_num_current = parseInt($(this).siblings('.each-child-num').html());
        var input_child_num = $('.btn-group-select-num .btn-primary.active input#child-input');
        child_num_current = child_num_current == 0 ? 0 : child_num_current - 1;
        $(this).siblings('.each-child-num').html(child_num_current);
        sumChildGuest();
        var child_num = parseInt($('.child-num').html());
        input_child_num.val(child_num);
    });

    $('.dropdown-menu.room-guest-dropdown').on('click', '.add-child', function() {
        var child_num_current = parseInt($(this).siblings('.each-child-num').html());
        var input_child_num = $('.btn-group-select-num .btn-primary.active input#child-input');
        child_num_current = child_num_current == 2 ? 2 : child_num_current + 1;
        $(this).siblings('.each-child-num').html(child_num_current);
        sumChildGuest();
        var child_num = parseInt($('.child-num').html());
        input_child_num.val(child_num);
    });

    $('.dropdown-menu.room-guest-dropdown').on('click', '.add-age', function() {
        var age_num_current = parseInt($(this).siblings('.each-age-num').html());
        age_num_current = age_num_current == 12 ? 12 : age_num_current + 1;
        $(this).siblings('.each-age-num').html(age_num_current);
    });

    $('.dropdown-menu.room-guest-dropdown').on('click', '.reduce-age', function() {
        var age_num_current = parseInt($(this).siblings('.each-age-num').html());
        age_num_current = age_num_current == 1 ? 1 : age_num_current - 1;
        $(this).siblings('.each-age-num').html(age_num_current);
        sumAdultGuest();
    });


    $(function() {
        $("#slider-range").slider({
            range: true,
            min: 0,
            max: 2500,
            values: [0, 2500],
            slide: function(event, ui) {
                $("#amount").html("AUD " + ui.values[0] + " - AUD " + ui.values[1]);
                $("#hotel-price-from-filter").val(ui.values[0]);
                $("#hotel-price-to-filter").val(ui.values[1]);
            },
        });
        $("#amount").html("AUD " + $("#slider-range").slider("values", 0) +
            " - AUD " + $("#slider-range").slider("values", 1));
    });

    $('#add-new-user-button').on('click', function() {
        var add_new_user = $('.add-new-user-container');
        var icon_add_new = $('.add-new-user-box i');
        if (!add_new_user.is(':visible')) {
            add_new_user.slideDown();
            icon_add_new.removeClass("fa-plus-circle").addClass("fa-minus-circle");
        } else {
            add_new_user.slideUp();
            icon_add_new.removeClass("fa-minus-circle").addClass("fa-plus-circle");
        }
    });

    $('#button-edit-account-profile').on('click', function() {
        var current_profile_setting = $('.profile-setting-display');
        var edit_profile_setting = $('.profile-setting-edit');
        if (!edit_profile_setting.is(':visible')) {
            current_profile_setting.hide();
            edit_profile_setting.fadeIn();
        } else {}
    });

    $('#cancel-account-profile-edit').on('click', function() {
        var current_profile_setting = $('.profile-setting-display');;
        var edit_profile_setting = $('.profile-setting-edit');
        // var edit_profile_setting_input = $('.profile-setting-edit input');
        if (!current_profile_setting.is(':visible')) {
            edit_profile_setting.hide();
            current_profile_setting.fadeIn();
            // edit_profile_setting_input.val("");
        } else {}
    });

    $('#button-edit-agency-profile').on('click', function() {
        var current_agency_setting = $('.agency-setting-display');
        var edit_agency_setting = $('.agency-setting-edit');
        if (!edit_agency_setting.is(':visible')) {
            current_agency_setting.hide();
            edit_agency_setting.fadeIn();
        } else {}
    });

    $('#cancel-agency-edit').on('click', function() {
        var current_agency_setting = $('.agency-setting-display');
        var edit_agency_setting = $('.agency-setting-edit');
        // var edit_agency_setting_input = $('.agency-setting-edit input');
        if (!current_agency_setting.is(':visible')) {
            edit_agency_setting.hide();
            current_agency_setting.fadeIn();
            // edit_agency_setting_input.val("");
        } else {}
    });




    function readURLImage(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $('.img-preview').attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    $("#imgInput, #account_avtInput, #newuser_avtInput").change(function() {
        readURLImage(this);
    });

    $('#agency-country').change(function() {
        var agency_state = $('#agency-state');
        if ($(this).val() === "") {
            agency_state.prop('disabled', 'disabled');
        } else {
            agency_state.removeAttr('disabled');
        }
    });


    $('.account-i-check').iCheck({
        checkboxClass: 'i-check'
    });

    $('.year-choice .fa-angle-left').click(function() {
        var year_show = $('.year-choice span');
        var year_number = parseInt(year_show.html());
        year_number = year_number - 1;
        $('.year-choice span').html(year_number);
    });


    $('.year-choice .fa-angle-right').click(function() {
        var year_show = $('.year-choice span');
        var year_number = parseInt(year_show.html());
        year_number = year_number + 1;
        $('.year-choice span').html(year_number);
    });

    $('input.datepicker').datepicker({
        todayHighlight: true,
        startDate: '+0d'
    });

    $('#reset-field-button').on('click', function() {
        var manage_form_input = $('.manage-form-holder input');
        manage_form_input.val('');
    });


    $('.backing-button').on('click', function() {
        window.history.back();
    });


});