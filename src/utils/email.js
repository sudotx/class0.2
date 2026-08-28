import { Resend } from "resend";

let resend;
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

export async function sendWelcomeEmail(email, username) {
  try {
    await getResend().emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Welcome!",
      html: `<p>Hi ${username}, thanks for registering.</p>`,
    });
  } catch (error) {
    console.error("failed to send welcome email:", error);
  }
}

export async function sendDeletionScheduledEmail(
  email,
  username,
  scheduledDeletionAt,
) {
  try {
    await getResend().emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Your account is scheduled for deletion",
      html: `<p>Hi ${username}, you requested account deletion. Your data will be permanently removed on ${scheduledDeletionAt.toDateString()} (30 days from now). If this wasn't you, contact us before then.</p>`,
    });
  } catch (error) {
    console.error("failed to send deletion scheduled email:", error);
  }
}
