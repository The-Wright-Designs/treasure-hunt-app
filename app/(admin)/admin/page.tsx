import { ShieldPlus } from "lucide-react";
import HuntForm from "@/_components/admin/hunt-form";
import HuntQueue from "@/_components/admin/hunt-queue";
import ActiveHuntSummary from "@/_components/admin/active-hunt-summary";
import { getQueuedHunts, getActiveHuntAdmin } from "@/_actions/admin-actions";

const AdminPage = async () => {
  const [queuedHunts, activeHunt] = await Promise.all([
    getQueuedHunts(),
    getActiveHuntAdmin(),
  ]);

  return (
    <div className="flex flex-col gap-10 px-5 pt-10">
      <div className="flex gap-[10px] items-center">
        <ShieldPlus size={32} color="#1D1D1D" className="shrink-0" />
        <h1>New Hunt</h1>
      </div>

      <p>
        Create the next hunt here. It stays hidden until the start date, when it
        goes live automatically at 07:00 on the Monday morning.
      </p>

      <HuntForm />

      <ActiveHuntSummary hunt={activeHunt} />

      <HuntQueue hunts={queuedHunts} />
    </div>
  );
};

export default AdminPage;
