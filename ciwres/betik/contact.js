(function ($) {
    "use strict";

    jQuery(document).ready(function ($) {
        $(document).on('submit', '#contact_form_submit', function (e) {
            e.preventDefault();
            var name = $('#name').val().trim();
            var email = $('#email').val().trim();
            var subject = $('#subject').val().trim();
            var orgname = $('#orgname').val().trim();
            var message = $('#message').val().trim();
            var phone = $('#phone').val().trim();
            var optInVal = $('#optInCheck').val();
            var optedInMailing = $('#optInCheck').is(":checked") ? optInVal : false;

            if (name && email && message) {
                $.ajax({
                    type: "POST",
                    url: 'contact/',
                    data: {
                        'name': name,
                        'email': email,
                        'subject': subject,
                        'orgname': orgname,
                        'message': message,
                        'phone': phone,
                        'optedInMailing' : optedInMailing,
                        'visip': kulip
                    },
                    success: function (data) {
                        $('#visitorMessage').children('.email-success').remove();
                        if (data == 'Name, email, and message fields are required.') {
                            $('#visitorMessage').append('<div class="alert alert-danger emailforminvalid">' + data + '</div><br>');
                            $('#contact_form_submit').prepend('<div class="alert alert-danger emailforminvalid">' + data + '</div>');
                        } else {
                            $('#visitorMessage').append('<div class="alert alert-success email-success">' + data + '</div><br>');
                        }

                    },
                    error: function (res) {
                        console.log("An error occurred preventing form submission.");
                    }
                });
            } else {
                let data = 'Name, e-mail address and message fields are required.';
                $('#contact_form_submit').children('.email-success').remove();
                $('#contact_form_submit').prepend('<div class="alert alert-danger">' + data + '</div>');
                $('#visitorMessage').append('<div class="alert alert-danger emailforminvalid">' + data + '</div><br>');
                // $('#map').height('576px');
                $('.emailforminvalid').fadeOut(9000);
            }

        });
    })

}(jQuery));