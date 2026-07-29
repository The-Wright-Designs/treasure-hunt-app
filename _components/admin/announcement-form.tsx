"use client";

import { useState, useActionState } from "react";
import TextInput from "@/_components/ui/inputs/text-input";
import ButtonType from "@/_components/ui/buttons/button-type";
import { createAnnouncement } from "@/_actions/announcement-actions";

const AnnouncementForm = () => {
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [state, formAction] = useActionState(createAnnouncement, {
    success: false,
  });

  const canSubmit = heading.trim() !== "" && body.trim() !== "";

  const resetForm = () => {
    setHeading("");
    setBody("");
    setDismissed(true);
    setFormKey((prev) => prev + 1);
  };

  if (state.success && !dismissed) {
    return (
      <div className="flex flex-col gap-5 items-start px-5 py-7 bg-orange/50 rounded-[6px]">
        <p className="text-subheading text-[20px]">
          Announcement published. It is live on the dashboard now.
        </p>

        <ButtonType
          type="button"
          colorTeal
          onClick={resetForm}
          cssClasses="desktop:hover:cursor-pointer"
        >
          Add another announcement
        </ButtonType>
      </div>
    );
  }

  return (
    <form
      key={formKey}
      action={(formData) => {
        setDismissed(false);
        formAction(formData);
      }}
      className="flex flex-col gap-5"
    >
      <TextInput
        label="Heading"
        name="heading"
        required
        placeholder="Suspicious vehicle in the area"
        value={heading}
        onChange={(e) => setHeading(e.target.value)}
      />

      <div className="flex flex-col gap-[6px] w-full">
        <label htmlFor="body" className="text-paragraph">
          Body *
        </label>
        <textarea
          id="body"
          name="body"
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What do people need to know?"
          className="bg-white border border-black/50 rounded-[6px] px-3 py-2 w-full placeholder:text-black/25 outline-none"
        />
      </div>

      {state.error && <p className="text-error text-[12px]">{state.error}</p>}

      <ButtonType
        colorTeal
        disabled={!canSubmit}
        cssClasses="mt-5 desktop:hover:cursor-pointer"
      >
        Publish announcement
      </ButtonType>
    </form>
  );
};

export default AnnouncementForm;
