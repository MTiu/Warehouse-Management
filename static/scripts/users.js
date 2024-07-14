function dateConvert(date){
    const dateObject = new Date(date);
    const formattedDate = dateObject.toLocaleString();
    return formattedDate;
}

function loadUsers(){
    $.post("/userSearch", {name: $('#search input').val()}, (data)=> {
        updateUserList(data);
    })
}

function updateUserList(users) {
    let html = "";
    let userLevel = $('#user_level').val();
    users.forEach(user => {
        if(user.id !== 1){
            html += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.first_name}</td>
                    <td>${user.last_name}</td>
                    <td>${user.username}</td>
                    <td>${user.level == 2 ? "User" : "Moderator"}</td>
                    <td>${dateConvert(user.created_at)}</td>
                    <td>${dateConvert(user.updated_at)}</td>
            `;
            if(userLevel == 1){
                html += `
                    <td class="edit_user" user-id="${user.id}" user-fname="${user.first_name}" user-lname="${user.last_name}" user-username="${user.username}" user-level="${user.level}">✏️</td>
                    <td class="remove_user" user-id="${user.id}">❌</td>
                    <td class="reset_password" user-id="${user.id}">RESET</td>
                </tr>
                `;
            }
        } else {
            html += `
            <tr>
                <td>${user.id}</td>
                <td>${user.first_name}</td>
                <td>${user.last_name}</td>
                <td>${user.username}</td>
                <td>Admin</td>
                <td>${dateConvert(user.created_at)}</td>
                <td>${dateConvert(user.updated_at)}</td>
        `;
        if(userLevel == 1){
            html += `
                <td class="edit_user" user-id="${user.id}" user-fname="${user.first_name}" user-lname="${user.last_name}" user-username="${user.username}" user-level="${user.level}">✏️</td>
                <td></td>
                <td class="reset_password" user-id="${user.id}">RESET</td>
            </tr>
            `
        }
        }
    });
    
    if(!users.length) {
        html = "<tr><td>No users to display</td></tr>"
    }
    
    $('tbody').html(html);
}

loadUsers();

$(document).on('change','#search input', ()=>{
    const SEARCH_VALUE = $('#search input').val();
    $.post("/userSearch", {name: SEARCH_VALUE}, (data)=> {
        updateUserList(data);
    })
})

$(document).on('click', '.closeButton', (e)=>{
    e.preventDefault(); 
    $('.edit-container').hide();
    $('.add-container').hide();
    $('.mask').hide();
})

$(document).on('click', '#addButton', (e)=>{
    e.preventDefault(); 
    $('.add-container').show();
    $('.mask').show();
})

$(document).on('click', '.edit_user', (e)=>{
    
    const USER_ID = $(e.target).attr("user-id");
    const USER_FIRST_NAME = $(e.target).attr("user-fname");
    const USER_LAST_NAME = $(e.target).attr("user-lname");
    const USER_USERNAME = $(e.target).attr("user-username");
    const USER_LEVEL = $(e.target).attr("user-level");
    $('.edit-container select').show();
    $('#levelHeader').show();
    $('.edit-container').height("700px");
    if(USER_ID == 1){
        $('#levelHeader').hide();
        $('.edit-container select').hide();
        $('.edit-container').height("600px");
    }
    $('.edit-container input[name="user_id"]').val(USER_ID);
    $('.edit-container input[name="first_name"]').val(USER_FIRST_NAME);
    $('.edit-container input[name="last_name"]').val(USER_LAST_NAME);
    $('.edit-container input[name="username"]').val(USER_USERNAME);
    $('.edit-container select[name="level"]').val(USER_LEVEL);

    $('.edit-container').show();
    $('.mask').show();
})

$('#editForm').on('submit', function(event) {
    if (this.checkValidity()) {
        event.preventDefault(); 
        var formData = $(this).serialize();
        console.log(formData);
        $.post('/editUser', formData, function(res) {
            loadUsers();
        });

        $('.edit-container').hide();
        $('.mask').hide();
    }
});

$('#addForm').on('submit', function(event) {
    if (this.checkValidity()) {
        event.preventDefault(); 
        var formData = $(this).serialize();
        console.log(formData);
        $.post('/addUser', formData, function(res) {
            alert(`PASSWORD CODE IS ${res.password}`);
            loadUsers();
        });

        $('.add-container').hide();
        $('.mask').hide();
    }
});

$(document).on('click','.remove_user', (e)=>{
    if(confirm("Are you sure you want to remove user?")){
        const ID = $(e.target).attr("user-id");
        $.post("/removeUser", {ID: ID}, ()=>{
            loadUsers();
        })
    }
})

$(document).on('click','.reset_password', (e)=>{
    if(confirm("Are you sure you want to reset password of user?")){
        const ID = $(e.target).attr("user-id");
        $.post("/resetUser", {ID: ID}, (res)=>{
            alert(`PASSWORD CODE IS ${res.password}`);
            loadUsers();
        })
    }
})