import InfoCard from "@/_components/ui/cards/info-card";
import generalData from "@/_data/general-data.json";

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-10 px-5 py-10">
      <h2>Dashboard</h2>
      <main className="flex flex-col gap-10">
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
