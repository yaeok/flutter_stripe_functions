class Payment {
  uid: string
  email: string
  username: string
  amount: number
  priceId

  constructor(
    uid: string,
    email: string,
    username: string,
    amount: number,
    priceId: string
  ) {
    this.uid = uid
    this.email = email
    this.username = username
    this.amount = amount
    this.priceId = priceId
  }
}
