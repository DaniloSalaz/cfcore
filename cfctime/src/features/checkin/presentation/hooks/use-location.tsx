import { useDependenciesInjection } from "@/common/providers/dependency-injection-provider";
import { useEffect, useState } from "react";

export function useGeolocation() {
  const [address, setAddress] = useState<string>('');
  const [position, setPosition] = useState<{ lat: number; lon: number } | null>({lat: 10.0, lon: 10.0});
  const [error, setError] = useState<string | null>(null);
  const { getGeoReverse } = useDependenciesInjection();

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation no soportado");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      (err) => {
        setError(err.message);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if(position?.lat && position?.lon) {
        getGeoReverse.execute(position?.lat, position?.lon)
            .then((result) => {
                if(result.ok) setAddress(result.value);
                else setAddress(`${position.lat} - ${position.lon}`)
            })
    }

  }, [position]);

  return { address, error };
}
