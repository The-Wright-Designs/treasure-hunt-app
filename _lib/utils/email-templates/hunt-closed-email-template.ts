export interface HuntParticipant {
  name: string;
  phone: string;
  email: string;
}

export interface HuntClosedEmailProps {
  huntId: string;
  startsAt: string;
  deadline: string;
  closedAt: string;
  prizeAmount: number;
  clueCount: number;
  totalParticipants: number;
  locationNote?: string;
  mapLatitude: number;
  mapLongitude: number;
  winner: HuntParticipant | null;
  completedBy: HuntParticipant[];
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "&mdash;";

  return date.toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatPrize = (amount: number) =>
  `R${amount.toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;

const overviewRow = (label: string, value: string) => `
          <tr>
            <td style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #EEEEEE; color: #1D1D1D; font-weight: 700; width: 45%;">${label}</td>
            <td style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #EEEEEE; color: #1D1D1D;">${value}</td>
          </tr>`;

const participantRow = (participant: HuntParticipant, index: number) => {
  const background = index % 2 === 0 ? "#FFFFFF" : "#F7F7F7";
  const name = escapeHtml(participant.name);
  const phone = escapeHtml(participant.phone);
  const email = escapeHtml(participant.email);

  return `
          <tr style="background-color: ${background};">
            <td style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #EEEEEE; color: #1D1D1D;">${name}</td>
            <td style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #EEEEEE;">${
              participant.phone
                ? `<a href="tel:${phone}" style="color: #0000EE;">${phone}</a>`
                : `<span style="color: #666666;">&mdash;</span>`
            }</td>
            <td style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #EEEEEE;">${
              participant.email
                ? `<a href="mailto:${email}" style="color: #0000EE;">${email}</a>`
                : `<span style="color: #666666;">&mdash;</span>`
            }</td>
          </tr>`;
};

export const huntClosedEmailTemplate = ({
  huntId,
  startsAt,
  deadline,
  closedAt,
  prizeAmount,
  clueCount,
  totalParticipants,
  locationNote,
  mapLatitude,
  mapLongitude,
  winner,
  completedBy,
}: HuntClosedEmailProps) => {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&amp;query=${mapLatitude},${mapLongitude}`;

  const locationValue = locationNote?.trim()
    ? escapeHtml(locationNote.trim())
    : `<a href="${mapsUrl}" style="color: #0000EE;">${mapLatitude}, ${mapLongitude}</a>`;

  const winnerPanel = winner
    ? `
        <p style="margin: 0 0 0.75rem 0; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #FFFFFF;">Winner</p>
        <p style="margin: 0 0 1rem 0; font-size: 1.75rem; font-weight: 600; line-height: 1.1; color: #FFFFFF;">${escapeHtml(winner.name)}</p>
        <p style="margin: 0 0 0.25rem 0; font-size: 1rem; color: #FFFFFF;">${
          winner.phone
            ? `<a href="tel:${escapeHtml(winner.phone)}" style="color: #FFFFFF; font-weight: 700;">${escapeHtml(winner.phone)}</a>`
            : "No phone number on file"
        }</p>
        <p style="margin: 0 0 1rem 0; font-size: 1rem; color: #FFFFFF;">${
          winner.email
            ? `<a href="mailto:${escapeHtml(winner.email)}" style="color: #FFFFFF;">${escapeHtml(winner.email)}</a>`
            : "No email address on file"
        }</p>
        <p style="margin: 0; font-size: 0.875rem; color: #FFFFFF;">Please contact them to arrange the ${formatPrize(prizeAmount)} prize.</p>`
    : `
        <p style="margin: 0 0 0.75rem 0; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #FFFFFF;">Winner</p>
        <p style="margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 600; line-height: 1.1; color: #FFFFFF;">No winner</p>
        <p style="margin: 0; font-size: 0.875rem; color: #FFFFFF;">Nobody completed this hunt, so no prize needs to be awarded.</p>`;

  const participantsTable = completedBy.length
    ? `
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; font-size: 0.875rem;">
          <tr>
            <th align="left" style="padding: 0.5rem 0.75rem; background-color: #4B9DA9; color: #FFFFFF; font-weight: 700;">Name</th>
            <th align="left" style="padding: 0.5rem 0.75rem; background-color: #4B9DA9; color: #FFFFFF; font-weight: 700;">Phone</th>
            <th align="left" style="padding: 0.5rem 0.75rem; background-color: #4B9DA9; color: #FFFFFF; font-weight: 700;">Email</th>
          </tr>${completedBy.map(participantRow).join("")}
        </table>`
    : `
        <p style="margin: 0; font-size: 0.875rem; color: #666666;">No participants completed this hunt.</p>`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Treasure Hunt App - Hunt Closed</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #F2F2F2;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; font-family: Arial, sans-serif; color: #1D1D1D;">
      <div style="background-color: #1D1D1D; padding: 1.5rem;">
        <p style="margin: 0 0 0.25rem 0; font-size: 1.5rem; font-weight: 600; line-height: 1; color: #FFFFFF;">Treasure Hunt App</p>
        <p style="margin: 0; font-size: 0.875rem; color: #E37434;">Hunt closed</p>
      </div>

      <div style="padding: 1.5rem;">
        <div style="background-color: #E37434; padding: 1.5rem; margin-bottom: 2rem;">
${winnerPanel}
        </div>

        <p style="margin: 0 0 0.75rem 0; font-size: 1.125rem; font-weight: 600; color: #1D1D1D;">Hunt overview</p>

        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; font-size: 0.875rem; margin-bottom: 2rem;">
${overviewRow("Started", formatDate(startsAt))}
${overviewRow("Deadline", formatDate(deadline))}
${overviewRow("Closed", formatDate(closedAt))}
${overviewRow("Prize amount", formatPrize(prizeAmount))}
${overviewRow("Clues", String(clueCount))}
${overviewRow("Total participants", String(totalParticipants))}
${overviewRow("Completed the hunt", String(completedBy.length))}
${overviewRow("Location", locationValue)}
${overviewRow("Hunt ID", escapeHtml(huntId))}
        </table>

        <p style="margin: 0 0 0.75rem 0; font-size: 1.125rem; font-weight: 600; color: #1D1D1D;">Participants who completed the hunt</p>
${participantsTable}
      </div>

      <div style="padding: 1rem 1.5rem 1.5rem 1.5rem; border-top: 1px solid #EEEEEE;">
        <p style="margin: 0; font-size: 0.75rem; color: #666666;">This is an automated message sent when a hunt is closed.</p>
      </div>
    </div>
  </body>
</html>`;
};
