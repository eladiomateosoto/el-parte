import bcryptjs from 'bcryptjs';

// Hash a PIN using bcryptjs
export const hashPin = async (pin) => {
  const salt = await bcryptjs.genSalt(10);
  return await bcryptjs.hash(pin, salt);
};

// Compare a PIN with its hash
export const comparePin = async (pin, hash) => {
  return await bcryptjs.compare(pin, hash);
};

// Format hours to decimal (e.g., "2.5" stays "2.5", "2,5" becomes "2.5")
export const formatHours = (hours) => {
  if (typeof hours === 'string') {
    return parseFloat(hours.replace(',', '.'));
  }
  return parseFloat(hours);
};

// Calculate total hours from tasks
export const calculateTotalHours = (tasks) => {
  return tasks.reduce((sum, task) => sum + (task.hours || 0), 0);
};

// Format date to DD/MM/YYYY
export const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Format time to HH:MM
export const formatTime = (date) => {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Calculate distance between two GPS coordinates (in meters)
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
