/**
 * Geolocation service
 * Handles GPS location requests and distance calculations
 */

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no está disponible en este navegador'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        resolve({
          lat: latitude,
          lng: longitude,
          accuracy,
        });
      },
      (error) => {
        let errorMessage = 'Error al obtener la ubicación';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado. Habilita la ubicación en la configuración del navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout al obtener la ubicación';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Calculate distance between two GPS coordinates (in meters)
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // Earth's radius in meters
  const rad1 = (lat1 * Math.PI) / 180;
  const rad2 = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(rad1) * Math.cos(rad2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Find nearby works within a certain radius
 */
export const findNearbyWorks = (userLat, userLng, works, radiusMeters = 50) => {
  return works.filter((work) => {
    if (!work.coordenadas) return false;
    const distance = calculateDistance(userLat, userLng, work.coordenadas.lat, work.coordenadas.lng);
    return distance <= radiusMeters;
  });
};
