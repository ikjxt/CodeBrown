import app from './firebaseConfig';

export const getCompletion = async (address) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${'AIzaSyBqdK2r3h7vi8WZ1ldQRHiayg0Mj5JbeUw'}`
    );
    const data = await response.json();

    if (data.status === "OK") {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      throw new Error("Geocoding failed");
    }
  } catch (error) {
    console.error("Error in getCompletion: ", error);
    throw error;
  }
};

export const getDistance = async (startLat, startLng, endLat, endLng) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${startLat},${startLng}&destinations=${endLat},${endLng}&key=${'AIzaSyBqdK2r3h7vi8WZ1ldQRHiayg0Mj5JbeUw'}`
    );
    const data = await response.json();

    if (data.status === "OK") {
      const distance = data.rows[0].elements[0].distance.text;
      const value = distance.split(" ")[0];
      return parseFloat(value.replace(",", ""));
    } else {
      throw new Error("Distance calculation failed");
    }
  } catch (error) {
    console.error("Error in getDistance: ", error);
    throw error;
  }
};