import { MapPinned } from "lucide-react";
import HuntCard from "@/_components/ui/cards/active-hunt/hunt-card";
import HuntEntryForm from "@/_components/ui/hunt-entry-form";
import JoinHuntButton from "@/_components/ui/buttons/join-hunt-button";
import MapComponent from "@/_components/ui/google-map";
import { getActiveHunt } from "@/_actions/active-hunt-actions";

const ActiveHuntPage = async () => {
  const activeHunt = await getActiveHunt();

  return (
    <div className="flex flex-col gap-10 px-5 pt-10">
      <div className="flex gap-[10px] items-center">
        <MapPinned size={32} color="#1D1D1D" className="shrink-0" />
        <h1>Active Hunt</h1>
      </div>

      {!activeHunt ? (
        <p>There is no active hunt at the moment. Check back soon!</p>
      ) : (
        <>
          <p>
            Join this week&apos;s hunt to unlock the clues and map. Once
            you&apos;ve tracked down the hidden item, enter the code printed on
            it to lock in your spot in the weekly draw. A random winner is
            selected at the end of each week and contacted directly to claim
            their R500 prize.
          </p>

          <HuntCard
            heading="Active hunt"
            deadline={activeHunt.deadline}
            prizeAmount={activeHunt.prizeAmount}
            activeHunters={activeHunt.activeHunters}
          />

          {!activeHunt.joined ? (
            <div className="flex flex-col gap-5">
              <p>
                Ready to start hunting? Join the hunt to unlock this week&apos;s
                clues and map.
              </p>
              <JoinHuntButton huntId={activeHunt.id} />
            </div>
          ) : (
            <>
              <HuntEntryForm
                huntId={activeHunt.id}
                entered={activeHunt.entered}
              />

              {!activeHunt.entered && (
                <>
                  {activeHunt.clues.length > 0 && (
                    <div className="flex flex-col gap-5">
                      <h3>Clues</h3>
                      <ol className="list-decimal flex flex-col gap-1 pl-5">
                        {activeHunt.clues.map((clue, index) => (
                          <li key={index}>
                            <p>{clue}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div className="flex flex-col gap-5">
                    <h3>Map</h3>
                    <MapComponent
                      lat={activeHunt.mapLatitude}
                      lng={activeHunt.mapLongitude}
                      zoom={activeHunt.mapZoom}
                      circleLat={activeHunt.circleLatitude}
                      circleLng={activeHunt.circleLongitude}
                      circleRadius={activeHunt.circleRadius}
                      cssClasses="w-full h-[350px]"
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div className="flex flex-col gap-5">
            <h3>Rules</h3>
            <ol className="list-decimal flex flex-col gap-1 pl-5">
              <li>
                <p>
                  The treasure hunt is only open to teens who are registered on
                  this app
                </p>
              </li>
              <li>
                <p>
                  Each hunt runs for 7 days, with a brand new hunt kicking off
                  every week
                </p>
              </li>
              <li>
                <p>You can only enter once per hunt, so make it count!</p>
              </li>
              <li>
                <p>
                  You&apos;ve got to find the item yourself — sharing the entry
                  code with friends so they can enter without finding it
                  isn&apos;t allowed, and you&apos;ll be disqualified if you do.
                  If you think about it, the less people who find the hidden
                  item, the better your chances are of winning
                </p>
              </li>
              <li>
                <p>
                  Once you&apos;ve tracked down the hidden item, enter the code
                  printed on it to lock in your entry
                </p>
              </li>
              <li>
                <p>
                  Make sure you submit your entry before the hunt closes — late
                  entries won&apos;t be accepted
                </p>
              </li>
              <li>
                <p>
                  At the end of each week, one lucky winner is picked randomly
                  from everyone who found the item
                </p>
              </li>
              <li>
                <p>
                  If you win, we&apos;ll reach out to you using the contact
                  details you signed up with, so make sure they&apos;re correct!
                </p>
              </li>
              <li>
                <p>
                  Winners need to come in to claim their R500 cash prize in
                  person, and must bring a parent or guardian along
                </p>
              </li>
              <li>
                <p>
                  Stick to the search area shown on the map, and please
                  don&apos;t go onto private property while you&apos;re hunting
                </p>
              </li>
              <li>
                <p>
                  Stay safe out there! You take part in the hunt at your own
                  risk
                </p>
              </li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
};

export default ActiveHuntPage;
