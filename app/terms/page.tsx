import type { Metadata } from "next";
import Link from "next/link";
import PageWrapper from "@/_lib/utils/page-wrapper";
import { LEGAL_UPDATED } from "@/_lib/utils/legal-version";

export const metadata: Metadata = {
  title: "Terms & Conditions | Treasure Hunt App",
};

const TermsPage = () => {
  return (
    <PageWrapper cssClasses="py-10">
      <div className="flex flex-col gap-8 max-w-[800px]">
        <div className="flex flex-col gap-3">
          <h1>Terms &amp; Conditions</h1>
          <p>Last updated: {LEGAL_UPDATED}</p>
          <p>
            These terms apply to everyone who uses the Treasure Hunt App and
            takes part in its hunts. The app is run by [PLACEHOLDER:
            organiser&apos;s full legal name] (&quot;the organiser&quot;). By
            registering, the player agrees to these terms, and for a player
            under 18, their parent or guardian agrees to them too. Please also
            read our <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-[20px]">1. Who can take part</h2>
          <ul className="list-disc flex flex-col gap-1 pl-5">
            <li>
              <p>Players must be aged 13 to 18</p>
            </li>
            <li>
              <p>
                Players under 18 need a parent or legal guardian to give
                consent before they can join a hunt
              </p>
            </li>
            <li>
              <p>Each person may have only one account, registered with their own true details</p>
            </li>
            <li>
              <p>
                Each device can only complete a hunt once, no matter how many
                accounts use it
              </p>
            </li>
            <li>
              <p>
                [PLACEHOLDER: whether relatives or employees of the organiser
                and sponsors may take part]
              </p>
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[20px]">2. How the hunt works</h2>
          <ul className="list-disc flex flex-col gap-1 pl-5">
            <li>
              <p>
                A new hunt runs each week, from Monday at 07:00 to Sunday at
                17:00 (South African time)
              </p>
            </li>
            <li>
              <p>
                An item with a printed code is hidden inside the search area
                shown on the hunt map. Players must join the hunt in the app to
                see the clues and map
              </p>
            </li>
            <li>
              <p>
                To enter, the player must find the item themselves and type its
                code into the app while standing in the search area, with
                location access switched on
              </p>
            </li>
            <li>
              <p>
                Each player may enter once per hunt. Entries after the deadline
                are not accepted
              </p>
            </li>
            <li>
              <p>A maximum of 5 wrong codes may be entered per hunt per hour</p>
            </li>
            <li>
              <p>Taking part is free. No purchase is needed</p>
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[20px]">3. Fair play</h2>
          <p>
            A player will be disqualified, and may have their account removed,
            if they:
          </p>
          <ul className="list-disc flex flex-col gap-1 pl-5">
            <li>
              <p>Share the code with anyone, or enter a code they did not find themselves</p>
            </li>
            <li>
              <p>Fake their location or tamper with the app</p>
            </li>
            <li>
              <p>Use more than one account, or register with false details</p>
            </li>
            <li>
              <p>Move, damage or hide the item from other players</p>
            </li>
          </ul>
          <p>
            The organiser&apos;s decision on disqualification and on any
            dispute about a hunt is final.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[20px]">4. The draw and the prize</h2>
          <ul className="list-disc flex flex-col gap-1 pl-5">
            <li>
              <p>
                When a hunt closes, one winner is picked at random by the app
                from every player who entered the correct code
              </p>
            </li>
            <li>
              <p>
                The prize is the cash amount shown on that hunt. It cannot be
                exchanged or transferred
              </p>
            </li>
            <li>
              <p>
                The organiser will contact the winner and their parent or
                guardian using the details given at registration
              </p>
            </li>
            <li>
              <p>
                The winner must collect the prize in person at [PLACEHOLDER:
                prize collection office address], together with the parent or
                guardian named at registration, who must show a valid South
                African ID or passport. A winner aged 18 must show their own ID
              </p>
            </li>
            <li>
              <p>
                If the prize is not claimed within [PLACEHOLDER: number] days of
                the winner being contacted, or the winner cannot be reached or
                is found to have broken these terms, the organiser may
                [PLACEHOLDER: redraw a new winner / forfeit the prize]
              </p>
            </li>
            <li>
              <p>
                The organiser may publish the winner&apos;s first name only,
                and only with the parent or guardian&apos;s permission
              </p>
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[20px]">5. Safety and responsibility</h2>
          <ul className="list-disc flex flex-col gap-1 pl-5">
            <li>
              <p>
                Stay inside the search area, do not go onto private property,
                and obey the law and road rules at all times
              </p>
            </li>
            <li>
              <p>
                Parents and guardians are responsible for deciding whether and
                how their child takes part, and for supervising them
              </p>
            </li>
            <li>
              <p>
                Players take part at their own risk. As far as the law allows,
                the organiser, the sponsors and the app developer are not
                liable for any injury, loss or damage that happens while taking
                part, except where it is caused by their gross negligence
              </p>
            </li>
            <li>
              <p>
                The app may occasionally be unavailable, or a hunt may be
                changed, delayed or cancelled. The organiser is not liable for
                this
              </p>
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[20px]">6. Sponsors</h2>
          <p>
            SMHART Security and Plett Security sponsor the hunt and their
            logos appear in the app. [PLACEHOLDER: confirm the sponsors&apos;
            role, e.g. whether they fund the prize or host prize collection].
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[20px]">7. Accounts</h2>
          <p>
            A player can delete their account at any time from the Profile
            page. The organiser may suspend or delete an account that breaks
            these terms.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[20px]">8. Changes and governing law</h2>
          <p>
            The organiser may update these terms. The date above shows the
            latest version, and players may be asked to accept important
            changes again. These terms are governed by the laws of the Republic
            of South Africa, and nothing in them limits any right a player has
            under the Consumer Protection Act.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[20px]">9. Contact</h2>
          <p>
            Questions about these terms can be sent to [PLACEHOLDER: email
            address] or [PLACEHOLDER: phone number].
          </p>
        </section>
      </div>
    </PageWrapper>
  );
};

export default TermsPage;
