"use client";

import { useCallback, useState } from "react";
import classNames from "classnames";
import ButtonType from "@/_components/ui/buttons/button-type";
import EditCluesForm from "@/_components/admin/edit-clues-form";

interface Props {
  clues: string[];
  huntId?: string;
  cssClasses?: string;
}

const ViewCluesButton = ({ clues, huntId, cssClasses }: Props) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaved = useCallback(() => {
    setEditing(false);
    setOpen(false);
    setSaved(true);
  }, []);

  if (clues.length === 0) return null;

  return (
    <div
      className={classNames(
        "flex flex-col gap-1.5 items-start",
        { "w-full": open },
        cssClasses,
      )}
    >
      <div className="flex gap-2 items-center">
        <ButtonType
          type="button"
          colorTeal
          onClick={() => {
            setOpen(!open);
            setEditing(false);
            setSaved(false);
          }}
          cssClasses="desktop:hover:cursor-pointer"
        >
          {open ? "Hide clues" : "View clues"}
        </ButtonType>

        {huntId && !editing && (
          <ButtonType
            type="button"
            colorOrange
            onClick={() => {
              setOpen(true);
              setEditing(true);
              setSaved(false);
            }}
            cssClasses="desktop:hover:cursor-pointer"
          >
            Edit
          </ButtonType>
        )}
      </div>

      {saved && !editing && <p className="text-[12px]">Clues updated.</p>}

      {open && !editing && (
        <ul className="flex flex-col gap-1 list-disc pl-5">
          {clues.map((clue, index) => (
            <li key={index}>
              <p>{clue}</p>
            </li>
          ))}
        </ul>
      )}

      {open && editing && huntId && (
        <EditCluesForm
          huntId={huntId}
          clues={clues}
          onClose={() => setEditing(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default ViewCluesButton;
