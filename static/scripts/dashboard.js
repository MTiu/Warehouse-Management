let PRODUCTS = [];

function updateLabelBackground(checkbox) {
  const label = $(checkbox).closest('label');
  if ($(checkbox).is(':checked')) {
    label.css({
      'background-image': 'linear-gradient(90deg, darkslategray 80%, darkgray 20%)', // Revert to default
      'color': '' // Revert to default
    });
  } else {
    label.css({
      'background-image': 'linear-gradient(90deg, gray 80%, darkgray 20%)', // Black with 50% opacity
      'color': 'white' // Optional: Change text color for better contrast
    });
  }
}

function initEventHandlers(){
  $('.quadrant_checkbox').each(function() {
    updateLabelBackground(this);
  });

  $('.quadrant_checkbox').on('change', function() {
    getProducts();
    updateLabelBackground(this);
  });
}

function uncheckAllCheckboxes() {
  $('.quadrant_checkbox').each(function() {
    $(this).prop('checked', false);
    updateLabelBackground(this); // Update background after unchecking
  });
}

function checkAllCheckboxes() {
  $('.quadrant_checkbox').each(function() {
    $(this).prop('checked', true);
    updateLabelBackground(this); // Update background after checking
  });
}

function updateProductList(products) {
  let itemHTML = "";
  products.forEach(product => {
    itemHTML += `
    <tr>
      <td class="quadrant">${ product.quadrant_name }</td>
      <td class="product_title">${ product.name }</td>
      <td class="update_product" product-description="${ product.description }" product-id="${ product.id }" product-quadrant-name="${ product.quadrant_name }" product-name="${ product.name }" product-quantity="${ product.quantity }" >✏️</td>
      <td class="remove_product" product-id="${ product.id }" product-quantity=${ product.quantity } product-quadrant-id="${product.quadrant_id}">❌</td>
      <td>${ product.quantity }</td>
    </tr>
    `;
  });

  if(!products.length) {
    itemHTML = "<tr><td>No Product Display</td></tr>"
  }

  $('#item_list').html(itemHTML);
}

function updateQuadrantList(data) {
  let quadrantHTML = "";
  let updateQuadrantHTML = "";
  let addQuadrantHTML = "<h4>Select Quadrant:</h4>";
  data.quadrants.forEach(quadrant => {
    quadrantHTML += `
    <label class="quadrant" for="quadrant${quadrant.id}">
      <input class="quadrant_checkbox" checked type="checkbox" name="quadrant" value="${quadrant.id}" id="quadrant${quadrant.id}" /> <h4>${quadrant.name}</h4>
      <h4>Free Space: ${quadrant.free_space}</h4>
      <div>
        ${quadrant.id > 8 ? `<button class="delete quadrant_button" value="${quadrant.id}">Delete</button>` : ''}
        <button class="update quadrant_button" quadrant-id="${quadrant.id}" quadrant-name="${quadrant.name}" quadrant-total-space="${quadrant.total_space}">Update</button>
      </div>
    </label>
    `;
    })
  data.quadrants.forEach(quadrant => {
    updateQuadrantHTML += `
      <option value="${ quadrant.id }">${ quadrant.name }</option>
    `;
    })
  data.quadrants.forEach(quadrant => {
    addQuadrantHTML += `
      <label for="add_product_quadrant${ quadrant.id }">
        <input type="radio" name="add_product_quadrant" class="quadrant_radio_button" value="${ quadrant.id }" id="add_product_quadrant${ quadrant.id }" /> ${ quadrant.name }
      </label>
    `;
    })
  $('#quadrant_list').html(quadrantHTML);
  $('#quadrant_id').html(updateQuadrantHTML);
  $('#quadrants').html(addQuadrantHTML);
  initEventHandlers();
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

  $.post("/dashboard", { quadrant_list: quadrant_list_array_string.substring(0, quadrant_list_array_string.length - 1), query_string: $('#search input').val() }, (data) => {
    PRODUCTS = data.products;

    updateProductList(PRODUCTS);
  });

  $.post("/products/top", (data) => {
    const TOPPRODUCTS = data.top_products;
    let tmpHTML = "";
    TOPPRODUCTS.forEach(product => {
      tmpHTML += `
        <li> ${product.name}</li>
      `
    })
    $('#tmp').html(tmpHTML);
  })

}

$(document).ready(() => {
  // $('#quadrant_list') // todo
  getProducts();
  initEventHandlers();

  $('#add_quadrant_button_submit').click((e) => {
    e.preventDefault();
    e.stopPropagation();

    const DATA = {
      name: $('#quadrant_name > input').val(),
      total_space: $('#quadrant_total_space > input').val(),
    }

    $.post('/quadrant/add', DATA, (data) => {
      getProducts();
    });

    $.post("/quadrant", (data) => {
      updateQuadrantList(data);
      getProducts();
      getChart();
    });

    $('#update_popup, #add_product_popup, #add_quadrant_popup, #mask').hide();
  })

  $('#add_button_submit').click((e) => {
    // DO MACHINE LEARNING
    e.preventDefault();
    e.stopPropagation();
    
    const IS_SELECTED = $('input[name="type_of_materials"]:checked, input[name="use_of_materials"]:checked').length > 0;
    let quadrant_id = 1;

    if (IS_SELECTED) {
      const warehouse = new Warehouse();

      // New data for prediction
      let tom = $('input[name="use_of_materials"]:checked').val();
      if(tom != 1) {
        tom = 0;
      } else {
        tom = $('input[name="type_of_materials"]:checked').val();
      }

      const newData = [
        [parseInt($('#product_quantity > input').val()) , parseInt($('input[name="use_of_materials"]:checked').val()), parseInt(tom)]
      ];

      // Predict the categories using the trained Random Forest Classifier
      const predictedCategories = warehouse.rfClassifier.predict(newData);
      const dataWithCategories = newData.map((row, index) => [...row, predictedCategories[index]]);
      // const kClusters = 2;

      // console.log(newData);

      // // Using the newData classified by the Random Forest
      // const newDataWithCategories = newData.map((row, index) => [...row, predictedCategories[index]]);
      // const newQuantities = newDataWithCategories.map(row => [row[0]]);
      // const initialIndices = [];
      // initialIndices.push(Math.floor(Math.random() * newQuantities.length));

      // const initialCentroids = initialIndices.map(index => newQuantities[index]);

      // // Assuming KMeans class and its methods are already defined
      // const kmeansModel = new KMeans(kClusters, 42);
      // kmeansModel.fit(newData); // Use the original features of newData
      // const newClusters = kmeansModel.assignLabels(newData);
      // const centroids = kmeansModel.centroids;

      quadrant_id = Math.round(dataWithCategories[0][3]);

    } else {
      quadrant_id = $('input[name="add_product_quadrant"]:checked').val();
    }

    const DATA = {
      name: $('#product_name > input').val(),
      quantity: $('#product_quantity > input').val(),
      description: $('input[name="description"]').val(),
      quadrant_id: quadrant_id
    }

    $.post('/product/add', DATA, (data) => {
      getProducts();
    });

    $.post("/quadrant", (data) => {
      updateQuadrantList(data);
      getProducts();
      getChart();
    });

    $('#update_popup, #add_product_popup, #mask').hide();
  });

  $('#add_product').click(() => {
    $('#add_product_popup, #mask').show();
    $('#type_of_materials').css("display", "none");
  })

  $('#deselect_button').on('click', function() {
    uncheckAllCheckboxes();
    getProducts();
  });

  $('#select_all_button').on('click', function() {
    checkAllCheckboxes()
    getProducts();
  });

  $('#add_quadrant').click(() => {
    $('#add_quadrant_popup, #mask').show();
  })

  $('.close_button').click(() => {
    $('#update_popup, #update_quadrant_popup, #add_product_popup, #add_quadrant_popup, #mask').hide();
  })

  $('#manual_add').click(() => {
    $('#quadrants').show();
    $('#use_of_materials, #type_of_materials').hide();
    $('input[name="type_of_materials"], input[name="use_of_materials"], input[name="add_product_quadrant"]').prop('checked', false);
  })

  $('#automatic_add').click(() => {
    $('#quadrants').hide();
    $('#use_of_materials').show();
    $('input[name="type_of_materials"], input[name="use_of_materials"], input[name="add_product_quadrant"]').prop('checked', false);
  })

  $('#use_of_materials input').click((e) => {
    if($(e.target).val() == 1) {
      $('#type_of_materials').css("display", "flex");
    } else {
      $('input[name="type_of_materials"]').prop('checked', false);
      $('#type_of_materials').css("display", "none");
    }
  });
  
  $(document).on('click', '.remove_product', (e) => {
    if(confirm("Are you sure you want to remove this product?")) {
      const PRODUCT_ID = $(e.target).attr("product-id");
      const PRODUCT_QUANTITY = $(e.target).attr("product-quantity");
      const QUADRANT_ID = $(e.target).attr("product-quadrant-id")
      $.post('/product/remove', { product_id: PRODUCT_ID, product_quantity: PRODUCT_QUANTITY, quadrant_id: QUADRANT_ID }, () => {
        $.post("/quadrant", (data) => {
          updateQuadrantList(data);
          getProducts();
          getChart();
        });
      });
    }
  });

  $(document).on('click', '.delete', (e) => {
    if(confirm("Are you sure you want to remove this quadrant and all of its products?")) {
      const QUADRANT_ID = $(e.target).val();

      $.post('/quadrant/remove', {quadrant_id: QUADRANT_ID }, () =>{
        $.post("/quadrant", (data) => {
          updateQuadrantList(data);
          getProducts();
          getChart();
        });
      })
    }
  });

  $(document).on('click', '.update_product', (e) => {
    e.preventDefault();
    e.stopPropagation();
    $('#update_popup, #mask').show();

    let quadrant_name = $(e.target).attr('product-quadrant-name');
    let product_name = $(e.target).attr('product-name');
    let product_quantity = $(e.target).attr('product-quantity');
    let product_id = $(e.target).attr('product-id');
    let product_description = $(e.target).attr('product-description');

    $('#quadrant_id option').filter(function() {
      return $(this).text() === quadrant_name;
    }).prop('selected', true);

    $('#update_product_name input').val(product_name);
    $('#update_product_quantity input').val(product_quantity);
    $('#update_description input').val(product_description);
    $('#update_product_id').val(product_id);
  });

  $(document).on('click', '.update.quadrant_button', (e) => {
    e.preventDefault();
    e.stopPropagation();
    $('#update_quadrant_popup, #mask').show();

    let quadrant_name = $(e.target).attr('quadrant-name');
    let quadrant_id = $(e.target).attr('quadrant-id');
    let quadrant_total_space = $(e.target).attr('quadrant-total-space');
    
    $('#update_quadrant_name input').val(quadrant_name);
    $('#update_quadrant_id').val(quadrant_id);
    $('#update_quadrant_total_space input').val(quadrant_total_space);
  });

  $('#update_button_submit').click(() => {
    const quadrant_id = $('#quadrant_id').val();
    const product_name = $('#update_product_name input').val();
    const product_quantity = $('#update_product_quantity input').val();
    const product_description = $('#update_description input').val();
    const product_id = $('#update_product_id').val();

    const DATA = {
      quadrant_id: quadrant_id,
      product_name: product_name,
      product_quantity: product_quantity,
      product_id: product_id,
      product_description: product_description
    };

    $.post('/product/update', DATA, () => {
      // Delay the quadrant fetch by 5 seconds
      
      setTimeout(() => {
        $.post("/quadrant", (data) => {
          getProducts();
          updateQuadrantList(data);
          getChart();
        });
      }, 100);
    });

    // $.post('/product/update', DATA, () => {
    //   getProducts();

    //   $.post("/quadrant", (data) => {
    //     updateQuadrantList(data);
    //   });
    // });

    $('#update_popup, #add_product_popup, #mask').hide();
  });

  // $('#update_button_submit').click(async () => {
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
  
  //   console.log("Sending update request for product:", DATA);
  
  //   try {
  //     // Update the product
  //     const updateResponse = await $.post('/product/update', DATA);
  //     console.log("Product update response:", updateResponse);
  
  //     // Once the product update is complete, update the quadrant list
  //     const quadrantData = await $.post("/quadrant");
  //     console.log("Quadrant data response:", quadrantData);
  
  //     updateQuadrantList(quadrantData);
  //   } catch (error) {
  //     console.error("Error updating product or fetching quadrants:", error);
  //   }
  
  //   $('#update_popup, #add_product_popup, #mask').hide();
  // });


  $('#update_quadrant_button_submit').click((e) => {
    e.preventDefault();
    e.stopPropagation();

    const DATA = {
      id: $('#update_quadrant_id').val(),
      name: $('#update_quadrant_name > input').val(),
      total_space: $('#update_quadrant_total_space > input').val(),
    }

    $.post('/quadrant/update', DATA, () => {

      $.post("/quadrant", (data) => {
        updateQuadrantList(data);
        getProducts();
        getChart();
      });

    });

    $('#update_popup, #update_quadrant_popup, #mask').hide();
  })

  $(document).on('change', '#search input', () => {
    console.log("ASD");
    getProducts();
  });

  let sort_name = "asc";
  let sort_quantity = "asc";
  let sort_quadrant = "asc";

  $('thead th:nth-child(2)').click(() => {
    if(sort_name == "asc") {
      sort_name = "desc";
      PRODUCTS = PRODUCTS.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sort_name = "asc";
      PRODUCTS = PRODUCTS.reverse();
    }

    updateProductList(PRODUCTS);
  })

  $('thead th:nth-child(1)').click(() => {
    if(sort_quadrant == "asc") {
      sort_quadrant = "desc";
      PRODUCTS = PRODUCTS.sort((a, b) => a.quadrant_name.localeCompare(b.quadrant_name));
    } else {
      sort_quadrant = "asc";
      PRODUCTS = PRODUCTS.reverse();
    }

    updateProductList(PRODUCTS);
  })

  $('thead th:nth-child(5)').click(() => {
    if(sort_quantity == "asc") {
      PRODUCTS = PRODUCTS.sort((a, b) => a.quantity - b.quantity);
      sort_quantity = "desc";
    } else {
      PRODUCTS = PRODUCTS.sort((a, b) => b.quantity - a.quantity);
      sort_quantity = "asc";
    }

    updateProductList(PRODUCTS);
  })
});
