import { CircleUser } from "lucide-react";
import TextInput from "@/_components/ui/inputs/text-input";
import ButtonType from "@/_components/ui/buttons/button-type";

const ProfilePage = () => {
  return (
    <div className="flex flex-col gap-10 px-5 pt-10">
      <div className="flex gap-[10px] items-center">
        <CircleUser size={32} color="#1D1D1D" className="shrink-0" />
        <h1>Profile</h1>
      </div>

      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-5">
          <TextInput label="Name" name="name" value="John Doe" disabled />
          <TextInput label="Phone number" name="phone" value="08212345678" />
          <TextInput
            label="Email"
            name="email"
            type="email"
            value="john@doe.co.za"
          />
          <ButtonType colorGrey cssClasses="mt-5">
            Save
          </ButtonType>
        </div>

        <hr className="border-black/25" />

        <div className="flex flex-col gap-5">
          <h2>Account</h2>
          <ButtonType colorOrange>Delete account</ButtonType>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
