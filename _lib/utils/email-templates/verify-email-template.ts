export interface VerifyEmailProps {
  name: string;
  verifyUrl: string;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const verifyEmailTemplate = ({ name, verifyUrl }: VerifyEmailProps) => {
  const user = escapeHtml(name);
  const url = escapeHtml(verifyUrl);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Treasure Hunt App - Verify your email</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #F2F2F2;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; font-family: Arial, sans-serif; color: #1D1D1D;">
      <div style="background-color: #1D1D1D; padding: 1.5rem;">
        <p style="margin: 0 0 0.25rem 0; font-size: 1.5rem; font-weight: 600; line-height: 1; color: #FFFFFF;">Treasure Hunt App</p>
        <p style="margin: 0; font-size: 0.875rem; color: #E37434;">Verify your email</p>
      </div>

      <div style="padding: 1.5rem; font-size: 0.875rem; line-height: 1.5;">
        <p style="margin: 0 0 1rem 0;">Hi ${user},</p>
        <p style="margin: 0 0 1rem 0;">Please confirm this is your email address so you can join a treasure hunt.</p>
        <p style="margin: 0 0 1.5rem 0;">
          <a href="${url}" style="display: inline-block; background-color: #E37434; color: #FFFFFF; font-weight: 700; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 6px;">Verify my email</a>
        </p>
        <p style="margin: 0; color: #666666;">If you didn't sign up for the Treasure Hunt App, you can ignore this email.</p>
      </div>

      <div style="padding: 1rem 1.5rem 1.5rem 1.5rem; border-top: 1px solid #EEEEEE;">
        <p style="margin: 0; font-size: 0.75rem; color: #666666; word-break: break-all;">If the button doesn't work, copy this link into your browser: ${url}</p>
      </div>
    </div>
  </body>
</html>`;
};
