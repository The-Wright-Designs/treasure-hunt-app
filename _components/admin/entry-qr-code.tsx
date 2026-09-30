"use client";

import { useRef } from "react";
import classNames from "classnames";
import { QRCodeCanvas } from "qrcode.react";
import ButtonType from "@/_components/ui/buttons/button-type";

interface Props {
  huntId: string;
  entryCode: string;
  cssClasses?: string;
}

const EntryQrCode = ({ huntId, entryCode, cssClasses }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const download = () => {
    if (!canvasRef.current) return;

    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = `hunt-${huntId}-qr.png`;
    link.click();
  };

  return (
    <div className={classNames("flex flex-col gap-2 items-start", cssClasses)}>
      <QRCodeCanvas
        ref={canvasRef}
        value={entryCode}
        size={512}
        level="H"
        marginSize={4}
        className="w-[160px] h-[160px]"
      />

      <ButtonType
        type="button"
        colorGrey
        onClick={download}
        cssClasses="desktop:hover:cursor-pointer"
      >
        Download QR
      </ButtonType>
    </div>
  );
};

export default EntryQrCode;
