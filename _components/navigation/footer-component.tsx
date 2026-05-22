import Link from "next/link";
import Image from "next/image";
import navData from "@/_data/nav-data.json";

const FooterComponent = () => {
  return (
    <footer className="bg-[BACKGROUND] w-full mt-15">
      <div className="px-7 pt-15 pb-7 flex flex-col gap-5 tablet:max-w-[1280px] tablet:mx-auto tablet:px-15 tablet:pb-5">
        <div className="flex flex-col gap-10 items-center tablet:flex-row tablet:justify-between tablet:items-start tablet:gap-0">
          <nav className="hidden tablet:block">
            <ul className="grid">
              {navData.map(({ title, url }, id) => {
                return (
                  <li key={id}>
                    <Link
                      href={url}
                      className="text-[14px] font-light desktop:hover:text-[PRIMARY]"
                    >
                      {title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="flex flex-col gap-5 items-center tablet:items-end">
            <Link
              href="/"
              className="flex flex-col gap-3 items-center w-[250px] tablet:w-auto tablet:flex-row tablet:items-start"
            >
              <Image
                src=""
                alt=""
                width={118}
                height={101}
                className="tablet:h-[34px] tablet:w-auto tablet:-translate-y-1.5"
              />
              <h1 className="text-[40px] font-semibold flex flex-col items-center gap-2 text-center tablet:text-[24px] tablet:text-right tablet:items-end tablet:gap-1">
                Treasure Hunt App
              </h1>
            </Link>
            <hr className="border-black/25 w-[125px] tablet:hidden" />
            <p className="text-paragraph text-center flex flex-col gap-1 tablet:text-right tablet:text-[14px]">
              Designed &amp; developed by
              <Link
                href="https://thewrightdesigns.co.za"
                className="hover:opacity-80"
                target="_blank"
                rel="noopener noreferrer"
              >
                The Wright Designs
              </Link>
            </p>
          </div>
        </div>
        <p className="text-paragraph text-center w-full flex flex-col gap-1 items-center tablet:flex-row tablet:text-[14px] tablet:justify-center">
          © {new Date().getFullYear()} Treasure Hunt App
          <span className="hidden tablet:block">|</span>
          <Link href="/" className="hover:opacity-80">
            www.clientdomain.co.za
          </Link>
        </p>
      </div>
    </footer>
  );
};

export default FooterComponent;
