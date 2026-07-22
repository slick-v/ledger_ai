export type User = {
  id: number;
  email: string;
  is_admin: boolean;
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


export type Transaction = {
  id: number;
  type: "income" | "expense";
  amount: string;
  category: string;
  account: string;
  merchant: string | null;
  notes: string | null;
  date: string;
};

export type AccountBalance = {
  type: string;
  balance: string;
};

export type DashboardData = {
  balance: string;
  total_income: string;
  total_expenses: string;
  monthly_income: string;
  monthly_expenses: string;
  accounts: AccountBalance[];
  recent_transactions: Transaction[];
};