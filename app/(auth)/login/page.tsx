import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/_lib/firebase-admin";
import LoginComponent from "@/_components/auth/login-component";

const LoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ emailChanged?: string }>;
}) => {
  const { emailChanged } = await searchParams;
  const session = (await cookies()).get("session")?.value;
  if (session) {
    let sessionValid = false;
    try {
      await adminAuth.verifySessionCookie(session, true);
      sessionValid = true;
    } catch (error) {
      console.error("Session verification failed:", error);
    }
    if (sessionValid) redirect("/dashboard");
  }

  return (
    <main className="flex items-center justify-center p-10">
      <LoginComponent
        notice={
          emailChanged
            ? "Your email has been updated. Please log in with your new email address."
            : undefined
        }
      />
    </main>
  );
};

export default LoginPage;
