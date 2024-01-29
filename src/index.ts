import { google, Auth } from "googleapis";
import { authorize } from "./auth";

/**
 * Lists the labels in the user's account.
 *
 * @param {Auth.OAuth2Client} auth An authorized OAuth2 client.
 * @return {Promise<void>}
 */
async function listLabels(auth: Auth.OAuth2Client): Promise<void> {
  console.log("listLables...");
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.labels.list({
    userId: "me",
  });
  console.log(res);
  const labels = res.data.labels;
  if (!labels || labels.length === 0) {
    console.log("No labels found.");
  }
}

async function main(): Promise<void> {
  console.log("Running MAIN...");
  const auth = await authorize();
  await listLabels(auth);
}

main();
