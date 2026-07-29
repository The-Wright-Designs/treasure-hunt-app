"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sendEmailVerification } from "firebase/auth";
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
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");
  const autoSent = useRef(false);

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
        if (!active) return;
        if (isVerified) {
          setVerified(true);
          router.refresh();
          return;
        }
        if (autoSent.current || !user.email) return;
        autoSent.current = true;

        const sentKey = `verification-sent:${user.email}`;
        if (sessionStorage.getItem(sentKey)) return;
        sessionStorage.setItem(sentKey, "1");

        sendEmailVerification(user).catch((err) => {
          console.error("Verification email failed to send:", err);
        });
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

  if (loading || !user || !checked || verified) return null;

  const handleResend = async () => {
    setError("");
    setResending(true);
    try {
      await sendEmailVerification(user);
      if (user.email)
        sessionStorage.setItem(`verification-sent:${user.email}`, "1");
      setResent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("auth/too-many-requests")) {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Could not send the link. Please try again.");
      }
    }
    setResending(false);
  };

  const handleRecheck = async () => {
    setError("");
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
            We sent a verification link to {user.email}. Please click it to
            confirm your address.{" "}
            <strong>
              If you can't see the email, please check your spam folder.
            </strong>
          </p>
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
          disabled={resending || resent}
          cssClasses="w-full tablet:w-auto"
        >
          {resending ? (
            <div className="spinner" />
          ) : resent ? (
            "Link sent"
          ) : (
            "Resend link"
          )}
        </ButtonType>
      </div>
      {error && <p className="text-error text-[12px]">{error}</p>}
    </div>
  );
};

export default VerifyEmailBanner;
