"use server";

import nodemailer from "nodemailer";
import {
  huntClosedEmailTemplate,
  HuntClosedEmailProps,
} from "@/_lib/utils/email-templates/hunt-closed-email-template";

export async function sendHuntClosedEmail(
  data: HuntClosedEmailProps,
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST as string,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER as string,
        pass: process.env.SMTP_PASS as string,
      },
      requireTLS: true,
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER as string,
      to: process.env.SMTP_SEND_TO as string,
      subject: `Hunt closed - winner: ${data.winner?.name ?? "no winner"}`,
      html: huntClosedEmailTemplate(data),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send hunt closed email:", error);
    return { success: false, error: "Failed to send hunt closed email" };
  }
}
