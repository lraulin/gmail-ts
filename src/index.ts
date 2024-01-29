import { google, Auth } from "googleapis";
import { authorize } from "./auth";
import { log } from "./logger";
// import { createEmail } from "./db/email-repository";

function getHeaderGetter(headers: any[]) {
  return function (key: string): string | undefined {
    const header = headers.find((header) => header.name === key);
    return header?.value;
  };
}

/**
 * Lists the labels in the user's account.
 *
 * @param {Auth.OAuth2Client} auth An authorized OAuth2 client.
 * @return {Promise<void>}
 */
async function listLabels(auth: Auth.OAuth2Client): Promise<void> {
  console.log("listLables...");
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.messages.list({
    userId: "me",
    maxResults: 10,
  });
  console.log(res);
  if (res.data.messages) {
    for (const message of res.data.messages) {
      console.log(message);
      const emailRes = await gmail.users.messages.get({
        userId: "me",
        id: message.id!,
      });
      const headers = emailRes.data.payload?.headers;
      if (headers) {
        const getHeader = getHeaderGetter(headers);
        const to = getHeader("To");
        const from = getHeader("From");
        const date = getHeader("Date");
        const id = getHeader("Message-ID");
        const subject = getHeader("Subject");
      }
      const body = emailRes.data.payload?.body;
      if (body) {
        log({ body: JSON.stringify(body) });
      }
      const parts = emailRes.data.payload?.parts;
      if (parts) {
        for (const part of parts) {
          log({ part: JSON.stringify(part) });
        }
      }
      // console.log(emailRes.data);
      // const to = emailRes.headers["to"];
      // const from = emailRes.headers["from"];
      // const
    }
  }
}

async function main(): Promise<void> {
  console.log("Running MAIN...");
  const auth = await authorize();
  await listLabels(auth);
}

main();
