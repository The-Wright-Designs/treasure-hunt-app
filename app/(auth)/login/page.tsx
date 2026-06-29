import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/_lib/firebase-admin";
import LoginComponent from "@/_components/auth/login-component";

const LoginPage = async () => {
  const session = (await cookies()).get("session")?.value;
  if (session) {
    let sessionValid = false;
    try {
      await adminAuth.verifySessionCookie(session);
      sessionValid = true;
    } catch (error) {
      console.error("Session verification failed:", error);
    }
    if (sessionValid) redirect("/dashboard");
  }

  return (
    <main className="flex items-center justify-center p-10">
      <LoginComponent />
    </main>
  );
};

export default LoginPage;
