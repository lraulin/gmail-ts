import * as fs from "fs/promises";
import path from "path";
import process from "process";
import { authenticate } from "@google-cloud/local-auth";
import { google, Auth } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { log } from "./logger";

// If modifying these scopes, delete token.json.
const SCOPES: string[] = ["https://www.googleapis.com/auth/gmail.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH: string = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH: string = path.join(process.cwd(), "credentials.json");
log({ TOKEN_PATH, CREDENTIALS_PATH });

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<Auth.OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist(): Promise<Auth.OAuth2Client | null> {
  try {
    const content: string = await fs.readFile(TOKEN_PATH, "utf8");
    const credentials: any = JSON.parse(content);
    return google.auth.fromJSON(credentials) as OAuth2Client;
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {Auth.OAuth2Client} client An authorized OAuth2 client.
 * @return {Promise<void>}
 */
async function saveCredentials(client: Auth.OAuth2Client): Promise<void> {
  const content: string = await fs.readFile(CREDENTIALS_PATH, "utf8");
  const keys: any = JSON.parse(content);
  const key: any = keys.installed || keys.web;
  const payload: string = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 * @return {Promise<Auth.OAuth2Client>}
 */
export async function authorize(): Promise<Auth.OAuth2Client> {
  let client: Auth.OAuth2Client | null = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}
