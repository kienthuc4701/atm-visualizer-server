import { ATMService } from "@/service/ATMService";
import { ATMState } from "./ATM";
import { AccountType } from "@/types";

export class IdleState implements ATMState {
  private service = new ATMService();

  insertCard(cardNumber: string):AccountType | null {
    const account =  this.service.getAccount(cardNumber);
    return this.service.getAccount(cardNumber);
  }
  ejectCard() {}
  enterPin(account:AccountType, pin: string):boolean {
    return this.service.validatePin(account, pin)
  }
  exit() {}
}
