import InfoCard from "@/_components/ui/cards/info-card";
import HuntCard from "@/_components/ui/cards/active-hunt/hunt-card";
import generalData from "@/_data/general-data.json";
import { getActiveHunt } from "@/_actions/active-hunt-actions";
import { getAnnouncements } from "@/_actions/announcement-actions";

const Dashboard = async () => {
  const [activeHunt, announcements] = await Promise.all([
    getActiveHunt(),
    getAnnouncements(),
  ]);

  const latestAnnouncement = announcements[0];

  return (
    <div className="flex flex-col gap-10 px-5 pt-10">
      <h2>Dashboard</h2>
      <main className="flex flex-col gap-10">
        {activeHunt && (
          <HuntCard
            heading="Active hunt"
            buttonLink="/active-hunt"
            buttonText={activeHunt.joined ? "View Hunt" : "Join the hunt"}
            deadline={activeHunt.deadline}
            prizeAmount={activeHunt.prizeAmount}
            activeHunters={activeHunt.activeHunters}
          />
        )}
        {latestAnnouncement && (
          <InfoCard
            heading="Announcements"
            icon="megaphone"
            buttonLink="/announcements"
            buttonText="More announcements"
            backgroundColor="teal"
          >
            {latestAnnouncement.body}
          </InfoCard>
        )}
        <InfoCard
          heading="Safety Tips"
          icon="shield-check"
          buttonLink="/safety-tips"
          buttonText="More safety tips"
          sliderData={generalData.safetyTips}
        />
      </main>
    </div>
  );
};

export default Dashboard;
