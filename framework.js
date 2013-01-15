var map;
var createNodeEnabled = false;
var routeStage = 0;
var markers = new Array();
var routes = new Array();
var startLat, startLong, endLat, endLong;

function initialize() {
	  var myLatlng = new google.maps.LatLng(-25.363882,131.044922);
	  var mapOptions = {
	    zoom: 4,
	    center: myLatlng,
	    mapTypeId: google.maps.MapTypeId.ROADMAP
	  }

  	map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

	google.maps.event.addListener(map, "click", function (e) {
		if (createNodeEnabled) {
			var clkLat = e.latLng.lat().toFixed(6);
			var clkLon = e.latLng.lng().toFixed(6);
			createMarker(clkLat, clkLon);
		}
	});
}

function toggleNodeCreate() {
	if (createNodeEnabled) {
		document.getElementById("createNodeButton").className = "btn";
		createNodeEnabled = false;
		setMessage("");
	} else {
		document.getElementById("createNodeButton").className = "btn btn-inverse";
		createNodeEnabled = true;
		setMessage("Use your left mouse click create nodes. Press the button again when you're done.");
	}
}

function toggleRouteCreate() {
	if (markers.length > 1) {
		routeStage = 1;
		routeButtonHit();
	} else {
		setMessage("You must have at least 2 nodes before you can create a route.");
	}
}

function routeButtonHit() {
	if (routeStage == 0) {
		document.getElementById("createRouteButton").className = "btn";
		setMessage("");
	} else if (routeStage == 1) {
		document.getElementById("createRouteButton").className = "btn btn-inverse";
		setMessage("Select the first node of the route.");
	} else {
		document.getElementById("createRouteButton").className = "btn btn-inverse";
		setMessage("Select the second and last node of the route.");
	}
}

function setMessage(string) {
	document.getElementById("message").innerHTML = string;
}

function calculateDistances(lat1,lon1,lat2,lon2) {
	var R = 6371; // km (change this constant to get miles)
	var dLat = (lat2-lat1) * Math.PI / 180;
	var dLon = (lon2-lon1) * Math.PI / 180;
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
	Math.sin(dLon/2) * Math.sin(dLon/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c;
	if (d>1) return Math.round(d)+"km";
	else if (d<=1) return Math.round(d*1000)+"m";
	return d;
}

function createMarker(Lat, Long) {
	var location = new google.maps.LatLng(Lat, Long);
	var marker = new google.maps.Marker({
        position: location,
        map: map
    });
    // Adds marker to the markers array.
    markers.push(marker);

	// Listener and following function give logic of what actions to 
	// action when pressing the markers, depending on button state.

	google.maps.event.addListener(marker, "click", markerListener);

	function markerListener() {
		// If the stage is 1 you are able to start route
		// 2 means you are setting the Finishing point
		// 0 function is disabled
		if (routeStage == 1) {
			startLat = this.position.lat();
    		startLong = this.position.lng();
			routeStage = 2;
			routeButtonHit();
		} else if (routeStage == 2) {
			endLat = this.position.lat();
    		endLong = this.position.lng();
			routeStage = 0;
			createRoute(startLat, startLong, endLat, endLong);
			routeButtonHit();
		}
	};
}

function createRoute(startLat, startLong, endLat, endLong) {
	distance = calculateDistances(startLat, startLong, endLat, endLong);
	//This draws a line between two points.
	var routeCoordinates = [
		new google.maps.LatLng(startLat, startLong),
		new google.maps.LatLng(endLat, endLong),
	];
	var routePath = new google.maps.Polyline({
	path: routeCoordinates,
	strokeColor: "#FF0000",
	strokeOpacity: 1.0,
	strokeWeight: 2
	});

	// TODO: save route information to routes array. startNodeId & finish (from marker 
	// objects in markers array), + distance + other properties.

	routePath.setMap(map);
}