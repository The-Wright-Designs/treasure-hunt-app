import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret, defineString } from "firebase-functions/params";
import { logger } from "firebase-functions";

const cronSecret = defineSecret("CRON_SECRET");
const appBaseUrl = defineString("APP_BASE_URL");

async function callCron(path: string) {
  const response = await fetch(`${appBaseUrl.value()}${path}`, {
    headers: { authorization: `Bearer ${cronSecret.value()}` },
    signal: AbortSignal.timeout(240000),
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(`${path} failed ${response.status}: ${body}`);
  }

  logger.info(`${path} ok`, { body });
}

export const closeHunts = onSchedule(
  {
    schedule: "0 * * * *",
    timeZone: "Etc/UTC",
    secrets: [cronSecret],
    timeoutSeconds: 300,
    retryCount: 2,
    region: "europe-west1",
  },
  async () => {
    await callCron("/api/cron/close-hunts");
  },
);

export const openHunts = onSchedule(
  {
    schedule: "5 * * * *",
    timeZone: "Etc/UTC",
    secrets: [cronSecret],
    timeoutSeconds: 120,
    retryCount: 2,
    region: "europe-west1",
  },
  async () => {
    await callCron("/api/cron/open-hunts");
  },
);
