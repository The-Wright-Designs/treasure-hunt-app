"use client";

import { useState } from "react";
import ButtonType from "@/_components/ui/buttons/button-type";
import { deleteAccount } from "@/_actions/auth-actions";

const DeleteAccount = () => {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <ButtonType colorOrange cssClasses="w-full" type="button" onClick={() => setConfirming(true)}>
        Delete account
      </ButtonType>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-error">Are you sure? Your account will be disabled and you will be logged out.</p>
      <form action={deleteAccount}>
        <ButtonType colorOrange cssClasses="w-full">
          Confirm delete
        </ButtonType>
      </form>
      <ButtonType colorGrey cssClasses="w-full" type="button" onClick={() => setConfirming(false)}>
        Cancel
      </ButtonType>
    </div>
  );
};

export default DeleteAccount;
