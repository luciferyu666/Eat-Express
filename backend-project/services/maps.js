const googleMapsClient = require('@google/maps').createClient({
    key: 'your-google-maps-api-key',
    Promise: Promise,
  });
  
  module.exports = googleMapsClient;