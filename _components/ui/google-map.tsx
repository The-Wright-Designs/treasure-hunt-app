"use client";

import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import classNames from "classnames";
import { useCallback, useRef } from "react";

interface Props {
  lat: number;
  lng: number;
  zoom: number;
  cssClasses?: string;
}

const libraries: never[] = [];

const MapComponent = ({ lat, lng, zoom, cssClasses }: Props) => {
  const center = { lat, lng };
  const mapRef = useRef<google.maps.Map | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      try {
        mapRef.current = map;
        circleRef.current = new google.maps.Circle({
          map,
          center,
          radius: 200,
          strokeColor: "#E37434",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#E37434",
          fillOpacity: 0.15,
        });
      } catch (error) {
        console.error("Error loading map:", error);
      }
    },
    [center],
  );

  const onUnmount = useCallback(() => {
    try {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
      mapRef.current = null;
    } catch (error) {
      console.error("Error unmounting map:", error);
    }
  }, []);

  if (loadError) {
    return (
      <div
        className={classNames(
          "bg-teal grid place-items-center py-16",
          cssClasses,
        )}
      >
        <p className="text-paragraph">Error loading map</p>
      </div>
    );
  }

  if (!isLoaded || !window.google || !window.google.maps) {
    return (
      <div
        className={classNames(
          "bg-teal grid place-items-center py-16",
          cssClasses,
        )}
      >
        <p className="text-paragraph">Map loading...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      zoom={zoom}
      center={center}
      mapContainerClassName={cssClasses}
      onLoad={onMapLoad}
      onUnmount={onUnmount}
      options={{
        mapId: "Treasure Hunt App",
      }}
    />
  );
};

export default MapComponent;
