import { ShieldPlus, Megaphone } from "lucide-react";
import HuntForm from "@/_components/admin/hunt-form";
import HuntQueue from "@/_components/admin/hunt-queue";
import ActiveHuntSummary from "@/_components/admin/active-hunt-summary";
import HuntAttentionList from "@/_components/admin/hunt-attention-list";
import AnnouncementForm from "@/_components/admin/announcement-form";
import AnnouncementList from "@/_components/admin/announcement-list";
import {
  getQueuedHunts,
  getActiveHuntAdmin,
  getClosedHuntsNeedingAttention,
} from "@/_actions/admin-actions";
import { getAnnouncements } from "@/_actions/announcement-actions";

const AdminPage = async () => {
  const [queuedHunts, activeHunt, huntsNeedingAttention, announcements] =
    await Promise.all([
      getQueuedHunts(),
      getActiveHuntAdmin(),
      getClosedHuntsNeedingAttention(),
      getAnnouncements(),
    ]);

  return (
    <div className="flex flex-col gap-10 px-5 pt-10">
      <div className="flex gap-[10px] items-center">
        <ShieldPlus size={32} color="#1D1D1D" className="shrink-0" />
        <h2>New Hunt</h2>
      </div>

      <p>
        Create the next hunt here. It stays hidden until the start date, when it
        goes live automatically at 07:00 on the Monday morning.
      </p>

      <HuntForm />

      <HuntAttentionList hunts={huntsNeedingAttention} />

      <ActiveHuntSummary hunt={activeHunt} />

      <HuntQueue hunts={queuedHunts} />

      <div className="flex gap-[10px] items-center">
        <Megaphone size={32} color="#1D1D1D" className="shrink-0" />
        <h2>Announcements</h2>
      </div>

      <p>
        Add, edit or remove the announcements shown on the dashboard and the
        announcements page. The newest one appears on the dashboard card.
      </p>

      <AnnouncementForm />

      <AnnouncementList announcements={announcements} />
    </div>
  );
};

export default AdminPage;
