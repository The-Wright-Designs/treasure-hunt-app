import { Trophy } from "lucide-react";
import PastHuntCard from "@/_components/ui/cards/achievements/past-hunt-card";
import data from "@/_data/general-data.json";

const { pastHunts } = data;

const AchievementsPage = () => {
  return (
    <div className="flex flex-col gap-10 px-5 pt-10">
      <div className="flex gap-[10px] items-center">
        <Trophy size={32} color="#1D1D1D" className="shrink-0" />
        <h1 className="text-[28px] min-[375px]:text-heading">Achievements</h1>
      </div>

      <div className="flex flex-col gap-5">
        {pastHunts.map((hunt) => (
          <PastHuntCard
            key={hunt.date}
            date={hunt.date}
            completed={hunt.completed}
            noOfHunters={hunt.noOfHunters}
            winner={"winner" in hunt && hunt.winner}
          />
        ))}
      </div>
    </div>
  );
};

export default AchievementsPage;
