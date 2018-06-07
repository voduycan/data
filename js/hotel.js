$(document).ready(function() {

    $(window).resize(stickyRight);
    stickyRight();

    function stickyRight() {
        if ($(window).width() > 768) {
            $('#sticky-right').sticky({
                topSpacing: 30,
                zIndex: 1001
            });
        }

    };

    formLogicHotels($('#roomsSearch'), 10, 'ACCOMMODATION');

    if ($('#map-canvas').length) {
        var map,
            service;
        jQuery(function($) {
            $(document).ready(function() {
                var latlng = new google.maps.LatLng(backend.latitude, backend.longitude);
                var myOptions = {
                    zoom: 14,
                    center: latlng,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    scrollwheel: false
                };
                map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);

                if (backend.mark) {
                    var marker = new google.maps.Marker({
                        position: latlng,
                        map: map
                    });
                    marker.setMap(map);
                }
                $('a[href="#google-map-tab"]').on('shown.bs.tab', function(e) {
                    google.maps.event.trigger(map, 'resize');
                    map.setCenter(latlng);
                });
            });
        });
    }

    initCancellation();

    $("img").on('error', function() {
        $(this).closest('.col-md-2').remove();
    });

    $("img").on('imageLoad', function(e) {
        $(this).closest('.col-md-2').removeClass('hidden');
    });


    $('#roomsSearch').submit(function() {
        window.scrollTo(0, 0);
        $("#loading").show();
        $("#container").hide();
        $.magnificPopup.close();
        var rq = $(this).serialize();
        $.ajax({
            type: 'post',
            url: 'getRooms',
            data: rq,
            success: function(data) {
                $("#rooms-form").empty().append(data);
                $("#loading").hide();
                $("#container").show();
                initCancellation();
            },
            error: function(error) {
                console.log(error);
            }
        });
        return false;
    });

    initAdditionalSearch();

});

function initCancellation() {
    $('.cancellation-policy').magnificPopup({
        removalDelay: 500,
        preloader: true,
        closeBtnInside: true,
        callbacks: {
            beforeOpen: function() {
                this.st.mainClass = this.st.el.attr('data-effect');
            },
            close: function() {
                $("#cancellationContent").empty()
            }
        },
        midClick: true
    });
    $('.cancellation-policy').bind("click", function(event) {
        var rq = {
            offerKey: $(this).data('offerkey')
        };
        $.ajax({
            type: 'post',
            url: 'getCancellation/0',
            data: rq,
            success: function(data) {
                $("#cancellationContent").empty().append(data);
            }
        });
        event.stopPropagation();
        //return false;
    });
}

function initAdditionalSearch() {
    $('.popup-text').magnificPopup({
        removalDelay: 500,
        closeBtnInside: true,
        callbacks: {
            beforeOpen: function() {
                this.st.mainClass = this.st.el.attr('data-effect');
            },
            open: function() {
                if ($('#hotelsSearchPopup').length) {
                    formLogicHotels($('#hotelsSearchPopup'), 10, 'ACCOMMODATION');
                }
            }
        },
        midClick: true
    });
}