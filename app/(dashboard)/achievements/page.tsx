import { Trophy } from "lucide-react";
import PastHuntCard from "@/_components/ui/cards/achievements/past-hunt-card";
import { getPastHunts } from "@/_actions/achievements-actions";

const AchievementsPage = async () => {
  const pastHunts = await getPastHunts();

  return (
    <div className="flex flex-col gap-10 px-5 pt-10">
      <div className="flex gap-[10px] items-center">
        <Trophy size={32} color="#1D1D1D" className="shrink-0" />
        <h1 className="text-[28px] min-[375px]:text-heading">Achievements</h1>
      </div>

      <div className="flex flex-col gap-5">
        {!pastHunts || pastHunts.length === 0 ? (
          <p>No past hunts yet.</p>
        ) : (
          pastHunts.map((hunt) => (
            <PastHuntCard
              key={hunt.deadline}
              deadline={hunt.deadline}
              completed={hunt.completed}
              noOfHunters={hunt.noOfHunters}
              winner={hunt.winner}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;
