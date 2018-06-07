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


$(document).bind("ready", function() {
    $('.nav-drop').dropit();
});

function formLogic(form, peopleLimit, productType) {
    /*form.submit(function (e) {
     e.preventDefault();
     var data = getFormObj(form);
     });*/

    var childrenSelect = form.find('[name="children"]');
    var childrenSelectDrop = form.find('[name="childrenSel"]');

    var adultsSelect = form.find('[name="adults"]');
    var adultsSelectDrop = form.find('[name="adultsSel"]');

    var childrenAgeWrap = form.find('.childrenAgeWrap');
    var labelAge = form.find('.labelAge');
    var gptsChildAge = form.find('.gptsChildAge');

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
            if (dateStartInput.datepicker('getDate') >= dateEndInput.datepicker('getDate')) {
                tempEndDate = $(this).datepicker('getDate');
                tempEndDate.setDate(tempEndDate.getDate() + 1);
            }
            $(this).datepicker('hide');
            if (typeof tempEndDate !== 'undefined') dateEndInput.datepicker('setDate', tempEndDate);
            dateEndInput.focus();
            dateEndInput.datepicker('show');
        });
    dateEndInput.datepicker('setStartDate', '+1d' );
    dateEndInput.datepicker('setDate', dateEnd)
        .on('changeDate', function(e) {
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
                    console.log(data);
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
        console.log($(this).parent().next().val());
    });

    // hide/shows children ages selects
    $(childrenSelect.add(childrenSelectDrop)).on('change', function() {
        var childrenCount = $(this).val();
        var select = '';

        for (var i = 0; i < childrenCount; i++) {
            $(gptsChildAge[i]).show();
            $(gptsChildAge[i]).prop( "disabled", false );
        }
        for (var i = childrenCount; i < peopleLimit; i++) {
            $(gptsChildAge[i]).hide();
            $(gptsChildAge[i]).prop( "disabled", true );
        }

        if (childrenCount != 0) {
            labelAge.show();
        } else {
            labelAge.hide();
        }
        //childrenAgeWrap.empty().append(select);
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

}

//TODO: unused
function getFormObj(form) {
    var formParams = {};

    form
        .serializeArray()
        .sort(SortByName)
        .forEach(function(item) {
            if (formParams[item.name]) {
                formParams[item.name] = [formParams[item.name]];
                formParams[item.name].push(item.value)
            } else {
                formParams[item.name] = item.value
            }
        });
    return formParams;
}

function SortByName(a, b){
    var aName = a.name.toLowerCase();
    var bName = b.name.toLowerCase();
    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}
