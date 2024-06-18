import React, { useState } from 'react';
import AirportSearch from './AirportSearch';
import MapComponent from './MapComponent';
import './DistanceCalculator.css';

interface Airport {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  iata: string;
}

const DistanceCalculator: React.FC = () => {
  const [fromAirport, setFromAirport] = useState<Airport | null>(null);
  const [toAirport, setToAirport] = useState<Airport | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [showMarkersAndPolyline, setShowMarkersAndPolyline] = useState<boolean>(false);
  const [mapKey, setMapKey] = useState<number>(0);
  const [map, setMap] = useState<google.maps.Map | undefined>(undefined);

  const handleAirportSelect = (setAirport: React.Dispatch<React.SetStateAction<Airport | null>>) => (airport: Airport | null) => {
    setAirport(airport);
    setDistance(null);
    setMapKey(prevKey => prevKey + 1); // Trigger map re-render
  };

  const calculateDistance = () => {
    if (fromAirport && toAirport) {
      const R = 3440; // Radius of the Earth in nautical miles
      const lat1 = fromAirport.latitude * (Math.PI / 180);
      const lon1 = fromAirport.longitude * (Math.PI / 180);
      const lat2 = toAirport.latitude * (Math.PI / 180);
      const lon2 = toAirport.longitude * (Math.PI / 180);

      const dLat = lat2 - lat1;
      const dLon = lon2 - lon1;

      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const distance = R * c;
      setDistance(distance);
      setShowMarkersAndPolyline(false); // Clear previous markers and polyline first
      setTimeout(() => {
        setShowMarkersAndPolyline(true); // Show new markers and polyline
        setMapKey(prevKey => prevKey + 1); // Trigger map re-render
      }, 0);

      console.log(`From Airport: ${JSON.stringify(fromAirport)}`);
      console.log(`To Airport: ${JSON.stringify(toAirport)}`);

      // Adjust map bounds to focus on the polyline
      if (map && fromAirport && toAirport) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: fromAirport.latitude, lng: fromAirport.longitude });
        bounds.extend({ lat: toAirport.latitude, lng: toAirport.longitude });
        map.fitBounds(bounds);
      }
    } else {
      // Clear polyline and markers if fromAirport or toAirport is null
      setShowMarkersAndPolyline(false);
      setMapKey(prevKey => prevKey + 1); // Trigger map re-render
    }
  };

  return (
    <div className="container">
      <h1 className="header">U.S. Airport Distance Calculator in Nautical Miles (NM)</h1>
      <div className="autocomplete-section">
        <AirportSearch label="From" onAirportSelect={handleAirportSelect(setFromAirport)} />
        <AirportSearch label="To" onAirportSelect={handleAirportSelect(setToAirport)} />
      </div>
      <button className="calculate-button" onClick={calculateDistance}>
        Calculate Distance
      </button>
      {distance && fromAirport && toAirport && (
        <div className="result">
          <p><strong>{fromAirport.name} ({fromAirport.iata}) and {toAirport.name} ({toAirport.iata}) are {distance.toFixed(2)} NM away!</strong></p>
        </div>
      )}
      <MapComponent
        key={mapKey} // Add key prop to force re-render
        fromAirport={fromAirport ? { lat: fromAirport.latitude, lng: fromAirport.longitude } : null}
        toAirport={toAirport ? { lat: toAirport.latitude, lng: toAirport.longitude } : null}
        showMarkersAndPolyline={showMarkersAndPolyline}
        setMap={setMap}
      />
    </div>
  );
};

export default DistanceCalculator;
