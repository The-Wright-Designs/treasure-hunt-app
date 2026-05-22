interface EmailTemplateProps {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export const contactEmailTemplate = ({
  name,
  email,
  phone,
  message,
}: EmailTemplateProps) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Treasure Hunt App - Contact Form Submission</title>
    <style>
      .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
      .header { background-color: #13103F; color: white; padding: 1rem; }
      .content { padding: 1rem; }
      .field { margin-bottom: 0.5rem; }
      .label { font-weight: 500; }
      .value { font-weight: 200; font-style: italic; color: #333; }
      .section-title { font-size: 1.1rem; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #13103F; }
      .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #eee; font-size: 0.9rem; color: #666; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Treasure Hunt App</h1>
      </div>

      <div class="content">
        <h2>Contact Form Submission</h2>

        <div class="field">
          <span class="label">Name:</span>
          <span class="value">${name}</span>
        </div>

        <div class="field">
          <span class="label">Email:</span>
          <span class="value">${email}</span>
        </div>

        ${
          phone
            ? `
<div class="field">
<span class="label">Phone:</span>
<span class="value">${phone}</span>
</div>
`
            : ""
        }

        <div class="field">
          <span class="label">Message:</span>
          <br />
          <span class="value">${message}</span>
        </div>
      </div>
    </div>
  </body>
</html>`;
};
