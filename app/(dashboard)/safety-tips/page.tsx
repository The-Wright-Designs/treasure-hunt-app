import { ShieldCheck } from "lucide-react";
import SafetyTipCard from "@/_components/ui/cards/safety-tips/safety-tip-card";
import data from "@/_data/general-data.json";

const { safetyTips } = data;

const SafetyTipsPage = () => {
  return (
    <div className="flex flex-col gap-10 px-5 py-10">
      <div className="flex gap-[10px] items-center">
        <ShieldCheck size={32} color="#1D1D1D" />
        <h1>Safety Tips</h1>
      </div>

      <div className="flex flex-col gap-5">
        {safetyTips.map((tip, index) => (
          <SafetyTipCard key={index} body={tip} />
        ))}
      </div>
    </div>
  );
};

export default SafetyTipsPage;
