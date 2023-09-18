document.addEventListener("DOMContentLoaded", () => {
    // Add event listeners to plus and minus buttons
    const plusButtons = document.querySelectorAll(".btn-plus");
    const minusButtons = document.querySelectorAll(".btn-minus");

    plusButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const productId = button.closest("td").getAttribute("data-product-id");
            const action = "plus"; // Specify the action here (plus or minus)

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
                    if (responseData.cart) {
                        // Example: Update total price
                        const totalElement = document.getElementById("cart-total");
                        totalElement.textContent = `₹ ${responseData.cart.total.toFixed(2)}`;
                    }
                } else {
                    // Handle error (e.g., show an error message)
                    console.error("Failed to update cart");
                }
            } catch (error) {
                console.error(error);
            }
        });
    });

    minusButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const productId = button.closest("td").getAttribute("data-product-id");
            const action = "minus"; // Specify the action here (plus or minus)

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
                    if (responseData.cart) {
                        // Example: Update total price
                        const totalElement = document.getElementById("cart-total");
                        totalElement.textContent = `₹ ${responseData.cart.total.toFixed(2)}`;
                    }
                } else {
                    // Handle error (e.g., show an error message)
                    console.error("Failed to update cart");
                }
            } catch (error) {
                console.error(error);
            }
        });
    });
});
