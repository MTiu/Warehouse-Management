function dateConvert(date){
    const dateObject = new Date(date);
    const formattedDate = dateObject.toLocaleString();
    return formattedDate;
}

function loadLogs(){
    $.post("/logSearch", {name: $('#search input').val()}, (data)=> {
        updateLogList(data);
    })
}

function updateLogList(logs) {
    let html = "";
    let user = $('#user_level').val();
    logs.forEach(log => {
        html += `
            <tr>
                <td>${(log.product_id)? log.product_id : "Unregistered Product"}</td>
                <td>${log.product_name}</td>
                <td>${log.username}</td>
                <td>${log.operation}</td>
                <td>${log.quantity}</td>
                <td>${dateConvert(log.created_at)}</td>
                <td>${dateConvert(log.updated_at)}</td>
        `;
        if(user == 1){
            html += `
                <td class="edit_log" log-id="${log.id}" log-user="${log.username}" product-id="${log.product_id}" product-name="${log.product_name}" log-operation="${log.operation}" product-quantity="${log.quantity}">✏️</td>
                <td class="remove_log" log-id="${log.id}">❌</td>
            </tr>
        `;
    }
    });
    
    if(!logs.length) {
        html = "<tr><td>No logs to display</td></tr>"
    }
    
    $('tbody').html(html);
}

loadLogs();

$(document).on('change','#search input', ()=>{
    const SEARCH_VALUE = $('#search input').val();
    $.post("/logSearch", {name: SEARCH_VALUE}, (data)=> {
        updateLogList(data);
    })
})

$(document).on('click','.remove_log', (e)=>{
    if(confirm("Are you sure you want to remove log?")){
        const ID = $(e.target).attr("log-id");
        $.post("/removeLog", {ID: ID}, ()=>{
            loadLogs();
        })
    }
})

$(document).on('click', '.edit_log', (e)=>{
    const LOG_ID = $(e.target).attr("log-id");
    const LOG_OP = $(e.target).attr("log-operation");
    const PRODUCT_QUANTITY = $(e.target).attr("product-quantity");
    const PRODUCT_NAME = $(e.target).attr("product-name");

    $('input[name="log_id"]').val(LOG_ID);
    $('input[name="product_name"]').val(PRODUCT_NAME);
    $('input[name="quantity"]').val(PRODUCT_QUANTITY);
    $('input[name="operation"]').val(LOG_OP);
    $('.edit-container').show();
    $('.mask').show();
})

$(document).on('click', '#closeButton', (e)=>{
    e.preventDefault(); 
    $('.edit-container').hide();
    $('.mask').hide();
})

$('#editForm').on('submit', function(event) {
    if (this.checkValidity()) {
        event.preventDefault(); 
        var formData = $(this).serialize();
        
        $.post('/editLog', formData, function(res) {
            loadLogs();
        });

        $('.edit-container').hide();
        $('.mask').hide();
    }
});