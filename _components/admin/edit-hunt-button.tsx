"use client";

import { useCallback, useState } from "react";
import classNames from "classnames";
import ButtonType from "@/_components/ui/buttons/button-type";
import HuntForm from "@/_components/admin/hunt-form";
import { QueuedHuntView } from "@/_types/past-hunt-types";

interface Props {
  hunt: QueuedHuntView;
  cssClasses?: string;
}

const EditHuntButton = ({ hunt, cssClasses }: Props) => {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaved = useCallback(() => {
    setEditing(false);
    setSaved(true);
  }, []);

  return (
    <div
      className={classNames(
        "flex flex-col gap-1.5",
        { "w-full": editing },
        cssClasses,
      )}
    >
      {!editing && (
        <ButtonType
          type="button"
          colorOrange
          onClick={() => {
            setEditing(true);
            setSaved(false);
          }}
          cssClasses="self-start desktop:hover:cursor-pointer"
        >
          Edit
        </ButtonType>
      )}

      {saved && !editing && <p className="text-[12px]">Hunt updated.</p>}

      {editing && (
        <>
          <HuntForm hunt={hunt} onSaved={handleSaved} />

          <ButtonType
            type="button"
            colorGrey
            onClick={() => setEditing(false)}
            cssClasses="self-start mt-1.5 desktop:hover:cursor-pointer"
          >
            Cancel
          </ButtonType>
        </>
      )}
    </div>
  );
};

export default EditHuntButton;
