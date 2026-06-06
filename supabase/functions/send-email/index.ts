import { createHmac } from 'node:crypto';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const HOOK_SECRET = Deno.env.get('SEND_EMAIL_HOOK_SECRET')!;
const FROM_EMAIL = 'KSTORE <noreply@kstore.cy>';
const SITE_URL = Deno.env.get('NEXT_PUBLIC_SITE_URL') ?? 'https://clothing-store-ten-eta.vercel.app';

// Verify the Supabase webhook signature
async function verifySignature(req: Request, body: string): Promise<boolean> {
  const signature = req.headers.get('x-supabase-signature');
  if (!signature) return false;
  const hmac = createHmac('sha256', HOOK_SECRET);
  hmac.update(body);
  const expected = hmac.digest('hex');
  return signature === expected;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const rawBody = await req.text();

  if (!(await verifySignature(req, rawBody))) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let payload: {
    user: { email: string; user_metadata?: { full_name?: string } };
    email_data: {
      token: string;
      token_hash: string;
      redirect_to: string;
      email_action_type: string;
      site_url: string;
    };
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { user, email_data } = payload;
  const { email_action_type, token_hash, redirect_to } = email_data;

  // Build the confirmation link
  const confirmUrl = new URL(`${SITE_URL}/auth/confirm`);
  confirmUrl.searchParams.set('token_hash', token_hash);
  confirmUrl.searchParams.set('type', email_action_type);
  confirmUrl.searchParams.set('next', redirect_to ?? '/');
  const confirmLink = confirmUrl.toString();

  // Build subject + HTML based on action type
  let subject = 'Confirm your KSTORE account';
  let heading = 'Welcome to KSTORE';
  let bodyText = 'Thanks for signing up. Click the button below to confirm your email address.';
  let buttonLabel = 'Confirm Email';

  if (email_action_type === 'recovery') {
    subject = 'Reset your KSTORE password';
    heading = 'Password Reset';
    bodyText = 'Click the button below to reset your password. This link expires in 1 hour.';
    buttonLabel = 'Reset Password';
  } else if (email_action_type === 'email_change') {
    subject = 'Confirm your new KSTORE email';
    heading = 'Email Change';
    bodyText = 'Click the button below to confirm your new email address.';
    buttonLabel = 'Confirm New Email';
  } else if (email_action_type === 'invite') {
    subject = "You've been invited to KSTORE";
    heading = "You're invited";
    bodyText = 'Click the button below to accept your invitation and set your password.';
    buttonLabel = 'Accept Invitation';
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e5e2dc;">
          <!-- Header -->
          <tr>
            <td style="padding:36px 48px 28px;border-bottom:1px solid #e5e2dc;">
              <p style="margin:0;font-size:22px;letter-spacing:0.2em;font-weight:600;color:#1a1a18;">KSTORE</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 48px;">
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;color:#1a1a18;line-height:1.3;">${heading}</h1>
              <p style="margin:0 0 32px;font-size:15px;color:#6b6962;line-height:1.7;">${bodyText}</p>
              <a href="${confirmLink}"
                style="display:inline-block;background:#1a1a18;color:#ffffff;text-decoration:none;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;padding:16px 40px;font-weight:500;">
                ${buttonLabel}
              </a>
              <p style="margin:32px 0 0;font-size:12px;color:#a09e9a;line-height:1.7;">
                If you didn't request this, you can safely ignore this email.<br />
                This link expires in 24 hours.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 48px 28px;border-top:1px solid #e5e2dc;">
              <p style="margin:0;font-size:11px;color:#c0bdb8;letter-spacing:0.06em;">KSTORE &mdash; Nicosia, Cyprus &mdash; info@kstore.cy</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [user.email],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend error:', err);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
