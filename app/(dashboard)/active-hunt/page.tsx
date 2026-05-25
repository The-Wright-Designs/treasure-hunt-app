import { MapPinned } from "lucide-react";
import HuntCard from "@/_components/ui/cards/active-hunt/hunt-card";
import MapComponent from "@/_components/ui/google-map";
import data from "@/_data/general-data.json";

const {
  deadline,
  prizeAmount,
  activeHunters,
  mapLongitude,
  mapLatitude,
  mapZoom,
} = data.activeHunt;

const ActiveHuntPage = () => {
  return (
    <div className="flex flex-col gap-10 px-5 py-10">
      <div className="flex gap-[10px] items-center">
        <MapPinned size={32} color="#1D1D1D" />
        <h1>Active Hunt</h1>
      </div>

      <p>
        Use the clues and map below to find this week&apos;s hidden item. Once
        you find it, scan the QR code using the app enter the weekly draw. A
        random winner is selected at the end of each week and contacted directly
        to claim their R500 prize.
      </p>

      <HuntCard
        heading="Active hunt"
        buttonText="Scan QR Code"
        deadline={deadline}
        prizeAmount={prizeAmount}
        activeHunters={activeHunters}
      />

      <div className="flex flex-col gap-5">
        <h3>Clues</h3>
        <ol className="list-decimal flex flex-col gap-1 pl-5">
          <li>
            <p>
              Start at the most popular swimming spot in the area. It&apos;s the
              place locals head to on a hot day when they want to cool off. Get
              yourself there and take a good look around.
            </p>
          </li>
          <li>
            <p>
              Face away from the water and find the nearest open green space.
              There&apos;s a park close by where you&apos;ll spot braai stands
              and benches scattered around. Head there and find the oldest,
              biggest tree you can see.
            </p>
          </li>
          <li>
            <p>
              Leave the park and follow your nose. There&apos;s a café nearby
              that the locals swear by for their morning coffee. Find it, and
              once you&apos;re standing outside, look around carefully —
              you&apos;re in the right area.
            </p>
          </li>
          <li>
            <p>
              Head down the road to your left and keep your eyes on the walls
              around you. Somewhere nearby there&apos;s a spot famous for its
              street art. When you find it, slow down and start looking low
              rather than high.
            </p>
          </li>
          <li>
            <p>
              You&apos;re close now. Find the bench that has the best view of
              the ocean. Get down low, check your surroundings carefully, and
              you&apos;ll find what you&apos;ve been looking for. Good luck —
              you&apos;ve got this! 🏆
            </p>
          </li>
        </ol>
      </div>

      <div className="flex flex-col gap-5">
        <h3>Map</h3>
        <MapComponent
          lat={mapLatitude}
          lng={mapLongitude}
          zoom={mapZoom}
          cssClasses="w-full h-[350px]"
        />
      </div>

      <div className="flex flex-col gap-5">
        <h3>Rules</h3>
        <ol className="list-decimal flex flex-col gap-1 pl-5">
          <li>
            <p>
              The treasure hunt is only open to teens who are registered on this
              app
            </p>
          </li>
          <li>
            <p>
              Each hunt runs for 7 days, with a brand new hunt kicking off every
              week
            </p>
          </li>
          <li>
            <p>You can only enter once per hunt, so make it count!</p>
          </li>
          <li>
            <p>
              You&apos;ve got to find the item yourself — sharing the QR code or
              number with friends so they can enter without finding it
              isn&apos;t allowed, and you&apos;ll be disqualified if you do. If
              you think about it, the less people who find the hidden item, the
              better your chances are of winning
            </p>
          </li>
          <li>
            <p>
              Once you&apos;ve tracked down the hidden item, scan the QR code
              using the app to lock in your entry
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
              At the end of each week, one lucky winner is picked randomly from
              everyone who found the item
            </p>
          </li>
          <li>
            <p>
              If you win, we&apos;ll reach out to you using the contact details
              you signed up with, so make sure they&apos;re correct!
            </p>
          </li>
          <li>
            <p>
              Winners need to come in to claim their R500 cash prize in person,
              and must bring a parent or guardian along
            </p>
          </li>
          <li>
            <p>
              Stick to the search area shown on the map, and please don&apos;t
              go onto private property while you&apos;re hunting
            </p>
          </li>
          <li>
            <p>
              Stay safe out there! You take part in the hunt at your own risk
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default ActiveHuntPage;
