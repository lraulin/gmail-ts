import { google, Auth, gmail_v1 } from "googleapis";
import { authorize } from "./auth";
import { createEmail } from "./db/email-repository";
import { GaxiosResponse } from "gaxios";
import { EmailData } from "./db/types";

function getHeaderGetter(headers: any[]) {
  return function (key: string): string | undefined {
    const header = headers.find((header) => header.name === key);
    return header?.value;
  };
}

function extractEmailData(
  emailRes: GaxiosResponse<gmail_v1.Schema$Message>
): EmailData {
  const headers = emailRes.data.payload?.headers;
  if (!headers) {
    throw new Error("No headers found in the email response.");
  }

  const getHeader = getHeaderGetter(headers);

  const id = getHeader("Message-ID");
  if (!id) {
    throw new Error("No Message-ID found in the email response.");
  }

  const to = getHeader("To");
  if (!to) {
    throw new Error("No To found in the email response.");
  }

  const from = getHeader("From");
  if (!from) {
    throw new Error("No From found in the email response.");
  }

  const subject = getHeader("Subject");
  if (!subject) {
    throw new Error("No Subject found in the email response.");
  }

  const date = getHeader("Date");
  if (!date) {
    throw new Error("No Date found in the email response.");
  }

  // Function to decode base64 encoded email body
  function decodeBase64(encoded: string): string {
    // Replace non-url compatible chars with base64 standard chars
    encoded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    return Buffer.from(encoded, "base64").toString("utf-8");
  }

  // Function to find plain text part in a message
  function findPlainTextPart(parts: any[]): string {
    for (const part of parts) {
      if (part.mimeType === "text/plain") {
        return decodeBase64(part.body.data);
      } else if (part.parts) {
        // Recursive search in case of nested multipart content
        const text = findPlainTextPart(part.parts);
        if (text) {
          return text;
        }
      }
    }
    throw new Error("No plain text part found in the email response.");
  }

  // Extract plain text content
  if (!emailRes.data.payload) {
    throw new Error("No payload found in the email response.");
  }

  const text: string = (() => {
    if (emailRes.data.payload.mimeType === "text/plain") {
      // Simple case: direct body content
      if (!emailRes.data.payload.body?.data) {
        throw new Error("No body.data found in the email response.");
      }
      return decodeBase64(emailRes.data.payload.body.data);
    } else if (emailRes.data.payload.parts) {
      // Multipart case: find the plain text part
      return findPlainTextPart(emailRes.data.payload.parts);
    }
    throw new Error("No plain text part found in the email response.");
  })();

  const amount: number = (() => {
    const regex = /amount of \$(\d+\.\d{2}) was placed or charged on your/;
    const match = text.match(regex);

    if (match && match[1]) {
      return Number(match[1]);
    }

    return 0;
  })();

  return { id, to, from, subject, date, text, amount };
}

async function getEmails(auth: Auth.OAuth2Client): Promise<void> {
  console.log("listLabels...");
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.messages.list({
    userId: "me",
    q: "from:capitalone@notification.capitalone.com subject:A new transaction was charged to your account",
    maxResults: 10,
  });

  if (res.data.messages) {
    for (const message of res.data.messages) {
      const emailRes = await gmail.users.messages.get({
        userId: "me",
        id: message.id!,
        format: "full", // Use 'full' to get the entire message body
      });

      const emailData = extractEmailData(emailRes);
      await createEmail(emailData);
    }
  }
}

async function main(): Promise<void> {
  console.log("Running MAIN...");
  const auth = await authorize();
  await getEmails(auth);
}

main();
