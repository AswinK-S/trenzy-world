document.addEventListener("DOMContentLoaded", () => {
    // Add event listeners to plus and minus buttons
    const plusButtons = document.querySelectorAll(".btn-plus");
    const minusButtons = document.querySelectorAll(".btn-minus");
    console.log(plusButtons);

    plusButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const productId = button.getAttribute("data-id");
            const quantityInput = document.getElementById(productId)
            const totalElement = document.getElementById("cart-total");
            const productTotal = document.getElementById(`total-price-${productId}`)
            const minus = document.getElementById('minus')
            const action = button.getAttribute("data-action");
            console.log('sss',action)

            if (parseInt(quantityInput.textContent) === 1 && action ==="minus") {
                // Exit the function to prevent further action
                if(minus){
                    minus.disabled=true
                }
                return;
            }else{
                if(minus){
                    minus.disbled=false;
                }
            }
            
            try {
                const response = await fetch(`/cart/${productId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ action }), // Send the action as JSON data

                });

                if (response.ok) {
                    // Handle success (e.g., update the UI)
                    const responseData = await response.json();
                    // Update the UI with responseData if needed
                    console.log('object',responseData);
                    quantityInput.textContent = responseData.quantity
                    totalElement.textContent = responseData.total
                    productTotal.textContent = responseData.price
                    if(responseData.quantity ===1 ){
                        if(minus){
                            minus.disabled=true;
                        }
                    }else{
                        if(minus){
                            minus.disabled=false;
                        }
                    }
                    if (responseData.cart) {
                        // Example: Update total price
                        totalElement.textContent = `₹ ${responseData.cart.total.toFixed(2)}`;
                    }
                } else {
                    // Handle error (e.g., show an error message)
                    console.error("Failed to update cart");
                }
            } catch (error) {
                console.error(error.message);
            }
        });
    });

    

    // minusButtons.forEach((button) => {
    //     button.addEventListener("click", async () => {
    //         const productId = button.closest("td").getAttribute("data-id");
    //         console.log("product id from cart.js",productId)
    //         const action = "minus"; // Specify the action here (plus or minus)

    //         try {
    //             const response = await fetch(`/cart/${productId}`, {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //                 body: JSON.stringify({ action }), // Send the action as JSON data
    //             });

    //             if (response.ok) {
    //                 // Handle success (e.g., update the UI)
    //                 const responseData = await response.json();
    //                 // Update the UI with responseData if needed
    //                 if (responseData.cart) {
    //                     // Example: Update total price
    //                     const totalElement = document.getElementById("cart-total");
    //                     totalElement.textContent = `₹ ${responseData.cart.total.toFixed(2)}`;
    //                 }
    //             } else {
    //                 // Handle error (e.g., show an error message)
    //                 console.error("Failed to update cart");
    //             }
    //         } catch (error) {
    //             console.error(error.message);
    //         }
    //     });
    // });
});
