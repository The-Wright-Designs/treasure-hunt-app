import { CircleUser } from "lucide-react";
import DeleteAccount from "@/_components/ui/delete-account";
import ProfileForm from "@/_components/ui/profile-form";
import { getProfile } from "@/_actions/profile-actions";

const ProfilePage = async () => {
  const profile = await getProfile();

  return (
    <div className="flex flex-col gap-10 px-5 pt-10">
      <div className="flex gap-[10px] items-center">
        <CircleUser size={32} color="#1D1D1D" className="shrink-0" />
        <h1>Profile</h1>
      </div>

      <div className="flex flex-col gap-10">
        <ProfileForm
          name={profile?.name ?? ""}
          phone={profile?.phone ?? ""}
          email={profile?.email ?? ""}
        />

        <hr className="border-black/25" />

        <div className="flex flex-col gap-5">
          <h2>Account</h2>
          <DeleteAccount />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
