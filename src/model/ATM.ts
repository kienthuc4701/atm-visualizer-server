import { AccountType } from "@/types";
import { IdleState } from "./IdleState";
import { PinEntryState } from "./PinEntryState";

export interface ATMState {
  insertCard: (cardNumber: string) => AccountType | null;
  ejectCard: () => void;
  enterPin: (account: AccountType, pin: string) => boolean;
  exit: () => void;
}

export default class ATM implements ATMState {
  private ATMState: ATMState;
  private account: AccountType | null;

  constructor() {
    this.ATMState = new IdleState();
    this.account = null;
  }
  getAccount(): AccountType | null {
    return this.account;
  }
  insertCard(cardNumber: string): AccountType | null {
    this.account = this.ATMState.insertCard(cardNumber);

    if (this.account) {
      this.setState(new PinEntryState());
      return this.account;
    }
    return null;
  }
  ejectCard() {
    this.ATMState.ejectCard();
  }
  enterPin(account: AccountType, pin: string): boolean {
    return this.ATMState.enterPin(account, pin);
  }
  exit() {
    this.ATMState.exit();
  }
  setState(ATMState: ATMState) {
    this.ATMState = ATMState;
  }
}
