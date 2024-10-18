import { AccountType } from "@/types";

// Mock database
const accounts: AccountType[] = [
  { id: "1", cardNumber: "1234567890", pin: "1234", balance: 1000 },
  { id: "2", cardNumber: "0987654321", pin: "4321", balance: 500 },
];

export { accounts };
