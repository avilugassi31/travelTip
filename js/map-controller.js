import { mapService } from './services/map-service.js';

var gMap;
// console.log('Main!');
var gIdx = 101;
mapService.getLocs().then((locs) => console.log('locs', locs));

window.onload = () => {
  document.querySelector('.my-location').addEventListener('click', (ev) => {
    console.log('Aha!', ev.target);
    getNow();
  });

  initMap()
    .then(() => {
      addMarker({ lat: 32.0749831, lng: 34.9120554 });
    })
    .catch(() => console.log('INIT MAP ERROR'));

  getPosition()
    .then((pos) => {
      console.log('User position is:', pos.coords);
    })
    .catch((err) => {
      console.log('err!!!', err);
    });
  renderLocation();
};

function initMap(lat = 32.0749831, lng = 34.9120554) {
  //   console.log('InitMap');
  return _connectGoogleApi().then(() => {
    // console.log('google available');
    gMap = new google.maps.Map(document.querySelector('#map'), {
      center: { lat, lng },
      zoom: 15,
    });
    gMap.addListener('click', (mapsMouseEvent) => {
      var lat = mapsMouseEvent.latLng.lat();
      var lng = mapsMouseEvent.latLng.lng();
      addLocation(lat, lng);
    });
    // console.log('Map!', gMap);
  });
}

function addLocation(lat, lng) {
  var location = {
    name: prompt('enter name location?'),
    lat: lat,
    lng: lng,
    id: gIdx++,
  };
  var locations = mapService.getLocation();
  if (!locations) locations = [];
  locations.push(location);
  mapService.saveUserLocation(locations);
  renderLocation();
  return location;
}

function renderLocation() {
  var locations = mapService.getLocation();
  if (!locations) locations = [];
  var strHTML = locations.map((location) => {
    return ` <table class="places"><thead><th>ID</th><th>Location Name</th><th>X</th><th>Y</th><th colspan="2">Actions</th></thead><tbody>
      <tr>
      <td>${location.id}</td>
      <td>${location.name}</td><td>${location.lat}</td><td>${location.lng}</td>
     <td><button onclick="onRemoveLocation('${location.id}')">REMOVE</button></td>
     <td><button onclick="onGoToLocation('${location.lat}','${location.lng}')">GoTo</button></td> </tr>
      </tbody></table> `;
  });
  document.querySelector('.table-container').innerHTML = strHTML.join('');
  mapService.saveUserLocation(locations);
}
function addMarker(loc) {
  var marker = new google.maps.Marker({
    position: loc,
    map: gMap,
    title: 'Hello World!',
  });
  return marker;
}

window.onRemoveLocation = onRemoveLocation;
function onRemoveLocation(id) {
  var locations = mapService.getLocation();
  var position = locations.findIndex(function (location) {
    return id === location.id;
  });
  locations.splice(position, 1);
  mapService.saveUserLocation(locations);
  renderLocation();
}
window.onGoToLocation = onGoToLocation;
function onGoToLocation(lat, lng) {
  var laLatLng = new google.maps.LatLng(lat, lng);
  gMap.panTo(laLatLng);
}

function panTo(lat, lng) {
  var laLatLng = new google.maps.LatLng(lat, lng);
  gMap.panTo(laLatLng);
}

// This function provides a Promise API to the callback-based-api of getCurrentPosition
function getPosition() {
  //   console.log('Getting Pos');
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

function _connectGoogleApi() {
  if (window.google) return Promise.resolve();
  const API_KEY = 'AIzaSyBIY92HpRALTKJdK5z-H_esCon3850knvs';
  var elGoogleApi = document.createElement('script');
  elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
  elGoogleApi.async = true;
  document.body.append(elGoogleApi);

  return new Promise((resolve, reject) => {
    elGoogleApi.onload = resolve;
    elGoogleApi.onerror = () => reject('Google script failed to load');
  });
}

// function getLocation() {
//   var locations = loadFromStorage(LOCATION);
//   return locations;
// }
function getNow() {
  if (!navigator.geolocation) {
    alert('HTML5 Geolocation is not supported in your browser.');
    return;
  }

  // One shot position getting or continus watch
  navigator.geolocation.getCurrentPosition(showLocation, handleLocationError);
  // navigator.geolocation.watchPosition(showLocation, handleLocationError);
}

function showLocation(position) {
  var lat = position.coords.latitude;
  var lang = position.coords.longitude;
  console.log(position);
  // var date = new Date(position.timestamp);
  // document.getElementById('timestamp').innerHTML =
  //   date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
  var coords = new google.maps.LatLng(lat, lang); //Makes a latlng
  gMap.panTo(coords);
}

function handleLocationError(error) {
  var locationError = document.getElementById('locationError');

  switch (error.code) {
    case 0:
      locationError.innerHTML =
        'There was an error while retrieving your location: ' + error.message;
      break;
    case 1:
      locationError.innerHTML =
        "The user didn't allow this page to retrieve a location.";
      break;
    case 2:
      locationError.innerHTML =
        'The browser was unable to determine your location: ' + error.message;
      break;
    case 3:
      locationError.innerHTML =
        'The browser timed out before retrieving the location.';
      break;
  }
}
window.onSearchLocation = onSearchLocation;
function onSearchLocation(ev) {
  ev.preventDefault();
  var elInput = document.querySelector('input[name=location]').value;
  console.log('elInput:', elInput);
  axios
    .get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${elInput}&key=AIzaSyBIY92HpRALTKJdK5z-H_esCon3850knvs`
    )
    .then((res) => {
      console.log('res:', res.data.results[0].geometry.location);
      panTo(
        res.data.results[0].geometry.location.lat,
        res.data.results[0].geometry.location.lng
      );
    });
}
