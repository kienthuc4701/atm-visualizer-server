import { AccountType } from "@/types";
import * as db from "@/database";

export class ATMService {
  private accounts: AccountType[];

  constructor() {
    this.accounts = db.accounts;
  }

  getAccount(cardNumber: string): AccountType | null {
    const account = this.accounts.find(
      (account) => account.cardNumber === cardNumber
    );
    return account ? account : null;
  }
  validatePin(account:AccountType, pin:string):boolean {
    return account?.pin === pin;
  }
}
