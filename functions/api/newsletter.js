import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

export async function onRequestPost({ request, env }) {
  const formData = await request.formData();

  if (formData.get("company")) {
    return Response.redirect(new URL("/thank-you", request.url), 303);
  }

  const firstName = formData.get("first_name")?.toString().trim();
  const lastName = formData.get("last_name")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim();

  if (!firstName || !email) {
    return new Response("Missing required fields", { status: 400 });
  }

  const msg = createMimeMessage();
  msg.setSender({ addr: "newsletter@yourdomain.com", name: "Power Grab TX Newsletter" });
  msg.setRecipient("newsletter@yourdomain.com");
  msg.setSubject("New Newsletter Signup");
  msg.setHeader("Reply-To", email);
  msg.addMessage({
    contentType: "text/plain",
    data: `New subscriber\n\nName: ${firstName} ${lastName}\nEmail: ${email}`,
  });

  try {
    await env.NEWSLETTER_EMAIL.send(
      new EmailMessage("newsletter@powergrabtx.com", "newsletter@powergrabtx.com", msg.asRaw())
    );
  } catch (e) {
    return new Response(`Error sending email: ${e.message}`, { status: 500 });
  }

  return Response.redirect(new URL("/thank-you", request.url), 303);
}