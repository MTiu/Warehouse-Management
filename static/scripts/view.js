// Sample data for product logs
let previousRow;
let selectedID;

function auto_grow(element) {
  element.style.height = "5px";
  element.style.height = (element.scrollHeight) + "px";
  }

function loadLineChart(){
      // Check if a chart instance already exists
      const existingChart = Chart.getChart('productLogsChart');
  
      // If a chart instance exists, destroy it
      if (existingChart) {
        existingChart.destroy();
      }
      const SELECTED_YEAR = $('#selected_year').val();
      const YEAR = {
        selectedYear: SELECTED_YEAR
      };
  $.post("/chart/line", YEAR, (data) => {
    const productLogsData = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug","Sep","Oct","Nov","Dec"],
      productAdds: data.logs.map(log => log.total_adds),
      productRemoves: data.logs.map(log => log.total_subtracts)
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
  });

}

let PRODUCTS = [];

function updateProductList(products) {
let html = "";
products.forEach(product => {
  html += `
  <tr selected-product-id="${product.id}">
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

if(selectedID) {
  const selectedRow = $(`tr[selected-product-id="${selectedID}"]`);
  previousRow = selectedRow;
  if (selectedRow.length) {
    selectedRow.css('background-color', '#262626');
    selectedRow.css('color', 'white');
  }
}
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

$(document).on('change', '#selected_year', () => {
  loadLineChart();
})

$(document).on('click','.view_product', (e) => {
  let editHTML = "";
  $.post('/quadrant', (data) =>{

    editHTML = `
    <h2>EDIT PRODUCT</h2>
    <input type="hidden" id="update_product_id" value= "${$(e.target).attr('product-id')}">
    <label for="title">
      <h4>Name: </h4>
      <input name="name" type="text" id="update_product_name" value="${$(e.target).attr('product-name')}" />
    </label>
    <label for="description">
      <h4>Description: </h4>
      <textarea oninput="auto_grow(this)" name="description" id="update_description">${$(e.target).attr('product-desc') == "null" ? "No Description" : $(e.target).attr('product-desc')}</textarea>
    </label>
    <label for="quantity">
      <h4>Quantity: </h4>
      <input type="number" name="quantity" id="update_product_quantity" value="${parseInt($(e.target).attr('product-quantity'))}" />
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
  selectedID = $(e.target).attr('product-id');
});

$(document).on('click', '#edit_product_button', function() {
  const quadrant_id = $('#quadrant_id').val();
  const product_name = $('#update_product_name').val();
  const product_quantity = $('#update_product_quantity').val();
  const product_description = $('#update_description').val();
  const product_id = $('#update_product_id').val();

  const DATA = {
      quadrant_id: quadrant_id,
      product_name: product_name,
      product_quantity: product_quantity,
      product_id: product_id,
      product_description: product_description
  };

  $.post('/product/update', DATA, () => {
      getProducts();
      loadLineChart();
  });
});

$(document).ready(() => {
  getProducts();
  loadLineChart();
});

