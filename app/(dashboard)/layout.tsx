import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/_lib/firebase-admin";
import HeaderComponent from "@/_components/navigation/header/header-component";
import FooterComponent from "@/_components/navigation/footer-component";
import BodyWrapper from "@/_components/layout/body-wrapper";
import VerifyEmailBanner from "@/_components/auth/verify-email-banner";
import PageWrapper from "@/_lib/utils/page-wrapper";
import { ShareModalProvider } from "@/_context/share-modal-context";
import { HeaderMenuProvider } from "@/_context/header-menu-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = (await cookies()).get("session")?.value;
  if (!session) redirect("/login");

  let isAdmin = false;
  let emailVerified = true;

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    isAdmin = decoded.admin === true;
    emailVerified = decoded.email_verified === true;
  } catch (error) {
    console.error("Session verification failed:", error);
    redirect("/login");
  }
  return (
    <HeaderMenuProvider>
      <ShareModalProvider>
        <HeaderComponent isAdmin={isAdmin} />
        <BodyWrapper>
          {!emailVerified && (
            <PageWrapper cssClasses="pt-5">
              <VerifyEmailBanner />
            </PageWrapper>
          )}
          {children}
        </BodyWrapper>
        <FooterComponent />
      </ShareModalProvider>
    </HeaderMenuProvider>
  );
}
