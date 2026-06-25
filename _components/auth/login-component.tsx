"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/_lib/firebase-client";
import { createSession, verifyAuthRecaptcha } from "@/_actions/auth-actions";
import TextInput from "@/_components/ui/inputs/text-input";
import ButtonType from "@/_components/ui/buttons/button-type";
import logo from "@/public/logo/treasure-hunt-app-logo.png";

const LoginComponent = () => {
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [error, setError] = useState("");
  const [values, setValues] = useState({ email: "", password: "" });
  const [view, setView] = useState<"login" | "forgot">("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (formData: FormData) => {
    setError("");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      if (executeRecaptcha) {
        const token = await executeRecaptcha("login");
        await verifyAuthRecaptcha(token);
      }
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const idToken = await credential.user.getIdToken();
      await createSession(idToken);
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("reCAPTCHA")) {
        setError("Security check failed. Please try again.");
      } else if (
        message.includes("auth/user-not-found") ||
        message.includes("auth/wrong-password") ||
        message.includes("auth/invalid-credential")
      ) {
        setError("Invalid email or password.");
      } else if (message.includes("auth/too-many-requests")) {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  const handleResetSubmit = async (formData: FormData) => {
    setResetError("");
    setResetSuccess(false);
    const email = formData.get("resetEmail") as string;
    try {
      if (executeRecaptcha) {
        const token = await executeRecaptcha("forgot_password");
        await verifyAuthRecaptcha(token);
      }
      await sendPasswordResetEmail(auth, email);
      setResetSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("reCAPTCHA")) {
        setResetError("Security check failed. Please try again.");
      } else if (message.includes("auth/invalid-email")) {
        setResetError("Please enter a valid email address.");
      } else if (message.includes("auth/too-many-requests")) {
        setResetError("Too many attempts. Please try again later.");
      } else {
        setResetError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="bg-white flex flex-col gap-5 p-7 rounded-[6px] w-full max-w-[335px]">
      <div className="flex gap-10 items-center justify-between pb-5 border-b border-black/25">
        <h1 className="font-semibold text-[20px]">Treasure Hunt App</h1>
        <Image src={logo} alt="Treasure Hunt App logo" width={56} height={56} />
      </div>
      {view === "login" ? (
        <>
          <h2>Login</h2>
          <form
            action={handleSubmit}
            className="flex flex-col gap-5 items-center w-full"
          >
            <div className="flex flex-col gap-5 w-full">
              <TextInput
                label="Email"
                name="email"
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={values.email}
                onChange={handleChange}
              />
              <TextInput
                label="Password"
                name="password"
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                value={values.password}
                onChange={handleChange}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setError("");
                setResetEmail("");
                setResetError("");
                setResetSuccess(false);
                setView("forgot");
              }}
              className="text-[12px] text-link text-center desktop:hover:cursor-pointer"
            >
              Forgot password?
            </button>
            <ButtonType type="submit" cssClasses="w-full">
              Login
            </ButtonType>
            {error && (
              <p className="text-error text-[12px] text-center">{error}</p>
            )}
            <p className="text-[12px]">
              Not a member? <Link href="/register">Register here</Link>
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
          </form>
        </>
      ) : (
        <>
          <h2>Reset Password</h2>
          {resetSuccess ? (
            <div className="flex flex-col gap-5 items-center w-full">
              <p className="text-paragraph w-full">
                If an account exists for that email, a reset link has been sent.
                Check your inbox.
              </p>
              <ButtonType
                type="button"
                colorGrey
                secondary
                onClick={() => {
                  setView("login");
                  setResetEmail("");
                  setResetSuccess(false);
                }}
                cssClasses="w-full"
              >
                Back to login
              </ButtonType>
            </div>
          ) : (
            <form
              action={handleResetSubmit}
              className="flex flex-col gap-5 items-center w-full"
            >
              <TextInput
                label="Email"
                name="resetEmail"
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <ButtonType type="submit" cssClasses="w-full">
                Send reset link
              </ButtonType>
              {resetError && (
                <p className="text-error text-[12px] text-center">
                  {resetError}
                </p>
              )}
              <ButtonType
                type="button"
                colorGrey
                secondary
                onClick={() => {
                  setView("login");
                  setResetEmail("");
                  setResetError("");
                }}
                cssClasses="w-full"
              >
                Back
              </ButtonType>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default LoginComponent;
