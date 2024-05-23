class Products {
  productId: string
  name: string
  priceId: string
  isSubscribed: boolean
  price: number

  constructor(
    productId: string,
    name: string,
    priceId: string,
    isSubscribed: boolean = false,
    price: number = 0
  ) {
    this.productId = productId
    this.name = name
    this.priceId = priceId
    this.isSubscribed = isSubscribed
    this.price = price
  }
}
