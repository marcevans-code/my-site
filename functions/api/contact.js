import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

export async function onRequestPost({ request, env }) {
  const formData = await request.formData();

  // Honeypot — bots fill this, humans never see it
  if (formData.get("company")) {
    return Response.redirect(new URL("/thank-you", request.url), 303);
  }

  const firstName = formData.get("first_name")?.toString().trim();
  const lastName = formData.get("last_name")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim();
  const subject = formData.get("subject")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  if (!firstName || !email || !subject || !message) {
    return new Response("Missing required fields", { status: 400 });
  }

  const msg = createMimeMessage();
  msg.setSender({ addr: "contact@yourdomain.com", name: "Power Grab TX Website" });
  msg.setRecipient("contact@yourdomain.com");
  msg.setSubject(`Contact Form: ${subject}`);
  msg.setHeader("Reply-To", email);
  msg.addMessage({
    contentType: "text/plain",
    data: `Name: ${firstName} ${lastName}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
  });

  try {
    await env.CONTACT_EMAIL.send(
      new EmailMessage("contact@powergrabtx.com", "contact@powergrabtx.com", msg.asRaw())
    );
  } catch (e) {
    return new Response(`Error sending email: ${e.message}`, { status: 500 });
  }

  return Response.redirect(new URL("/thank-you", request.url), 303);
}