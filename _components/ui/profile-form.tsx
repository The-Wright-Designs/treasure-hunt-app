"use client";

import { useState, useEffect } from "react";
import TextInput from "@/_components/ui/inputs/text-input";
import PhoneInput from "@/_components/ui/inputs/phone-input";
import EmailInput from "@/_components/ui/inputs/email-input";
import ButtonType from "@/_components/ui/buttons/button-type";
import { saveProfile } from "@/_actions/profile-actions";

interface Props {
  name: string;
  phone: string;
  email: string;
}

const ProfileForm = ({ name, phone, email }: Props) => {
  const [currentPhone, setCurrentPhone] = useState(phone);
  const [currentEmail, setCurrentEmail] = useState(email);

  const SA_PHONE_REGEX = /^(\+27|0)[6-8][0-9]{8}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isDirty = currentPhone !== phone || currentEmail !== email;

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
  }, []);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = () => {
      if (!confirm("You have unsaved changes. Are you sure you want to leave?")) {
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [isDirty]);
  const isPhoneValid = currentPhone === "" || SA_PHONE_REGEX.test(currentPhone);
  const isEmailValid = currentEmail === "" || EMAIL_REGEX.test(currentEmail);

  return (
    <form action={saveProfile} className="flex flex-col gap-5">
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
      <ButtonType colorGrey cssClasses="mt-5" disabled={!isDirty || !isPhoneValid || !isEmailValid}>
        Save
      </ButtonType>
    </form>
  );
};

export default ProfileForm;
