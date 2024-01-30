import { Kysely, Migration } from "kysely";

export default class CreateEmailTable implements Migration {
  async up(db: Kysely<any>): Promise<void> {
    await db.schema
      .createTable("email")
      .addColumn("id", "text", (col) => col.primaryKey())
      .addColumn("to", "text")
      .addColumn("from", "text")
      .addColumn("date", "text")
      .addColumn("subject", "text")
      .addColumn("text", "text")
      .addColumn("amount", "real")
      .addColumn("created_at", "text", (col) =>
        col.defaultTo(new Date().toISOString())
      )
      .addColumn("modified_at", "text")
      .execute();
  }

  async down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable("email").execute();
  }
}
