
// Sample data for product logs
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

let PRODUCTS = [];

function updateProductList(products) {
let html = "";

products.forEach(product => {
  html += `
  <tr>
    <td class="quadrant">${ product.quadrant_name }</td>
    <td class="product_title">${ product.name }</td>
    <td class="view_product" product-id="${ product.id }">👁️</td>
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

// function getProduct(product_id) {
//   const quadrant_id = $('#quadrant_id').val();
//   const product_name = $('#update_product_name input').val();
//   const product_quantity = $('#update_product_quantity input').val();
//   const product_description = $('#update_description input').val();
//   const product_id = $('#update_product_id').val();

//   const DATA = {
//     quadrant_id: quadrant_id,
//     product_name: product_name,
//     product_quantity: product_quantity,
//     product_id: product_id,
//     product_description: product_description
//   };

//   $.post('/product/update', DATA, () => {
//     getProducts();
//     $('#update_popup, #add_product_popup, #mask').hide();
//   });
// }


$(document).ready(() => {
  getProducts();
  auto_grow(document.getElementById('description'));
});

