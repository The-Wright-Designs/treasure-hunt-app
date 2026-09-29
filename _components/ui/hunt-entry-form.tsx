"use client";

import { useState, useEffect, useActionState } from "react";
import classNames from "classnames";
import { PartyPopper } from "lucide-react";
import TextInput from "@/_components/ui/inputs/text-input";
import ButtonType from "@/_components/ui/buttons/button-type";
import { submitHuntEntry } from "@/_actions/active-hunt-actions";

interface Props {
  huntId: string;
  entered: boolean;
  cssClasses?: string;
}

async function submitWithLocation(
  prevState: { success: boolean; error?: string },
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const position = await new Promise<GeolocationPosition | null>((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (result) => resolve(result),
      () =>
        navigator.geolocation.getCurrentPosition(
          (result) => resolve(result),
          () => resolve(null),
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
        ),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });

  if (position) {
    formData.set("latitude", position.coords.latitude.toString());
    formData.set("longitude", position.coords.longitude.toString());
  }

  return submitHuntEntry(prevState, formData);
}

function getBlockedInstructions() {
  const ua = navigator.userAgent;
  const isIos =
    /iPhone|iPad|iPod/.test(ua) ||
    (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);

  if (isIos) {
    return 'Go to Settings > Privacy & Security > Location Services, make sure it\'s on, and set "Safari Websites" (or your browser) to "While Using the App". Then go to Settings > Apps > Safari > Location and choose "Ask" or "Allow". Then reload this page.';
  }

  if (/Android/.test(ua)) {
    return "Tap the icon on the left of the address bar > Permissions > Location > Allow. Also make sure Location is switched on in your phone's quick settings. Then reload this page.";
  }

  return "Click the icon on the left of the address bar > Site settings > Location > Allow. Then reload this page.";
}

const HuntEntryForm = ({ huntId, entered, cssClasses }: Props) => {
  const [entryCode, setEntryCode] = useState("");
  const [locationState, setLocationState] = useState<PermissionState>("prompt");
  const locationEnabled = locationState === "granted";
  const [state, formAction] = useActionState(submitWithLocation, {
    success: false,
  });

  const requestLocation = () =>
    navigator.geolocation.getCurrentPosition(
      () => setLocationState("granted"),
      (error) =>
        setLocationState(
          error.code === error.PERMISSION_DENIED ? "denied" : "granted",
        ),
      { maximumAge: 60000, timeout: 15000 },
    );

  useEffect(() => {
    requestLocation();

    if (!navigator.permissions) return;

    let status: PermissionStatus | undefined;

    const update = (next: PermissionState) =>
      setLocationState((prev) => (next === "prompt" ? prev : next));

    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      status = result;
      update(result.state);
      result.onchange = () => update(result.state);
    });

    return () => {
      if (status) status.onchange = null;
    };
  }, []);

  if (entered || state.success) {
    return (
      <div
        className={classNames(
          "flex gap-5 items-center px-5 py-7 bg-teal rounded-[6px]",
          cssClasses,
        )}
      >
        <PartyPopper size={50} color="#FFFFFF" className="shrink-0" />
        <div className="flex flex-col gap-1">
          <p className="text-subheading text-[20px] text-white">
            Congratulations!
          </p>
          <p className="text-white">
            You&apos;ve completed the hunt, and are now in this week&apos;s draw
            — we&apos;ll be in touch if you win.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className={classNames("flex flex-col gap-5", cssClasses)}
    >
      <input type="hidden" name="huntId" value={huntId} />

      <TextInput
        label="Found the item? Enter the code on it"
        name="entryCode"
        required
        placeholder="TEAL-4471"
        autoComplete="off"
        value={entryCode}
        onChange={(e) => setEntryCode(e.target.value)}
        disabled={!locationEnabled}
      />

      {!locationEnabled && (
        <p className="text-error text-[12px]">
          {locationState === "prompt"
            ? "Location must be enabled to enter the code. Tap the button below and allow location access."
            : `Location must be enabled to enter the code. Location access is blocked for this site. ${getBlockedInstructions()}`}
        </p>
      )}

      {state.error && <p className="text-error text-[12px]">{state.error}</p>}

      {locationEnabled ? (
        <ButtonType
          colorTeal
          disabled={entryCode.trim() === ""}
          cssClasses="self-start desktop:hover:cursor-pointer"
        >
          Submit entry
        </ButtonType>
      ) : (
        locationState === "prompt" && (
          <ButtonType
            type="button"
            colorOrange
            onClick={requestLocation}
            cssClasses="self-start desktop:hover:cursor-pointer"
          >
            Enable location
          </ButtonType>
        )
      )}
    </form>
  );
};

export default HuntEntryForm;
