"use client";

import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import classNames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  lat: number;
  lng: number;
  zoom: number;
  circleLat?: number;
  circleLng?: number;
  circleRadius?: number;
  cssClasses?: string;
}

const libraries: never[] = [];

const MapComponent = ({
  lat,
  lng,
  zoom,
  circleLat,
  circleLng,
  circleRadius,
  cssClasses,
}: Props) => {
  const center = { lat, lng };
  const mapRef = useRef<google.maps.Map | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const resolvedCircleLat = circleLat ?? lat;
  const resolvedCircleLng = circleLng ?? lng;
  const resolvedCircleRadius = circleRadius ?? 200;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const onMapLoad = useCallback((loadedMap: google.maps.Map) => {
    mapRef.current = loadedMap;
    setMap(loadedMap);
  }, []);

  useEffect(() => {
    if (!map) return;

    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle({
        map,
        strokeColor: "#E37434",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#E37434",
        fillOpacity: 0.15,
      });
    }

    circleRef.current.setCenter({
      lat: resolvedCircleLat,
      lng: resolvedCircleLng,
    });
    circleRef.current.setRadius(resolvedCircleRadius);
  }, [map, resolvedCircleLat, resolvedCircleLng, resolvedCircleRadius]);

  const onUnmount = useCallback(() => {
    try {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
      mapRef.current = null;
      setMap(null);
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
