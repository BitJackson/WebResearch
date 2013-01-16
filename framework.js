var map;
var createNodeEnabled = false;
var routeStage = 0;
var routeFindStage = 0;
var markers = new Array();
var routes = new Array();
var startMarker, endMarker;
var selectedRoute;
var mapzz = { a:{b:10,c:4},
           b:{a:10,e:50},
           c:{a:4,d:13,e:20},
           d:{c:12,f:68},
           e:{b:50,c:20,f:70,g:45},
           f:{d:68,e:70,g:8,h:28},
           g:{e:45,f:8},
           h:{f:28}
           };	
var genMap = {};

function initialize() {
	// Initializes google maps API around Australia (arb).
  var myLatlng = new google.maps.LatLng(-25.363882,131.044922);
  var mapOptions = {
    zoom: 4,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }

  map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

  // Listener for map clicking to create markers when mode is on.
	google.maps.event.addListener(map, "click", function (e) {
		if (createNodeEnabled) {
			var clkLat = e.latLng.lat().toFixed(6);
			var clkLon = e.latLng.lng().toFixed(6);
			createMarker(clkLat, clkLon);
		}
	});
}

function toggleNodeCreate() {
	// Function that turns on node create mode.
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
	// Function that turns on route create mode.
	if (routeStage == 0) {
		if (markers.length > 1) {
			routeStage = 1;
			routeButtonHit();
		} else {
			setMessage("You must have at least 2 nodes before you can create a route.");
		}
	} else {
		routeStage = 0;
		routeButtonHit();
	}
}

function routeButtonHit() {
	// Route stage button logic and message logic
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

function findRoute() {
	// Function that turns on routeFinder mode.
	if (routeFindStage == 0) {
		var errors = false;
		if (markers.length < 4) { 
			errors = true; 
		}
		if (routes.length < 3) { 
			errors = true; 
		}
		if (errors) {
			setMessage("The shortest route could not be generated as you dont have enough nodes and/or routes.");
		} else {
			routeFindStage = 1;
			routeFinderButtonHit();
		};
	} else {
		routeFindStage = 0;
		routeFinderButtonHit();
	}
}

function routeFinderButtonHit() {
	// RouteFinder stage button logic and message logic
	if (routeFindStage == 0) {
		document.getElementById("routeFinderButton").className = "btn btn-success";
		setMessage("");
	} else if (routeFindStage == 1) {
		document.getElementById("routeFinderButton").className = "btn btn-inverse";
		setMessage("<h4>RouteFinder</h4> starting node of the route.");
	} else if (routeFindStage == 2){
		document.getElementById("routeFinderButton").className = "btn btn-inverse";
		setMessage("<h4>RouteFinder</h4> destination node of the route.");
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
			startMarker= this;
			routeStage = 2;
			routeButtonHit();
		} else if (routeStage == 2) {
			endMarker = this;
			routeStage = 1;
			createRoute(startMarker, endMarker);
			routeButtonHit();
		}

		if (routeFindStage == 1) {
			startMarker = this;
			routeFindStage = 2;
			routeFinderButtonHit();
		} else if (routeFindStage == 2) {
			endMarker = this;
			routeFindStage = 0;
			runRouteFinder(startMarker, endMarker);
			routeFinderButtonHit();
		}
	};
}

function createRoute(startMarker, endMarker) {
	var distance = calculateDistances(
		startMarker.position.lat(), 
		startMarker.position.lng(), 
		endMarker.position.lat(), 
		endMarker.position.lng()
	);
	//This draws a line between two points.
	var routeCoordinates = [
		new google.maps.LatLng(startMarker.position.lat(), 
		startMarker.position.lng()),
		new google.maps.LatLng(endMarker.position.lat(), 
		endMarker.position.lng()),
	];

	var routePath = new google.maps.Polyline({
	path: routeCoordinates,
	strokeColor: "#FF0000",
	strokeOpacity: 1.0,
	strokeWeight: 2
	});


	// TODO: This is the route array where we would save any route information,
	// such as safety and other modifiers.
	var route =[startMarker.__gm_id, endMarker.__gm_id, distance];

	routes.push(route);

	google.maps.event.addListener(routePath, "click", highlightRoute);

	function highlightRoute() {
		routePath.setOptions({strokeColor:'blue'});
		document.getElementById("properties_panel").style.display = "block";
		document.getElementById("distance").innerHTML = distance;
		selectedRoute = routePath;
	}

	routePath.setMap(map);
}

function runRouteFinder(startMarker, endMarker) {
	var idPos;
	var curMarker;
	var curRoute;
	for (var i = 0; i < markers.length; i++) {

		curMarker = markers[i];
		//for each marker, look for routes that it is involved in.
		genMap[curMarker.__gm_id] = {};

    for (var r = 0; r < routes.length; r++) {
    	curRoute = routes[r];

    	idPos = curRoute.indexOf(curMarker.__gm_id);
    	if (idPos == 0) {
    		genMap[curMarker.__gm_id][curRoute[1]] = curRoute[2];
    	} else if (idPos == 1) {
				genMap[curMarker.__gm_id][curRoute[0]] = curRoute[2];
    	}

    }
	}

	graph = new Graph(genMap);
	alert(graph.findShortestPath(startMarker.__gm_id, endMarker.__gm_id));

}

function unselectRoute() {
	// When the close button is pushed, make the line go back to red and hide the box.
	selectedRoute.setOptions({strokeColor:'red'});
	document.getElementById("properties_panel").style.display = "none";
}

// THE CODE BELOW IS THE DJIKSTRAS IMPLEMENTATION
// 
//

var Graph = (function (undefined) {

        var extractKeys = function (obj) {
                var keys = [], key;
                for (key in obj) {
                    Object.prototype.hasOwnProperty.call(obj,key) && keys.push(key);
                }
                return keys;
        }

        var sorter = function (a, b) {
                return parseFloat (a) - parseFloat (b);
        }

        var findPaths = function (map, start, end, infinity) {
                infinity = infinity || Infinity;

                var costs = {},
                    open = {'0': [start]},
                    predecessors = {},
                    keys;

                var addToOpen = function (cost, vertex) {
                        var key = "" + cost;
                        if (!open[key]) open[key] = [];
                        open[key].push(vertex);
                }

                costs[start] = 0;

                while (open) {
                        if(!(keys = extractKeys(open)).length) break;

                        keys.sort(sorter);

                        var key = keys[0],
                            bucket = open[key],
                            node = bucket.shift(),
                            currentCost = parseFloat(key),
                            adjacentNodes = map[node] || {};

                        if (!bucket.length) delete open[key];

                        for (var vertex in adjacentNodes) {
                            if (Object.prototype.hasOwnProperty.call(adjacentNodes, vertex)) {
                                        var cost = adjacentNodes[vertex],
                                            totalCost = cost + currentCost,
                                            vertexCost = costs[vertex];

                                        if ((vertexCost === undefined) || (vertexCost > totalCost)) {
                                                costs[vertex] = totalCost;
                                                addToOpen(totalCost, vertex);
                                                predecessors[vertex] = node;
                                        }
                                }
                        }
                }

                if (costs[end] === undefined) {
                        return null;
                } else {
                        return predecessors;
                }

        }

        var extractShortest = function (predecessors, end) {
                var nodes = [],
                    u = end;

                while (u) {
                        nodes.push(u);
                        predecessor = predecessors[u];
                        u = predecessors[u];
                }

                nodes.reverse();
                return nodes;
        }

        var findShortestPath = function (map, nodes) {
                var start = nodes.shift(),
                    end,
                    predecessors,
                    path = [],
                    shortest;

                while (nodes.length) {
                        end = nodes.shift();
                        predecessors = findPaths(map, start, end);

                        if (predecessors) {
                                shortest = extractShortest(predecessors, end);
                                if (nodes.length) {
                                        path.push.apply(path, shortest.slice(0, -1));
                                } else {
                                        return path.concat(shortest);
                                }
                        } else {
                                return null;
                        }

                        start = end;
                }
        }

        var toArray = function (list, offset) {
                try {
                        return Array.prototype.slice.call(list, offset);
                } catch (e) {
                        var a = [];
                        for (var i = offset || 0, l = list.length; i < l; ++i) {
                                a.push(list[i]);
                        }
                        return a;
                }
        }

        var Graph = function (map) {
                this.map = map;
        }

        Graph.prototype.findShortestPath = function (start, end) {
                if (Object.prototype.toString.call(start) === '[object Array]') {
                        return findShortestPath(this.map, start);
                } else if (arguments.length === 2) {
                        return findShortestPath(this.map, [start, end]);
                } else {
                        return findShortestPath(this.map, toArray(arguments));
                }
        }

        Graph.findShortestPath = function (map, start, end) {
                if (Object.prototype.toString.call(start) === '[object Array]') {
                        return findShortestPath(map, start);
                } else if (arguments.length === 3) {
                        return findShortestPath(map, [start, end]);
                } else {
                        return findShortestPath(map, toArray(arguments, 1));
                }
        }

        return Graph;

})();

