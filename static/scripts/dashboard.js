let PRODUCTS = [];

function calculateFreeSpacePercentage(freeSpace, totalSpace) {
  const adjustedTotalSpace = totalSpace;
  const freeSpacePercentage = (freeSpace / adjustedTotalSpace) * 100;
  return Math.min(Math.round(freeSpacePercentage), 100); 
}

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
      <td class="update_product" product-description="${ product.description }" product-id="${ product.id }" product-quadrant-name="${ product.quadrant_name }" product-name="${ product.name }" product-quantity="${ product.quantity }" product-length="${ product.length }" product-width="${ product.width }" product-height="${ product.height }">✏️</td>
      <td class="remove_product" product-id="${ product.id }" product-name="${product.name}" product-quantity=${ product.quantity } product-quadrant-id="${product.quadrant_id}" product-length=${ product.length } product-width=${ product.width } product-height=${ product.height }>❌</td>
      <td>${ product.quantity }</td>
    </tr>
    `;
  });

  if(!products.length) {
    itemHTML = "<tr><td>No product to display</td></tr>"
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
      <h4>Est. Free Space: ${calculateFreeSpacePercentage(quadrant.free_space, quadrant.total_space)}%</h4>
      <div>
        ${quadrant.id > 8 ? `<button class="delete quadrant_button" value="${quadrant.id}">Delete</button>` : ''}
        <button class="update quadrant_button" quadrant-id="${quadrant.id}" quadrant-name="${quadrant.name}" quadrant-total-space="${quadrant.total_space}" quadrant-free-space="${quadrant.free_space}" quadrant-length="${quadrant.length}" quadrant-width="${quadrant.width}" quadrant-height="${quadrant.height}">Update</button>
      </div>
    </label>
    `;
    })
  data.quadrants.forEach(quadrant => {
    updateQuadrantHTML += `
      <option value="${ quadrant.id }">${ quadrant.name }</option>
    `;
    })
    data.quadrants.forEach((quadrant, index) => {
      addQuadrantHTML += `
        <label for="add_product_quadrant${ quadrant.id }">
          <input type="radio" name="add_product_quadrant" class="quadrant_radio_button" value="${ quadrant.id }" id="add_product_quadrant${ quadrant.id }" ${ index === 0 ? "checked" : "" } /> ${ quadrant.name }
        </label>
      `;
    });
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

  $.post("/quadrant", (data) => {
    updateQuadrantList(data);
    getProducts();
    initEventHandlers();
  });

  $('#add_quadrant_button_submit').click((e) => {
    e.preventDefault();
    e.stopPropagation();

    let temp_name = $('#quadrant_name > input').val();
    if(!temp_name){
      alert("QUADRANT NAME should not be empty!");
      return
    }
    
    const DATA = {
      name: temp_name,
      total_length: $('#quadrant_total_length').val(),
      total_width: $('#quadrant_total_width').val(),
      total_height: $('#quadrant_total_height').val(),
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
      quadrant_id = Math.round(dataWithCategories[0][3]);

    } else {
      quadrant_id = $('input[name="add_product_quadrant"]:checked').val();
      console.log(quadrant_id);
    }
    let temp_description = $('textarea[name="description"]').val() || "No Description";
    let temp_name = $('#product_name > input').val();
    let product_quantity = $('#product_quantity > input').val();
    let temp_length = $('#product_length').val();
    let temp_width = $('#product_width').val();
    let temp_height = $('#product_height').val();
    let user = $('#user_id').val();

    if(!temp_name){
      alert("PRODUCT NAME should not be empty!");
      return;
    }
    
    if(product_quantity < 0){
      alert("PRODUCT QUANTITY should not be negative");
      return;
    } else if (product_quantity == 0){
      alert("PRODUCT QUANTITY should not be empty");
      return;
    }
    if(temp_length < 0){
      alert("PRODUCT LENGTH should not be negative");
      return;
    } else if (temp_length == 0){
      alert("PRODUCT LENGTH should not be empty");
      return;
    }
    if(temp_height < 0){
      alert("PRODUCT HEIGHT should not be negative");
      return;
    } else if (temp_height == 0){
      alert("PRODUCT HEIGHT should not be empty");
      return;
    }
    if(temp_width < 0){
      alert("PRODUCT WIDTH should not be negative");
      return;
    } else if (temp_width == 0){
      alert("PRODUCT WIDTH should not be empty");
      return;
    }

    const DATA = {
      name: temp_name,
      quantity: product_quantity,
      description: temp_description,
      length: temp_length,
      width: temp_width,
      height: temp_height,
      quadrant_id: quadrant_id,
      user: user
    }

    $.post('/product/add', DATA, (data) => {
      if(data.errors){
        alert("Quadrant doesn't have enough space!");
      }
      $.post("/quadrant", (data) => {
        updateQuadrantList(data);
        getProducts();
        getChart();
      });
  
    });


    $('#update_popup, #add_product_popup, #mask').hide();
  });

  $('#add_product').click(() => {
    $('#add_product_popup, #mask').show();
    $('#type_of_materials').css("display", "none");
    $('#product-name input').val("");
    $('#product-quantity input').val(0);
    $('#description').val("");

    if($('#uom_materials').is(':checked')) {
      $('#type_of_materials').css("display", "flex");
    } else {
      $('input[name="type_of_materials"]').prop('checked', false);
      $('#type_of_materials').css("display", "none");
      }
    $('#tom_wood').prop('checked', true);
    $('input[id="add_product_quadrant1"]').prop('checked', true);
    
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
    $('input[name="type_of_materials"], input[name="use_of_materials"]').prop('checked', false);
    $('input[id="add_product_quadrant1"]').prop('checked', true);
    $('#automatic_add').css({
      'background-color' : 'white',
      'color' : 'black'
    })
    $('#manual_add').css({
      'background-color' : 'black',
      'color' : 'white'
    })
    $('input[name="type_of_materials"]').prop('checked', false);
    $('#type_of_materials').css("display", "none");
  })

  $('#automatic_add').click(() => {
    $('#quadrants').hide();
    $('#use_of_materials').show();
    $('input[name="type_of_materials"], input[name="use_of_materials"], input[name="add_product_quadrant"]').prop('checked', false);
    $('#uom_tools').prop('checked',true);
    $('#automatic_add').css({
      'background-color' : 'black',
      'color' : 'white'
    })
    $('#manual_add').css({
      'background-color' : 'white',
      'color' : 'black'
    })
    $('input[name="type_of_materials"]').prop('checked', false);
    $('#type_of_materials').css("display", "none");
  })

  $('#use_of_materials input').click((e) => {
    if($(e.target).val() == 1) {
      $('#type_of_materials').css("display", "flex");
    } else {
      $('input[name="type_of_materials"]').prop('checked', false);
      $('#type_of_materials').css("display", "none");
      }
    $('#tom_wood').prop('checked', true);
  });
  
  $(document).on('click', '.remove_product', (e) => {
    if(confirm("Are you sure you want to remove this product?")) {
      const PRODUCT_ID = $(e.target).attr("product-id");
      const PRODUCT_QUANTITY = $(e.target).attr("product-quantity");
      const QUADRANT_ID = $(e.target).attr("product-quadrant-id");
      const length = $(e.target).attr("product-length");
      const width = $(e.target).attr("product-width");
      const height = $(e.target).attr("product-height");
      const NAME =  $(e.target).attr("product-name");
      const user = $('#user_id').val();

      const DATA = { 
        product_id: PRODUCT_ID, 
        product_quantity: PRODUCT_QUANTITY, 
        product_name: NAME,
        quadrant_id: QUADRANT_ID,
        length: length,
        width: width,
        height: height,
        user: user,
      }
      $.post('/product/remove', DATA, () => {
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
    let length = $(e.target).attr('product-length');
    let width = $(e.target).attr('product-width');
    let height = $(e.target).attr('product-height');

    $('#quadrant_id option').filter(function() {
      return $(this).text() === quadrant_name;
    }).prop('selected', true);

    $('#update_product_name input').val(product_name);
    $('#update_product_quantity input').val(product_quantity);
    $('#update_description').val(product_description);
    $('#update_product_id').val(product_id);
    $('#update_product_length').val(length);
    $('#update_product_width').val(width);
    $('#update_product_height').val(height);
  });

  $(document).on('click', '.update.quadrant_button', (e) => {
    e.preventDefault();
    e.stopPropagation();
    $('#update_quadrant_popup, #mask').show();

    let quadrant_name = $(e.target).attr('quadrant-name');
    let quadrant_id = $(e.target).attr('quadrant-id');
    let quadrant_total_space = $(e.target).attr('quadrant-total-space');
    let quadrant_free_space = $(e.target).attr('quadrant-free-space');
    let length = $(e.target).attr('quadrant-length');
    let width = $(e.target).attr('quadrant-width');
    let height = $(e.target).attr('quadrant-height');

    $('#update_quadrant_name input').val(quadrant_name);
    $('#update_quadrant_id').val(quadrant_id);
    $('#update_quadrant_total_space input').val(quadrant_total_space);
    $('#update_quadrant_current_total_space').val(quadrant_total_space);
    $('#update_quadrant_free_space').val(quadrant_free_space);
    $('#update_quadrant_free_space').val(quadrant_free_space);
    $('#update_quadrant_total_length').val(length);
    $('#update_quadrant_total_width').val(width);
    $('#update_quadrant_total_height').val(height);
  });

  $('#update_button_submit').click(() => {
    const quadrant_id = $('#quadrant_id').val();
    const product_name = $('#update_product_name input').val();
    const product_quantity = $('#update_product_quantity input').val();
    const product_description = $('#update_description').val() || "No Description";
    const product_id = $('#update_product_id').val();
    const length = $('#update_product_length').val();
    const width = $('#update_product_width').val();
    const height = $('#update_product_height').val();
    const user = $('#user_id').val();

    if(!product_name){
      alert("PRODUCT NAME should not be empty");
      return;
    }

    if(product_quantity < 0){
      alert("PRODUCT QUANTITY should not be negative");
      return;
    } 
    
    if(length < 0){
      alert("PRODUCT LENGTH should not be negative");
      return;
    } else if (length == 0){
      alert("PRODUCT LENGTH should not be empty");
      return;
    }
    if(width < 0){
      alert("PRODUCT WIDTH should not be negative");
      return;
    } else if (width == 0){
      alert("PRODUCT WIDTH should not be empty");
      return;
    }
    if(height < 0){
      alert("PRODUCT HEIGHT should not be negative");
      return;
    } else if (height == 0){
      alert("PRODUCT HEIGHT should not be empty");
      return;
    }

    const DATA = {
      quadrant_id: quadrant_id,
      product_name: product_name,
      product_quantity: product_quantity,
      product_id: product_id,
      product_description: product_description,
      length: length,
      width: width,
      height: height,
      user: user,
    };

    $.post('/product/update', DATA, (data) => {
      
      setTimeout(() => {
        if(data.errors){
          alert("Quadrant doesn't have enough space!");
        }
        $.post("/quadrant", (data) => {
          getProducts();
          updateQuadrantList(data);
          getChart();
        });
      }, 100);
    });

    $('#update_popup, #add_product_popup, #mask').hide();
  });

  $('#update_quadrant_button_submit').click((e) => {
    e.preventDefault();
    e.stopPropagation();

    let temp_name = $('#update_quadrant_name > input').val();
    let current_total_space = parseFloat($('#update_quadrant_current_total_space').val());
    let temp_length = parseFloat($('#update_quadrant_total_length').val());
    let temp_width = parseFloat($('#update_quadrant_total_width').val());
    let temp_height = parseFloat($('#update_quadrant_total_height').val());
    let temp_total_space = Math.round(temp_length * temp_width * temp_height);
    let temp_free_space = parseFloat($('#update_quadrant_free_space').val());
    let temp_used_space = Math.abs(temp_free_space - current_total_space);

    if(!temp_name){
      alert("QUADRANT NAME should not be empty!");
      return;
    }
    if(!temp_total_space){
      alert("Length/Width/Height should not be empty!");
      return;
    }
    if (temp_total_space < temp_used_space) {
      alert("TOTAL SPACE cannot be less than used space.");
      return;
    }

    const DATA = {
      id: $('#update_quadrant_id').val(),
      name: temp_name,
      total_space: temp_total_space,
      length: temp_length,
      height: temp_height,
      width: temp_width,
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
    getProducts();
  });

});
