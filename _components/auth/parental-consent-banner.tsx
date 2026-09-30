"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRoundCheck } from "lucide-react";
import classNames from "classnames";
import { requestParentalConsent } from "@/_actions/consent-actions";
import ButtonType from "@/_components/ui/buttons/button-type";

interface ParentalConsentBannerProps {
  parentEmail: string;
  cssClasses?: string;
}

const ParentalConsentBanner = ({
  parentEmail,
  cssClasses,
}: ParentalConsentBannerProps) => {
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    setError("");
    setSent(false);
    setResending(true);
    const result = await requestParentalConsent();
    if (result.success) {
      setSent(true);
    } else {
      setError(result.error ?? "Could not send the email. Please try again.");
    }
    setCooldown(60);
    setResending(false);
  };

  if (!parentEmail) {
    return (
      <div
        className={classNames(
          "bg-orange/10 border border-orange rounded-[6px] flex gap-2 items-start p-4 mb-5",
          cssClasses,
        )}
      >
        <UserRoundCheck color="#E37434" size={18} className="shrink-0 mt-[2px]" />
        <div className="flex flex-col gap-1">
          <h3>Registration incomplete</h3>
          <p className="text-[12px]">
            Your account is missing some registration details, so you
            can&apos;t join a hunt yet. Please delete your account from your
            Profile page and register again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        "bg-orange/10 border border-orange rounded-[6px] flex flex-col gap-3 p-4 mb-5",
        cssClasses,
      )}
    >
      <div className="flex gap-2 items-start">
        <UserRoundCheck color="#E37434" size={18} className="shrink-0 mt-[2px]" />
        <div className="flex flex-col gap-1">
          <h3>Waiting for your parent or guardian</h3>
          <p className="text-[12px]">
            We emailed {parentEmail} a link to give consent. You can look
            around, but you can&apos;t join a hunt until they approve. If they
            don&apos;t respond within 7 days, your account will be deleted.
          </p>
          <p className="text-[12px]">
            Ask them to check their spam folder if they can&apos;t find it.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 tablet:flex-row">
        <ButtonType
          type="button"
          colorOrange
          onClick={() => router.refresh()}
          cssClasses="w-full tablet:w-auto"
        >
          They&apos;ve approved
        </ButtonType>
        <ButtonType
          type="button"
          colorGrey
          secondary
          onClick={() => {
            handleResend();
          }}
          disabled={resending || cooldown > 0}
          cssClasses="w-full tablet:w-auto"
        >
          {resending ? (
            <div className="spinner" />
          ) : cooldown > 0 ? (
            `Resend in ${cooldown}s`
          ) : (
            "Resend email"
          )}
        </ButtonType>
      </div>
      {sent && (
        <p className="text-[12px]">
          Email sent to {parentEmail}.
        </p>
      )}
      {error && <p className="text-error text-[12px]">{error}</p>}
    </div>
  );
};

export default ParentalConsentBanner;
