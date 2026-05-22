import Image from "next/image";
import Link from "next/link";
import TextInput from "@/_components/ui/inputs/text-input";
import ButtonType from "@/_components/ui/buttons/button-type";
import logo from "@/public/logo/treasure-hunt-app-logo.png";

const LoginComponent = () => {
  return (
    <div className="bg-white flex flex-col gap-5 p-7 rounded-[6px] w-full max-w-[335px]">
      <div className="flex gap-10 items-center justify-between pb-5 border-b border-black/25">
        <h1 className="font-semibold text-[20px]">Treasure Hunt App</h1>
        <Image src={logo} alt="Treasure Hunt App logo" width={56} height={56} />
      </div>
      <h2>Login</h2>
      <div className="flex flex-col gap-5 items-center w-full">
        <div className="flex flex-col gap-5 w-full">
          <TextInput
            label="Email"
            name="email"
            type="email"
            placeholder="Email"
          />
          <TextInput
            label="Password"
            name="password"
            type="password"
            placeholder="Password"
          />
        </div>
        <ButtonType type="submit" cssClasses="w-full">
          Login
        </ButtonType>
        <p className="text-[12px]">
          Not a member? <Link href="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginComponent;
