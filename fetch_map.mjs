import fetch from 'node-fetch';
import { writeFile } from 'fs/promises';

// Function to generate circle points
function generateCirclePoints(centerLng, centerLat, radius, numPoints) {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const x = centerLng + radius * Math.cos(angle);
    const y = centerLat + radius * Math.sin(angle);
    points.push([x, y]);
  }
  // Close the circle
  points.push(points[0]); // Ensure the polygon is closed
  return points;
}

// Center coordinates and radius of the circle
const centerLng = -73.9819;
const centerLat = 40.748817;
const radius = 0.02; // Approximately 2 kilometers
const numPoints = 50; // Number of points to approximate the circle

// Generate circle points
const circlePoints = generateCirclePoints(centerLng, centerLat, radius, numPoints);

// Create GeoJSON feature for the circle
const geojson = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [circlePoints]  // Ensure circlePoints is correctly structured as [ [lng, lat], [lng, lat], ... ]
      },
      "properties": {}
    }
  ]
};

// Direct JSON.stringify without encoding
const geojsonString = JSON.stringify(geojson);

// Log GeoJSON string for validation
console.log('GeoJSON String:', geojsonString);

// Mapbox API parameters
const mapStyle = 'nsonline/clxfr7pi8003001ob1ppc473u';
const zoomLevel = 12;
const width = 800;
const height = 600;
const accessToken = 'sk.eyJ1IjoibnNvbmxpbmUiLCJhIjoiY2x4MGQyem5lMGcyOTJqcHZ2Z2pqYmo5YyJ9.OPVvj2tLkyF23YI72-z7ag';

// Construct API URL
const encodedGeojson = encodeURIComponent(geojsonString);
console.log('Encoded GeoJSON:', encodedGeojson);
const url = `https://api.mapbox.com/styles/v1/${mapStyle}/static/geojson(${encodedGeojson})/${centerLng},${centerLat},${zoomLevel}/${width}x${height}?access_token=${accessToken}`;
console.log('Constructed URL:', url);

// Fetch the image
fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.buffer();
  })
  .then(buffer => writeFile('circle-map.png', buffer))
  .then(() => {
    console.log('Circle map image saved!');
  })
  .catch(err => console.error('Error fetching map:', err));
