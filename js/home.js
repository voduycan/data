$(function() {
    formLogicHotels($('#hotels-search'), 10, 'ACCOMMODATION');
    //formLogic($('#activities-search'), 20, 'EXCURSION');

    if (backend.message != 0) {
        alert(backend.message);
    }

    starsLogic();

});


var starsLogic = function () {
    var starsCancel = $('.stars-cancel');
    var starsButtons = $('.star-button');
    var starRating = $('#star-rating-val');
    var starInput = $('input[name="category"]');

    var sOn = 'star-on';
    var sOff = 'star-off';
    var sHover = 'star-hover';
    var sCancelOff = 'stars-cancel-disabled';
    var sCancelHover = 'stars-cancel-hover';


    var starsHoverIn = function () {
        iterateStarsButtonsHover($(this)[0], sHover);
    };

    var starsHoverOut = function () {
        iterateStarsButtonsHover($(this)[0], '', sHover);
    };

    var starsClick = function () {
        var index = iterateStarsButtonsSelect($(this)[0]);
        starsCancel.removeClass(sCancelOff);
        starsCancel.mouseenter(starCancelOn);
        starRating.html(index + 2);
        starInput.val(index + 2);
    };

    var iterateStarsButtonsHover = function (current, addClass, removeClass) {
        var found = false;
        starsButtons.each(function (i, el) {
            if(el == current) {
                found = true;
            }
            if(found == true) {
                $(this).addClass(addClass);
                $(this).removeClass(removeClass);
            }
        });
    };

    var iterateStarsButtonsSelect = function (current) {
        var found = false;
        var index = false;
        starsButtons.each(function (i, el) {
            if(el == current) {
                index = i;
                found = true;
            }
            if(found == true) {
                $(this).addClass(sOn);
                $(this).removeClass(sOff);
                $(this).removeClass(sHover);
            } else {
                $(this).removeClass(sOn);
                $(this).addClass(sOff);
            }
        });
        return index;
    };

    var starCancelOn = function () {
        $(this).addClass(sCancelHover);
    };

    starsButtons.hover(starsHoverIn, starsHoverOut);

    starsCancel.mouseleave( function () {
        $(this).removeClass(sCancelHover);
    } );

    starsButtons.click(starsClick);

    starsCancel.click(function () {
        starsCancel.addClass(sCancelOff);
        $(this).removeClass(sCancelHover);
        starsCancel.off('mouseenter', starCancelOn);
        iterateStarsButtonsSelect();
        starRating.html(0);
        starInput.val(0);
    });
};