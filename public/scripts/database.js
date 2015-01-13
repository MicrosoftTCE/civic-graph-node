$(document).ready(function () {
            $('#user-submit').click(function () {
                var payload = {
                    name: $('#user-name').val()
                };
 
                $.ajax({
                    url: "/",
                    type: "POST",
                    contentType: "application/json",
                    processData: false,
                    data: JSON.stringify(payload),
                    complete: function (data) {
                        $('#output').html(data.responseText);
                    }
                });
            });
            $('#user-delete').click(function () {
                var payload = {
                    name: $('#user-name').val()
                };
 
                $.ajax({
                    url: "/",
                    type: "POST",
                    contentType: "application/json",
                    processData: false,
                    data: JSON.stringify(payload),
                    complete: function (data) {
                        $('#output').html(data.responseText);
                    }
                });
            });
        });