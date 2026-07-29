"use client";

import { useState, useEffect, useActionState } from "react";
import classNames from "classnames";
import { AnnouncementView } from "@/_types/announcement-types";
import { formatDeadlineLabel } from "@/_lib/utils/format-deadline";
import TextInput from "@/_components/ui/inputs/text-input";
import ButtonType from "@/_components/ui/buttons/button-type";
import {
  updateAnnouncement,
  deleteAnnouncement,
} from "@/_actions/announcement-actions";

interface Props {
  announcements: AnnouncementView[];
  cssClasses?: string;
}

const DeleteForm = ({ announcementId }: { announcementId: string }) => {
  const [state, formAction] = useActionState(
    async () => deleteAnnouncement(announcementId),
    { success: false } as { success: boolean; error?: string },
  );

  return (
    <form action={formAction} className="flex flex-col gap-1.5 items-start">
      {state.error && <p className="text-error text-[12px]">{state.error}</p>}

      <ButtonType colorGrey cssClasses="desktop:hover:cursor-pointer">
        Delete
      </ButtonType>
    </form>
  );
};

const EditForm = ({
  announcement,
  onDone,
}: {
  announcement: AnnouncementView;
  onDone: () => void;
}) => {
  const [state, formAction] = useActionState(updateAnnouncement, {
    success: false,
  });

  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={announcement.id} />

      <TextInput
        label="Heading"
        name="heading"
        required
        defaultValue={announcement.heading}
      />

      <div className="flex flex-col gap-[6px] w-full">
        <label htmlFor={`body-${announcement.id}`} className="text-paragraph">
          Body *
        </label>
        <textarea
          id={`body-${announcement.id}`}
          name="body"
          rows={5}
          defaultValue={announcement.body}
          className="bg-white border border-black/50 rounded-[6px] px-3 py-2 w-full placeholder:text-black/25 outline-none"
        />
      </div>

      {state.error && <p className="text-error text-[12px]">{state.error}</p>}

      <div className="flex gap-2 items-center">
        <ButtonType colorTeal cssClasses="desktop:hover:cursor-pointer">
          Save
        </ButtonType>

        <ButtonType
          type="button"
          colorGrey
          onClick={onDone}
          cssClasses="desktop:hover:cursor-pointer"
        >
          Cancel
        </ButtonType>
      </div>
    </form>
  );
};

const AnnouncementList = ({ announcements, cssClasses }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className={classNames("flex flex-col gap-5", cssClasses)}>
      <h3>Published Announcements</h3>

      {announcements.length === 0 ? (
        <p>No announcements yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {announcements.map((announcement) => (
            <li
              key={announcement.id}
              className="flex flex-col gap-1.5 border border-black/50 rounded-[6px] px-3 py-2"
            >
              {editingId === announcement.id ? (
                <EditForm
                  announcement={announcement}
                  onDone={() => setEditingId(null)}
                />
              ) : (
                <>
                  <p className="text-subheading">{announcement.heading}</p>
                  <p>{announcement.body}</p>
                  <p className="text-[12px]">
                    Added {formatDeadlineLabel(announcement.createdAt)}
                  </p>

                  <div className="flex gap-2 items-start mt-1.5">
                    <ButtonType
                      type="button"
                      colorTeal
                      onClick={() => setEditingId(announcement.id)}
                      cssClasses="desktop:hover:cursor-pointer"
                    >
                      Edit
                    </ButtonType>

                    <DeleteForm announcementId={announcement.id} />
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AnnouncementList;
