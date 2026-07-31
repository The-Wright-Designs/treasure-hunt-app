"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendEmailVerification } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { MailWarning } from "lucide-react";
import classNames from "classnames";
import { useAuth } from "@/_context/auth-context";
import { createSession } from "@/_actions/auth-actions";
import ButtonType from "@/_components/ui/buttons/button-type";

const VerifyEmailBanner = ({ cssClasses }: { cssClasses?: string }) => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [verified, setVerified] = useState(false);
  const [checked, setChecked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");

  const syncVerifiedState = useCallback(async () => {
    if (!user) return false;

    await user.reload();

    if (!user.emailVerified) return false;

    const idToken = await user.getIdToken(true);
    await createSession(idToken);
    return true;
  }, [user]);

  useEffect(() => {
    if (loading || !user) return;

    let active = true;

    syncVerifiedState()
      .then((isVerified) => {
        if (!active || !isVerified) return;
        setVerified(true);
        router.refresh();
      })
      .catch((err) => {
        console.error("Verification state check failed:", err);
      })
      .finally(() => {
        if (active) setChecked(true);
      });

    return () => {
      active = false;
    };
  }, [loading, user, syncVerifiedState, router]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  if (loading || !user || !checked || verified) return null;

  const handleResend = async () => {
    setError("");
    setSent(false);
    setResending(true);
    try {
      await sendEmailVerification(user);
      setSent(true);
      setCooldown(60);
    } catch (err) {
      if (
        err instanceof FirebaseError &&
        err.code === "auth/too-many-requests"
      ) {
        setError(
          "A link has already been sent. Please check your inbox and spam folder, then wait a few minutes before trying again.",
        );
        setCooldown(60);
      } else {
        setError("Could not send the link. Please try again.");
      }
    }
    setResending(false);
  };

  const handleRecheck = async () => {
    setError("");
    setSent(false);
    setChecking(true);
    try {
      const isVerified = await syncVerifiedState();
      if (isVerified) {
        setVerified(true);
        router.refresh();
      } else {
        setError("Not verified yet. Please click the link in your email.");
      }
    } catch (err) {
      console.error("Verification state check failed:", err);
      setError("Something went wrong. Please try again.");
    }
    setChecking(false);
  };

  return (
    <div
      className={classNames(
        "bg-orange/10 border border-orange rounded-[6px] flex flex-col gap-3 p-4 mb-5",
        cssClasses,
      )}
    >
      <div className="flex gap-2 items-start">
        <MailWarning color="#E37434" size={18} className="shrink-0 mt-[2px]" />
        <div className="flex flex-col gap-1">
          <h3>Verify your email address</h3>
          <p className="text-[12px]">
            A verification link was sent to {user.email}. Please click it to
            confirm your address.
          </p>
          <p className="text-[12px]">
            If you can&apos;t see the email, before requesting a new link:
          </p>
          <ul className="list-disc pl-4 flex flex-col gap-1">
            <li className="text-[12px]">Check your spam folder</li>
            <li className="text-[12px]">
              Double check your email address is correct in your profile
            </li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col gap-2 tablet:flex-row">
        <ButtonType
          type="button"
          colorOrange
          onClick={() => {
            handleRecheck();
          }}
          disabled={checking}
          cssClasses="w-full tablet:w-auto"
        >
          {checking ? (
            <div className="spinner spinner-black" />
          ) : (
            "I've verified"
          )}
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
            "Resend link"
          )}
        </ButtonType>
      </div>
      {sent && (
        <p className="text-[12px]">
          Link sent. Please check your inbox and spam folder.
        </p>
      )}
      {error && <p className="text-error text-[12px]">{error}</p>}
    </div>
  );
};

export default VerifyEmailBanner;
