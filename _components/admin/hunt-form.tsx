"use client";

import { useState, useActionState } from "react";
import { Plus, Trash2 } from "lucide-react";
import NumberInput from "@/_components/ui/inputs/number-input";
import TextInput from "@/_components/ui/inputs/text-input";
import SelectInput from "@/_components/ui/inputs/select-input";
import ButtonType from "@/_components/ui/buttons/button-type";
import MapComponent from "@/_components/ui/google-map";
import { createHunt } from "@/_actions/admin-actions";

const isWeekday = (value: string, day: number) => {
  const [year, month, date] = value.split("-").map(Number);
  return new Date(year, month - 1, date).getDay() === day;
};

const getNextMonday = () => {
  const today = new Date();
  const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
  const monday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + daysUntilMonday,
  );
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
};

const formatDeadline = (value: string) => {
  const [year, month, date] = value.split("-").map(Number);
  return new Date(year, month - 1, date + 6).toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const HuntForm = () => {
  const [clues, setClues] = useState<string[]>([""]);
  const [startsAt, setStartsAt] = useState("");
  const [minDate] = useState(getNextMonday);
  const [mapLatitude, setMapLatitude] = useState("");
  const [mapLongitude, setMapLongitude] = useState("");
  const [mapZoom, setMapZoom] = useState("15.5");
  const [circleLatitude, setCircleLatitude] = useState("");
  const [circleLongitude, setCircleLongitude] = useState("");
  const [circleRadius, setCircleRadius] = useState("200");
  const [locationNote, setLocationNote] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [state, formAction] = useActionState(createHunt, { success: false });

  const validStartsAt =
    !!startsAt && isWeekday(startsAt, 1) && startsAt >= minDate;

  const lat = Number(mapLatitude);
  const lng = Number(mapLongitude);

  const validCoords =
    mapLatitude !== "" &&
    mapLongitude !== "" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;

  const circleLat = Number(circleLatitude);
  const circleLng = Number(circleLongitude);
  const circleSize = Number(circleRadius);

  const validCircle =
    circleLatitude !== "" &&
    circleLongitude !== "" &&
    circleRadius !== "" &&
    Number.isFinite(circleLat) &&
    Number.isFinite(circleLng) &&
    Number.isFinite(circleSize) &&
    circleLat >= -90 &&
    circleLat <= 90 &&
    circleLng >= -180 &&
    circleLng <= 180 &&
    circleSize >= 1 &&
    circleSize <= 5000;

  const circleEmpty =
    circleLatitude === "" && circleLongitude === "" && circleRadius === "";

  const hasClue = clues.some((clue) => clue.trim() !== "");

  const canSubmit =
    validStartsAt && validCoords && (circleEmpty || validCircle) && hasClue;

  const resetForm = () => {
    setClues([""]);
    setStartsAt("");
    setMapLatitude("");
    setMapLongitude("");
    setMapZoom("15.5");
    setCircleLatitude("");
    setCircleLongitude("");
    setCircleRadius("200");
    setLocationNote("");
    setDismissed(true);
    setFormKey((prev) => prev + 1);
  };

  const updateClue = (index: number, value: string) => {
    setClues((prev) => prev.map((clue, i) => (i === index ? value : clue)));
  };

  const removeClue = (index: number) => {
    setClues((prev) => prev.filter((_, i) => i !== index));
  };

  if (state.success && !dismissed) {
    return (
      <div className="flex flex-col gap-5 items-start px-5 py-7 bg-orange/50 rounded-[6px]">
        <p className="text-subheading text-[20px]">
          Hunt created. It will go live at the start date.
        </p>

        <ButtonType
          type="button"
          colorTeal
          onClick={resetForm}
          cssClasses="desktop:hover:cursor-pointer"
        >
          Add new hunt
        </ButtonType>
      </div>
    );
  }

  return (
    <form
      key={formKey}
      action={(formData) => {
        setDismissed(false);
        formAction(formData);
      }}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-[6px] w-full">
        <label htmlFor="startsAt" className="text-paragraph">
          Starts on (Monday) *
        </label>
        <input
          id="startsAt"
          name="startsAt"
          type="date"
          required
          min={minDate}
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          className="bg-white border border-black/50 rounded-[6px] px-3 py-2 w-full outline-none"
        />
        {startsAt && !validStartsAt && (
          <p className="text-error text-[12px]">
            {isWeekday(startsAt, 1)
              ? "Please choose an upcoming Monday."
              : "Please choose a Monday."}
          </p>
        )}
        <p className="text-[12px]">
          {validStartsAt
            ? `Runs 07:00 until 17:00 on ${formatDeadline(startsAt)}.`
            : "Hunts run from 07:00 Monday until 17:00 the following Sunday."}
        </p>
      </div>

      <NumberInput
        label="Map latitude"
        name="mapLatitude"
        required
        min={-90}
        max={90}
        step="any"
        placeholder="-33.99211638093106"
        value={mapLatitude}
        onChange={(e) => setMapLatitude(e.target.value)}
      />

      <NumberInput
        label="Map longitude"
        name="mapLongitude"
        required
        min={-180}
        max={180}
        step="any"
        placeholder="23.31568410450805"
        value={mapLongitude}
        onChange={(e) => setMapLongitude(e.target.value)}
      />

      <SelectInput
        label="Map zoom"
        name="mapZoom"
        required
        value={mapZoom}
        onChange={(e) => setMapZoom(e.target.value)}
        options={[
          { label: "Wide ", value: "15.00" },
          { label: "Medium", value: "15.5" },
          { label: "Close", value: "16" },
        ]}
      />

      <NumberInput
        label="Circle latitude"
        name="circleLatitude"
        min={-90}
        max={90}
        step="any"
        placeholder="-34.03352342443208"
        value={circleLatitude}
        onChange={(e) => setCircleLatitude(e.target.value)}
      />

      <NumberInput
        label="Circle longitude"
        name="circleLongitude"
        min={-180}
        max={180}
        step="any"
        placeholder="23.370744491641904"
        value={circleLongitude}
        onChange={(e) => setCircleLongitude(e.target.value)}
      />

      <NumberInput
        label="Circle radius (metres)"
        name="circleRadius"
        min={1}
        max={5000}
        step={1}
        placeholder="200"
        value={circleRadius}
        onChange={(e) => setCircleRadius(e.target.value)}
      />

      {!circleEmpty && !validCircle && (
        <p className="text-error text-[12px]">
          Please complete all three circle fields with valid values, or clear
          them all.
        </p>
      )}

      {validCoords && (
        <div className="flex flex-col gap-[6px] w-full">
          <p className="text-paragraph">Map preview</p>
          <MapComponent
            lat={lat}
            lng={lng}
            zoom={Number(mapZoom)}
            circleLat={validCircle ? circleLat : undefined}
            circleLng={validCircle ? circleLng : undefined}
            circleRadius={validCircle ? circleSize : undefined}
            cssClasses="w-full h-[300px] rounded-[6px]"
          />
        </div>
      )}

      <TextInput
        label="Location note"
        name="locationNote"
        placeholder="Buried under the bench near the lighthouse steps"
        value={locationNote}
        onChange={(e) => setLocationNote(e.target.value)}
      />

      <div className="flex flex-col gap-[6px] w-full">
        <p className="text-paragraph">Clues *</p>

        {clues.map((clue, index) => (
          <div key={index} className="flex gap-2 items-start">
            <textarea
              name="clue"
              rows={3}
              value={clue}
              onChange={(e) => updateClue(index, e.target.value)}
              placeholder={`Clue ${index + 1}`}
              className="bg-white border border-black/50 rounded-[6px] px-3 py-2 w-full placeholder:text-black/25 outline-none"
            />
            {clues.length > 1 && (
              <button
                type="button"
                onClick={() => removeClue(index)}
                aria-label={`Remove clue ${index + 1}`}
                className="border border-black/50 rounded-[6px] p-2 shrink-0 desktop:hover:cursor-pointer"
              >
                <Trash2 size={16} color="#DC2626" />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => setClues((prev) => [...prev, ""])}
          className="flex gap-1 items-center self-start mt-1 desktop:hover:cursor-pointer"
        >
          <Plus size={16} color="#4B9DA9" />
          <span className="text-subheading">Add clue</span>
        </button>
      </div>

      {state.error && <p className="text-error text-[12px]">{state.error}</p>}

      <ButtonType
        colorTeal
        disabled={!canSubmit}
        cssClasses="mt-5 desktop:hover:cursor-pointer"
      >
        Create hunt
      </ButtonType>
    </form>
  );
};

export default HuntForm;
