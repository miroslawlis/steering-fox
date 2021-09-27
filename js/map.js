//(52.1884564, 20.993544); //Warsaw
//(43.5091311, 16.4347832); //Chorwacja, Split

function initMap() {
  var directionsService = new google.maps.DirectionsService();
  var directionsRenderer = new google.maps.DirectionsRenderer();
  var map = new google.maps.Map(document.getElementById("map-canvas"), {
    zoom: 8,
    center: { lat: 52.18, lng: 20.99 },
  });
  directionsRenderer.setMap(map);

  var onChangeHandler = function () {
    calculateAndDisplayRoute(directionsService, directionsRenderer);
  };
  document
    .getElementById("map-canvas")
    .addEventListener("click", onChangeHandler);
}

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
  directionsService.route(
    {
      origin: "Warszawa",
      destination: "Krakow",
      travelMode: "DRIVING",
    },
    function (response, status) {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
      } else {
        window.alert("Directions request failed due to " + status);
      }
    }
  );
}
