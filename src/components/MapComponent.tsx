import React, { useState, useCallback, useEffect } from "react";
import {
  GoogleMap,
  InfoWindow,
  Marker,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";


interface AirportPosition {
  lat: number;
  lng: number;
}

interface MapComponentProps {
  fromAirport: AirportPosition | null;
  toAirport: AirportPosition | null;
  showMarkersAndPolyline: boolean;
  setMap: (map: google.maps.Map | undefined) => void;
}

const center = {
  lat: 39.8283,
  lng: -98.5795,
};

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

const MapComponent: React.FC<MapComponentProps> = ({ fromAirport, toAirport, showMarkersAndPolyline, setMap }) => {

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API || "",
    libraries,
  });

  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  const handleActiveMarker = (marker: string) => {
    if (marker === activeMarker) {
      return;
    }
    setActiveMarker(marker);
  };

  const handleOnLoad = useCallback((map: google.maps.Map) => {
    const bounds = new google.maps.LatLngBounds({
      north: 49.3457868,
      south: 24.396308,
      west: -125.0,
      east: -66.93457,
    });
    map.fitBounds(bounds);
    setMap(map);
  }, [setMap]);

  const onUnmount = useCallback(() => {
    setMap(undefined);
  }, [setMap]);

  const getPolylinePath = useCallback(() => {
    return fromAirport && toAirport ? [
      { lat: fromAirport.lat, lng: fromAirport.lng },
      { lat: toAirport.lat, lng: toAirport.lng },
    ] : [];
  }, [fromAirport, toAirport]);

  useEffect(() => {
    console.log("Polyline path:", getPolylinePath());
    console.log("From Airport:", fromAirport);
    console.log("To Airport:", toAirport);
  }, [fromAirport, toAirport, getPolylinePath]);

  if (!isLoaded) return null;

  return (
    <GoogleMap
      onLoad={handleOnLoad}
      onUnmount={onUnmount}
      onClick={() => setActiveMarker(null)}
      mapContainerStyle={{ width: "100%", height: "600px" }}
      center={center}
      zoom={3}
    >
      {showMarkersAndPolyline && fromAirport && toAirport && (
        <>
          <Polyline
            path={getPolylinePath()}
            options={{
              strokeColor: "#FF0000",
              strokeOpacity: 1.0,
              strokeWeight: 2,
              geodesic: true,
            }}
          />
          <Marker
            icon='http://maps.google.com/mapfiles/ms/icons/green-dot.png'
            position={fromAirport}
            onClick={() => handleActiveMarker("fromAirport")}
          >
            {activeMarker === "fromAirport" && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div>From Airport</div>
              </InfoWindow>
            )}
          </Marker>
          <Marker
            icon='http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            position={toAirport}
            onClick={() => handleActiveMarker("toAirport")}
          >
            {activeMarker === "toAirport" && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div>To Airport</div>
              </InfoWindow>
            )}
          </Marker>
        </>
      )}
    </GoogleMap>
  );
};

export default React.memo(MapComponent);
