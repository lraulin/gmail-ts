import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
  email: EmailTable;
  expense: ExpenseTable;
}

export interface EmailTable {
  id: Generated<number>;
  to: string;
  from: string;
  date: Date;
  text: string;
  created_at: Date;
}

export interface ExpenseTable {
  id: Generated<number>;
  amount: number;
}

export type Email = Selectable<EmailTable>;
export type NewEmail = Insertable<EmailTable>;
export type EmailUpdate = Updateable<EmailTable>;

export type Expense = Selectable<ExpenseTable>;
export type NewExpense = Insertable<ExpenseTable>;
export type ExpenseUpdate = Updateable<ExpenseTable>;
