function addProduct() {
    const productName = document.getElementById("addprod").value.trim();
    const category = document.getElementById("category").value.trim();
    const brand = document.getElementById("addProdCat").value.trim();
    const price = document.getElementById("addPrice").value.trim();
    const offer = document.getElementById("addOffer").value.trim();
    const size = document.getElementById("selectSize").value.trim();
    const description = document.getElementById("product_description").value.trim();
    const imageCount = document.getElementById("formFileLg").files.length;

    const errorElement = document.getElementById("productError");

    if (productName === "") {
        errorElement.textContent = "Product name cannot be empty";
        return false;
    }

    if (category === "Select category from below") {
        errorElement.textContent = "Please select a category";
        return false;
    }

    if (brand === "") {
        errorElement.textContent = "Brand name cannot be empty";
        return false;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(price)) {
        errorElement.textContent = "Price must be a number";
        return false;
    }

    if (!/^\d+$/.test(offer)) {
        errorElement.textContent = "Offer must be a number";
        return false;
    }

    if (size === "default") {
        errorElement.textContent = "Please select a size";
        return false;
    }

    if (description === "") {
        errorElement.textContent = "Product description cannot be empty";
        return false;
    }

    if (imageCount < 4) {
        errorElement.textContent = "Please select 4 images";
        return false;
    }

    return true;
}



function validateEditProductForm() {
    console.log('edit product')
    const productName = document.getElementById("product_name").value.trim();
    const productBrand = document.getElementById("product_brand").value.trim();
    const productCategory = document.getElementById("category").value.trim();
    const productPrice = document.getElementById("product_price").value.trim();
    const productQuantity = document.getElementById("product_quantity").value.trim();
    // const productOffer = document.getElementById("addOffer").value.trim();
    const productDescription = document.getElementById("product_description").value.trim();
    // const productExpiryDate = document.getElementById("expDate").value.trim();

    const errorElement = document.getElementById("productError");


    if (productName === "") {
        errorElement.textContent="Product Name is required";
        return false;
    }
    if (productBrand === "") {
        errorElement.textContent="Brand is required";
        return false;
    }
    if (productCategory === "") {
        errorElement.textContent="Category is required";
        return false;
    }
    if (productPrice === "") {
        errorElement.textContent="Price is required";
        return false;
    }
    if (productQuantity === "") {
        errorElement.textContent="Quantity is required";
        return false;
    }
    
    if (productDescription === "") {
        errorElement.textContent="Product Description is required";
        return false;
    }
   


    return true;
}
