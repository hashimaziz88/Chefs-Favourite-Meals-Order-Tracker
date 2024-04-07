// Get reference to HTML elements
const messageEl = document.getElementById("message");
const ingredientInput = document.getElementById("ingredientInput");
const orderDisplay = document.getElementById("orderDisplay");

// Function to display orders
function displayOrders() {
  // Retrieve orders from session storage or initialize to empty array
  const orders = JSON.parse(sessionStorage.getItem("orders") || "[]");
  // Get display elements for incomplete and completed orders
  const incompleteOrdersDisplay = document.getElementById(
    "incompleteOrdersDisplay"
  );
  const completedOrdersDisplay = document.getElementById(
    "completedOrdersDisplay"
  );

  // If no orders found, display appropriate message and return
  if (orders.length === 0) {
    incompleteOrdersDisplay.innerHTML = "No incomplete orders found.";
    completedOrdersDisplay.innerHTML = "No completed orders found.";
    return;
  }

  // Initialize strings for displaying orders
  let incompleteOrdersText = "Incomplete orders:<br>";
  let completedOrdersText = "Completed orders:<br>";

  // Loop through orders and categorize them
  orders.forEach((order) => {
    const orderText = `Order Number #${order.orderNumber}: ${order.description}<br>`;
    if (order.completionStatus === "incomplete") {
      incompleteOrdersText += orderText;
    } else {
      completedOrdersText += orderText;
    }
  });

  // Update HTML elements with order information
  incompleteOrdersDisplay.innerHTML = incompleteOrdersText;
  completedOrdersDisplay.innerHTML = completedOrdersText;
}

// Function to fetch a random meal based on ingredient
async function fetchRandomMeal(ingredient) {
  // Construct URL for fetching meals
  const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`;

  // Fetch data from API
  const response = await fetch(url);
  const data = await response.json();

  // Return a random meal or null if no meals found
  return data.meals
    ? data.meals[Math.floor(Math.random() * data.meals.length)]
    : null;
}

// Function to take an order from a user
async function takeOrder() {
  // Prompt user for main ingredient
  const ingredient = prompt("Enter your main ingredient:")
    .toLowerCase()
    .replace(/\s+/g, "_");

  // If no ingredient provided, display message and return
  if (!ingredient) {
    alert("Please enter an ingredient.");
    messageEl.textContent = "Please enter an ingredient.";
    return;
  }

  // Fetch a random meal based on the ingredient
  const randomMeal = await fetchRandomMeal(ingredient);

  // If ingredient not found, display message and retry
  if (!randomMeal) {
    alert("Ingredient not found. Please try again.");
    messageEl.textContent = "Ingredient not found. Please try again.";
    return takeOrder();
  }

  // Create order object
  const order = {
    description: randomMeal.strMeal,
    orderNumber: (parseInt(sessionStorage.getItem("lastOrderNumber")) || 0) + 1,
    completionStatus: "incomplete",
  };

  // Update last order number in session storage
  sessionStorage.setItem("lastOrderNumber", order.orderNumber);

  // Retrieve stored orders from session storage
  const storedOrders = JSON.parse(sessionStorage.getItem("orders") || "[]");
  // Add new order to stored orders
  storedOrders.push(order);
  // Update orders in session storage
  sessionStorage.setItem("orders", JSON.stringify(storedOrders));

  // Display updated orders
  displayOrders();
  // Display message confirming order
  messageEl.textContent = `Your order (#${order.orderNumber}): ${order.description}`;
  // Clear input field
  ingredientInput.value = "";
}

// Function to mark an order as complete
function completeOrder() {
  // Retrieve orders from session storage
  const orders = JSON.parse(sessionStorage.getItem("orders") || "[]");

  // If no orders found, display message and return
  if (orders.length === 0) {
    messageEl.textContent = "No orders found to complete.";
    return;
  }

  // Prepare list of incomplete orders for user selection
  let orderList = "Enter order number to complete:\n";
  orders.forEach((order, index) => {
    if (order.completionStatus === "incomplete") {
      orderList += `${index + 1}: Order #${order.orderNumber} - ${
        order.description
      }\n`;
    }
  });

  // Prompt user for order selection
  const orderSelection = prompt(orderList + "Or type '0' to exit:");

  // If user cancels, return
  if (orderSelection === null) {
    return;
  }

  // If user chooses to skip, display message and return
  if (orderSelection.trim() === "0") {
    messageEl.textContent = "Order completion skipped.";
    return;
  }

  // Parse user's order selection
  const orderIndex = parseInt(orderSelection) - 1;

  // If invalid order number, alert user and retry
  if (isNaN(orderIndex) || orderIndex < 0 || orderIndex >= orders.length) {
    alert("Invalid order number. Please enter a valid order number.");
    return completeOrder();
  }

  // If order already completed, alert user and retry
  if (orders[orderIndex].completionStatus === "completed") {
    alert("Order already completed.");
    return completeOrder();
  }

  // Mark order as completed
  orders[orderIndex].completionStatus = "completed";
  // Update orders in session storage
  sessionStorage.setItem("orders", JSON.stringify(orders));

  // Remove completed order from orders array
  const completedOrder = orders.splice(orderIndex, 1)[0];
  // Retrieve completed orders from session storage
  const completedOrders = JSON.parse(
    sessionStorage.getItem("completedOrders") || "[]"
  );
  // Add completed order to completed orders
  completedOrders.push(completedOrder);
  // Update completed orders in session storage
  sessionStorage.setItem("completedOrders", JSON.stringify(completedOrders));

  // Display updated orders
  displayOrders();
  // Display message confirming order completion
  messageEl.textContent = `Order #${orderSelection} marked as completed.`;
}

// Event listeners for buttons to take and complete orders
document.getElementById("takeOrderBtn").addEventListener("click", takeOrder);
document
  .getElementById("completeOrderBtn")
  .addEventListener("click", completeOrder);

// Call displayOrders when the page loads
displayOrders();