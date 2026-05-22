import HeaderDesktop from "./desktop/header-desktop";
import { HeaderMobile } from "./mobile/header-mobile";

const HeaderComponent = () => {
  return (
    <header className="top-0 sticky z-20 bg-[BACKGROUND] px-7 py-5 border-b-4 border-[PRIMARY]">
      <HeaderDesktop cssClasses="hidden desktop:flex px-15 max-w-[1280px] mx-auto" />
      <HeaderMobile cssClasses="desktop:hidden" />
    </header>
  );
};

export default HeaderComponent;
