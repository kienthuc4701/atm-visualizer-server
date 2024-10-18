export enum ATMStateType {
  IDLE = "IDLE",
  EXIT = "EXIT",
  OUT_OF_SERVICE = "OUT_OF_SERVICE",
  OUT_OF_CASH = "OUT_OF_CASH",
  HAS_CARD = "HAS_CARD",
  HAS_PIN = "HAS_PIN",
}

export type AccountType = {
  id:string,
  cardNumber: string,
  pin:string,
  balance:number,
}
