"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, X } from "lucide-react";
import TextInput from "@/_components/ui/inputs/text-input";
import NumberInput from "@/_components/ui/inputs/number-input";
import ButtonType from "@/_components/ui/buttons/button-type";
import logo from "@/public/logo/treasure-hunt-app-logo.png";

const RegisterComponent = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

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
                value={values.name}
                onChange={handleChange}
              />
              <NumberInput
                label="Phone number"
                name="phone"
                placeholder="Phone number"
                required
                value={values.phone}
                onChange={handleChange}
              />
              <TextInput
                label="Email"
                name="email"
                type="email"
                placeholder="Email"
                required
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
              </div>
              <TextInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                required
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
            onClick={() => setStep(2)}
            cssClasses="w-full"
            disabled={!step1Valid}
          >
            Next
          </ButtonType>
        ) : (
          <>
            <ButtonType
              type="button"
              cssClasses="w-full"
              disabled={
                !allRulesMet || values.password !== values.confirmPassword
              }
              onClick={() => {
                if (values.password !== values.confirmPassword) {
                  setPasswordError("Passwords do not match");
                  return;
                }
              }}
            >
              Register
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
        )}
        <p className="text-[12px]">
          Already a member? <Link href="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterComponent;
