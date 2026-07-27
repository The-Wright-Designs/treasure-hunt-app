import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/_lib/firebase-admin";
import HeaderComponent from "@/_components/navigation/header/header-component";
import FooterComponent from "@/_components/navigation/footer-component";
import BodyWrapper from "@/_components/layout/body-wrapper";
import { ShareModalProvider } from "@/_context/share-modal-context";
import { HeaderMenuProvider } from "@/_context/header-menu-context";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = (await cookies()).get("session")?.value;
  if (!session) redirect("/login");

  let admin = false;

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    admin = decoded.admin === true;
  } catch (error) {
    console.error("Session verification failed:", error);
    redirect("/login");
  }

  if (!admin) redirect("/dashboard");

  return (
    <HeaderMenuProvider>
      <ShareModalProvider>
        <HeaderComponent isAdmin={admin} />
        <BodyWrapper>{children}</BodyWrapper>
        <FooterComponent />
      </ShareModalProvider>
    </HeaderMenuProvider>
  );
}
