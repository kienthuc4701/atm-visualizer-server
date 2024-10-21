import { ATMState, ATM } from './atm';

export class NoCardState implements ATMState {
  insertCard(atm: ATM): void {
    console.log("Card inserted. Please enter your PIN.");
    atm.setState(new HasCardState());
  }
  enterPin(atm: ATM, pin: string): void {
    console.log("Please insert a card first.");
  }
  selectOperation(atm: ATM, operation: string): void {
    console.log("Please insert a card first.");
  }
  enterAmount(atm: ATM, amount: number): void {
    console.log("Please insert a card first.");
  }
  ejectCard(atm: ATM): void {
    console.log("No card to eject.");
  }
}

export class HasCardState implements ATMState {
  insertCard(atm: ATM): void {
    console.log("Card already inserted.");
  }
  enterPin(atm: ATM, pin: string): void {
    if (pin === atm.correctPin) {
      console.log("PIN correct. Please select an operation.");
      atm.setState(new SelectOperationState());
    } else {
      console.log("Incorrect PIN. Card ejected.");
      atm.setState(new NoCardState());
    }
  }
  selectOperation(atm: ATM, operation: string): void {
    console.log("Please enter your PIN first.");
  }
  enterAmount(atm: ATM, amount: number): void {
    console.log("Please enter your PIN first.");
  }
  ejectCard(atm: ATM): void {
    console.log("Card ejected.");
    atm.setState(new NoCardState());
  }
}

export class SelectOperationState implements ATMState {
  insertCard(atm: ATM): void {
    console.log("Card already inserted.");
  }
  enterPin(atm: ATM, pin: string): void {
    console.log("PIN already entered. Please select an operation.");
  }
  selectOperation(atm: ATM, operation: string): void {
    if (operation === "withdraw" || operation === "deposit") {
      console.log(`${operation} selected. Please enter amount.`);
      atm.setOperation(operation);
      atm.setState(new EnterAmountState());
    } else if (operation === "balance") {
      console.log(`Your balance is $${atm.balance}`);
      atm.ejectCard();
    } else {
      console.log("Invalid operation. Card ejected.");
      atm.setState(new NoCardState());
    }
  }
  enterAmount(atm: ATM, amount: number): void {
    console.log("Please select an operation first.");
  }
  ejectCard(atm: ATM): void {
    console.log("Card ejected.");
    atm.setState(new NoCardState());
  }
}

export class EnterAmountState implements ATMState {
  insertCard(atm: ATM): void {
    console.log("Card already inserted.");
  }
  enterPin(atm: ATM, pin: string): void {
    console.log("PIN already entered. Please enter amount.");
  }
  selectOperation(atm: ATM, operation: string): void {
    console.log("Operation already selected. Please enter amount.");
  }
  enterAmount(atm: ATM, amount: number): void {
    if (atm.operation === "withdraw") {
      if (amount <= atm.balance) {
        atm.balance -= amount;
        console.log(`Withdrawn $${amount}. New balance: $${atm.balance}`);
      } else {
        console.log("Insufficient funds.");
      }
    } else if (atm.operation === "deposit") {
      atm.balance += amount;
      console.log(`Deposited $${amount}. New balance: $${atm.balance}`);
    }
    atm.ejectCard();
  }
  ejectCard(atm: ATM): void {
    console.log("Card ejected.");
    atm.setState(new NoCardState());
  }
}