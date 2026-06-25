import HeaderComponent from "@/_components/navigation/header/header-component";
import FooterComponent from "@/_components/navigation/footer-component";
import BodyWrapper from "@/_components/layout/body-wrapper";
import { ShareModalProvider } from "@/_context/share-modal-context";
import { HeaderMenuProvider } from "@/_context/header-menu-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HeaderMenuProvider>
      <ShareModalProvider>
        <HeaderComponent />
        <BodyWrapper>{children}</BodyWrapper>
        <FooterComponent />
      </ShareModalProvider>
    </HeaderMenuProvider>
  );
}
