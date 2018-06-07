var mapDiv, mapCloseDiv;

$(document).ready(function() {
    $('.nav-drop').dropit();
});


$(function() {
    return $.ajax({
        dataType: 'html',
        type: 'post',
        url: backend.routeName,
        data: backend.ajaxData,
        success: function(data) {
            $('.full-page').remove();
            $("#container").html(data);
            $(document).ready(function () {
                formLogicHotels($('#hotelsSearchPopup'), 10, 'ACCOMMODATION');
                initAdditionalSearch();
                initFilters();
                dynamicHeight();

                mapDiv = $('#map');
                mapCloseDiv = $('.mapClose');
                mapCloseDiv.on('click', toggleBigMap);
                $('#mapButton').on('click', toggleBigMap);
                $('.mapExpand').on('click', toggleBigMap);

            });
        }
    });
});

function toggleBigMap() {
    mapDiv.toggleClass('hidden');
    mapCloseDiv.toggleClass('hidden');
    if(!mapDiv.hasClass('hidden')) {
        initMap();
    }
    return false;
}

function initMap() {

    var imageUrl = 'http://chart.apis.google.com/chart?cht=mm&chs=24x32&chco=FFFFFF,008CFF,000000&ext=.png'
    var markerImage = new google.maps.MarkerImage(imageUrl,
        new google.maps.Size(24, 32));
    var markers = {};

    // Create a map object and specify the DOM element for display.
    var map = new google.maps.Map(document.getElementById('map'), {
        center: backend.cityCoordinates,
        scrollwheel: true,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    jQuery.each(backend.allHotels, function (index, hotel) {
        if (hotel.info.latitude && hotel.info.longitude) {
            var latLng = new google.maps.LatLng(
                hotel.info.latitude,
                hotel.info.longitude
            );
            var marker = new google.maps.Marker({
                position: latLng,
                map: map,
                icon: markerImage,
                title: hotel.info.name
            });
            var infowindow = new google.maps.InfoWindow({
                content: hotelMapInfo({
                    name: hotel.info.name,
                    href: hotel.route,
                    price: hotel.minRoomPrice
                })
            });
            google.maps.event.addListener(marker, 'click', function () {
                infowindow.open(map, marker);
            });
            markers[index] = marker;
        }
    });
}

function hotelMapInfo(props) {
    return '<a href="' + props.href +'" class="gptsShowHotelItem">' + props.name +'</a><br />' +
           '<span>AUD ' + props.price +'</span>';
}

function initFilters()
{
    $("#price-slider").ionRangeSlider({
        min: backend.minPrice,
        max: backend.maxPrice,
        type: 'double',
        prefix: "$",
        // maxPostfix: "+",
        prettify: false,
        hasGrid: true,
        onFinish: function () {
            onFilter();
            return false;
        },
    });


    $('.i-check, .i-radio').iCheck({
        checkboxClass: 'i-check',
        radioClass: 'i-radio',
    });

    $('.i-check-hotel').iCheck({
        checkboxClass: 'i-check hotel',
    });

    $('.i-check-roomType').iCheck({
        checkboxClass: 'i-check roomType'
    });

    $('.i-check-mealType').iCheck({
        checkboxClass: 'i-check mealType'
    });

    //$('.i-check').iCheck('check');

    /*$('.i-check').on('ifClicked', function () {
        if ($(this).parent('div').hasClass('checked')) {
            $(this).iCheck('uncheck');
        } else {
            $(this).iCheck('check');
        }
        onFilter();
        return false;
    });

    var nameTimer;
    $('#hotel-name-filter').on('input', function () {
        clearTimeout(nameTimer);
        nameTimer = setTimeout(function() { onFilter(); }, 1000);
        return false;
    });

    var priceTimer;
    $('#hotel-price-from-filter').on('input', function () {
        clearTimeout(priceTimer);
        priceTimer = setTimeout(function() { onFilter(); }, 1000);
        return false;
    });

    $('#hotel-price-to-filter').on('input', function () {
        clearTimeout(priceTimer);
        priceTimer = setTimeout(function() { onFilter(); }, 1000);
        return false;
    }); */

    $('#bf-apply').on('click', function() { onFilter(); });

    $('#bf-cancel').on('click', function() { onFilterCancel(); });


    $('.booking-sort').bind("click", function(event) {
      //$(this).dropit();
        console.log('click');
    });
}

function onFilterCancel() {
    $('#hotel-price-from-filter').val(backend.minPrice);
    $('#hotel-price-to-filter').val(backend.maxPrice);
    $('#hotel-name-filter').val('');
    $('div.i-check.checked input').iCheck('uncheck');
    $('.trust-you-filter').iCheck('uncheck');

    onFilter();
}

function getFilterValues() {
    var filter = {};

    var minPriceInput = $('#hotel-price-from-filter');
    var maxPriceInput = $('#hotel-price-to-filter');

    filter['priceFrom'] = parseInt(minPriceInput.val());
    filter['priceTo'] = parseInt(maxPriceInput.val());

    if(isNaN(filter['priceFrom'])) {filter['priceFrom'] = 0}
    if(isNaN(filter['priceTo'])) {filter['priceTo'] = 0}

    if (filter['priceFrom'] < backend.minPrice) {
        filter['priceFrom'] = backend.minPrice;
        minPriceInput.val(backend.minPrice);
    }

    if (filter['priceTo'] > backend.maxPrice) {
        filter['priceTo'] = backend.maxPrice;
        maxPriceInput.val(backend.maxPrice)
    }

    if (filter['priceTo'] <= filter['priceFrom']) {
        filter['priceTo'] = filter['priceFrom'] + 1;
        maxPriceInput.val( filter['priceFrom'] + 1 );
    }

    filter['budgetRule'] = backend.budgetRule;
    filter['budgetRule'] = 'total'; // always total for now
    filter['categories'] = [];
    filter['facilities'] = [];
    filter['themes'] = [];
    filter['bestValue'] = [];
    filter['availability'] = [];
    filter['cancellations'] = [];
    filter['name'] = $('#hotel-name-filter').val();
    filter['trustYouRating'] = [];

    $('div.i-check.checked input.trust-you-filter').each(function () {
        filter['trustYouRating'].push($(this).val());
    });

    $('div.i-check.checked input.categories-filter').each(function () {
        filter['categories'].push($(this).val());
    });

    $('div.i-check.checked input.availability-filter').each(function () {
        filter['availability'].push($(this).val());
    });

    $('div.i-check.checked input.best-value-filter').each(function () {
        filter['bestValue'].push($(this).val());
    });

    $('div.i-check.checked input.theme-filter').each(function () {
        filter['themes'].push($(this).val());
    });

    $('div.i-check.checked input.facility-filter').each(function () {
        filter['facilities'].push($(this).val());
    });

    $('div.i-check.checked input.cancellations-filter').each(function () {
        filter['cancellations'].push($(this).val());
    });

    return filter;
}

function onFilter(sort, type, page) {

    var rq = {};
    rq = getUrlParams();
    rq.filter = getFilterValues();

    if(sort && type) {
        rq.sortKey = sort;
        rq.sortType = type;
    } else {
        rq.sortKey = backend.sortKey;
        rq.sortType = backend.sortType;
    }

    if (page) {
        rq.page = page;
    } else {
        rq.page = 1;
    }


    console.log(rq);
    $.ajax({
        dataType: 'html',
        type: 'get',
        url: 'filter',
        data: rq,
        success: function(data) {
            $("html, body").animate({ scrollTop: 0 }, "slow", function(){
                $("#hotelsItems").empty().append(data).promise().done(function () {
                    if(!mapDiv.hasClass('hidden')) {
                        initMap();
                    }
                });
            });

            window.history.pushState(rq, rq.page, window.location.href.replace(/\s*?\&page=.*[0-9]/,"") + "&page=" + rq.page);
        }
    });
}

function dynamicHeight() {
    if ($(window).width() >= 690) {
        while ($('.dynamic-fontsize').height() > parseInt($('.dynamic-fontsize').css('line-height'), 10)) {
            fontsize = parseInt($('.dynamic-fontsize').css('font-size'), 10) - 1;
            $('.dynamic-fontsize').css('font-size', fontsize)
        }
    }


    return false;
}



function initAdditionalSearch() {
    $('.popup-text').magnificPopup({
        removalDelay: 500,
        closeBtnInside: true,
        callbacks: {
            beforeOpen: function () {
                this.st.mainClass = this.st.el.attr('data-effect');
            },
            open: function () {

            }
        },
        midClick: true
    });
}
