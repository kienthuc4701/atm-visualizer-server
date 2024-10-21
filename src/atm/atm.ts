import { NoCardState } from "./states";

export interface ATMState {
    insertCard(atm: ATM): void;
    enterPin(atm: ATM, pin: string): void;
    selectOperation(atm: ATM, operation: string): void;
    enterAmount(atm: ATM, amount: number): void;
    ejectCard(atm: ATM): void;
  }
  
  export class ATM {
    private state: ATMState;
    public balance: number;
    public correctPin: string;
    public operation: string;
  
    constructor(initialBalance: number, correctPin: string) {
      this.state = new NoCardState();
      this.balance = initialBalance;
      this.correctPin = correctPin;
      this.operation = "";
    }
  
    setState(state: ATMState): void {
      this.state = state;
    }
  
    setOperation(operation: string): void {
      this.operation = operation;
    }
  
    insertCard(): void {
      this.state.insertCard(this);
    }
  
    enterPin(pin: string): void {
      this.state.enterPin(this, pin);
    }
  
    selectOperation(operation: string): void {
      this.state.selectOperation(this, operation);
    }
  
    enterAmount(amount: number): void {
      this.state.enterAmount(this, amount);
    }
  
    ejectCard(): void {
      this.state.ejectCard(this);
    }
  }
  
