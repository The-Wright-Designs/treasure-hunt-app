"use client";

import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import classNames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import ButtonType from "@/_components/ui/buttons/button-type";

interface Props {
  lat: number;
  lng: number;
  zoom: number;
  circleLat?: number;
  circleLng?: number;
  circleRadius?: number;
  showUserLocation?: boolean;
  cssClasses?: string;
}

const libraries: never[] = [];

const DOT_RADIUS_PIXELS = 7;

const dotRadiusForZoom = (zoomLevel?: number) => {
  const currentZoom = zoomLevel ?? 15;
  const metresPerPixel = 156543.03392 / Math.pow(2, currentZoom);
  return DOT_RADIUS_PIXELS * metresPerPixel;
};

const MapComponent = ({
  lat,
  lng,
  zoom,
  circleLat,
  circleLng,
  circleRadius,
  showUserLocation,
  cssClasses,
}: Props) => {
  const center = { lat, lng };
  const mapRef = useRef<google.maps.Map | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const userDotRef = useRef<google.maps.Circle | null>(null);
  const userAccuracyRef = useRef<google.maps.Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<google.maps.LatLngLiteral | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [userPositionFound, setUserPositionFound] = useState(false);

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

  const clearUserLocation = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (userDotRef.current) {
      userDotRef.current.setMap(null);
      userDotRef.current = null;
    }
    if (userAccuracyRef.current) {
      userAccuracyRef.current.setMap(null);
      userAccuracyRef.current = null;
    }
    lastPositionRef.current = null;
    setUserPositionFound(false);
  }, []);

  useEffect(() => {
    if (!map || !showUserLocation || !navigator.geolocation) return;

    const onPosition = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      const userCenter = { lat: latitude, lng: longitude };

      if (!userAccuracyRef.current) {
        userAccuracyRef.current = new google.maps.Circle({
          map,
          strokeColor: "#4B9DA9",
          strokeOpacity: 0.4,
          strokeWeight: 1,
          fillColor: "#4B9DA9",
          fillOpacity: 0.15,
        });
      }

      if (!userDotRef.current) {
        userDotRef.current = new google.maps.Circle({
          map,
          zIndex: 999,
          strokeColor: "#FFFFFF",
          strokeOpacity: 1,
          strokeWeight: 2,
          fillColor: "#4B9DA9",
          fillOpacity: 1,
        });
      }

      userAccuracyRef.current.setCenter(userCenter);
      userAccuracyRef.current.setRadius(Math.min(accuracy, 1000));
      userDotRef.current.setCenter(userCenter);
      userDotRef.current.setRadius(dotRadiusForZoom(map.getZoom()));
      lastPositionRef.current = userCenter;

      setUserPositionFound(true);
      setLocationStatus(null);
    };

    const onPositionError = (error: GeolocationPositionError) => {
      if (error.code === error.PERMISSION_DENIED) {
        setLocationStatus(
          "Turn on location in your browser settings to see where you are on the map.",
        );
        return;
      }

      if (error.code === error.POSITION_UNAVAILABLE) {
        setLocationStatus(
          "We can't find your location right now. Move somewhere with better signal and try again.",
        );
        return;
      }

      setLocationStatus("Finding your location is taking a while, hang tight.");
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      onPosition,
      onPositionError,
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    );

    const zoomListener = map.addListener("zoom_changed", () => {
      if (!userDotRef.current || !lastPositionRef.current) return;
      userDotRef.current.setRadius(dotRadiusForZoom(map.getZoom()));
    });

    return () => {
      zoomListener.remove();
      clearUserLocation();
    };
  }, [map, showUserLocation, clearUserLocation]);

  const showHuntArea = useCallback(() => {
    if (!map) return;
    map.panTo({ lat: resolvedCircleLat, lng: resolvedCircleLng });
    map.setZoom(zoom);
  }, [map, resolvedCircleLat, resolvedCircleLng, zoom]);

  const showMyLocation = useCallback(() => {
    if (!map || !lastPositionRef.current) return;
    map.panTo(lastPositionRef.current);
  }, [map]);

  const onUnmount = useCallback(() => {
    try {
      clearUserLocation();
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
      mapRef.current = null;
      setMap(null);
    } catch (error) {
      console.error("Error unmounting map:", error);
    }
  }, [clearUserLocation]);

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
    <div className="flex flex-col gap-5">
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
      {showUserLocation && (
        <div className="flex gap-2">
          <ButtonType
            type="button"
            onClick={showHuntArea}
            colorOrange
            cssClasses="flex-1 desktop:hover:cursor-pointer"
          >
            Hunt area
          </ButtonType>
          <ButtonType
            type="button"
            onClick={showMyLocation}
            disabled={!userPositionFound}
            colorTeal
            cssClasses="flex-1 desktop:hover:cursor-pointer"
          >
            My location
          </ButtonType>
        </div>
      )}
      {showUserLocation && map && !navigator.geolocation && (
        <p>
          Your browser can&apos;t share your location, so we can&apos;t show
          where you are on the map.
        </p>
      )}
      {showUserLocation && locationStatus && <p>{locationStatus}</p>}
    </div>
  );
};

export default MapComponent;
