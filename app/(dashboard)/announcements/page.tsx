import { Megaphone } from "lucide-react";
import AnnouncementsCard from "@/_components/ui/cards/announcements/announcements-card";
import data from "@/_data/general-data.json";

const { announcements } = data;

const AnnouncementsPage = () => {
  return (
    <div className="flex flex-col gap-10 px-5 pt-10">
      <div className="flex gap-[10px] items-center">
        <Megaphone size={32} color="#1D1D1D" className="shrink-0" />
        <h1 className="text-[28px] min-[375px]:text-heading">Announcements</h1>
      </div>

      <div className="flex flex-col gap-5">
        {announcements.map((announcement) => (
          <AnnouncementsCard
            key={announcement.heading}
            heading={announcement.heading}
            body={announcement.body}
          />
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
