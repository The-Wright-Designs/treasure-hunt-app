export interface ParentalConsentEmailProps {
  parentName: string;
  teenName: string;
  consentUrl: string;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const parentalConsentEmailTemplate = ({
  parentName,
  teenName,
  consentUrl,
}: ParentalConsentEmailProps) => {
  const parent = escapeHtml(parentName);
  const teen = escapeHtml(teenName);
  const url = escapeHtml(consentUrl);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Treasure Hunt App - Parental consent</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #F2F2F2;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; font-family: Arial, sans-serif; color: #1D1D1D;">
      <div style="background-color: #1D1D1D; padding: 1.5rem;">
        <p style="margin: 0 0 0.25rem 0; font-size: 1.5rem; font-weight: 600; line-height: 1; color: #FFFFFF;">Treasure Hunt App</p>
        <p style="margin: 0; font-size: 0.875rem; color: #E37434;">Parental consent needed</p>
      </div>

      <div style="padding: 1.5rem; font-size: 0.875rem; line-height: 1.5;">
        <p style="margin: 0 0 1rem 0;">Hi ${parent},</p>
        <p style="margin: 0 0 1rem 0;">${teen} has signed up for the Treasure Hunt App, a weekly real-world treasure hunt for teens in Plettenberg Bay with a cash prize. They named you as their parent or guardian.</p>
        <p style="margin: 0 0 1rem 0;">Because ${teen} is under 18, the law requires your consent before they can take part. Please use the button below to read what information we collect and to give or decline consent.</p>
        <p style="margin: 0 0 1.5rem 0;">
          <a href="${url}" style="display: inline-block; background-color: #E37434; color: #FFFFFF; font-weight: 700; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 6px;">Review and give consent</a>
        </p>
        <p style="margin: 0 0 1rem 0;">This link expires in 7 days. If consent isn't given by then, the account is deleted automatically.</p>
        <p style="margin: 0; color: #666666;">If you don't know ${teen} or didn't expect this email, you can ignore it.</p>
      </div>

      <div style="padding: 1rem 1.5rem 1.5rem 1.5rem; border-top: 1px solid #EEEEEE;">
        <p style="margin: 0; font-size: 0.75rem; color: #666666; word-break: break-all;">If the button doesn't work, copy this link into your browser: ${url}</p>
      </div>
    </div>
  </body>
</html>`;
};
