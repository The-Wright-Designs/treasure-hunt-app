"use client";

import { useState, useEffect, useActionState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/_lib/firebase-client";
import TextInput from "@/_components/ui/inputs/text-input";
import PhoneInput from "@/_components/ui/inputs/phone-input";
import EmailInput from "@/_components/ui/inputs/email-input";
import ButtonType from "@/_components/ui/buttons/button-type";
import { saveProfile, type SaveProfileState } from "@/_actions/profile-actions";

interface Props {
  name: string;
  phone: string;
  email: string;
}

const ProfileForm = ({ name, phone, email }: Props) => {
  const [currentPhone, setCurrentPhone] = useState(phone);
  const [currentEmail, setCurrentEmail] = useState(email);
  const [confirmedAt, setConfirmedAt] = useState<{ state: SaveProfileState } | null>(null);
  const [state, formAction] = useActionState(saveProfile, null);
  const leaving = state?.ok === true && state.emailChanged;
  const confirming = confirmedAt !== null && confirmedAt.state === state;

  const SA_PHONE_REGEX = /^(\+27|0)[6-8][0-9]{8}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isDirty = currentPhone !== phone || currentEmail !== email;

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
  }, []);

  useEffect(() => {
    if (!leaving) return;
    signOut(auth).finally(() => {
      window.location.href = "/login?emailChanged=1";
    });
  }, [leaving]);

  useEffect(() => {
    if (!isDirty || leaving) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, leaving]);

  useEffect(() => {
    if (!isDirty || leaving) return;
    const handler = () => {
      if (!confirm("You have unsaved changes. Are you sure you want to leave?")) {
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [isDirty, leaving]);
  const isPhoneValid = currentPhone === "" || SA_PHONE_REGEX.test(currentPhone);
  const isEmailValid = EMAIL_REGEX.test(currentEmail);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <TextInput label="Name" name="name" defaultValue={name} disabled />
      <PhoneInput
        label="Phone number"
        name="phone"
        value={currentPhone}
        onChange={(e) => setCurrentPhone(e.target.value)}
      />
      <EmailInput
        label="Email"
        name="email"
        value={currentEmail}
        onChange={(e) => setCurrentEmail(e.target.value)}
      />
      {!confirming ? (
        <ButtonType
          colorGrey
          cssClasses="mt-5"
          type="button"
          onClick={() => setConfirmedAt({ state })}
          disabled={!isDirty || !isPhoneValid || !isEmailValid}
        >
          Save
        </ButtonType>
      ) : (
        <div className="mt-5 flex flex-col gap-4">
          <p className="text-center">
            {currentEmail !== email
              ? "Are you sure? Changing your email will log you out and you will need to verify your new address."
              : "Are you sure you want to update your profile details?"}
          </p>
          <ButtonType colorGrey cssClasses="w-full">
            Confirm changes
          </ButtonType>
          <ButtonType
            colorGrey
            secondary
            cssClasses="w-full"
            type="button"
            onClick={() => setConfirmedAt(null)}
          >
            Cancel
          </ButtonType>
        </div>
      )}
      {state?.ok === false && (
        <p className="text-error text-[12px] text-center">{state.error}</p>
      )}
      {state?.ok === true && state.emailChanged && (
        <p className="text-[12px] text-center">
          Email updated. Redirecting you to log in again...
        </p>
      )}
      {state?.ok === true && !state.emailChanged && !isDirty && (
        <p className="text-[12px] text-center">Profile updated</p>
      )}
    </form>
  );
};

export default ProfileForm;
