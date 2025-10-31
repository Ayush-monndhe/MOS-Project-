// Parse the response JSON
let response = pm.response.json();

// Get the current temperature from the first period
let currentTemp = response.properties.periods[0].temperature;

// Log it for debugging
console.log("Current Temperature:", currentTemp);

// Store it as a Postman variable
pm.environment.set("currentTemperature", currentTemp);
