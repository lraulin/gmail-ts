import { ColumnType, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
  email: EmailTable;
}

export interface EmailData {
  id: string;
  to: string;
  from: string;
  date: string;
  subject: string;
  text: string;
  amount: number;
}

export interface EmailTable extends EmailData {
  created_at: ColumnType<string, string, never>;
  modified_at: string;
}

export type Email = Selectable<EmailTable>;
export type NewEmail = Insertable<EmailTable>;
export type EmailUpdate = Updateable<EmailTable>;
