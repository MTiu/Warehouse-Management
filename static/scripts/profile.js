    $('#editForm').on('submit', function(event) {
        if (this.checkValidity()) {
            event.preventDefault(); 
            const NEW_PASSWORD = $(`input[name="new_password"]`).val();
            const CONFIRM_PASSWORD = $(`input[name="confirm_password"]`).val();
            console.log(NEW_PASSWORD, CONFIRM_PASSWORD);
            var formData = $(this).serialize();
            if(NEW_PASSWORD !== CONFIRM_PASSWORD){
                alert("NEW PASSWORD AND CONFIRM PASSWORD SHOULD BE THE SAME!!");
                return;
            } else {
                $.post('/changePass', formData, function(res) {
                    alert(res.message); 
                    window.location.href = "/logout";
            })
            }
        }
    });
