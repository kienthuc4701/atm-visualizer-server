import { AccountType } from "@/types";
import { ATMState } from "./ATM";
import { ATMService } from "@/service/ATMService";

export class PinEntryState implements ATMState {
  private service = new ATMService();

  insertCard(cardNumber: string): AccountType | null {
    return this.service.getAccount(cardNumber);
  }
  ejectCard() {}
  enterPin(account:AccountType, pin: string):boolean {
      return this.service.validatePin(account, pin);
  }
  exit() {}
}
