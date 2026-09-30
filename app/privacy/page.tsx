import type { Metadata } from "next";
import Link from "next/link";
import PageWrapper from "@/_lib/utils/page-wrapper";
import { LEGAL_UPDATED } from "@/_lib/utils/legal-version";

export const metadata: Metadata = {
  title: "Privacy Policy | Treasure Hunt App",
};

const PrivacyPage = () => {
  return (
    <PageWrapper cssClasses="py-10">
      <div className="flex flex-col gap-8 max-w-[800px]">
        <div className="flex flex-col gap-3">
          <h1>Privacy Policy</h1>
          <p>Last updated: {LEGAL_UPDATED}</p>
          <p>
            This policy explains what personal information the Treasure Hunt
            App collects, why, who it is shared with and what your rights are
            under the Protection of Personal Information Act, 2013 (POPIA). It
            is written for players and for their parents or guardians.
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-[20px]">1. Who we are</h2>
          <p>
            The Treasure Hunt App is run by [PLACEHOLDER: organiser&apos;s full
            legal name] (&quot;the organiser&quot;, &quot;we&quot;,
            &quot;us&quot;), who is the responsible party for your personal
            information. Our Information Officer is [PLACEHOLDER: Information
            Officer name], contactable at [PLACEHOLDER: email address] or
            [PLACEHOLDER: phone number].
          </p>
          <p>
            The app is built and maintained on our behalf by The Wright Designs,
            which acts as an operator and only processes information on our
            instructions. The hunt is sponsored by SMHART Security and Plett
            Security.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[20px]">2. Who the app is for</h2>
          <p>
            The app is for teens aged 13 to 18 in Plettenberg Bay. Because most
            players are children under POPIA, a player under 18 cannot take
            part in any hunt until a parent or legal guardian has given
            consent by following the link we email to them. If consent is not
            given within 7 days, the account is deleted. Players aged 18
            consent for themselves.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[20px]">3. What we collect</h2>
          <h3>From the player at sign-up</h3>
          <ul className="list-disc flex flex-col gap-1 pl-5">
            <li>
              <p>Name, mobile number, email address and date of birth</p>
            </li>
            <li>
              <p>Optionally, school and home address</p>
            </li>
            <li>
              <p>A password, which is held by our authentication provider and never seen by us</p>
            </li>
          </ul>
          <h3>About the parent or guardian</h3>
          <ul className="list-disc flex flex-col gap-1 pl-5">
            <li>
              <p>Name, email address, mobile number and relationship to the player</p>
            </li>
            <li>
              <p>
                A record of consent: the name typed when consenting, the date
                and time, the IP address, the browser used and the version of
                these documents that was agreed to
              </p>
            </li>
          </ul>
          <h3>While playing</h3>
          <ul className="list-disc flex flex-col gap-1 pl-5">
            <li>
              <p>Which hunts the player joined and completed, and any wins</p>
            </li>
            <li>
              <p>
                Location: when a player submits a hunt code, their phone&apos;s
                GPS position is checked against the hunt area. The position is
                used for that check only and is not stored. The map showing the
                player&apos;s live position runs on their own device and is not
                sent to us.
              </p>
            </li>
            <li>
              <p>
                A random device identifier stored in a cookie, used to stop one
                phone completing a hunt under several accounts
              </p>
            </li>
            <li>
              <p>
                The number of wrong codes entered per hunt, kept for up to an
                hour to limit guessing
              </p>
            </li>
          </ul>
          <h3>Cookies and similar technologies</h3>
          <ul className="list-disc flex flex-col gap-1 pl-5">
            <li>
              <p>A session cookie that keeps the player logged in for up to 7 days</p>
            </li>
            <li>
              <p>The device identifier cookie described above</p>
            </li>
            <li>
              <p>
                A note in the browser that the sponsor welcome screen has been
                seen
              </p>
            </li>
            <li>
              <p>
                Google reCAPTCHA, which collects device and usage signals to
                protect sign-up and login from bots
              </p>
            </li>
          </ul>
          <p>We do not use advertising or analytics trackers.</p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[20px]">4. Why we collect it</h2>
          <ul className="list-disc flex flex-col gap-1 pl-5">
            <li>
              <p>To create and secure the player&apos;s account</p>
            </li>
            <li>
              <p>To check age and obtain parental consent</p>
            </li>
            <li>
              <p>To run each hunt, including joining, code entry and the random draw</p>
            </li>
            <li>
              <p>To prevent cheating, using the location check, device identifier and guess limit</p>
            </li>
            <li>
              <p>
                To contact the winner and their parent or guardian, and to
                confirm their identity when the prize is collected
              </p>
            </li>
            <li>
              <p>To show announcements and safety tips</p>
            </li>
            <li>
              <p>
                School and home address are collected so that the organiser and
                its sponsors can offer safety and emergency support features to
                players in future, such as helping a player who reports that
                they are in danger. Until those features exist, this
                information is stored but not used. Both fields are optional.
              </p>
            </li>
          </ul>
          <p>
            We will not use personal information for any other purpose without
            asking for consent again.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[20px]">5. Who we share it with</h2>
          <ul className="list-disc flex flex-col gap-1 pl-5">
            <li>
              <p>
                The organiser receives an email when each hunt closes, listing
                the winner&apos;s contact details, their parent or
                guardian&apos;s name and number, and the names and contact
                details of every player who found the item
              </p>
            </li>
            <li>
              <p>
                Service providers who host and run the app on our behalf:
                Google Firebase and Google Cloud (accounts, database and
                scheduled tasks), Vercel (website hosting),
                [PLACEHOLDER: email provider name] (sending emails), and Google
                reCAPTCHA and Google Maps
              </p>
            </li>
          </ul>
          <p>
            Some of these providers store or process information outside South
            Africa. We only use providers that are bound by data protection
            laws or agreements that give protection similar to POPIA, as
            section 72 of POPIA requires.
          </p>
          <p>
            We never sell personal information or share it for marketing. We
            may disclose information if the law requires it.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[20px]">6. How long we keep it</h2>
          <ul className="list-disc flex flex-col gap-1 pl-5">
            <li>
              <p>Account and parent details are kept until the account is deleted</p>
            </li>
            <li>
              <p>
                If a parent or guardian does not give consent within 7 days, or
                declines, the account is deleted automatically
              </p>
            </li>
            <li>
              <p>Wrong-code records are deleted automatically after about a day</p>
            </li>
            <li>
              <p>
                When an account is deleted, the record of past hunts keeps an
                anonymous account number showing who took part and who won, and
                the device identifier is kept against hunts that device
                completed. These no longer link to a name, phone number or
                email address.
              </p>
            </li>
            <li>
              <p>
                The organiser keeps winner records for [PLACEHOLDER: retention
                period for winner records]
              </p>
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[20px]">7. Your rights</h2>
          <p>Players and their parents or guardians may:</p>
          <ul className="list-disc flex flex-col gap-1 pl-5">
            <li>
              <p>Ask what information we hold and request a copy</p>
            </li>
            <li>
              <p>
                Correct it. Phone number and email can be changed on the
                Profile page, and anything else by contacting us
              </p>
            </li>
            <li>
              <p>
                Delete the account at any time using the Delete account button
                on the Profile page, or by contacting us
              </p>
            </li>
            <li>
              <p>
                Withdraw consent or object to processing. A parent or guardian
                can withdraw consent at any time by contacting us, and the
                account will be deleted
              </p>
            </li>
            <li>
              <p>
                Complain to the Information Regulator at{" "}
                <Link
                  href="https://inforegulator.org.za"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  inforegulator.org.za
                </Link>
              </p>
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[20px]">8. How we protect it</h2>
          <p>
            The database can only be reached by the app&apos;s server, never
            directly from a phone or browser. Every request is checked against
            a secure, HTTP-only login session. Passwords are handled by our
            authentication provider and are never stored by us. Access to admin
            tools is limited to authorised people. If we become aware of a
            security breach affecting personal information, we will notify the
            Information Regulator and the people affected as POPIA requires.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[20px]">9. Changes and contact</h2>
          <p>
            If we change this policy we will update the date above and, for
            material changes, ask for consent again. Questions or requests can
            be sent to [PLACEHOLDER: email address] or [PLACEHOLDER: phone
            number]. See also our <Link href="/terms">Terms &amp; Conditions</Link>.
          </p>
        </section>
      </div>
    </PageWrapper>
  );
};

export default PrivacyPage;
