import { db } from "./database";
import { EmailUpdate, Email, EmailData } from "./types";

export async function findEmailById(id: string) {
  return await db
    .selectFrom("email")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();
}

export async function findEmails(criteria: Partial<Email>) {
  let query = db.selectFrom("email");

  if (criteria.id) {
    query = query.where("id", "=", criteria.id); // Kysely is immutable, you must re-assign!
  }

  if (criteria.created_at) {
    query = query.where("created_at", "=", criteria.created_at);
  }

  return await query.selectAll().execute();
}

export async function updateEmail(id: string, updateWith: EmailUpdate) {
  await db
    .updateTable("email")
    .set({ ...updateWith, modified_at: new Date().toISOString() })
    .where("id", "=", id)
    .execute();
}

export async function createEmail(email: EmailData) {
  return await db
    .insertInto("email")
    .values({
      ...email,
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function deleteEmail(id: string) {
  return await db
    .deleteFrom("email")
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirst();
}
