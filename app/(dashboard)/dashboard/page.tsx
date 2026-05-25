import InfoCard from "@/_components/ui/cards/active-hunt/info-card";
import HuntCard from "@/_components/ui/cards/active-hunt/hunt-card";
import generalData from "@/_data/general-data.json";

const { activeHunt } = generalData;
const { deadline: deadlineIso, prizeAmount, activeHunters } = activeHunt;

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-10 px-5 py-10">
      <h2>Dashboard</h2>
      <main className="flex flex-col gap-10">
        <HuntCard
          heading="Active hunt"
          buttonLink="#"
          buttonText="Join the hunt"
          deadline={deadlineIso}
          prizeAmount={prizeAmount}
          activeHunters={activeHunters}
        />
        <InfoCard
          heading="Announcements"
          icon="megaphone"
          buttonLink="#"
          buttonText="More announcements"
          backgroundColor="teal"
        >
          Trust your instincts - If a situation feels uncomfortable or unsafe,
          it's okay to remove yourself and seek help from a trusted adult.
        </InfoCard>
        <InfoCard
          heading="Safety Tips"
          icon="shield-check"
          buttonLink="#"
          buttonText="More safety tips"
          sliderData={generalData.safetyTips}
        />
      </main>
    </div>
  );
};

export default Dashboard;
