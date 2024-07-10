$(document).ready(() => {
    $('#loginForm').on('submit', function(event) {
        if (this.checkValidity()) {
            event.preventDefault(); 
            var formData = $(this).serialize();

            $.post('/logProc', formData, function(res) {
                if (res.message) {
                    alert(res.message); 
                } else {
                    window.location.href = res;
                }
            })
        }
    });
});