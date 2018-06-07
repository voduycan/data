function getUrlParams() {
    var urlParams;
    (window.onpopstate = function () {
        var match,
            pl     = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query  = window.location.search.substring(1);

        urlParams = {};
        while (match = search.exec(query))
            urlParams[decode(match[1])] = decode(match[2]);
    })();
    return urlParams;
}

function formLogicHotels(form, peopleLimit, productType) {
    //date picker initialization
    form.find('.input-daterange').datepicker({
        todayHighlight: true,
        dateFormat: 'dd-mm-yyyy'
        //language: backend.lang
    });

    var dateStartInput = form.find('.input-daterange input[name="start"]');
    var dateEndInput = form.find('.input-daterange input[name="end"]');
    var dateStart = new Date(dateStartInput.data('date'));
    var dateEnd = new Date(dateEndInput.data('date'));

    // fix datepicker parameters
    dateStartInput.datepicker('setDate', dateStart)
        .on('changeDate', function(e) {
            var tempEndDate = false;
            if (Math.ceil((dateStartInput.datepicker('getDate') - dateEndInput.datepicker('getDate'))/86400000 * 7) == 0) {
                tempEndDate = $(this).datepicker('getDate');
                tempEndDate.setDate(tempEndDate.getDate() + 1);
            }

            $(this).datepicker('hide');
            if (tempEndDate) dateEndInput.datepicker('setDate', tempEndDate);
            dateEndInput.focus();
            dateEndInput.datepicker('show');
        });

    dateEndInput.datepicker('setDate', dateEnd)
        .on('changeDate', function(e) {
            var tempStartDate = false;
            if (Math.ceil((dateStartInput.datepicker('getDate') - dateEndInput.datepicker('getDate'))/86400000 * 7) == 0) {
                tempStartDate = $(this).datepicker('getDate');
                tempStartDate.setDate(tempStartDate.getDate() + 1);
            }
            if (tempStartDate) dateEndInput.datepicker('setDate', tempStartDate);
            $(this).datepicker('hide');
            $(this).blur();
        });


    // AJAX request for variants of cities
    form.find('.typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1,
        limit: 10
    }, {
        source: function(q, cb) {
            var rq = {
                pattern: q + '%',
                productType: productType
            };
            return $.ajax({
                dataType: 'json',
                type: 'post',
                url:  '/' + backend.lang + '/getLocations',
                data: rq,
                chache: false,
                success: function(data) {
                    var result = [];
                    $.each(data.cities, function(index, val) {
                        result.push({
                            value: val.name + ', ' + val.countryName,
                            cityId: val.id
                        });
                    });
                    cb(result);
                }
            });
        }
    }).on('typeahead:selected', function(object, datum) {
        $(this).parent().next().val(datum.cityId);
    });

    // Rooms count logic for multiroom
    form.find('#roomsNumberUl a').on('click', function() {
        var roomsCount = $(this).data('value');
        var text = $(this).html();

        form.find('input[name="rooms[count]"]').val(roomsCount).trigger('change');
        form.find('#roomsNumberBtn').data('value', roomsCount);
        form.find('#roomsNumberBtn .roomsNumberBtnText').html(text);

        generateTextForRooms();
    });

    // Adults count logic
    form.find('.adultsNumber #adultsNumberUl a').on('click', function() {
        var adultsCount = $(this).data('value');
        var roomNumber = $(this).data('room');
        var text = $(this).html();

        form.find('.adultsSel-' + roomNumber).val(adultsCount).trigger('change');
        form.find('#adultsNumberBtn-' + roomNumber).data('value', adultsCount);
        form.find('#adultsNumberBtn-' + roomNumber + ' .adultsNumberBtnText').html(text);

        generateTextForRooms();
    });

    // Children count logic
    form.find('.childrenNumber #childrenNumberUl a').on('click', function() {
        var childrenCount = $(this).data('value');
        var roomNumber = $(this).data('room');
        var text = $(this).html();

        form.find('.childrenSel-' + roomNumber).val(childrenCount).trigger('change');
        form.find('#childrenNumberBtn-' + roomNumber).data('value', childrenCount);
        form.find('#childrenNumberBtn-' + roomNumber + ' .childrenNumberBtnText').html(text);

        generateTextForRooms();
    });

    // ChildrenAges count logic
    form.find('.childAgeNumber #childAgeNumberUl a').on('click', function() {
        var childrenAgeCount = $(this).data('value');
        var roomNumber = $(this).data('room');
        var childNumber = $(this).data('child');


        form.find('.childAge-' + roomNumber + '-' + childNumber).val(childrenAgeCount).trigger('change');
        form.find('#childAgeNumberBtn-' + roomNumber + '-' + childNumber + ' .childAgeNumberBtnText').html(childrenAgeCount);
    });

    // hide/shows room block for multiroom booking
    form.find('input[name="rooms[count]"]').on('change', function() {
        var roomsIndex = $(this).val();
        form.find('.room').each(function(index) {
            if (index < roomsIndex) {
                $(this).removeClass('active');
                $(this).addClass('active');
                $(this).find('.adultsSel, .childrenSel').each(function() {
                    $(this).prop('disabled', false);
                });
            } else {
                $(this).removeClass('active');
                $(this).find('input').each(function() {
                    $(this).prop('disabled', true);
                });
            }
        });
    });


    // set js functioanlity of every room block
    form.find('.room').each(function(index) {
        var room = $(this);

        var childrenSelect = $(room).find('.children');
        var childrenSelectDrop = $(room).find('.childrenSel');

        var adultsSelect = $(room).find('.adults');
        var adultsSelectDrop = $(room).find('.adultsSel');

        var labelAge = $(room).find('.labelAge')
        var childAge = $(room).find('.childAgeNumber');
        var gptsChildAge = $(room).find('.childAge');

        // hide/shows children ages selects
        childrenSelectDrop.on('change', function() {
            var childrenCount = $(this).val();
            var select = '';

            for (var i = 0; i < childrenCount; i++) {
                $(childAge[i]).show();
                $(gptsChildAge[i]).prop( "disabled", false );
            }
            for (var i = childrenCount; i < peopleLimit; i++) {
                $(childAge[i]).hide();
                $(gptsChildAge[i]).prop( "disabled", true );
            }

            if (childrenCount != 0) {
                labelAge.show();
            } else {
                labelAge.hide();
            }
        });

        // limits total max people selection (changes children/adults select options accordingly)
        var maxPeopleControl = function(event) {
            var select = event.data.select;
            var selectDrop = event.data.selectDrop;
            var peopleLimit = event.data.peopleLimit;

            var people = $(this).val();
            var freePlacesLeft = peopleLimit - people;

            for(i = 0; i <= select.length; i++) {
                nOption = select[i];
                if (i >= freePlacesLeft) {
                    $(nOption).parent().hide();
                } else {
                    $(nOption).parent().show();
                }
            }
            var selectDropOpts = selectDrop.find('option');
            for(i = 0; i <= selectDropOpts.length; i++) {
                nOption = selectDropOpts[i];
                if (i >= freePlacesLeft) {
                    $(nOption).hide();
                } else {
                    $(nOption).show();
                }
            }
        };

        adultsSelect.add(adultsSelectDrop).change({
            select: childrenSelect,
            selectDrop: childrenSelectDrop,
            peopleLimit: peopleLimit + 1 /* 0 correction */}, maxPeopleControl);

        childrenSelect.add(childrenSelectDrop).change({
            select: adultsSelect,
            selectDrop: adultsSelectDrop,
            peopleLimit: peopleLimit}, maxPeopleControl);


        // obviously
        hideRadioShowSelect(adultsSelect, adultsSelectDrop);
        hideRadioShowSelect(childrenSelect, childrenSelectDrop);

        function hideRadioShowSelect(radios, select) {
            radios.last().change(function() {
                radios.parent().parent().addClass('hidden');
                radios.prop('disabled', true);
                select.removeClass('hidden');
                select.prop('disabled', false);
            });
        }


        // required to JS init proper initial state from DOM. Sadly, we don't have React here=(
        initButtons(adultsSelect, adultsSelectDrop);
        initButtons(childrenSelect, childrenSelectDrop);

        function initButtons(radios, select){
            var r = radios.filter(':checked');
            r.change();
            if (r.val() == radios.last().val()) {
                select.find('option:selected').change();
            }
        }
    });
}

function generateTextForRooms() {
    var adultsSum = 0;
    var childrenSum = 0;
    var roomsText = $('#roomsModal #roomsNumberBtn .roomsNumberBtnText').html();

    $('.room.active').each(function() {
        $(this).find('.adultsNumber button').each(function() {
            adultsSum += $(this).data('value');
        });
        $(this).find('.childrenNumber button').each(function() {
            childrenSum += $(this).data('value');
        });
    });

    $('#hotelRooms .roomsCountText').html(roomsText);
    $('#hotelRooms .adultsCountText').html(adultsSum);
    $('#hotelRooms .childrenCountText').html(childrenSum);
}

// REWRITE THIS
function setDefault(rooms, adults, children) {
    $('.room').each(function(index) {
        if (index < rooms) {
            if (!$(this).hasClass('active')) {
                $(this).addClass('active');
            }
            $(this).find('#adultsNumberBtn-1 .adultsNumberBtnText').html(adults);
            $(this).find('#adultsSel-1').val(adults).trigger('change');
            $(this).find('#childrenNumberBtn-1 .childrenNumberBtnText').html(children);
            $(this).find('#childrenSel-1').val(children).trigger('change');
            } else {
                $(this).removeClass('active');
                $(this).find('input').each(function() {
                    $(this).hide();
                    $(this).prop('disabled', true);
                });
            }
    });

    $('#hotelRooms .roomsCountText').html(rooms);
    $('#hotelRooms .adultsCountText').html(adults);
    $('#hotelRooms .childrenCountText').html(children);

    return true;
}
