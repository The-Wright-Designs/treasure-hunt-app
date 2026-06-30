import InfoCard from "@/_components/ui/cards/info-card";
import HuntCard from "@/_components/ui/cards/active-hunt/hunt-card";
import generalData from "@/_data/general-data.json";
import { getActiveHunt } from "@/_actions/active-hunt-actions";

const Dashboard = async () => {
  const activeHunt = await getActiveHunt();

  return (
    <div className="flex flex-col gap-10 px-5 pt-10">
      <h2>Dashboard</h2>
      <main className="flex flex-col gap-10">
        {activeHunt && (
          <HuntCard
            heading="Active hunt"
            buttonLink="/active-hunt"
            buttonText="Join the hunt"
            deadline={activeHunt.deadline}
            prizeAmount={activeHunt.prizeAmount}
            activeHunters={activeHunt.activeHunters}
          />
        )}
        <InfoCard
          heading="Announcements"
          icon="megaphone"
          buttonLink="/announcements"
          buttonText="More announcements"
          backgroundColor="teal"
        >
          Trust your instincts - If a situation feels uncomfortable or unsafe,
          it's okay to remove yourself and seek help from a trusted adult.
        </InfoCard>
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
