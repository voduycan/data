
$('.voucher').click(function (){
    var rq = {
        processId: $(this).data('processid'),
    };
    $.ajax({
        type: 'post',
        url: backend.voucherRoute,
        data: rq,
        success: function(data) {
            if (data.error) {
                $("#errorVoucher").empty().append(data.error);
                $.magnificPopup.open({
                          removalDelay: 500,
                          preloader: true,
                          closeBtnInside: true,
                          callbacks: {
                              close: function() {
                                  $("#errorVoucher").empty();
                              },
                              beforeOpen: function() {
                                 this.st.mainClass = 'mfp-zoom-out';
                              }
                          },
                          midClick: true,
                  items: {
                    src: '#errorVoucher', // can be a HTML string, jQuery object, or CSS selector
                    type: 'inline'
                  }
                });
                return false;
            }
            if (data.link) {
                window.location.href = data.link;
            }
        }
    });
});
