let map;
let marker;
let infoWindow;

let searchResults = [];
let searchResultMarkers = [];
let searchCenterMarker = null;
let keyword = '';
let searchRadius = 1000; // default 1000 meters
let isPlaceMarker = false;
  
let transitLayer;
let stationMarkers = [];
let placesService;
 
let census_tracts_layer;
let oz_tract_layer;
let seattle_station_layer;
let mha_layer;
let health_layer;
let village_layer;
let king_county_layer;
let fmr_layer;
let zip_codes;
let us_fmr_zips;
let vps_layer;
let council_district_layer;
let hacla_delta_layer;
let hoa_layer;
let affh_layer;
let redBlue_layer;
let usda_layer;
let seattle_zoning_layer;
let lr1_layer;
let frequent_transit_layer;
  
let intersection_layer;
   
let hdc_properties = [];
let ozn_properties = [];
let anew_properties = [];
let apod_properties = [];
let acquisition_properties = [];
  
let comp_properties = [];
  
let laccd_schools = [];
let public_schools = [];
let private_schools = [];

const sponsorMap = new Map([
   ['hdc', hdc_properties],
   ['ozn', ozn_properties],
   ['anew', anew_properties],
   ['apodments.com', apod_properties],
   ['acquisitions', acquisition_properties],
   ['comps', comp_properties]
]);
      
const sponsorColor = {
   'hdc': '#7fbd45',
   'ozn': '#b23b7c',
   'anew': '#f06449',
   'apodments.com':'#0082ca',
   'acquisitions': '#734968',
   'comps': '#407f7f'
}

const zoningColor = {
	'Commercial': 'rgb(255, 79, 79)',
	'Seattle Mixed': 'rgb(255, 119, 0)',
	'Neighborhood Commercial': 'rgb(255, 174, 0)',
	'High-Density Multi-Family': 'rgb(97, 44, 0)',
	'Lowrise Multi-Family': 'rgb(161, 102, 51)',
	'Residential Small Lot': 'rgb(255, 220, 64)',
	'Neighborhood Residential': 'rgb(252, 249, 194)',
	'Downtown': 'rgb(137, 105, 199)',
	'Industrial': 'rgb(0, 206, 217)',
	'Major Institutions': 'rgb(15, 124, 128)',
	'Master Planned Community': 'rgb(122, 245, 202)',
}

const schoolMap = new Map([
  ['LACCD', laccd_schools],
  ['public', public_schools],
  ['private', private_schools]
]);

const schoolColor = {
   'LACCD': '#bfb05e', 
   'public': '#3e5d80', 
   'private': '#734968'
 };  
 
 
let transitStations = {
   bus: [],
   subway: [],
   light_rail: [],
   train: [],
   transit: []
};
  
const transitColor = {
   'transit': 'red',
   'bus': 'green',
   'light_rail': 'blue',
   'train': 'black',
   'subway': 'pink'
}
    
const transitMap = new Map([
   ['subway', transitStations.subway],
   ['transit', transitStations.transit],
   ['bus', transitStations.bus],
   ['light_rail', transitStations.light_rail],
   ['train', transitStations.train]
]);
  
const transitTypes = {
   'transit': ['transit_station'],
   'bus': ['bus_station'],
   'light_rail': ['light_rail_station'],
   'train': ['train_station',],
   'subway': ['subway_station']
}
  
const tierList = ['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#b10026']
const hoaColors = ['#ffffcc','#c2e699','#78c679','#238443'];
const affhColors = ['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837']

const HalcaDelta = { '-212': 0, '-128': 1, '-120': 1,  '-72': 1, '-44': 1,
	 				 '24': 2, '60': 2, '76': 2, '144': 3, '196': 3, '276': 4, 
	 				 '312': 5, '324': 5,'376': 5, '592': 6, '660': 6,'976': 7,
  				   };
   
const districtList = [
   '#0D47A1', // District 1 - Dark Blue
   '#1565C0', // District 2 - Strong Blue
   '#1976D2', // District 3 - Medium Blue
   '#1E88E5', // District 4 - Bright Blue
   '#2196F3', // District 5 - Standard Blue
   '#42A5F5', // District 6 - Light Blue
   '#64B5F6', // District 7 - Lighter Blue
   '#90CAF9', // District 8 - Very Light Blue
   '#2C387E', // District 9 - Deep Navy
   '#3949AB', // District 10 - Indigo Blue
   '#5C6BC0', // District 11 - Muted Blue
   '#7986CB', // District 12 - Soft Blue
   '#3F51B5', // District 13 - Material Blue
   '#5677FC', // District 14 - Google Blue
   '#4FC3F7'  // District 15 - Sky Blue
];


//Add to existing variable declarations at the top
let propertyCircles = new Map();

const ONE_MILE_IN_METERS = 1609.34;
   
async function initMap() {
   const zoom = 10;
	
   // Request needed libraries.
   const [{ Map }, { AdvancedMarkerElement }, {PlaceAutocompleteElement}] = await Promise.all([
	   google.maps.importLibrary("maps"),
       google.maps.importLibrary("marker"),
       google.maps.importLibrary("places"),
   ]);

   // Initialize the map.
   map = new Map(document.getElementById("map"), {
	   center: { lat: 47.606370, lng: -122.320401 },
       zoom: 13,
       mapId: "4504f8b37365c3d0",
       mapTypeControl: false,
   });

  const placeAutocomplete = new PlaceAutocompleteElement({
      locationRestriction: map.getBounds(),
  });

  placeAutocomplete.id = "place-autocomplete-input";
  const card = document.getElementById("place-autocomplete-card");

  card.appendChild(placeAutocomplete);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(card);

  // Create the marker and infowindow.
  marker = new AdvancedMarkerElement({
    map,
  });
  
  infoWindow = new google.maps.InfoWindow({});

  // Add the gmp-select listener, and display the results on the map.
  placeAutocomplete.addEventListener("gmp-select", async ( place ) => {
	  place = event.placePrediction.toPlace();
      
      await place.fetchFields({
		  fields: ["displayName", "formattedAddress", "location"],
      });
      
      // If the place has a geometry, then present it on a map.
      if (place.viewport) {
		  map.fitBounds(place.viewport);
      } else {
         map.setCenter(place.location);
         map.setZoom(17);
      }

      let content =
         '<div id="infowindow-content">' +
            '<span id="place-displayname" class="title">' + place.displayName + '</span><br />' +
            '<span id="place-address">' + place.formattedAddress +  '</span>' +
         '</div>';

      updateInfoWindow(content, place.location);
      marker.position = place.location;
   });
  
   //store AdvanceMarkerElement in window
   window.AdvancedMarkerElement = AdvancedMarkerElement;

   census_tracts_layer = new google.maps.Data();  
   oz_tract_layer = new google.maps.Data();
   seattle_station_layer = new google.maps.Data();
   mha_layer = new google.maps.Data();
   low_income_layer = new google.maps.Data();
   village_layer = new google.maps.Data();
   health_layer = new google.maps.Data();
   king_county_layer = new google.maps.Data();
   zip_codes = new google.maps.Data();
   us_fmr_zips = new google.maps.Data();
   seattle_zoning_layer = new google.maps.Data();
   vps_layer = new google.maps.Data();
   council_district_layer = new google.maps.Data();
   hacla_delta_layer = new google.maps.Data();
   hoa_layer = new google.maps.Data();
   affh_layer = new google.maps.Data();
   redBlue_layer = new google.maps.Data();
   usda_layer = new google.maps.Data();
   //fmr_layer = new google.maps.Data();
   lr1_layer = new google.maps.Data();
   frequent_transit_layer = new google.maps.Data();
    
   intersection_layer = new google.maps.Data();
    
   census_tracts_layer.loadGeoJson("geoData/CA_WA_Tracts.geojson");
   oz_tract_layer.loadGeoJson("geoData/ca_wa_opportunity_zones.geojson");
   seattle_station_layer.loadGeoJson("geoData/seattle_station_overlay.txt"); 
   mha_layer.loadGeoJson("geoData/MHA_zone.geojson");
   village_layer.loadGeoJson("geoData/urban_center.geojson");
   health_layer.loadGeoJson("geoData/health_index2.geojson");
   king_county_layer.loadGeoJson("geoData/king_county_housing.geojson");
   zip_codes.loadGeoJson("geoData/zip_code_safmr.geojson");
   us_fmr_zips.loadGeoJson("geoData/us_fmr_zip_code.geojson");
   seattle_zoning_layer.loadGeoJson("geoData/SeattleZoningCode.geojson");
   vps_layer.loadGeoJson("geoData/hacla_vps.geojson");
   council_district_layer.loadGeoJson("geoData/LA_Seattle_CD.geojson");
   hacla_delta_layer.loadGeoJson("geoData/hacla_comparison.geojson");
   hoa_layer.loadGeoJson("geoData/HOA.geojson");
   affh_layer.loadGeoJson("geoData/affh.geojson");
   redBlue_layer.loadGeoJson("geoData/election_map_2024.geojson");
   usda_layer.loadGeoJson("geoData/USDA_Multifamily_wgs84.geojson");
   //fmr_layer.loadGeoJson("geoData/fmr_vps.geojson");
   lr1_layer.loadGeoJson("geoData/lr1_base.geojson");
   frequent_transit_layer.loadGeoJson("geoData/Frequent_Transit_Service_Area.geojson");
   	
   //set up event listeners
   document.getElementById('toggleCensusTracts').addEventListener('change', toggleCensusTracts);
   document.getElementById('toggleTracts').addEventListener('change', toggleTracts);
   document.getElementById('toggleSeattleStationOverlay').addEventListener('change', toggleSeattleStationOverlay);
   document.getElementById('toggleMHA').addEventListener('change', toggleMHA);
   document.getElementById('toggleVillage').addEventListener('change', toggleVillage);
   document.getElementById('toggleHealth').addEventListener('change', toggleHealth);
   document.getElementById('toggleKing').addEventListener('change', toggleKing);
   document.getElementById('toggleSAFMR').addEventListener('change', toggleSAFMR);
   document.getElementById('toggleUSFMR').addEventListener('change', toggleUSFMR);
   document.getElementById('toggleVPS').addEventListener('change', toggleVPS);
   document.getElementById('toggleCD').addEventListener('change', toggleCD);
   document.getElementById('toggleDelta').addEventListener('change', toggleDelta);
   document.getElementById('toggleOverlap').addEventListener('change', toggleOverlap);
   document.getElementById('toggleHOA').addEventListener('change', toggleHOA);
   document.getElementById('toggleAFFH').addEventListener('change', toggleAFFH);
   document.getElementById('toggleRedBlue').addEventListener('change', toggleRedBlue);
   document.getElementById('toggleUSDA').addEventListener('change', toggleUSDA);
   //document.getElementById('toggleFMR').addEventListener('change', toggleFMR);
   document.getElementById('toggleSeattleZoningCode').addEventListener('change', toggleSeattleZoningCode);
   document.getElementById('toggleSeattleZoningLR1').addEventListener('change', toggleSeattleZoningLR1);
   document.getElementById('toggleFrequentTransit').addEventListener('change', toggleFrequentTransit);
 
   //initialize places service
   placesService = new google.maps.places.PlacesService(map);
   	
   initKeywordSearch();
}
  
// Helper function to create an info window.
function updateInfoWindow(content, center) {
   infoWindow.setContent(content);
   infoWindow.setPosition(center);
   infoWindow.open({
	   map,
       anchor: marker,
       shouldFocus: false,
   });
}
  
// Add this function to initialize the keyword search functionality
function initKeywordSearch(){
   // Get DOM elements
   const startSearchButton = document.getElementById('start-search-button');
   const keywordInput = document.getElementById('keyword-input');
   const radiusInput = document.getElementById('search-radius');
   const clearResultsButton = document.getElementById('clear-results-button');
   const confirmSearchButton = document.getElementById('confirm-search-button');
   const cancelSearchButton = document.getElementById('cancel-search-button');
   const csvConverterButton = document.getElementById('csv-converter');
	  
	// Add event listeners
	startSearchButton.addEventListener('click', startMarkerPlacement);
	keywordInput.addEventListener('keyup', function(event) {
       if (event.key === 'Enter'){
	      startMarkerPlacement();
	   }
	});
	
	radiusInput.addEventListener('change', function() {
	   searchRadius = parseInt(radiusInput.value);
	});
	  
	clearResultsButton.addEventListener('click', clearSearchResults);
	confirmSearchButton.addEventListener('click', performKeywordSearch);
	cancelSearchButton.addEventListener('click', cancelMarkerPlacement);
	csvConverterButton.addEventListener('click', convertToCSV);
}
  
  
function startMarkerPlacement(){
   // Get the Keywrod from the input field
   keyword = document.getElementById('keyword-input').value.trim();
	  
   if (!keyword){
      alert('Please enter a keyword to search for places.');
	  return;
   }
	  
   clearSearchResults();
	  
   // Set the overlay to cover the entire screen
   const searchOverlay = document.getElementById('search-overlay');
   searchOverlay.style.position = 'fixed';
   searchOverlay.style.top = '0';
   searchOverlay.style.left = '0';
   searchOverlay.style.width = '100%';
   searchOverlay.style.height = '100%';
   searchOverlay.style.zIndex = '1000';
   searchOverlay.style.display = 'flex';
	  
   // Create a draggable marker at the center of the map
   const center = map.getCenter();
   createDraggableSearchCenterMarker(center);  
   isPlacingMarker = true;
}
  
// Function to cancel marker placement
function cancelMarkerPlacement(){	 	   
   // Hide Overlay
   document.getElementById('search-overlay').style.display = 'none';
	  
   if (searchCenterMarker) {
      searchCenterMarker.map = null;
	  searchCenterMarker = null;
   }
	  
   isPlaceingMarker = false;
}
  
// Function to create a draggable marker for the search center
function createDraggableSearchCenterMarker(position) {
   // Remove exisiting center marker if any
   if (searchCenterMarker){
      searchCenterMarker.map = null;
   }
	  
   // Create the center marker element with a pulse effect
   const centerElement = document.createElement('div');
   centerElement.className = 'search-center-marker'
   centerElement.innerHTML = '<i style="font-size:24px" class="fa">&#xf11a;</i>';
	  
   searchCenterMarker = new google.maps.marker.AdvancedMarkerElement({
      map: map,
	  position: position,
	  content: centerElement,
	  zIndex: 1100, // make sure it appears on top
	  gmpDraggable: true // Make it draggable
	});
	  
	return searchCenterMarker;
}
  
function performKeywordSearch() {
   // Hide the overlay and reset the flag
   document.getElementById('search-overlay').style.display = 'none';
   isPlacingMarker = false;
	  
   if (!searchCenterMarker) {
      alert('Please place a marker on the map first');
	  return;
   }
	  
   searchRadius = parseInt(document.getElementById('search-radius').value);
	  
   const position = searchCenterMarker.position;
	  
   // Perform the search
   const request = {
      location: position,
	  radius: searchRadius,
	  keyword: keyword
   };
	  
   placesService.nearbySearch(request, handleSearchResults);
}
  
function handleSearchResults(results, status){  
   if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0){
      createSearchRadiusCircle(searchCenterMarker.position, searchRadius);
		  
	  //calculate distance for all results
	  results = addDistanceToResults(results);
		  
	  // Sort results by distance (closest first)
	  results.sort((a,b) => a.distance - b.distance);
		  
	  // Store the results globally for CSV export
	  searchResults = results;
		  
	  console.log('handleSearchResults: ', results);
		  
	  //create markers for each result
	  results.forEach(place => {
	     createPlaceMarker(place);
	  });
		  
	  //adjust map bounds to show all results
	  fitMapToSearchResults();
		 
	  updateSearchCenterInfo(results.length);
   } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS){
	  alert('No place found matching "' + keyword + '" within ' + searchRadius + ' meters.');
   } else {
	  alert('Place search failed due to: ' + status);
   }
}
  
function convertToCSV(){
   if (searchResults.length === 0){
	  alert('No search results to convert. Please try a new search.');
	  return;
   }
	  
   const headers = ['Name','Address','Distance (m)', 'Distance (mi)', 'Types',
	  				'Rating', 'User ratings Total', 'Latitude', 'Longitude','Place ID'];
	  
   // Create array to hold all rows of the CSV
   const csvRows = [headers.join(',')]; // Start with the row header 
	  
   //Format each search results as a csv row
   searchResults.forEach(place => {
      console.log("csv place: ", place);
		  
	  const distanceInMiles = place.distance / 1609.34; // 1mi = 1609 meters
		  
	  const row = [
	     '"' + (place.name || '').replace(/"/g, '""') + '"', // Escape quotes in CSV
		 '"' + (place.vicinity || '').replace(/"/g, '""') + '"',
		 place.distance.toFixed(2), // Distance in meters
		 distanceInMiles.toFixed(2),
		 '"' + (place.types ? place.types.join(';') : '').replace(/"/g, '""') + '"',
		 place.rating || '',
		 place.user_ratings_total || '',
		 place.geometry.location.lat(),
		 place.geometry.location.lng(),
		 place.place_id || ''
      ];
		  
	  csvRows.push(row.join(','));
   });
	  
   // Join all rows with newlines to create the CSV Content
   const csvContent = csvRows.join('\n');
	  
   // Create a blob form the CSV Content
   const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
	  
   // Create a URL for the Blob
   const url = URL.createObjectURL(blob);
	  
   // create a link element to download the CSV
   const link = document.createElement('a');
   link.setAttribute('href', url);
   link.setAttribute('download', `places_search_${keyword}_${new Date().toISOString().slice(0,10)}.csv`);
   link.style.visibility = 'hidden';
	  
   // Add the link to the document
   document.body.appendChild(link);
	  
   // Click the link to downlaod the CSV
   link.click();
	  
   // Remove the link from the document 
   document.body.removeChild(link);
}
  
function addDistanceToResults(results) {
   const centerLat = searchCenterMarker.position.lat;
   const centerLng = searchCenterMarker.position.lng;
	  
   return results.map(place => {
      const placeLat = place.geometry.location.lat();
	  const placeLng = place.geometry.location.lng();
		  
	  //calculate distance using Google's geometry library
	  const distance = google.maps.geometry.spherical.computeDistanceBetween(
	     new google.maps.LatLng(centerLat, centerLng),
		 new google.maps.LatLng(placeLat, placeLng)
	  );
		  
	  console.log("place: ", place, "\nDistance", distance);
		  
	  place.distance = distance;
	  return place;
   });
}
  
function formatDistance(meters) {
   if (meters < 1000){
      return Math.round(meters) +  ' m';
	} else {
	  return (meters /1000).toFixed(1) + ' km';
	}
}
  
function createSearchRadiusCircle(center, radius) {
   if (window.searchRadiusCircle){
	   window.searchRadiusCircle.setMap(null);
   }
	  
   window.searchRadiusCircle = new google.maps.Circle({
	  strokeColor: '#FF0000',
	  strokeOpacity: 0.8,
	  strokeWeight: 2,
	  fillColor: '#FF0000',
	  map: map,
	  center: center,
	  radius: radius,
	  zIndex: 1
   });
}
  
//fucntion to update the search center marker with result into
function updateSearchCenterInfo(resultCount){
   searchCenterMarker.addListener("gmp-click", () => {
	  const content = `
	     <div class="info-window">
		    <h5>Search Center</h5>
		       <p>Keyword: "${keyword}"</p>
		       <p>Radius: ${searchRadius} meters </p>
		       <p>Results: ${resultCount}</p>
	     </div>
	  `;
		  
	  infoWindow.setContent(content);
	  infoWindow.setPosition(searchCenterMarker.position);
	  infoWindow.open(map);
   });
}
  
function fitMapToSearchResults() {
   if (searchResultMarkers.length > 0){
	  const bounds = new google.maps.LatLngBounds();
		  
	  bounds.extend(searchCenterMarker.position);
		  
	  searchResultMarkers.forEach(marker => {
 	     bounds.extend(marker.position);
	  });
		  
	  map.fitBounds(bounds);
   }
}
  
function createPlaceMarker(place){
   const placeMarker = new google.maps.marker.AdvancedMarkerElement({
      map,
	  content: buildPlaceContent(place),
	  position: {
	     lat: place.geometry.location.lat(),
		 lng: place.geometry.location.lng()
	  },
	  title: place.name
   });
	    
   placeMarker.addListener("gmp-click", () => {
      toggleHighlight(placeMarker, place);
		  
	  placesService.getDetails(
	     {placeId: place.place_id, fields: ['name', 'formatted_address', 'rating', 'user_ratings_total', 'website', 'formatted_phone_number', 'photos', 'opening_hours', 'price_level' ]},
		 (placeDetails, detailsStatus) => {
		    if (detailsStatus === google.maps.places.PlacesServiceStatus.OK){
			   placeDetails.distance = place.distance;
			   showPlaceDetails(placeMarker, placeDetails);
			}
          }
      );
   });
	  
   searchResultMarkers.push(placeMarker);
   return placeMarker;
}
  
function buildPlaceContent(place){
   const content = document.createElement("div");
   content.classList.add("place-result");
	  
   let iconColor = '#4285F4';
	  
   if (place.types) {
	  if (place.types.includes('restaurant') || place.types.includes('food')){
	     iconColor = '#DB4437'; // Red for food
	   } else if (place.types.includes('store') || place.types.includes('shopping_mall')) {
		 iconColor = '#0F9D58'; // Green for shopping
	   } else if (place.types.includes('bar') || place.types.includes('night_club')){
		 iconColor = '#F4B400'; // Yellow for nighlife
	   }
   }
	  
   console.log("distance before: ", place.distance);
   const distanceText = formatDistance(place.distance);
   console.log("distance after: ", distanceText);
	  
   content.innerHTML = `
      <div class="icon">
	     <i aria-hidden="true" class="fa fa-map-pin" style="color: ${iconColor};"></i>
	  	    <span class="fa-sr-only">place</span>
	  </div>
	  
	  <div class="details">
	     <div class="name">${place.name}</div>
	  	 <div class="distance"><i class="fa fa-location-arrow" aria-hidden="true"></i>${distanceText}</div>
	  	 <div class="address">${place.vicinity || ''}</div>
	  	 <div class="rating">${place.rating ? `Rating: ${place.rating}/5 (${place.user_ratings_total} reviews)` : 'No ratings'} </div>
	  	 ${place.types ? `<div class="types">${place.types.slice(0,3).join(', ')}</div>` : ''}
	  </div>
   `;
	  
   return content;
}
  
// Function to show place details in an info window
function showPlaceDetails(marker, placeDetails){
   const distanceText = formatDistance(placeDetails.distance);
	  
   console.log("place details: ", placeDetails);
   //console.log("open: ", placeDetails.opening_hours.isOpen());
	  
   const content = `
      <div class="info-window">
	     <h5>${placeDetails.name}</h5>
	  	    <p><strong><i class="fa fa-location-arrow" aria-hidden="true"></i>${distanceText} from search center</strong></p>
	  		<p>${placeDetails.formatted_address || ''}</p>
	  		${placeDetails.rating ? `<p>Rating ${placeDetails.rating}/5 (${placeDetails.user_ratings_total} reviews)</p>` : ''}
	  		${placeDetails.formatted_phone_number ? `<p>Phone: ${placeDetails.formatted_phone_number}` : ''}
	  		${placeDetails.website ? `<p><a href="${placeDetails.website}" target="_blank">Website</a></p>` : ''}
	  		${placeDetails.opening_hours ? `<p>${placeDetails.opening_hours.open_now ? 'Open Now' : 'Closed now'}</p>` : ''}
	  		${placeDetails.price_level ? `<p>Price leve: ${Array(placeDetails.price_level + 1).join('$')}</p>` : ''}
	  	</div>
   `;
	  
   infoWindow.setContent(content);
   infoWindow.setPosition(marker.position);
   infoWindow.open(map);
}
  
function clearSearchResults() {
   searchResultMarkers.forEach(m => {
      m.map = null;
	});
	  
	searchResultMarkers = [];
	searchResults = [];
	  
	if (searchCenterMarker){
	    searchCenterMarker.map = null;
	    searchCenterMarker = null;
	}
	  
	if (window.searchRadiusCircle){
		window.searchRadiusCircle.setMap(null);
		window.searchRadiusCircle = null;
	}
	  
	infoWindow.close();
	  
	document.getElementById('search-overlay').style.display = 'none';
	  
	isPlacingMarker = false;
}

function toggleUSDA(){
	if (document.getElementById('toggleUSDA').checked){
		usda_layer.setStyle({
			fillColor: '#bfb05e',
			fillOpacity: .7,
			strokeColor: '#000',
			strokeOpacity: .5,
			strokeWeight: .5
		});
		
		usda_layer.addListener('click', handleMouseClickUSDA);
		usda_layer.setMap(map);
	} else {
		usda_layer.setMap(null);
	}
}


function handleMouseClickUSDA(event){
	console.log(event);
	var content = '<div class="info-window">';
	content += '<h5> State:  ' + event.feature.getProperty('STATENAME') + '</h5>' +
			   '<p> As of: ' + event.feature.getProperty('EDIT_DATE') + '</p>' +
			   '<p> State ID: ' + event.feature.getProperty('STATEFP') + '</p>';
    content += '</div>';
	  
    infoWindow.setContent(content);
    infoWindow.setPosition(event.latLng);
    infoWindow.open(map);
}
  
  
function toggleFrequentTransit(){
	if (document.getElementById('toggleFrequentTransit').checked){
		frequent_transit_layer.setStyle({
			fillColor: '#73513e',
			fillOpacity: .7,
			strokeColor: '#000',
			strokeOpacity: .5,
		});
		
		frequent_transit_layer.addListener('click', handleMouseClickFrequentTransit);
		frequent_transit_layer.setMap(map);
	} else {
		frequent_transit_layer.setMap(null);
	}
}

function handleMouseClickFrequentTransit(event){
	console.log(event);
	var content = '<div class="info-window">';
	content += '<h5> ObjectID / FID: ' + event.feature.getProperty('OBJECTID') + '</h5>'; 
	content += '<p> PIN: ' + event.feature.getProperty('PIN') + '</p>'; 
	content +=  '</div>';
	
	infoWindow.setContent(content);
	infoWindow.setPosition(event.latLng);
	infoWindow.open(map);
}
  
function toggleRedBlue() {
   if (document.getElementById('toggleRedBlue').checked){
      redBlue_layer.setStyle(function(feature) {
	     const party = feature.getProperty('party');
		 const margin = (feature.getProperty('margin') + 15) / 100;
		 const color = party == 'Republican' ? 'red' : 'blue';
			  
		 return {
		    fillColor: color,
			fillOpacity: margin,
			storkeWeight: 0.3,
		  };
      });
		  
	  redBlue_layer.addListener('click', handleMouseClickRedBlue);
	  redBlue_layer.setMap(map);
   } else {
	  redBlue_layer.setMap(null);
   }  
}
  
function toggleAFFH() {
   if (document.getElementById('toggleAFFH').checked){
	  affh_layer.setStyle(function(feature) {
	     const affhIndex = feature.getProperty('oppscore');
		 const color = affhColors[affhIndex];
			  
		 return {
		    fillColor: color,
			fillOpacity: 0.7,
			strokeWeight: 0.5,
		  };
	  });
		  
	  affh_layer.addListener('click', handleMouseClickAFFH);
	  affh_layer.setMap(map);
   } else {
      affh_layer.setMap(null);
   }
}
  
function toggleHOA(){
   if (document.getElementById('toggleHOA').checked) {
      hoa_layer.setStyle(function(feature) {	 
	     const hoaIndex = feature.getProperty('HIGH_OPP');
	     const color = hoaColors[hoaIndex];
			 
		 return {
		    fillColor: color,
			fillOpacity: .7,
			strokeWeight: .5,
		 };
      });
	  
	  hoa_layer.addListener('click', handleMouseClickHOA);
      hoa_layer.setMap(map);
   } else {
	  hoa_layer.setMap(null);  
   }
}
  
function handleMouseClickRedBlue(event){
   var content = '<div class="info-window">';
   content += '<h5> State: ' + event.feature.getProperty('NAME') + '</h5>'+ 
	          '<h6> Party: ' + event.feature.getProperty('party') + '</h6>' +
	          '<p> Margin of Victory: ' + event.feature.getProperty('margin') + '</p>';
   content += '</div>';
	  
   infoWindow.setContent(content);
   infoWindow.setPosition(event.latLng);
   infoWindow.open(map);
}
  
function handleMouseClickAFFH(event){
   var content = '<div class="info-window">';
   
   if (event.feature.getProperty('oppscore') == null) {
      content += '<div class="info-window">' +
		         '<h5> Census Tract: ' + event.feature.getProperty('fips') + '</h5>' +
		 		 '<p> County: ' + event.feature.getProperty('county_name') + '</p>' +
	      		 '<p> Region: ' + event.feature.getProperty('region') + '</p>' +
	     		 '<p> <strong>Excluded Area - </strong>Low population (total population below 750) and low population density (below 25 people/mi2) or High share of military population (50 percent or more of the age 16+ population are employed by the armed forces). </p>'; 
   } else {
      content +=
		  '<h5> Census Tract: ' + event.feature.getProperty('fips') + '</h5>' +
		  '<h6> Opportunity: ' + event.feature.getProperty('oppcat') + '</h6>' +
		  '<h6> Opportunity Score: ' + event.feature.getProperty('oppscore') + '</h6>' +
		  '<p> County: ' + event.feature.getProperty('county_name') + '</p>' +
		  '<p> Region: ' + event.feature.getProperty('region') + '</p>' +
		  '<p> Home value:  ' + event.feature.getProperty('home_value') + '</p>' +
		  '<p> Percentage People of Color: ' + event.feature.getProperty('pct_poc') + '</p>' +
		  '<p> Percent Hispanic: ' + event.feature.getProperty('pct_hispanic') + '</p>' +
		  '<p> Percent Black: ' + event.feature.getProperty('pct_black') + '</p>' +
		  '<p> Percent Employed: ' + event.feature.getProperty('pct_employed') + '</p>' +
		  '<p> Percent Bachelors Plus: ' + event.feature.getProperty('pct_bachelors_plus') + '</p>' +
		  '<p> Percent Below Poverty: ' + event.feature.getProperty('pct_below_pov') + '</p>' +
		  '<p> Percent Employed: ' + event.feature.getProperty('pct_employed') + '</p>';
   }
	 
   content += '</div>';
	  
   infoWindow.setContent(content);
   infoWindow.setPosition(event.latLng);
   infoWindow.open(map);
}
  
function handleMouseClickHOA(event){
   //console.log(event.feature);
   var content = '<div class="info-window">' +
	  '<h5> Census Tract: ' + event.feature.getProperty('TRACTCE') + '</h5>' +
	  '<p> High Opportunity Index: ' + event.feature.getProperty('HIGH_OPP') + '</p>' +
	  '<p> Difficult Development Area: ' + event.feature.getProperty('DDA_FLAG') + '</p>' +
	  '<p> HOA prior to poverty screen:  ' + event.feature.getProperty('QAP_FLAG') + '</p>' +
	  '<p> GEOID: ' + event.feature.getProperty('GEOID') + '</p>';
	  '</div>';
	  
	  infoWindow.setContent(content);
	  infoWindow.setPosition(event.latLng);
	  infoWindow.open(map);
}
   
function processShape(geometry) {
   console.log("in process shape2");
   console.log("geometry: ", geometry);
   console.log("type: ", geometry.getType());
	 	
   if (geometry.getType() === 'Polygon'){
      // Assuming geometry1[0] represents the exterior ring
      const ring = geometry.getArray()[0].getArray().map(coord => [coord.lng(), coord.lat()]); // Correctly map to [lng, lat]
	  //ensure first and last points are the same to close the ring
	  if (ring.length > 0 && (ring[0][0] != ring[ring.length - 1][0] || ring[0][1] != ring[ring.length - 1][1])){
	     ring.push(ring[0]); //add the first point to the end to close the ring
	  }
			
	  return {
	     type: 'Polygon',
		 coordinates: [ring]
	  };
   } else if (geometry.getType() === 'MultiPolygon'){
	  const polygons = [];
	  console.log("hi", geometry.getArray()[0]);
	  console.log("hi2", geometry.getArray()[0].getArray());
	  console.log("hi3", geometry.getArray()[0].getArray()[0].getArray());
			
	  geometry.getArray().forEach(polygon => {
	     console.log("polygon: ", polygon);
		 const ring = polygon.getArray()[0].getArray().map(coord => [coord.lng(), coord.lat()]); // Correctly map to [lng, lat]
		 //ensure first and last points are the same to close the ring
		 if (ring.length > 0 && (ring[0][0] != ring[ring.length - 1][0] || ring[0][1] != ring[ring.length - 1][1])){
		    ring.push(ring[0]); //add the first point to the end to close the ring
		 }
				
		 polygons.push(ring);
      });
			
      return {
         type: 'MultiPolygon',
	     coordinates: [polygons]
	   };
   }
   
   return null;
}
  
function toggleOverlap() {
   console.log("in toggle overlap2");
   if (!document.getElementById('toggleOverlap').checked) {
      intersection_layer.setMap(null);
      return;
   }
    
   const visible_layers = [];
    
   //if (census_tracts_layer.getMap()) visible_layers.push(census_tracts_layer);
   if (oz_tract_layer.getMap()) visible_layers.push(oz_tract_layer);
   if (seattle_station_layer.getMap()) visible_layers.push(seattle_station_layer);
   if (mha_layer.getMap()) visible_layers.push(mha_layer);
   if (health_layer.getMap()) visible_layers.push(health_layer);
   if (village_layer.getMap()) visible_layers.push(village_layer);
   if (king_county_layer.getMap()) visible_layers.push(king_county_layer);
   //if (fmr_layer.getMap()) visible_layers.push(fmr_layer);
   //if (zip_codes.getMap()) visible_layers.push(zip_codes);
   //if (us_fmr_zips.getMap()) visible_layers.push(us_fmr_zips);
   if (seattle_zoning_layer.getMap()) visible_layers.push(seattle_zoning_layer);
   if (vps_layer.getMap()) visible_layers.push(vps_layer);
   if (council_district_layer.getMap()) visible_layers.push(council_district_layer);
   if (hacla_delta_layer.getMap()) visible_layers.push(hacla_delta_layer);
   //if (hoa_layer.getMap()) visible_layers.push(hoa_layer);
            
   if (visible_layers.length < 2) {
       alert('You need at least 2 layers to check overlaps');
       return;
   }
	
   //Initialize the intersection layer with the first layer
   intersection_layer = visible_layers[0];
	
   //Iteratively find intersections with each subsquent layer
   for (let i = 1; i < visible_layers.length; i++) {
      const next_layer = visible_layers[i];
	  const new_intersection = new google.maps.Data();
		
	  intersection_layer.forEach(feature1 => {
	     next_layer.forEach(feature2 => {
		    console.log("feature 1: ", feature1);
		    console.log('feature 2: ', feature2);
				
			 if (!feature1.getGeometry() || !feature2.getGeometry()) return;
			    
			 try {
			    const shape1 = processShape(feature1.getGeometry());
				const shape2 = processShape(feature2.getGeometry());
					
				const turfFeature1 = shape1.type === 'Polygon'
						? turf.polygon(shape1.coordinates) : turf.multiPolygon(shape1.coordinates);
				const turfFeature2 = shape2.type === 'Polygon'
						? turf.polygon(shape2.coordinates) : turf.multiPolygon(shape2.coordinates);
					
				const intersection = turf.intersect(turfFeature1, turfFeature2);
					
				if (intersection){
				   console.log("intersection: ", intersection);
						
				   const combined_properties = {};
				   feature1.forEachProperty((value, key) => {
					  combined_properties[`${key}`] = value;
					});
						
					feature2.forEachProperty((value, key) => {
					  combined_properties[`${key}`] = value;
					});
						
					new_intersection.addGeoJson({
					   type: 'Feature',
					   geometry: intersection.geometry,
					   properties: combined_properties,
				    });
				 }
			  } catch (error){
			     console.error('Error calculating intersection', error);
			  } 
		   });
		});
	
		//update intersection layer for the next iteration
		intersection_layer = new_intersection;
	}
	
	intersection_layer.setStyle({
		fillColor: 'green',
		fillOpacity: 0.6,
	});
	
	intersection_layer.addListener('click', handleMouseClickIntersection);
	intersection_layer.setMap(map);
    console.log('Number of visible layers:', visible_layers.length);
}
   
function handleMouseClickIntersection(event){
   console.log("in handle click intersection function", event);
   var content = '<div class="info-window">';
	   
   event.feature.forEachProperty((value, key) => {
      content += '<p><strong>' +  key + ":</strong> " + value + '</p>';
	});
	    
	content += '</div>';
	   
	infoWindow.setContent(content);
	infoWindow.setPosition(event.latLng);
	infoWindow.open(map);
}  

    
function toggleUSFMR(){
   if (document.getElementById('toggleUSFMR').checked) {
      us_fmr_zips.setStyle(function(feature) {
	  const us_score = feature.getProperty('us_score');
	  let red, green;
	  if (us_score < 0.5) {
	      // Red to Yellow
		  red = 255;
		  green = Math.round(255 * (us_score * 2));
	   } else {
	      // Yellow to Green
	      red = Math.round(255 * ((1 - us_score) * 2));
	       green = 255;
	   };
			
	   const color = `rgb(${red}, ${green}, 0)`;
	
	   return {
		  fillColor: color,
		  fillOpacity: .7,
		  strokeColor: '#000',
		  strokeOpacity: 1,
		  strokeWeight: .5
		};
	 });

	 us_fmr_zips.addListener('click', handleMouseClickSAFMR);
	 us_fmr_zips.setMap(map);
   } else {
	  us_fmr_zips.setMap(null);
   }
}
      
  async function toggleSAFMR(){
	  const legendElement = document.getElementById('legend');
	   if (document.getElementById('toggleSAFMR').checked) {
	    zip_codes.setStyle(function(feature) {
	      const msa_score = feature.getProperty('score');
	      const us_score = feature.getProperty('us_score');
	      
		  // Determine fill color based on MSA score
		  let fillColor;
		  if (msa_score >= 0.9) {
			  fillColor = 'green';
		  } else if (msa_score >= 0.8) {
		      fillColor = 'yellow';
		  } else if (msa_score >= 0.7) {
		      fillColor = 'red';
		  } else {
		      fillColor = 'gray';
		  }
		
	      // Determine stroke color based on US score
	      let strokeColor;
	      if (us_score >= 0.9) {
	        strokeColor = 'green';
	      } else if (us_score >= 0.8) {
	        strokeColor = 'yellow';
	      } else if (us_score >= 0.7) {
	        strokeColor = 'red';
	      } else {
	        strokeColor = 'gray';
	      }
	      
	      // Determine z-index based on stroke color priority
	      let zIndex;
	      switch (strokeColor) {
	        case 'green':
	          zIndex = 4;
	          break;
	        case 'yellow':
	          zIndex = 3;
	          break;
	        case 'red':
	          zIndex = 2;
	          break;
	        default:
	          zIndex = 1;
	      }
		
	      return {
	        fillColor: fillColor,
	        fillOpacity: 0.7,
	        strokeColor: strokeColor,
	        strokeOpacity: 1,
	        strokeWeight: 2,
	        zIndex: zIndex
	      };
	    });

	    zip_codes.addListener('click', handleMouseClickSAFMR);
	    zip_codes.setMap(map);
	    legendElement.style.display = 'block'; // Show the legend
	  } else {
	    zip_codes.setMap(null);
	    legendElement.style.display = 'none'; // Show the legend
	  }
  }
  
   function toggleCD(){
	  if (document.getElementById('toggleCD').checked) {
		  console.log("checked");
		  council_district_layer.setStyle(function(feature) {
			  console.log(feature);
			  var district;
			  
			  if (feature.getProperty('C_DISTRICT')){
				  district = feature.getProperty('C_DISTRICT');
			  } else {
				  district = feature.getProperty('District');
			  }
			  
			  console.log(district);
			  
			  color = districtList[district - 1];
			  
			  return {
				  fillColor: color,
				  fillOpacity: .7,
				  strokeColor:  'black',
				  strokeWeight: .5
			  };	
		  });
		  
		  council_district_layer.addListener('click', handleMouseClickCD);
		  council_district_layer.setMap(map);
	  } else {
		  council_district_layer.setMap(null);
	  }
  }
  
  function toggleDelta(){
	  if (document.getElementById('toggleDelta').checked) {		  
		  hacla_delta_layer.setStyle(function(feature) {
		  
		  const delta = feature.getProperty('delta');
		  const tier = HalcaDelta[delta];
			  				
		  color = tierList[tier];

		  return {
			  fillColor: color,
			  fillOpacity: .7,
			  strokeColor:  'black',
			  strokeWeight: .5
			  };			
		  });
			  
		  hacla_delta_layer.addListener('click', handleMouseClickDelta);
		  hacla_delta_layer.setMap(map);
	  } else {
		  hacla_delta_layer.setMap(null);
	  }
  }
  
  function toggleVPS() {
	  if (document.getElementById('toggleVPS').checked){
		  vps_layer.setStyle( function(feature) {
			  
			  const tier = feature.getProperty('tier') - 1;
			  color = tierList[tier];
			  
			  return {
				  fillColor: color,
				  fillOpacity: .7,
				  strokeColor:  'black',
				  strokeWeight: .5
			  };			
		  });
		  
		  vps_layer.addListener('click', handleMouseClickVPS);
		  vps_layer.setMap(map);
  	  } else {
			vps_layer.setMap(null);
		}
   }
  
  
   function toggleCensusTracts(){
	  if (document.getElementById('toggleCensusTracts').checked){
		  census_tracts_layer.setStyle({
			  fillColor: 'blue',
			  strokeColor: '#000',
			  strokeOpacity: .9,
			  stokeWeight: 1
		  });
		  
		  census_tracts_layer.addListener('click', handleMouseClickCensusTract);
		  census_tracts_layer.setMap(map);
	  } else {
		  census_tracts_layer.setMap(null);
	  }
	  
  }
      
  function toggleSeattleZoningCode(){
	if (document.getElementById('toggleSeattleZoningCode').checked){
		seattle_zoning_layer.setStyle(function(feature) {
			const category = feature.getProperty('CATEGORY_DESC');
			const color  = zoningColor[category];
			
			return {
				fillColor: color,
				fillOpacity: .7,
			    strokeColor: '#000',
			    strokeOpacity: .7,
			    strokeWeight: 0
			}	
		 
		 });
		 
		 seattle_zoning_layer.addListener('click', handleMouseClickSeattleZoning);
		 seattle_zoning_layer.setMap(map);	
	} else {
		seattle_zoning_layer.setMap(null);
	}
  }
  
   function toggleSeattleZoningLR1(){
	if (document.getElementById('toggleSeattleZoningLR1').checked){
		lr1_layer.setStyle(function(feature) {
			const category = feature.getProperty('CATEGORY_DESC');
			const color  = zoningColor[category];
			
			return {
				fillColor: color,
				fillOpacity: .7,
			    strokeColor: '#000',
			    strokeOpacity: .7,
			    strokeWeight: 0
			}	
		 
		 });
		 
		 lr1_layer.addListener('click', handleMouseClickSeattleZoning);
		 lr1_layer.setMap(map);	
	} else {
		 lr1_layer.setMap(null);
	}
  }
  
  function toggleTracts(){
	if (document.getElementById('toggleTracts').checked){
		oz_tract_layer.setStyle({
		    fillColor: 'green',
		    strokeColor: '#000',
		    strokeOpacity: 1,
		    strokeWeight: 1
		 });
		 
		 oz_tract_layer.addListener('click', handleMouseClickCensusTract);
		 oz_tract_layer.setMap(map);	
	} else {
		 oz_tract_layer.setMap(null);
	}
  }
  	  
  function toggleSeattleStationOverlay(){
	  if (document.getElementById('toggleSeattleStationOverlay').checked){
		   seattle_station_layer.setStyle({
			    fillColor: 'purple',
			    strokeColor: '#000',
			    strokeOpacity: 1,
			    strokeWeight: 1
		   });
			
		   seattle_station_layer.addListener('click', handleMouseClickStations);	
		   seattle_station_layer.setMap(map);  
	  } else {
		  seattle_station_layer.setMap(null);
	  }
  }
  
  function toggleMHA(){
	if (document.getElementById('toggleMHA').checked){			
		mha_layer.setStyle({
		    fillColor: 'blue',
		    strokeColor: '#000',
		    strokeOpacity: 1,
		    strokeWeight: 1
		 });
		 
		 mha_layer.addListener('click', handleMouseClickMHA);
		 mha_layer.setMap(map);	
	} else {
		mha_layer.setMap(null);
	}
  }
  
  function toggleVillage(){
	  if (document.getElementById('toggleVillage').checked){
		  console.log("in toogleVillage");
		  village_layer.setStyle({
		    fillColor: 'yellow',
		    strokeColor: '#000',
		    strokeOpacity: 1,
		    strokeWeight: 1
		 });
		 
		 village_layer.addListener('click', handleMouseClickVillage);
		 village_layer.setMap(map);
	  } else {
		  village_layer.setMap(null);
	  }
  }
  
  async function toggleHealth(){
	if (document.getElementById('toggleHealth').checked){		
		  health_layer.setStyle(function(feature) {
			var healthScore = feature.getProperty('HEALTH_DISADV_SCORE');  
			console.log(feature);
			console.log("health score: ", healthScore);
			return {
				fillColor: 'red',
				fillOpacity: healthScore,
			    strokeColor: '#000',
			    strokeOpacity: 1,
			    strokeWeight: 0.5
			};
		 });
		 
		 health_layer.addListener('mouseover', handleMouseOver);
		 health_layer.addListener('mouseout', handleMouseOut);
		 
		 health_layer.setMap(map);
	} else {
		health_layer.setMap(null);
	}
  }
	  	  
  async function toggleKing(){
	if (document.getElementById('toggleKing').checked){		
		  king_county_layer.setStyle(function(feature) {
			console.log(feature);
			
			//var income = feature.getProperty('income');
			var rent = feature.getProperty('median_rent');
			var renter_pct = feature.getProperty('rental_pct');
			
			if (rent < 0) {
				console.log("nan rent", rent);
				rent = 1000;
				console.log("non nan rent", rent);
			}
			
			//var burdened = rent * 12 / income;

			return {
				fillColor: 'purple',
				fillOpacity: renter_pct,
			    strokeColor: '#000',
			    strokeOpacity: 1,
			    strokeWeight: .5
			};     
		 });
		 
		 king_county_layer.addListener('click', handleMouseClickKing);
		 
		 king_county_layer.setMap(map);
	} else {
		king_county_layer.setMap(null);
	}
  }
  
  async function toggleFMR(){
	  if (document.getElementById('toggleFMR').checked){
		  let min = Infinity;
		  let max = -Infinity;
		  
		  fmr_layer.forEach((feature) => {
			  const fmr = feature.getProperty('One-Bedroom');
			  if (fmr < min) min = fmr;
			  if (fmr > max) max = fmr;
		  });
		  
		  		
		  fmr_layer.setStyle(function(feature) {
			//var zip = feature.getProperty('zip_code');  
			console.log(feature);
			
			const fmr = feature.getProperty('One-Bedroom');
			const normalizedFMR = (fmr - min) /(max - min);
			
			// Interpolate between red (low FMR) and green (high FMR)
			let red, green;
	        if (normalizedFMR < 0.5) {
		        // Red to Yellow
		        red = 255;
		        green = Math.round(255 * (normalizedFMR * 2));
	        } else {
		        // Yellow to Green
		        red = Math.round(255 * ((1 - normalizedFMR) * 2));
		        green = 255;
	        }
			
			const color = `rgb(${red}, ${green}, 0)`;
			console.log(color);
	
			return {
				fillColor: color,
				fillOpacity: .7,
			    strokeColor: '#000',
			    strokeOpacity: 1,
			    strokeWeight: .5
			};
		 });
		 
		 fmr_layer.addListener('click', handleMouseClickFMR);
		 
		 fmr_layer.setMap(map);
	} else {
		 fmr_layer.setMap(null);
	}
	  
  }
  
  function handleMouseClickStations(event) {
	  var content = '<div class="info-window">' + 
	  '<h5>' + event.feature.getProperty('DESCRIPTION') + ' Station </h5>' +
	  '<p> Description: ' + event.feature.getProperty('PUBLIC_DESCRIPTION') + '</p>' + 
	  '<p> Type: ' + event.feature.getProperty('TYPE') + '</p>' +
	  '<p>' + event.feature.getProperty('CHAPTER') + '</p>' +
	  '</div>';
	 
	 infoWindow.setContent(content);
	 infoWindow.setPosition(event.latLng);
	 infoWindow.open(map);
  }
  
  function handleMouseClickVillage(event){
	  var content = '<div class="info-window">' + 
	  '<h5>' + event.feature.getProperty('UV_NAME') + '</h5>' +
	  '<p> Equity Category: ' + event.feature.getProperty('EQUITY_CATEGORY') + '</p>' + 
	  '<p> Housing Units Expected 2035: ' + event.feature.getProperty('HU_EXPECTED_2035') + '</p>' +
	  '<p> Jobs Expected 2035: ' + event.feature.getProperty('JOB_EXPECTED_2035') + '</p>' +
	  '</div>';
	 
	 infoWindow.setContent(content);
	 infoWindow.setPosition(event.latLng);
	 infoWindow.open(map);
	  
  }
  
  function handleMouseClickMHA(event) {
	 console.log(event);
	  
	 var content = '<div class="info-window">' +
	 '<h5> Zoning: ' + event.feature.getProperty('BASE_ZONE') + '</h5>' +
	 '<p> Zone ID: ' + event.feature.getProperty('ZONEID') + '</p>' +
	 '<p> Zone Description: ' + event.feature.getProperty('DETAIL_DESC') + '</p>' +
	 '<p>' + event.feature.getProperty('CHAPTER') + '</p>' +
	 '<p> Description: ' + event.feature.getProperty('PUBLIC_DESCRIPTION') + '</p>' +
	 '</div>';
	 
	 infoWindow.setContent(content);
	 infoWindow.setPosition(event.latLng);
	 infoWindow.open(map);
  }
  
  function handleMouseClickCD(event) {
	  var district;
			  
	  if (event.feature.getProperty('C_DISTRICT')){
		  district = event.feature.getProperty('C_DISTRICT');
	  } else {
		  district = event.feature.getProperty('District');
	  }
	  
	  var content = '<div class="info-window">' +
	  '<h5> District ' + district + '</h5>' +
	  '</div>';
			  
	  infoWindow.setContent(content);
	  infoWindow.setPosition(event.latLng);
	  infoWindow.open(map);
  }
  
   function handleMouseClickDelta(event){
	 const efficiency_y = event.feature.getProperty('efficiency_y') ? event.feature.getProperty('efficiency_y') : 2132;
	 
	 var content =  
	  '<div class="info-window">' + 
	  '<h5> Zip Code ' + event.feature.getProperty('zip_code') + '</h5>' +
	  	'<div style="display: flex; justify-content: space-between; margin-top: 10px;">' +
	  		'<div>' + 
			  	'<h6 style="margin: 0 0 5px 0;"> 2024 HACLA VPS </h6>' +
			  	'<ul style="list-style-type: disc; margin: 0; padding-left: 20px;"> ' +
			  		'<li> Efficiency: $' +  efficiency_y + '</li>' +
			  		'<li> One Bedroom: $' + event.feature.getProperty('1_y') + '</li>' +
			  		'<li> Two Bedroom: $' + event.feature.getProperty('2_y') + '</li>' +
			  		'<li> Three Bedroom: $' + event.feature.getProperty('3_y') + '</li>' +
			  		'<li> Four Bedroom: $' + event.feature.getProperty('4_y') + '</li>' +
			  		//'<li> Five Bedroom: $' + event.feature.getProperty('5_y') + '</li>' +
			  		//'<li> Six Bedroom: $' + event.feature.getProperty('6_y') + '</li>' +
			  		//'<li> Seven Bedroom: $' + event.feature.getProperty('7_y') + '</li>' +
			  		//'<li> Eight Bedroom: $' + event.feature.getProperty('8_y') + '</li>' +
			  		'<li> Year: ' + event.feature.getProperty('year_y') + '</li>' +
			  		'<li> Tier: ' + (event.feature.getProperty('tier_y') > 0 ? event.feature.getProperty('tier_y') : 'Other')  + '</li>' + 
			'</div>' +	
		  	'<div>' + 
			  	'<h6 style="margin: 0 0 5px 0;"> 2025 HACLA VPS </h6>' +
			  	'<ul style="list-style-type: disc; margin: 0; padding-left: 20px;"> ' +
			  		'<li> Efficiency: $' + event.feature.getProperty('efficiency_x') + '</li>' +
			  		'<li> One Bedroom: $' + event.feature.getProperty('1_x') + '</li>' +
			  		'<li> Two Bedroom: $' + event.feature.getProperty('2_x') + '</li>' +
			  		'<li> Three Bedroom: $' + event.feature.getProperty('3_x') + '</li>' +
			  		'<li> Four Bedroom: $' + event.feature.getProperty('4_x') + '</li>' +
			  		//'<li> Five Bedroom: $' + event.feature.getProperty('5_x') + '</li>' +
			  		//'<li> Six Bedroom: $' + event.feature.getProperty('6_x') + '</li>' +
			  		//'<li> Seven Bedroom: $' + event.feature.getProperty('7_x') + '</li>' +
			  		//'<li> Eight Bedroom: $' + event.feature.getProperty('8_x') + '</li>' +
			  		//'<li> Nine Bedroom: $' + event.feature.getProperty('9') + '</li>' +
			  		//'<li> Ten Bedroom: $' + event.feature.getProperty('10') + '</li>' +
			  		'<li> Year: ' + event.feature.getProperty('year_x') + '</li>' +
			  		'<li> Tier: ' + event.feature.getProperty('tier_x') + '</li>' + 
			 '</div>' +	 
			 '<div>' + 
			  	'<h6 style="margin: 0 0 5px 0;"> Delta </h6>' +
			  	'<ul style="list-style-type: disc; margin: 0; padding-left: 20px;"> ' +
			  		'<li> Efficiency: ' +  event.feature.getProperty('delta') + '</li>' +
			  		'<li> One Bedroom: ' + (event.feature.getProperty('1_x') - event.feature.getProperty('1_y')) + '</li>' +
			  		'<li> Two Bedroom: ' + (event.feature.getProperty('2_x') - event.feature.getProperty('2_y')) + '</li>' +
			  		'<li> Three Bedroom: ' + (event.feature.getProperty('3_x') - event.feature.getProperty('3_y')) + '</li>' +
			  		'<li> Four Bedroom: ' +  (event.feature.getProperty('4_x') - event.feature.getProperty('4_y')) + '</li>' +
			  		//'<li> Five Bedroom: ' + (event.feature.getProperty('5_x') - event.feature.getProperty('5_y')) + '</li>' +
			  		//'<li> Six Bedroom: ' + (event.feature.getProperty('6_x') - event.feature.getProperty('6_y')) + '</li>' +
			  		//'<li> Seven Bedroom: ' + (event.feature.getProperty('7_x') - event.feature.getProperty('7_y')) + '</li>' +
			  		//'<li> Eight Bedroom: ' +  (event.feature.getProperty('8_x') - event.feature.getProperty('8_y')) + '</li>' +
			'</div>' +	
	  	'</div>' +
	  '</div>';
	  
	 infoWindow.setContent(content);
	 infoWindow.setPosition(event.latLng);
	 
	 infoWindow.open(map)
  }
     
  function handleMouseClickVPS(event) {
	  console.log(event);
	  
	  var content = 
	  '<div class="info-window">' + 
	  '<h5> Zip Code ' + event.feature.getProperty('zip_code') + '</h5>' +
	  '<h6> ' + event.feature.getProperty('area_name') + '</h6>' +
	  	'<div style="display: flex; justify-content: space-between; margin-top: 10px;">' +
		  	'<div>' + 
			  	'<h6 style="margin: 0 0 5px 0;"> HACLA VPS </h6>' +
			  	'<ul style="list-style-type: disc; margin: 0; padding-left: 20px;"> ' +
			  		'<li> Efficiency: $' + event.feature.getProperty('VPS_Efficiency') + '</li>' +
			  		'<li> One Bedroom: $' + event.feature.getProperty('1') + '</li>' +
			  		'<li> Two Bedroom: $' + event.feature.getProperty('2') + '</li>' +
			  		'<li> Three Bedroom: $' + event.feature.getProperty('3') + '</li>' +
			  		'<li> Four Bedroom: $' + event.feature.getProperty('4') + '</li>' +
			  		//'<li> Five Bedroom: $' + event.feature.getProperty('5') + '</li>' +
			  		//'<li> Six Bedroom: $' + event.feature.getProperty('6') + '</li>' +
			  		//'<li> Seven Bedroom: $' + event.feature.getProperty('7') + '</li>' +
			  		//'<li> Eight Bedroom: $' + event.feature.getProperty('8') + '</li>' +
			  		//'<li> Nine Bedroom: $' + event.feature.getProperty('9') + '</li>' +
			  		//'<li> Ten Bedroom: $' + event.feature.getProperty('10') + '</li>' +
			  		'<li> Year: ' + event.feature.getProperty('vps_year') + '</li>' +
			  		'<li> Tier: ' + event.feature.getProperty('tier') + '</li>' +
			 '</div>' +
			 '<div>' + 
			  	'<h6 style="margin: 0 0 5px 0;"> HUD SAFMR </h6>' +
			  	'<ul style="list-style-type: disc; margin: 0; padding-left: 20px;"> ' +
			  		'<li> Efficiency: $' + event.feature.getProperty('FMR_Efficiency') + '</li>' +
			  		'<li> One Bedroom: $' + event.feature.getProperty('One-Bedroom') + '</li>' +
			  		'<li> Two Bedroom: $' + event.feature.getProperty('Two-Bedroom') + '</li>' +
			  		'<li> Three Bedroom: $' + event.feature.getProperty('Three-Bedroom') + '</li>' +
			  		'<li> Four Bedroom: $' + event.feature.getProperty('Four-Bedroom') + '</li>' +
			  		'<li> Year: ' + event.feature.getProperty('year') + '</li>' +
			 '</div>' +		
			 '<div>' + 
			  	'<h6 style="margin: 0 0 5px 0;"> Delta </h6>' +
			  	'<ul style="list-style-type: disc; margin: 0; padding-left: 20px;"> ' +
			  		'<li> Efficiency: ' +  (event.feature.getProperty('VPS_Efficiency') - event.feature.getProperty('FMR_Efficiency')) + '</li>' +
			  		'<li> One Bedroom: ' + (event.feature.getProperty('One-Bedroom') - event.feature.getProperty('1')) + '</li>' +
			  		'<li> Two Bedroom: ' + (event.feature.getProperty('Two-Bedroom')- event.feature.getProperty('2')) + '</li>' +
			  		'<li> Three Bedroom: ' + (event.feature.getProperty('Three-Bedroom') - event.feature.getProperty('3')) + '</li>' +
			  		'<li> Four Bedroom: ' +  (event.feature.getProperty('Four-Bedroom') - event.feature.getProperty('4')) + '</li>' +
			'</div>' + 
	  	'</div>' +
	  '</div>';
	  
	 infoWindow.setContent(content);
	 infoWindow.setPosition(event.latLng);
	 
	 infoWindow.open(map);
  }
  
  function handleMouseClickCensusTract(event){
	  console.log(event);
	  console.log(event.feature);
	  
	  var content =  '<div class="info-window">' +
       '<h5> Tract: ' + event.feature.getProperty('TRACTCE') + '</h5>' + 
       '<p> State: ' + event.feature.getProperty('STATEFP') + '</p>' + 
       '<p> County: ' + event.feature.getProperty('COUNTYFP') + '</p>' +   
       '</div>';
       
      infoWindow.setContent(content);
      infoWindow.setPosition(event.latLng);
      
      infoWindow.open(map);
  }
  
  function handleMouseClickSeattleZoning(event){
	  console.log(event);
	  console.log("feature", event.feature);
	  const mha = event.feature.getProperty('MHA');
	  
	  var content = '<div class="info-window">' +
          '<h5> Zone: ' + event.feature.getProperty('BASE_ZONE') + '</h5>' +
          '<p> Category: ' + event.feature.getProperty('CATEGORY_DESC') + '</p>' +
          '<p> Detailed Description: ' + event.feature.getProperty('DETAIL_DESC') + '</p>' +
          '<p> Mandatory Housing Affordability (MHA): ' + (mha == 'Y' ? 'Yes' : 'No') + '</p>' +
          '<p>Chapter: ' + event.feature.getProperty('CHAPTER') + '</p>' +
          '<p>Effective: ' + event.feature.getProperty('EFFECTIVE') + '</p>' +
          '<p>' + event.feature.getProperty('BASE_ZONE') + ' ' + event.feature.getProperty('PUBLIC_DESCRIPTION') + '</p>' +
          '<p>Zoning History: ' + event.feature.getProperty('ZONINGHISTORY') + '</p>' +
          '<p>IZ: ' + event.feature.getProperty('IZ') + '</p>' +
          '<p>Light Rail: ' + event.feature.getProperty('LIGHTRAIL') + '</p>' +
          '</div>';

          infoWindow.setContent(content);
          infoWindow.setPosition(event.latLng);
          
          infoWindow.open(map);
  }
	  
  function handleMouseClickKing(event){
	  console.log("in king mouse click");
       var content = '<div class="info-window">' +
          '<h5> Median Income: ' + event.feature.getProperty('income') + '</h5>' +
          '<p> Tract: ' + event.feature.getProperty('tract') + '</p>' +
          '<p>American Indian: ' + event.feature.getProperty('american_indian') + '</p>' +
          '<p>Asian: ' + event.feature.getProperty('asian') + '</p>' +
          '<p>Black: ' + event.feature.getProperty('black') + '</p>' +
          '<p>Hispanic: ' + event.feature.getProperty('hispanic') + '</p>' +
          '<p>White: ' + event.feature.getProperty('white') + '</p>' +
          '<p>Median Rent ' + event.feature.getProperty('median_rent') + '</p>' +
          '<p>Rental Units: ' + event.feature.getProperty('rental_units') + '</p>' +
          '<p>Total Units: ' + event.feature.getProperty('total_units') + '</p>' +
          '<p>Rental Ratio: ' + event.feature.getProperty('rental_pct').toFixed(3) + '</p>' +
          '</div>';
          
          infoWindow.setContent(content);
          infoWindow.setPosition(event.latLng);
          
          infoWindow.open(map);
  }
  
  function handleMouseOver(event){
	  console.log("in mouse click");
	  
	  var content = '<div class="info-window">' +
          '<h5>' + event.feature.getProperty('NAMELSAD') + '</h5>' +
          '<p>Health Disadvantage Score: ' + event.feature.getProperty('HEALTH_DISADV_SCORE').toFixed(3) + '</p>' +
          '<p>Health Disadvantage Quntile: ' + event.feature.getProperty('HEALTH_DISADV_QUINTILE') + '</p>' +
          '<p>Life Expectancy: ' + event.feature.getProperty('LIFE_EXPECTANCY_AT_BIRTH').toFixed(1) + ' years</p>' +
          '<p>Adults with Obesity: ' + (event.feature.getProperty('PCT_ADULT_WITH_OBESITY') * 100).toFixed(1) + '%</p>' +
          '<p>Adults with Diabetes: ' + (event.feature.getProperty('PCT_ADULT_WITH_DIABETES') * 100).toFixed(1) + '%</p>' +
          '<p>Adults with Asthma: ' + (event.feature.getProperty('PCT_ADULT_WITH_ASTHMA') * 100).toFixed(1) + '%</p>' +
          '</div>';
          
          infoWindow.setContent(content);
          infoWindow.setPosition(event.latLng);
          
          infoWindow.open(map);
  }
  
  function handleMouseClickFMR(event){
	  console.log("in mouse click");
	  
	  var tier = event.feature.getProperty('tier');
	  if (tier != null){
		  tier = tier.toString();
		  if (tier == '4') tier = "VPS";
	  } 
	  
	  var content = '<div class="info-window">' +
          '<h5>Zip Code: ' + event.feature.getProperty('zip_code') + '</h5>' +
          '<p>Efficiency: ' + event.feature.getProperty('Efficiency') + '</p>' +
          '<p>One-Bedroom: ' + event.feature.getProperty('One-Bedroom') + '</p>' +
          '<p>Two-Bedroom: ' + event.feature.getProperty('Two-Bedroom') + ' </p>' +
          '<p>Three-Bedroom: ' + event.feature.getProperty('Three-Bedroom') + '</p>' +
          '<p>Four-Bedroom: ' + event.feature.getProperty('Four-Bedroom') + '</p>' +
          '<p>tier: ' +  tier + '</p>' +
          '<p>vps_0: ' + event.feature.getProperty('vps_0') + '</p>' +
          '<p>vps_1: ' + event.feature.getProperty('vps_1') + '</p>' +
          '<p>vps_2: ' + event.feature.getProperty('vps_2') + '</p>' +
          '<p>vps_4: ' + event.feature.getProperty('vps_4') + '</p>' +
          '</div>';
          
          infoWindow.setContent(content);
          infoWindow.setPosition(event.latLng);
          
          infoWindow.open(map);
  }
  
  function handleMouseClickSAFMR(event){		  
	  var content = '<div class="info-window">' +
          '<h5>' + event.feature.getProperty('area_name') + '</h5>' +
          '<p>Zip Code: ' + event.feature.getProperty('zip_code') + '</p>' +
          '<p>Efficiency: ' + event.feature.getProperty('Efficiency') + '</p>' +
          '<p>One-Bedroom: ' + event.feature.getProperty('One-Bedroom') + '</p>' +
          '<p>Two-Bedroom: ' + event.feature.getProperty('Two-Bedroom') + ' </p>' +
          '<p>Three-Bedroom: ' + event.feature.getProperty('Three-Bedroom') + '</p>' +
          '<p>Four-Bedroom: ' + event.feature.getProperty('Four-Bedroom') + '</p>' +
          '<p>Min-One-Bed: ' + event.feature.getProperty('min_oneBed') + '</p>' +
          '<p>Max-One-Bed: ' + event.feature.getProperty('max_oneBed') + '</p>' +
          '<p>MSA Score: ' + event.feature.getProperty('score') + '</p>' +
          '<p>US Score: ' + event.feature.getProperty('us_score') + '</p>' +
          '<p>Year: ' + event.feature.getProperty('year') + '</p>' +
          '</div>';
          
          infoWindow.setContent(content);
          infoWindow.setPosition(event.latLng);
          
          infoWindow.open(map);
  }
  
  function handleMouseOut(){  
  	  infoWindow.close();
  }
   
  function escapeHtml(unsafe) {
	  return unsafe 
	  .replace(/&/g, "&amp;")
	  .replace(/</g, "&lt;")
	  .replace(/>/g, "&gt;")
	  .replace(/"/g, "&quot;")
	  .replace(/'/g, "&#039;");
  }
	  
  function toggleHighlight(markerView, property) {
	  console.log("clicked");
	  if (markerView.content.classList.contains("property")) {
	    // Handle property markers
	    if (markerView.content.classList.contains("highlight")) {
	      markerView.content.classList.remove("highlight");
	      markerView.zIndex = null;
	    } else {
	      markerView.content.classList.add("highlight");
	      markerView.zIndex = 1;
	    }
	  } else if (markerView.content.classList.contains("school")) {
	    // Handle school markers
	    if (markerView.content.classList.contains("highlight")) {
	      markerView.content.classList.remove("highlight");
	      markerView.zIndex = null;
	    } else {
	      markerView.content.classList.add("highlight");
	      markerView.zIndex = 1;
	    }
	 } else if (markerView.content.classList.contains("transit-station")){
		 //handle transit station markers
		 if (markerView.content.classList.contains("highlight")){
			 markerView.content.classList.remove("highlight");
			 markerView.zIndex = null;
		 } else {
			 markerView.content.classList.add("highlight");
			 markerView.zIndex = 1;
		 }
	 } 
  }
	  		
  $(document).ready(function() {
	  $('#sponsors').multiselect({
		  includeSelectAllOption: true,
          nonSelectedText: 'Properites',

          onChange: function(option, checked) {

	            // Get the value of the changed option
	            var value = $(option).val();
	            
	            // Check if the option was selected or deselected
	            if (checked) {
	                console.log('Option ' + value + ' was selected');
	                // Call function to show properties for this sponsor
	                showProperties(value);
	            } else {
	                console.log('Option ' + value + ' was deselected');
	                // Call function to hide properties for this sponsor
	                hideProperties(value);
	            }
        	},
	        onSelectAll: function() {
	            console.log('All options were selected');
	            // Call function to show all properties
	            showAllProperties();
	        },
	        onDeselectAll: function() {
	            console.log('All options were deselected');
	            // Call function to hide all properties
	            hideAllProperties();
	        }
        });	
        
      $('#schools').multiselect({
	    includeSelectAllOption: true,
	    nonSelectedText: 'Schools',
	    
	    onChange: function(option, checked) {
	      var value = $(option).val();
	      
	      if (checked) {
	        console.log('School ' + value + ' was selected');
	        showSchools(value);
	      } else {
	        console.log('School ' + value + ' was deselected');
	        hideSchools(value);
	      }
	    },
	    onSelectAll: function() {
	      console.log('All schools were selected');
	      showAllSchools();
	    },
	    onDeselectAll: function() {
	      console.log('All schools were deselected');
	      hideAllSchools();
	    }
	 });
	 
	 
	  $('#transit').multiselect({
	    includeSelectAllOption: true,
	    nonSelectedText: 'Transit',
	    
	    onChange: function(option, checked) {
	      var value = $(option).val();
	      
	      if (checked) {
	        console.log('Transit ' + value + ' was selected');
	        showTransit(value);
	      } else {
	        console.log('Transit ' + value + ' was deselected');
	        hideTransit(value);
	      }
	    },
	    onSelectAll: function() {
	      console.log('All transit stations were selected');
	      showAllTransit();
	    },
	    onDeselectAll: function() {
	      console.log('All transit stations were deselected');
	      hideAllTransit();
	    }
	 });
	 
	 $('toggleRadius').on('change', function(){
		 toggleRadiusDislay(this.checked);
	 });
	         
	});
	
	
	async function showTransit(type){
		if (!map) return;
		console.log("type: ", type);
	    let stations = transitMap.get(type);
	    if (stations.length){
			hideTransit(type);
		}
	    
	    await fetchAndCreateTransitMarkers(type);
	    stations = transitMap.get(type);
	    stations.forEach(marker => marker.setMap(map));
	}
	
	function hideTransit(type){
		const stations = transitMap.get(type);
	    stations.forEach(marker => marker.setMap(null));
	}
	
	function showAllTransit(){
		transitMap.forEach((stations, type) => {
	        showTransit(type);
	    });		
	}
	function hideAllTransit(){
		transitMap.forEach((stations) => {
			stations.forEach(marker => marker.setMap(null));
		});
	}
		
	async function showProperties(value) {
	    if (!map) return;
	    console.log('in show properties function, sponsor:', value); 
	    
	    
	    let properties = sponsorMap.get(value);
	    if (properties.length === 0) {
			if (value == 'comps'){
				await fetchAndCreateCompMarkers();
			} else {
				await fetchAndCreateMarkers(value);
			}
	    }
	    
	    properties = sponsorMap.get(value);
	    properties.forEach(marker => {
			marker.setMap(map);
			const circle = propertyCircle.get(marker);
			if (circle){
				circle.setMap(document.getElementById('toggleRadius').checked ? map : null);
			}
		});
	}
	
	function hideProperties(sponsor) {
	    const properties = sponsorMap.get(sponsor);
	    properties.forEach(marker => marker.setMap(null));
	}
	    	
	function showAllProperties() {
	    sponsorMap.forEach((properties, sponsor) => {
	        showProperties(sponsor);
	    });
	}
	
	function hideAllProperties() {
	    sponsorMap.forEach((properties) => {
	        properties.forEach(marker => marker.setMap(null));
	    });
	}
		
	async function showSchools(category){
	  if (!map) return;
	  let schools = schoolMap.get(category);
	  if (schools.length === 0) {
	    await fetchAndCreateSchoolMarkers(category);
	  }
	  schools = schoolMap.get(category);
	  schools.forEach(marker => marker.setMap(map));
	}
	
	// Function to hide schools for a specific category
	function hideSchools(category) {
	  const schools = schoolMap.get(category);
	  schools.forEach(marker => marker.setMap(null));
	}
	
	// Function to show all schools
	function showAllSchools() {
	  schoolMap.forEach((schools, category) => {
	    showSchools(category);
	  });
	}
	
	// Function to hide all schools
	function hideAllSchools() {
	  schoolMap.forEach((schools) => {
	    schools.forEach(marker => marker.setMap(null));
	  });
	}
	
	
	//function to create transit markers
	 async function fetchAndCreateTransitMarkers(type) {
	  if (!map) return;
	  
	  let center = map.getCenter();
	  const types = transitTypes[type];
	  const processedPlaces = new Map();
	  
	   console.log("center: ", center);
	  
	  try {
		  //make seperate api calls for each keyword
		  const allResults = await Promise.all(
			  types.map(placeType => 
			  	new Promise((resolve, reject) => {
					  const request = {
						  location: center,
						  radius: 10000, //10km
						  type: placeType
					  };
					  
					  console.log("searching for: ", placeType);
					  
					  placesService.nearbySearch(request, (results, status) => {
						  if (status === google.maps.places.PlacesServiceStatus.OK) {
							  resolve(results);
						  } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS){
						  	resolve([]);
						  } else {
							  reject(status);
						  }
					  });
					  
				  })
			  )
		  );
		  
		  //flattend and deduplicate results
		  allResults.flat().forEach(place => {
			  //use PlaceId as unique identifier
			  if (!processedPlaces.has(place.place_id)){
				  processedPlaces.set(place.place_id, place);
				  
				  const transitMarker = new AdvancedMarkerElement({
					  map,
					  content: buildTransitContent(place, type),
					  position: {
						lat: place.geometry.location.lat(),
					 	lng: place.geometry.location.lng()
					  },
					  title: place.name
				  });
				  
				  transitMarker.addListener("gmp-click", () => {
					  toggleHighlight(transitMarker, place);
				  });
				  
				  transitMap.get(type).push(transitMarker);
			  }
			  
		  });

	  } catch (error) {
		  console.log("error fetching transit stations", error);
	  }
  }
	
	// Function to fetch and create school markers
	async function fetchAndCreateSchoolMarkers(category) {
	  try {
	    const response = await fetch("/HDC_Map/getSchoolsServlet");
	    const data = await response.json();
	    
	    data.forEach(item => {
		  console.log(item);
	      if (item.category.toLowerCase() === category.toLowerCase()) {
			  console.log("making marker");
	         const newMarker = new AdvancedMarkerElement({
	          map: map,
	          content: buildSchoolContent(item),
	          position: {
	            lat: parseFloat(item.lat),
	            lng: parseFloat(item.lng)
	          },
	          title: item.name
	        });
	        
	        newMarker.addListener("click", () => {
	          toggleHighlight(newMarker, item);
	        });
	        
	        schoolMap.get(category).push(newMarker);
	      }
	    });
	  } catch (error) {
	    console.error("Error fetching school data:", error);
	  }
	}
	
	async function fetchAndCreateCompMarkers(){
		try {
			const response = await fetch("/HDC_Map/getCompsServlet");
			const data = await response.json();
			
			data.forEach(item => {		
				const result = buildContent(item);
				const newMarker = new AdvancedMarkerElement({
					map: map,
					content: result.content,
					position: {
						lat: parseFloat(item.latitude),
						lng: parseFloat(item.longitude)
					},
					title: item.name
				});
				
				//store circle reference
	            propertyCircles.set(newMarker, result.circle);
				
				newMarker.addListener("click", () => {
					toggleHighlight(newMarker, item);
				});
				
				sponsorMap.get('comps').push(newMarker);
			});
		} catch (error){
			console.log("error adding comps", error);
		}
	}
		

	async function fetchAndCreateMarkers(sponsor) {
	    try {
	        const response = await fetch("/HDC_Map/getDataServlet");
	        const data = await response.json();
	        
	        data.forEach(item => {
	            if (item.owner.toLowerCase() === sponsor) {
				   const result = buildContent(item);
	               const newMarker = new AdvancedMarkerElement({
	                    map: map,
	                    content: result.content,
	                    position: {
	                        lat: parseFloat(item.lat),
	                        lng: parseFloat(item.lng)
	                    },
	                    title: item.owner,
	                });
	                
	                //store circle reference
	                propertyCircles.set(newMarker, result.circle);
	                
	                newMarker.addListener("gmp-click", () => {
	                    toggleHighlight(newMarker, item);
	                });
	                
	                sponsorMap.get(sponsor).push(newMarker);
	            }
	        });
	    } catch (error) {
	        console.error("Error fetching property data:", error);
	    }
	 }
	 
	 function toggleRadiusDisplay(show){
		 sponsorMap.forEach((properties, sponsor) => {
			 properties.forEach(marker => {
				 const circle = propertyCircles.get(marker);
				 if (circle) {
					 circle.setMap(show ? map : null);
				 }
			 });
		 });
	 }
	 
	 
	 		// Function to build the content for school markers
		function buildSchoolContent(school) {
		  const content = document.createElement("div");
		  const category = school.category.toLowerCase();
		  const color = schoolColor[category];
		  
		  console.log("building school content");
		
		  content.classList.add("school");
		  content.innerHTML = `
		    <div class="icon">
		      <i aria-hidden="true" class="fa fa-icon fa-graduation-cap" title="school" style="color: ${color};"></i>
		      <span class="fa-sr-only">school</span>
		    </div>
		    <div class="details">
		      <div class="name">${school.name}</div>
		      <div class="address">${school.address}</div>
		      <div clas="category">${school.category}</div>
		    </div>
		  `;
		  console.log("angel:", content);
		  return content;
		}  
		
		// Update buildCompContent to match property styling
		function buildCompContent(item) {
		    const content = document.createElement("div");
		    content.classList.add("property");
		    const color = sponsorColor['comps'];
		    
		    content.innerHTML = `
		        <div class="icon">
		            <i aria-hidden="true" class="fa fa-icon fa-building" title="building" style="color: ${color};"></i>
		            <span class="fa-sr-only">building</span>
		        </div>
		        <div class="details">
		            <div class="owner">${item.name}</div>
		            <div class="address">${item.address}</div>
		            <div class="features">
		           
		                <div>
		                    Studio: <i aria-hidden="true" class="fa-solid fa-dollar-sign"></i>
		                    <span>${item.studio_rent}</span>
		                </div>
		                
		                <div>
		                    Studio: <i aria-hidden="true" class="fa fa-ruler fa-lg size" title="size"></i>
		                    <span>${item.studio_sf} ft<sup>2</sup></span>
		                </div>
		               
		                <div>
		                    1BR: <i aria-hidden="true" class="fa-solid fa-dollar-sign"></i>
		                    <span>${item.onebr1ba_rent}</span>
		                </div>
		             
		                <div>
		                    1BR: <i aria-hidden="true" class="fa fa-ruler fa-lg size" title="size"></i>
		                    <span>${item.onebr1ba_sf} ft<sup>2</sup></span>
		                </div>
		            </div>
		        </div>`;
		    
		   const circle = new google.maps.Circle({
				strokeColor: color,
				strokeOpacity: 0.4,
				strokeWeight: 1,
				fillColor: color,
				fillOpacity: 0.1, 
				radius: ONE_MILE_IN_METERS,
				visible: false, //initially hidden
				center: {
					lat: parseFloat(property.lat),
					lng: parseFloat(property.lng)
				}
			});
			    
			return {
				content: content,
				circle: circle
			};
		}
		
		function buildContent(property) {
			const content = document.createElement("div");
			const owner = property.owner.toLowerCase();
			const color = sponsorColor[owner];
			
			content.classList.add("property");
			content.innerHTML = `
				<div class="icon">
			        <i aria-hidden="true" class="fa fa-icon fa-building" title="building" style="color: ${color};"></i>
			        <span class="fa-sr-only">building</span>
			    </div>
			    <div class="details">
			        <div class="owner">${property.owner}: ${property.name}</div>
			        <div class="address">${property.address}</div>
			        <div class="features">
				        
				        <div>
				            <i aria-hidden="true" class="fa-solid fa-door-open" title="room"></i>
				            <span class="fa-sr-only">room</span>
				            <span>${property.units}</span>
				        </div>
			    		
			    		<div>
				            <i aria-hidden="true" class="fa-solid fa-person-walking" title="walk_score"></i>
				            <span class="fa-sr-only">Walk Score</span>
				            <span>${property.walk_score}/100</span>
			        	</div>
				        
				        <div>
				            <i aria-hidden="true" class="fa fa-ruler fa-lg size" title="size"></i>
				            <span class="fa-sr-only">size</span>
				            <span>${property.bld_size} ft<sup>2</sup></span>
				        </div>
			        </div>
			    </div>
			    `;
			    
			const circle = new google.maps.Circle({
				strokeColor: color,
				strokeOpacity: 0.4,
				strokeWeight: 1,
				fillColor: color,
				fillOpacity: 0.1, 
				radius: ONE_MILE_IN_METERS,
				visible: false, //initially hidden
				center: {
					lat: parseFloat(property.lat),
					lng: parseFloat(property.lng)
				}
			});
			    
			return {
				content: content,
				circle: circle
			};
		}
		
		function buildTransitContent(place, type){
			const content = document.createElement("div");
			const color = transitColor[type];
			
			content.classList.add("transit-station");
			content.innerHTML = `
			<div class="icon">
		      <i aria-hidden="true" class="fa fa-train" style="color: ${color};"></i>
		      <span class="fa-sr-only">transit station</span>
		    </div>
		    <div class="details">
		      <div class="name">${place.name}</div>
		      <div class="type">${type.replace('_', ' ').toUpperCase()}</div>
		      <div class="address">${place.vicinity}</div>
		      <div class="rating">Rating: ${place.rating ? place.rating + '/5' : 'N/A'}</div>
		    </div>
			`;
			
			return content;
		}
		
		function showLoadingSpinner(){
			console.log("entering loading spinner");
			document.getElementById('loadingSpinner').style.display = 'flex';
		}
		function hideLoadingSpinner(){ 
			document.getElementById('loadingSpinner').style.display = 'none';
			console.log("exiting loading spinner function");
		}	
				
	  initMap();
		 