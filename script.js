

 
// script.js
// This script handles the Google Map initialization, geocoding,
// and rendering the path on the map using Google Maps Directions Service
// and includes Autocomplete for input fields.

let map; // Global variable to hold the Google Map instance
let markers = []; // Array to store map markers
let directionsRenderer; // Variable to hold the Google Maps DirectionsRenderer
let autocompleteStart; // For Google Places Autocomplete
let autocompleteEnd;   // For Google Places Autocomplete

/**
 * Initializes the Google Map. This function is called by the Google Maps API
 * once it's loaded (typically via the 'callback' parameter in the script URL).
 */
function initMap() {
    // Create a new Google Map instance and attach it to the 'map' div
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 30.3256, lng: 78.0419 }, // Center map on Dehradun, India
        zoom: 13 // Set initial zoom level
    });

    // Initialize the DirectionsRenderer. This will draw the route on the map.
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Initialize Places Autocomplete for input fields
    const inputStart = document.getElementById('start');
    const inputEnd = document.getElementById('end');

    // Restrict autocomplete search results.
    // 'componentRestrictions' is good for country.
    // 'bounds' could be used for a more specific area like Dehradun city limits.
    // 'strictBounds: true' ensures results are only within the specified bounds.
    const dehradunBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(30.2000, 77.8500), // Southwest coordinates of Dehradun region
        new google.maps.LatLng(30.4500, 78.2000)  // Northeast coordinates of Dehradun region
    );

    const autocompleteOptions = {
        bounds: dehradunBounds,
        strictBounds: false, // Allow results outside exact bounds but prefer within
        types: ['geocode'], // Restrict to addresses/geographic locations
        fields: ['formatted_address', 'geometry'] // Request necessary fields
    };

    autocompleteStart = new google.maps.places.Autocomplete(inputStart, autocompleteOptions);
    autocompleteEnd = new google.maps.places.Autocomplete(inputEnd, autocompleteOptions);

    // Optional: Add listeners to update input values directly when a place is selected
    // This ensures the input field gets the full formatted address from Autocomplete.
    autocompleteStart.addListener('place_changed', () => {
        const place = autocompleteStart.getPlace();
        if (place.formatted_address) {
            inputStart.value = place.formatted_address;
        }
        // You might trigger path calculation automatically here, but currently, it's on button click.
    });

    autocompleteEnd.addListener('place_changed', () => {
        const place = autocompleteEnd.getPlace();
        if (place.formatted_address) {
            inputEnd.value = place.formatted_address;
        }
    });
}


/**
 * Calculates and displays the shortest path between two user-defined locations
 * on the map using Google Maps Directions Service.
 */
async function calculateShortestPath() {
    const errorMessageDiv = document.getElementById("errorMessage");
    const loadingSpinner = document.getElementById("loadingSpinner");
    const routeInfoDiv = document.getElementById("routeInfo");
    const routeDistanceSpan = document.getElementById("routeDistance");
    const routeDurationSpan = document.getElementById("routeDuration");

    errorMessageDiv.textContent = ""; // Clear previous errors
    routeInfoDiv.style.display = "none"; // Hide route info initially
    loadingSpinner.style.display = "block"; // Show loading spinner

    const startAddress = document.getElementById("start").value;
    const endAddress = document.getElementById("end").value;

    // Basic validation for input fields
    if (!startAddress || !endAddress) {
        errorMessageDiv.textContent = "Please enter both start and end locations.";
        loadingSpinner.style.display = "none"; // Hide loading spinner
        return;
    }

    try {
        // Clear previous directions and markers44
        directionsRenderer.setDirections({ routes: [] }); // Clears the previous route
        markers.forEach(m => m.setMap(null)); // Clear custom markers (if any were added)
        markers = []; // Reset markers array

        // Create a DirectionsService instance
        const directionsService = new google.maps.DirectionsService();

        // Define the DirectionsRequest
        const request = {
            origin: startAddress, // Pass address string directly for origin
            destination: endAddress, // Pass address string directly for destination
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC // Use metric units (kilometers, meters)
        };

        // Make the directions request
        const response = await directionsService.route(request);

        if (response.status === 'OK') {
            directionsRenderer.setDirections(response);

            // Get the first route (usually the best one) and its first leg
            const route = response.routes[0];
            const leg = route.legs[0];

            // Display route information
            routeDistanceSpan.textContent = leg.distance.text;
            routeDurationSpan.textContent = leg.duration.text;
            routeInfoDiv.style.display = "block"; // Show the route info div

            // Optional: Add custom markers for start and end points using the actual geocoded points
            // from the directions response. This ensures markers are placed exactly where the route starts/ends.
            // Note: DirectionsRenderer adds its own default start/end markers,
            // so you might remove those or customize them if you want your own only.
            const startMarker = new google.maps.Marker({
                position: leg.start_location,
                map: map,
                label: {
                    text: 'A',
                    color: 'white',
                    fontWeight: 'bold'
                },
                title: leg.start_address,
                // icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' // Example custom icon
            });
            const endMarker = new google.maps.Marker({
                position: leg.end_location,
                map: map,
                label: {
                    text: 'B',
                    color: 'white',
                    fontWeight: 'bold'
                },
                title: leg.end_address,
                // icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' // Example custom icon
            });
            markers.push(startMarker, endMarker); // Store custom markers if you want to clear them later

        } else if (response.status === 'ZERO_RESULTS') {
            errorMessageDiv.textContent = "No route found between these locations. Please check the addresses or try different ones.";
            routeInfoDiv.style.display = "none";
        }
        else {
            throw new Error(`Directions request failed: ${response.status}`);
        }

    } catch (error) {
        console.error("Error calculating shortest path:", error);
        errorMessageDiv.textContent = `Error: ${error.message}. Please try valid addresses, ensure your API key is correct, and all necessary Google Maps APIs (Maps JavaScript, Geocoding, Directions, Places) are enabled in your Google Cloud Console with proper restrictions.`;
        routeInfoDiv.style.display = "none"; // Hide route info on error
    } finally {
        loadingSpinner.style.display = "none"; // Hide loading spinner
    }
}