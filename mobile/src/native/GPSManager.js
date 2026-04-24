import Geolocation from '@react-native-community/geolocation';

export async function getGPSLocation() {
  return new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      () => resolve(null),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000}
    );
  });
}
