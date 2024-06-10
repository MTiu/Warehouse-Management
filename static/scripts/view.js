// Sample data for product logs
let previousRow;
function loadLineChart(){
  // $.post("/")
  const productLogsData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug","Sep","Oct","Nov","Dec"],
    productAdds: [3500, 1200, 1500, 1000, 2400, 1200],
    productRemoves: [1515, 684, 1051, 1042, 1612, 911]
    };
    
    // Get the canvas element
    const ctx = document.getElementById('productLogsChart').getContext('2d');
    
    // Create the chart
    const productLogsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: productLogsData.labels,
      datasets: [
        {
          label: 'Adds',
          data: productLogsData.productAdds,
          borderColor: 'darkgreen',
          backgroundColor: 'lime',
          borderWidth: 2
        },
        {
          label: 'Removes',
          data: productLogsData.productRemoves,
          borderColor: 'darkred',
          backgroundColor: 'red', 
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: true,
        text: 'Product Adds and Removes Over Time'
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Warehouse Movement'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Months'
          }
        }
      }
    }
    });
    
}

let PRODUCTS = [];

function updateProductList(products) {
let html = "";
products.forEach(product => {
  html += `
  <tr>
    <td class="quadrant">${ product.quadrant_name }</td>
    <td class="product_title">${ product.name }</td>
    <td class="view_product" product-id="${ product.id }" product-name="${product.name}" product-desc="${ product.description}" product-quantity="${ product.quantity }" quadrant-id="${product.quadrant_id}" quadrant-name="${product.quadrant_name}">👁️</td>
    <td>${ product.quantity }</td>
  </tr>
  `;
});

if(!products.length) {
  html = "<tr><td>No Product Display</td></tr>"
}

$('tbody').html(html);
}

function getProducts() {
let quadrant_list_array_string = "";
  
$('.quadrant_checkbox').each((index, checkbox) => {
  if(checkbox.checked) {
    quadrant_list_array_string += checkbox.value + ",";
  }
});

if(!quadrant_list_array_string) {
  quadrant_list_array_string = "0 "; // DO NOT REMOVE EXTRA SPACE
}

$.post("/dashboard", { quadrant_list: quadrant_list_array_string.substring(0, quadrant_list_array_string.length - 1), query_string: "" }, (data) => {
  PRODUCTS = data.products;
  PRODUCTS = PRODUCTS.sort((a, b) => a.quantity - b.quantity);

  updateProductList(PRODUCTS);
});
}

function auto_grow(element) {
element.style.height = "5px";
element.style.height = (element.scrollHeight) + "px";
}

$(document).on('click','.view_product', (e) => {
  let editHTML = "";
  $.post('/quadrant', (data) =>{

    editHTML = `
    <h2>EDIT PRODUCT</h2>
    <label for="title">
      <h4>Name: </h4>
      <input name="name" type="text" id="name" value="${$(e.target).attr('product-name')}" />
    </label>
    <label for="description">
      <h4>Description: </h4>
      <textarea oninput="auto_grow(this)" name="description" id="description">${$(e.target).attr('product-desc') == "null" ? "No Description" : $(e.target).attr('product-desc')}</textarea>
    </label>
    <label for="quantity">
      <h4>Quantity: </h4>
      <input type="number" name="quantity" id="quantity" value="${parseInt($(e.target).attr('product-quantity'))}" />
    </label>
    <label for="quadrant">
      <h4>Quadrant Name:</h4>
      <select id="quadrant_id">
        <option value="${ $(e.target).attr('quadrant-id') }">${ $(e.target).attr('quadrant-name') }</option>
  `;

  data.quadrants.forEach(quadrant => {
    // Check if the quadrant ID and name do not match the current one
    if (quadrant.id !== $(e.target).attr('quadrant-id') && quadrant.name !== $(e.target).attr('quadrant-name')) {
      editHTML += `
        <option value="${quadrant.id}">${quadrant.name}</option>
      `;
    }
  });

    editHTML += `
        </select>
    </label>
    <button id="edit_product_button">Edit</button>
    `

  $('.right .container').html(editHTML);

  })

  if (previousRow) {
    previousRow.css('background-color', '');
    previousRow.closest('tr').css('color', '');
  }

  $(e.target).closest('tr').css('background-color', '#262626');
  $(e.target).closest('tr').css('color', 'white');

  previousRow = $(e.target).closest('tr');
});

$(document).ready(() => {
  getProducts();
  loadLineChart();
});

