interface Props {
  body: string;
}

const SafetyTipCard = ({ body }: Props) => {
  return (
    <div className="bg-teal p-5 rounded-[6px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)]">
      <p className="text-white">{body}</p>
    </div>
  );
};

export default SafetyTipCard;
