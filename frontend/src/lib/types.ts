export type User = {
  id: number;
  email: string;
};

export type Token = {
  access_token: string;
  token_type: string;
};

export type ExpenseCategory =
  | "Food" | "Grocery" | "Fuel" | "Shopping" | "Bills"
  | "Health" | "Entertainment" | "Travel" | "Education" | "Other";

export type IncomeCategory = "Salary" | "Investment" | "Other";

export type AccountType = "Cash" | "UPI" | "Bank";

export type Expense = {
  id: number;
  amount: string;
  category: ExpenseCategory;
  account: AccountType;
  merchant: string | null;
  notes: string | null;
  date: string;
};

export type Income = {
  id: number;
  amount: string;
  category: IncomeCategory;
  account: AccountType;
  notes: string | null;
  date: string;
};