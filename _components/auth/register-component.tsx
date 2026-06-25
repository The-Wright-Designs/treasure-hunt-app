"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { auth } from "@/_lib/firebase-client";
import { createSession, verifyAuthRecaptcha } from "@/_actions/auth-actions";
import TextInput from "@/_components/ui/inputs/text-input";
import NumberInput from "@/_components/ui/inputs/number-input";
import ButtonType from "@/_components/ui/buttons/button-type";
import logo from "@/public/logo/treasure-hunt-app-logo.png";

const RegisterComponent = () => {
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
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

  const step1Valid =
    values.name.trim().length >= 2 &&
    /^0[0-9]{9,11}$/.test(values.phone) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
              />
              <NumberInput
                label="Phone number"
                name="phone"
                placeholder="Phone number"
                required
                phone
                value={values.phone}
                onChange={handleChange}
              />
              <TextInput
                label="Email"
                name="email"
                type="email"
                placeholder="Email"
                required
                autoComplete="email"
                value={values.email}
                onChange={handleChange}
              />
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
              />
            </>
          )}
        </div>
        {step === 1 ? (
          <ButtonType
            type="button"
            onClick={async () => {
              setTransitioning(true);
              await new Promise((resolve) => setTimeout(resolve, 1000));
              setTransitioning(false);
              setStep(2);
            }}
            cssClasses="w-full"
            disabled={!step1Valid || transitioning}
          >
            {transitioning ? <div className="spinner" /> : "Next"}
          </ButtonType>
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
                  if (executeRecaptcha) {
                    const token = await executeRecaptcha("register");
                    await verifyAuthRecaptcha(token);
                  }
                  const credential = await createUserWithEmailAndPassword(
                    auth,
                    values.email,
                    values.password,
                  );
                  await updateProfile(credential.user, {
                    displayName: values.name,
                  });
                  const idToken = await credential.user.getIdToken();
                  await createSession(idToken);
                  router.push("/dashboard");
                } catch (err) {
                  const message = err instanceof Error ? err.message : "";
                  if (message.includes("reCAPTCHA")) {
                    setError("Security check failed. Please try again.");
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
              onClick={() => setStep(1)}
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
