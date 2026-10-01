"use client";

import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import ButtonType from "@/_components/ui/buttons/button-type";

interface Props {
  onScan: (value: string) => void;
  onCancel: () => void;
  checking?: boolean;
  cssClasses?: string;
}

const QrScanner = ({ onScan, onCancel, checking, cssClasses }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState(false);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    let scanner: { stop: () => void; destroy: () => void } | undefined;
    let cancelled = false;
    let scanned = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    import("qr-scanner").then(({ default: Scanner }) => {
      if (cancelled || !videoRef.current) return;

      const instance = new Scanner(
        videoRef.current,
        (result) => {
          if (scanned) return;
          scanned = true;
          timeout = setTimeout(() => onScanRef.current(result.data), 1000);
        },
        {
          preferredCamera: "environment",
          maxScansPerSecond: 5,
          highlightScanRegion: true,
        },
      );
      scanner = instance;

      instance.start().catch(() => {
        if (!cancelled) setError(true);
      });
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      scanner?.stop();
      scanner?.destroy();
    };
  }, []);

  return (
    <div className={classNames("flex flex-col gap-3", cssClasses)}>
      {error ? (
        <p className="text-error text-[12px]">
          We couldn&apos;t open your camera. Allow camera access for this site
          in your browser settings, then reload this page.
        </p>
      ) : (
        <div className="relative w-full max-w-[400px] aspect-square rounded-[6px] overflow-hidden bg-black">
          <video
            ref={videoRef}
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          {checking && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="spinner" />
            </div>
          )}
        </div>
      )}

      <ButtonType
        type="button"
        colorGrey
        onClick={onCancel}
        cssClasses="self-start desktop:hover:cursor-pointer"
      >
        Cancel
      </ButtonType>
    </div>
  );
};

export default QrScanner;
