import { MessageCircleWarning } from "lucide-react";

interface Props {
  heading: string;
  body: string;
}

const AnnouncementsCard = ({ heading, body }: Props) => {
  return (
    <div className="flex flex-col gap-5 bg-teal p-5 rounded-[6px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)]">
      <div className="flex items-center gap-2">
        <MessageCircleWarning color="#FFFFFF" size={20} />
        <p className="text-white text-subheading font-bold">{heading}</p>
      </div>
      <p className="text-white">{body}</p>
    </div>
  );
};

export default AnnouncementsCard;
