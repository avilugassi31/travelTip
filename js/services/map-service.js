import { storageService } from './storage-service.js';

export const mapService = {
  getLocs,
  getLocation,
  saveUserLocation
};
const LOCATION = 'location';
var locs = [{ lat: 11.22, lng: 22.11 }];

function getLocs() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(locs);
    }, 2000);
  });
}

function getLocation() {
  var locations = storageService.loadFromStorage(LOCATION);
  return locations;
}

function saveUserLocation(location) {
  storageService.saveToStorage(LOCATION, location);
}
