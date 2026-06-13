function loadRouteMap() {
  const routeContainer = document.getElementById("routeContainer");
  if (!routeContainer) return;
  routeContainer.style.display = "block";

  if (window.google && window.google.maps) {
    initializeRouteMap();
    return;
  }

  if (document.querySelector('script[data-google-maps-script]')) {
    return;
  }

  const script = document.createElement("script");
  script.src = "https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initializeRouteMap";
  script.async = true;
  script.defer = true;
  script.dataset.googleMapsScript = "true";
  document.head.appendChild(script);
}

window.initializeRouteMap = function () {
  const mapElement = document.getElementById("routeMap");
  if (!mapElement) return;

  const center = { lat: 14.5995, lng: 120.9842 };
  const map = new google.maps.Map(mapElement, {
    center,
    zoom: 12,
  });

  const routePath = [
    { lat: 14.5995, lng: 120.9842 },
    { lat: 14.6100, lng: 120.9822 },
    { lat: 14.6180, lng: 120.9825 }
  ];

  new google.maps.Polyline({
    path: routePath,
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 5,
    map,
  });

  mapElement.style.height = "280px";
};
