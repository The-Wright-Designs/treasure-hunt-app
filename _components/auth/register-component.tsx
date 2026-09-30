"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { auth } from "@/_lib/firebase-client";
import { createSession, verifyAuthRecaptcha } from "@/_actions/auth-actions";
import { requestParentalConsent } from "@/_actions/consent-actions";
import { ageFromDateOfBirth, isEligibleAge } from "@/_lib/utils/age";
import { RELATIONSHIPS } from "@/_types/consent-types";
import TextInput from "@/_components/ui/inputs/text-input";
import PhoneInput from "@/_components/ui/inputs/phone-input";
import EmailInput from "@/_components/ui/inputs/email-input";
import SelectInput from "@/_components/ui/inputs/select-input";
import ButtonType from "@/_components/ui/buttons/button-type";
import logo from "@/public/logo/treasure-hunt-app-logo.png";

const RegisterComponent = () => {
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [values, setValues] = useState({
    name: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    school: "",
    address: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    parentRelationship: RELATIONSHIPS[0],
    password: "",
    confirmPassword: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [transitioning, setTransitioning] = useState(false);
  const [registering, setRegistering] = useState(false);

  const passwordRules = {
    uppercase: /[A-Z]/.test(values.password),
    lowercase: /[a-z]/.test(values.password),
    special: /[^A-Za-z0-9]/.test(values.password),
    numeric: /[0-9]/.test(values.password),
  };

  const allRulesMet = Object.values(passwordRules).every(Boolean);

  const age = ageFromDateOfBirth(values.dateOfBirth);
  const needsParent = age < 18;

  const step1Valid =
    values.name.trim().length >= 2 &&
    /^(\+27|0)[6-8][0-9]{8}$/.test(values.phone) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) &&
    isEligibleAge(age);

  const parentEmailMatches =
    values.parentEmail.trim().toLowerCase() === values.email.trim().toLowerCase();

  const step2Valid =
    acceptedTerms &&
    (!needsParent ||
      (values.parentName.trim().length >= 2 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.parentEmail) &&
        !parentEmailMatches &&
        /^(\+27|0)[6-8][0-9]{8}$/.test(values.parentPhone)));

  const goToStep = async (next: 1 | 2 | 3) => {
    setTransitioning(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setTransitioning(false);
    setStep(next);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === "confirmPassword" || e.target.name === "password") {
      setPasswordError("");
    }
  };

  return (
    <div className="bg-white flex flex-col gap-5 p-7 rounded-[6px] w-full max-w-[335px]">
      <div className="flex gap-10 items-center justify-between pb-5 border-b border-black/25">
        <h1 className="font-semibold text-[20px]">Treasure Hunt App</h1>
        <Image src={logo} alt="Treasure Hunt App logo" width={56} height={56} />
      </div>
      <h2>Register</h2>
      <div className="flex flex-col gap-5 items-center w-full">
        <div className="flex flex-col gap-5 w-full">
          {step === 1 ? (
            <>
              <TextInput
                label="Name"
                name="name"
                placeholder="Name"
                required
                autoComplete="name"
                value={values.name}
                onChange={handleChange}
                disabled={registering}
              />
              <PhoneInput
                label="Phone number"
                name="phone"
                placeholder="Phone number"
                required
                value={values.phone}
                onChange={handleChange}
                disabled={registering}
              />
              <EmailInput
                label="Email"
                name="email"
                placeholder="Email"
                required
                value={values.email}
                onChange={handleChange}
                disabled={registering}
              />
              <TextInput
                label="Date of birth"
                name="dateOfBirth"
                type="date"
                required
                autoComplete="bday"
                value={values.dateOfBirth}
                onChange={handleChange}
                disabled={registering}
                error={
                  values.dateOfBirth && !isEligibleAge(age)
                    ? "The treasure hunt is only open to players aged 13 to 18."
                    : ""
                }
              />
              <TextInput
                label="School (optional, for future safety support)"
                name="school"
                placeholder="School"
                value={values.school}
                onChange={handleChange}
                disabled={registering}
              />
              <TextInput
                label="Address (optional, for future safety support)"
                name="address"
                placeholder="Address"
                autoComplete="street-address"
                value={values.address}
                onChange={handleChange}
                disabled={registering}
              />
            </>
          ) : step === 2 ? (
            <>
              {needsParent && (
                <>
                  <div className="flex flex-col gap-1">
                    <h3>Parent or guardian</h3>
                    <p className="text-[12px]">
                      Because you&apos;re under 18, we&apos;ll email your parent
                      or guardian to ask for their consent before you can join
                      a hunt.
                    </p>
                  </div>
                  <TextInput
                    label="Parent or guardian's name"
                    name="parentName"
                    placeholder="Full name"
                    required
                    value={values.parentName}
                    onChange={handleChange}
                    disabled={registering}
                  />
                  <SelectInput
                    label="Relationship to you"
                    name="parentRelationship"
                    required
                    options={RELATIONSHIPS.map((relationship) => ({
                      label: relationship,
                      value: relationship,
                    }))}
                    value={values.parentRelationship}
                    onChange={handleChange}
                    disabled={registering}
                  />
                  <EmailInput
                    label="Parent or guardian's email"
                    name="parentEmail"
                    placeholder="Email"
                    required
                    value={values.parentEmail}
                    onChange={handleChange}
                    disabled={registering}
                  />
                  {values.parentEmail && parentEmailMatches && (
                    <p className="text-error text-[12px] -mt-3">
                      This must be your parent or guardian&apos;s own email,
                      not yours.
                    </p>
                  )}
                  <PhoneInput
                    label="Parent or guardian's phone number"
                    name="parentPhone"
                    placeholder="Phone number"
                    required
                    value={values.parentPhone}
                    onChange={handleChange}
                    disabled={registering}
                  />
                </>
              )}
              <label className="flex gap-3 items-start">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  disabled={registering}
                  className="mt-1 shrink-0 accent-orange desktop:hover:cursor-pointer"
                />
                <span className="text-[12px]">
                  I have read and agree to the{" "}
                  <Link href="/terms" target="_blank">
                    Terms &amp; Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" target="_blank">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </>
          ) : (
            <>
              <TextInput
                label="Password"
                name="password"
                type="password"
                placeholder="Password"
                required
                autoComplete="new-password"
                value={values.password}
                onChange={handleChange}
                disabled={registering}
              />
              <div className="flex flex-col gap-2">
                {[
                  {
                    label: "Uppercase character",
                    met: passwordRules.uppercase,
                  },
                  {
                    label: "Lowercase character",
                    met: passwordRules.lowercase,
                  },
                  { label: "Special character", met: passwordRules.special },
                  { label: "Numeric character", met: passwordRules.numeric },
                ].map(({ label, met }) => (
                  <div key={label} className="flex items-center gap-2">
                    {met ? (
                      <Check color="#16A34A" size={14} />
                    ) : (
                      <X color="#DC2626" size={14} />
                    )}
                    <p className="text-[12px]">{label}</p>
                  </div>
                ))}
                {values.confirmPassword && (
                  <div className="flex items-center gap-2">
                    {values.password === values.confirmPassword ? (
                      <Check color="#16A34A" size={14} />
                    ) : (
                      <X color="#DC2626" size={14} />
                    )}
                    <p className="text-[12px]">Passwords match</p>
                  </div>
                )}
              </div>
              <TextInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                required
                autoComplete="new-password"
                value={values.confirmPassword}
                onChange={handleChange}
                error={passwordError}
                disabled={registering}
              />
            </>
          )}
        </div>
        {step === 1 ? (
          <ButtonType
            type="button"
            onClick={() => goToStep(2)}
            cssClasses="w-full"
            disabled={!step1Valid || transitioning}
          >
            {transitioning ? <div className="spinner" /> : "Next"}
          </ButtonType>
        ) : step === 2 ? (
          <>
            <ButtonType
              type="button"
              onClick={() => goToStep(3)}
              cssClasses="w-full"
              disabled={!step2Valid || transitioning}
            >
              {transitioning ? <div className="spinner" /> : "Next"}
            </ButtonType>
            <ButtonType
              type="button"
              colorGrey
              secondary
              onClick={() => setStep(1)}
              cssClasses="w-full"
            >
              Back
            </ButtonType>
          </>
        ) : (
          <>
            <ButtonType
              type="button"
              cssClasses="w-full"
              disabled={
                !allRulesMet ||
                values.password !== values.confirmPassword ||
                registering
              }
              onClick={async () => {
                if (values.password !== values.confirmPassword) {
                  setPasswordError("Passwords do not match");
                  return;
                }
                setRegistering(true);
                try {
                  if (!executeRecaptcha) {
                    throw new Error("reCAPTCHA: not ready");
                  }
                  const token = await executeRecaptcha("register");
                  await verifyAuthRecaptcha(token);
                  const credential = await createUserWithEmailAndPassword(
                    auth,
                    values.email,
                    values.password,
                  );
                  await updateProfile(credential.user, {
                    displayName: values.name,
                  });
                  try {
                    await sendEmailVerification(credential.user);
                  } catch (verificationError) {
                    console.error(
                      "Verification email failed to send:",
                      verificationError,
                    );
                  }
                  const idToken = await credential.user.getIdToken(true);
                  await createSession(idToken, values.phone, {
                    dateOfBirth: values.dateOfBirth,
                    school: values.school,
                    address: values.address,
                    ...(needsParent && {
                      parent: {
                        name: values.parentName,
                        email: values.parentEmail,
                        phone: values.parentPhone,
                        relationship: values.parentRelationship,
                      },
                    }),
                  });
                  if (needsParent) await requestParentalConsent();
                  router.push("/dashboard");
                } catch (err) {
                  const message = err instanceof Error ? err.message : "";
                  if (message.includes("reCAPTCHA")) {
                    setError(
                      "Security check failed. Please refresh the page and try again.",
                    );
                  } else if (message.includes("auth/email-already-in-use")) {
                    setError("An account with this email already exists.");
                  } else if (message.includes("auth/invalid-email")) {
                    setError("Please enter a valid email address.");
                  } else if (message.includes("auth/weak-password")) {
                    setError(
                      "Password is too weak. Please choose a stronger password.",
                    );
                  } else {
                    setError("Something went wrong. Please try again.");
                  }
                  setValues((prev) => ({ ...prev, password: "", confirmPassword: "" }));
                  setRegistering(false);
                }
              }}
            >
              {registering ? <div className="spinner" /> : "Register"}
            </ButtonType>
            <ButtonType
              type="button"
              colorGrey
              secondary
              onClick={() => setStep(2)}
              cssClasses="w-full"
            >
              Back
            </ButtonType>
            {error && <p className="text-error text-[12px] text-center">{error}</p>}
          </>
        )}
        <p className="text-[12px]">
          Already a member? <Link href="/login">Login here</Link>
        </p>
        <p className="text-[12px]">
          <Link href="/privacy">Privacy Policy</Link> ·{" "}
          <Link href="/terms">Terms &amp; Conditions</Link>
        </p>
        <p className="text-[10px] text-black/50 text-center">
          This site is protected by reCAPTCHA and the Google{" "}
          <Link
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </Link>{" "}
          apply.
        </p>
      </div>
    </div>
  );
};

export default RegisterComponent;
