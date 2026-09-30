"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  grantParentalConsent,
  declineParentalConsent,
} from "@/_actions/consent-actions";
import TextInput from "@/_components/ui/inputs/text-input";
import ButtonType from "@/_components/ui/buttons/button-type";

interface ConsentFormProps {
  token: string;
  teenName: string;
}

const ConsentForm = ({ token, teenName }: ConsentFormProps) => {
  const [grantState, grantAction] = useActionState(grantParentalConsent, {
    success: false,
  });
  const [declineState, declineAction] = useActionState(declineParentalConsent, {
    success: false,
  });

  if (grantState.success) {
    return (
      <div className="flex flex-col gap-3">
        <h2>Thank you</h2>
        <p>
          Consent has been recorded. {teenName} can now take part in the
          treasure hunt. Remember that a winner must collect their prize in
          person with you, and you&apos;ll need to bring your ID.
        </p>
      </div>
    );
  }

  if (declineState.success) {
    return (
      <div className="flex flex-col gap-3">
        <h2>Consent declined</h2>
        <p>
          {teenName}&apos;s account and all of its details have been deleted.
        </p>
      </div>
    );
  }

  const checkboxes = [
    {
      name: "isGuardian",
      label: `I am the parent or legal guardian of ${teenName}`,
    },
    {
      name: "privacy",
      label: "I consent to the processing of my child's and my personal information as described in the Privacy Policy",
    },
    {
      name: "terms",
      label: "I have read and agree to the Terms & Conditions",
    },
    {
      name: "prize",
      label: "I understand that if my child wins, I must collect the prize with them in person and show my ID",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <form action={grantAction} className="flex flex-col gap-5">
        <input type="hidden" name="token" value={token} />
        <p>
          Please read the <Link href="/privacy" target="_blank">Privacy Policy</Link>{" "}
          and <Link href="/terms" target="_blank">Terms &amp; Conditions</Link>{" "}
          before continuing.
        </p>
        <div className="flex flex-col gap-3">
          {checkboxes.map(({ name, label }) => (
            <label key={name} className="flex gap-3 items-start">
              <input
                type="checkbox"
                name={name}
                required
                className="mt-1 shrink-0 accent-orange desktop:hover:cursor-pointer"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <TextInput
          label="Type your full name as your signature"
          name="signedName"
          placeholder="Full name"
          required
          autoComplete="name"
        />
        <ButtonType type="submit" colorOrange cssClasses="w-full">
          Give consent
        </ButtonType>
        {grantState.error && (
          <p className="text-error text-[12px] text-center">{grantState.error}</p>
        )}
      </form>

      <form
        action={declineAction}
        className="flex flex-col gap-3 pt-5 border-t border-black/25"
      >
        <input type="hidden" name="token" value={token} />
        <p>
          If you don&apos;t want {teenName} to take part, decline below. Their
          account and details will be deleted straight away.
        </p>
        <ButtonType type="submit" colorGrey secondary cssClasses="w-full">
          Decline and delete account
        </ButtonType>
        {declineState.error && (
          <p className="text-error text-[12px] text-center">{declineState.error}</p>
        )}
      </form>
    </div>
  );
};

export default ConsentForm;
