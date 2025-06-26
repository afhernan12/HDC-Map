
let map;
let king_county_layer;
let infoWindow;

let userIncome = 0;
let rentIncrease = 0;
let utilitiesIncrease = 0;
let parkingFee = 0;
let rentersInsurance = 0;
let rentBurdenPop = 0;
let totalPopulation = 0;


let racePieChart;
let incomeBarChart;
let displacedBarChart;


function initMap() {
	const zoom = 10;
    map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(47.606370, -122.320401),
	    zoom,
	    minZoom: zoom - 6,
		maxZoom: zoom + 6,
	    mapId: "4504f8b37365c3d0",
	    mapTypeId: 'satellite',
    });
        
    king_county_layer = new google.maps.Data();
    infoWindow = new google.maps.InfoWindow();

    // Load GeoJSON data and add event listeners after it's fully loaded
    king_county_layer.loadGeoJson("geoData/king_county_housing.geojson", null, function() {
        // Add click listener after GeoJSON is loaded
        king_county_layer.addListener('click', handleMouseClick);
        // Set the layer on the map
        king_county_layer.setMap(map);
    });
   	
   	// Add event listener to the form
    document.getElementById('calculator-form').addEventListener('submit', handleFormSubmit);
}
  
function handleFormSubmit(event) {
	rentBurdenPop = 0;
	totalPopulation = 0;
    event.preventDefault();
    userIncome = parseFloat(document.getElementById('income').value);
    rentIncrease = parseFloat(document.getElementById('rent-increase').value) || 0;
    utilitiesIncrease = parseFloat(document.getElementById('utilities-increase').value) || 0;
    parkingFee = parseFloat(document.getElementById('parking-fee').value) || 0;
    rentersInsurance = parseFloat(document.getElementById('renters-insurance').value) || 0;
    
    if (isNaN(userIncome) || userIncome <= 0) {
        alert("Please enter a valid positive number for income.");
        return;
    }
    toggleKing(userIncome);
}
	      
function toggleKing() {
    king_county_layer.setStyle(function(feature) {
        let rent = feature.getProperty('median_rent');
        let tractIncome = feature.getProperty('income');
        let population = feature.getProperty('Total');
        
        // Check if the tract has null properties
        if (rent === null || isNaN(rent) || rent < 0) {
            //console.log("Null or invalid data for tract:", feature.getProperty('tract'));
            return {
                fillColor: 'gray',
                fillOpacity: 0.5,
                strokeColor: '#000',
                strokeOpacity: 1,
                strokeWeight: .5
            };
        }
        
        totalPopulation += Number(population);
        	
        const totalRent = Number(rent) + rentIncrease + utilitiesIncrease + parkingFee + rentersInsurance;
        const affordabilityRatio = (totalRent * 12) / userIncome;
        
        const popBurdenRatio = (Number(rent) + rentIncrease + utilitiesIncrease + parkingFee + rentersInsurance) * 12 / tractIncome;
        
        if (popBurdenRatio > .3) rentBurdenPop += Number(population);
        
        
        let fillColor = 'purple';
        if (affordabilityRatio >= 0.3) {
            fillColor = 'red';
        } else if (affordabilityRatio > 0.2) {
            fillColor = 'yellow';
        } else {
            fillColor = 'green';
        }

        //console.log("Feature:", feature.getProperty('tract'), "Rent:", rent, "Ratio:", affordabilityRatio, "Color:", fillColor);

        return {
            fillColor: fillColor,
            fillOpacity: 0.5,
            strokeColor: '#000',
            strokeOpacity: 1,
            strokeWeight: .5
        };     
    });
}

function handleMouseClick(event) {
    console.log("Feature clicked:", event.feature);
    let content = '';
    
    if (event.feature.getProperty('median_rent') === null) {
        content += '<h3>Tract: ' + event.feature.getProperty('tract') + '</h3>' +
                   '<p>No data available for this tract.</p>';
    } else {
        content += '<h3>Tract: ' + event.feature.getProperty('tract') + '</h3>' +
            '<li>Median Rent: $' + event.feature.getProperty('median_rent') + '</li>' +
            '<li>Rental Units: ' + event.feature.getProperty('rental_units') + '</li>' +
            '<li>Total Units: ' + event.feature.getProperty('total_units') + '</li>';

        if (event.feature.getProperty('rental_pct') !== null) {
            content += '<p>Rental Units / Total Units: ' + event.feature.getProperty('rental_pct').toFixed(3) + '</p>';
        }

        document.getElementById('tractInfo').innerHTML = content;
        document.getElementById('graphContainer').style.display = 'flex';

        updateRacePieChart(event.feature);
        updateIncomeBarChart(event.feature);   
        showDisplacedChart(); 
    }

    infoWindow.setContent(content);
    infoWindow.setPosition(event.latLng);
    infoWindow.open(map);
}

function updateRacePieChart(feature) {
	console.log("in race pie");
    const ctx = document.getElementById('racePieChart').getContext('2d');
    const raceData = {
        labels: ['American Indian', 'Asian', 'Black', 'Hispanic', 'White'],
        datasets: [{
            data: [
                feature.getProperty('american_indian'),
                feature.getProperty('asian'),
                feature.getProperty('black'),
                feature.getProperty('hispanic'),
                feature.getProperty('white')
            ],
            backgroundColor: [
                '#407f7f', '#7fbd45', '#73513e', '#bfb05e', '#92c3c2'
            ]
        }]
    };

    if (racePieChart) {
        racePieChart.destroy();
    }

    racePieChart = new Chart(ctx, {
        type: 'pie',
        data: raceData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Race Breakdown'
                },
                legend: {
                    position: 'right',
                    align: 'center',
                }
            }
        }
    });
}

function showDisplacedChart(){
	console.log("in displaced chart");
	console.log("rent pop", rentBurdenPop);
	console.log("pop", totalPopulation);
    const ctx = document.getElementById('displacedBarChart').getContext('2d');
    const displacedData = {
        labels: ['Rent Burden Population', 'Total Population'],
        datasets: [{
            data: [rentBurdenPop, totalPopulation],
            backgroundColor: ['#691219', '#00474f']
        }]
    };

    if (displacedBarChart) {
        displacedBarChart.destroy();
    }

    displacedBarChart = new Chart(ctx, {
        type: 'bar',
        data: displacedData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Number of People Rent Burdened'
                },
                legend: {
					display: false
				}
            },
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });
}

function updateIncomeBarChart(feature) {
	console.log("in bar chart");
    const ctx = document.getElementById('incomeBarChart').getContext('2d');
    const tractIncome = feature.getProperty('income') || 0;
    const incomeData = {
        labels: ['Your Income', 'Tract Average Income'],
        datasets: [{
            data: [userIncome, tractIncome],
            backgroundColor: ['#73A1B2', '#6E8658']
        }]
    };

    if (incomeBarChart) {
        incomeBarChart.destroy();
    }

    incomeBarChart = new Chart(ctx, {
        type: 'bar',
        data: incomeData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Income Comparison'
                },
                legend: {
					display: false
				}
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Income ($)'
                    }
                }
            }
        }
    });
}
