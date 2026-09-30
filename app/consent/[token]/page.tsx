import type { Metadata } from "next";
import Image from "next/image";
import { getConsentRequest } from "@/_actions/consent-actions";
import ConsentForm from "@/_components/auth/consent-form";
import logo from "@/public/logo/treasure-hunt-app-logo.png";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Parental consent | Treasure Hunt App",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const ConsentPage = async ({
  params,
}: {
  params: Promise<{ token: string }>;
}) => {
  const { token } = await params;
  const request = await getConsentRequest(token);

  return (
    <main className="flex items-center justify-center p-5 phone:p-10">
      <div className="bg-white flex flex-col gap-5 p-7 rounded-[6px] w-full max-w-[560px]">
        <div className="flex gap-10 items-center justify-between pb-5 border-b border-black/25">
          <h1 className="font-semibold text-[20px]">Treasure Hunt App</h1>
          <Image src={logo} alt="Treasure Hunt App logo" width={56} height={56} />
        </div>
        {request ? (
          <>
            <h2>Parental consent</h2>
            <p>
              Hi {request.parentName}. {request.teenName} has registered for
              the Treasure Hunt App, a weekly real-world treasure hunt in
              Plettenberg Bay where players who find a hidden item go into a
              draw for a cash prize. They named you as their{" "}
              {request.relationship.toLowerCase()}.
            </p>
            <div className="flex flex-col gap-2">
              <h3>What we collect</h3>
              <ul className="list-disc flex flex-col gap-1 pl-5">
                <li>
                  <p>
                    Your child&apos;s name, phone number, email, date of birth,
                    and optionally school and home address
                  </p>
                </li>
                <li>
                  <p>Your name, email, phone number and relationship to them</p>
                </li>
                <li>
                  <p>
                    Which hunts they join and complete. Their location is
                    checked when they enter a code, but not stored
                  </p>
                </li>
                <li>
                  <p>A random device identifier used to prevent cheating</p>
                </li>
              </ul>
              <p>
                If your child wins, the organiser will contact you both to
                arrange collection of the prize in person. You can withdraw
                consent and have the account deleted at any time.
              </p>
            </div>
            <ConsentForm token={token} teenName={request.teenName} />
          </>
        ) : (
          <>
            <h2>Link expired</h2>
            <p>
              This consent link has expired or has already been used. Ask your
              teen to log in to the app and tap &quot;Resend email&quot; to
              get a new link.
            </p>
          </>
        )}
      </div>
    </main>
  );
};

export default ConsentPage;
