$(document).ready(function () {

    for (var property in backend.roomsSupplierPrices) {
        if (backend.roomsSupplierPrices.hasOwnProperty(property)) {
            roomMarkup(property, backend.roomsSupplierPrices[property]);
        }
    }

    console.log(backend.roomsSupplierPrices);
});

var allActualMarkupInputs = [];
var totalPriceHolder      = $(".booking-price");

function updateTotalPrice() {
    var total = 0;
    allActualMarkupInputs.forEach(function(actualMarkupInput) {
        total += parseFloat( actualMarkupInput.val() );
    });
    totalPriceHolder.html( decForm(round(total, 2)) );
}

function roomMarkup(roomNumber, supplierPrice) {

    /* START: markup logic */

    var cancellationsMargin    = 0;
    var markupLimit            = 0.5; // percents
    var markupMinPrice         = parseFloat( $("#markup-base-price-" + roomNumber).data('priceMin') );
    var markupSuggestedPrice   = parseFloat( $("#markup-base-price-" + roomNumber).data('priceSuggested') );
    var taxesAmount            = parseFloat( $("#taxes-" + roomNumber).data('price') );

    var actualMarkupInput      = $("#final-markup-"         + roomNumber); // final-markup-{{ $key }}
    allActualMarkupInputs.push(actualMarkupInput);
    var editMarkupInput        = $("#markup-val-"                  + roomNumber); // markup-val-{{ $roomNumber }}
    var editMarkupYourProfit   = $("#markup-profit-"               + roomNumber); // markup-profit-{{ $roomNumber }}
    var roomPriceHoldersOnPage = $(".booking-room-price-"          + roomNumber); // booking-room-price-{{ $roomNumber }}
    var roomPriceNoTaxHolders  = $(".booking-room-price-no-tax-"   + roomNumber);

    var warningMax             = $("#markup-val-max-warn-"  + roomNumber); //
    var warningMin             = $("#markup-val-min-warn-"  + roomNumber); //
    var warningZero            = $("#markup-val-zero-warn-" + roomNumber); //

    var markupButton           = $("#markup-button-"        + roomNumber); //markup-button-{{ $roomNumber }}
    var markupSaveButton       = $("#markup-save-"          + roomNumber); //markup-button-{{ $roomNumber }}
    var markupSaveButtonOff    = $("#markup-save-dis-"      + roomNumber); //markup-button-{{ $roomNumber }}
    var markupCancelButton     = $("#markup-cancel-"        + roomNumber); //markup-button-{{ $roomNumber }}



    var lastMarkupPrice = parseFloat(editMarkupInput.val()); //for cancel click
    var saveFlag = false;


    $('.cancellation-policy-btn').bind("click", function() {
        $("#cancellationContent").empty();
        var rq = {
            offerKey: $(this).data('offerkey')
        };
        $.ajax({
            type: 'post',
            url: 'getCancellation/' + cancellationsMargin.toString(),
            data: rq,
            success: function(data) {
                $("#cancellationContent").empty().append(data);
            }
        });
        return false;
    });

    editMarkupInput.on('input', function () {
        if (this.value.match(/[^\d\.]/g)) {
            this.value = this.value.replace(/[^\d\.]/g, '');
        }
        if (this.value.match(/\./g) != null && this.value.match(/\./g).length > 1) {
            this.value = this.value.substr(0, this.value.lastIndexOf("."));
        }

        if (editMarkupInput.val() == '') {
            warningZero.show();
            warningMin.hide();
            warningMax.hide();
            editMarkupYourProfit.html('');
        } else {
            var input = parseFloat(editMarkupInput.val());
            var validInput = validateEditInput(input);
            if(validInput > input) {
                warningMin.show();
                warningMax.hide();
                warningZero.hide();
                markupSaveButton.hide();
                markupSaveButtonOff.show();
            } else if(validInput < input) {
                warningMin.hide();
                warningMax.show();
                warningZero.hide();
                markupSaveButton.hide();
                markupSaveButtonOff.show();
            } else {
                warningMin.hide();
                warningMax.hide();
                warningZero.hide();
                markupSaveButton.show();
                markupSaveButtonOff.hide();
            }

            var profit = input - supplierPrice;
            profit = round(profit, 2);

            editMarkupYourProfit.html(decForm(profit).toString());
        }
    });

    var toValidState = function () {
        var input = Number(editMarkupInput.val());
        input = validateEditInput(input);

        warningMin.hide();
        warningMax.hide();
        warningZero.hide();

        var profit = input - supplierPrice;
        profit = round(profit, 2);

        editMarkupYourProfit.html(decForm(profit).toString());
        editMarkupInput.val(input.toString());
    };

    //editMarkupInput.on('change, blur', toValidState);

    var validateEditInput = function (input) {
        if(markupMinPrice > input) { //should be not less, than Suggested price
            return markupMinPrice;
        }

        var markupPercent = input / markupSuggestedPrice - 1;
        if(markupPercent > markupLimit) {
            return round(markupMinPrice * (markupLimit + 1), 2);
        }
        return input;
    };

    var saveMarkup = function () {
        toValidState();
        var roundedInput = round(editMarkupInput.val(), 2);
        roundedInput = validateEditInput(roundedInput);

        lastMarkupPrice = roundedInput;

        cancellationsMargin = roundedInput - markupSuggestedPrice;

        actualMarkupInput.val(roundedInput);
        editMarkupInput.val(roundedInput);
        
        var roundedInputNoTax = round(roundedInput - taxesAmount, 2);
        roomPriceHoldersOnPage.html(decForm(roundedInput).toString());
        roomPriceNoTaxHolders.html(decForm(roundedInputNoTax).toString());

        updateTotalPrice();

        saveFlag = false;
    };

    var markupCancel = function () {
        toValidState();
        editMarkupInput.val(lastMarkupPrice.toString());
        var profit = round(lastMarkupPrice - supplierPrice, 2);
        editMarkupYourProfit.html(decForm(profit).toString());

    };

    var closeFunction = function () {
        if(saveFlag) {
            saveMarkup();
        } else {
            markupCancel();
        }
    };


    var markupPopUp = markupButton.magnificPopup({
        removalDelay: 500,
        preloader: true,
        closeBtnInside: true,
        callbacks: {
            close: closeFunction
        },
        midClick: true
    });

    markupSaveButton.click(function () {
        saveFlag = true;
        markupPopUp.magnificPopup('close');
    });

    markupCancelButton.click(function () {
        markupPopUp.magnificPopup('close');
    });

    /* END: markup logic */

}


function decForm(float) {
    var val = parseFloat(Math.round(float * 100) / 100).toFixed(2);
    return numberWithCommas(val);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}