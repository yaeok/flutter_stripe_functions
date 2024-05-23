import * as functions from 'firebase-functions'
import Stripe from 'stripe'
import { getAuth } from 'firebase-admin/auth'

const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: '2024-04-10',
})

const getAllProducts = functions
  .region('asia-northeast1')
  .https.onCall(async () => {
    const priceRes = await stripe.prices.list()
    const productsRes = await stripe.products.list()
    const result: Products[] = []
    productsRes.data.forEach((product) => {
      const price = priceRes.data.find((price) => price.product === product.id)
      if (price) {
        result.push({
          productId: product.id,
          name: product.name,
          priceId: price.id,
          isSubscribed: price.recurring?.interval === 'month' ? true : false,
          price: price.unit_amount ? price.unit_amount : 0,
        })
      }
    })
    return result
  })

const createPaymentIntent = functions
  .region('asia-northeast1')
  .https.onCall(async (data: Payment) => {
    try {
      const email: string = data.email
      const username: string = data.username
      const amount: number = data.amount
      var customer: Stripe.Customer | null = null
      customer = await stripe.customers
        .search({
          query: 'email:"' + email + '"',
        })
        .then((response) => {
          return response.data[0] || null
        })
      if (customer == null) {
        customer = await stripe.customers.create({
          email: email,
          name: username,
        })
      }
      // Ephemeral Key (一時的なアクセス権を付与するキー)を作成
      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: '2024-04-10' }
      )
      // PaymentIntent の作成
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'jpy',
        customer: customer.id,
        automatic_payment_methods: {
          enabled: true,
        },
      })
      // アプリ側で必要な値を返却
      return {
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customerId: customer.id,
      }
    } catch (error) {
      console.error(`error: %j`, error)
      return {
        title: `エラーが発生しました`,
        message: error,
      }
    }
  })

const createSubscription = functions
  .region('asia-northeast1')
  .https.onCall(async (data: Payment) => {
    try {
      const email: string = data.email
      const username: string = data.username
      const priceId: string = data.priceId
      var customer: Stripe.Customer | null = null
      customer = await stripe.customers
        .search({
          query: 'email:"' + email + '"',
        })
        .then((response) => {
          return response.data[0] || null
        })
      if (customer == null) {
        customer = await stripe.customers.create({
          email: email,
          name: username,
        })
      }
      // Ephemeral Key (一時的なアクセス権を付与するキー)を作成
      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: '2024-04-10' }
      )
      // PaymentIntent の作成
      const subscriptions = await stripe.subscriptions.create({
        currency: 'jpy',
        customer: customer.id,
        items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
      })
      const test: Stripe.Invoice =
        subscriptions.latest_invoice as Stripe.Invoice
      const client_secret = test.payment_intent as Stripe.PaymentIntent
      // アプリ側で必要な値を返却
      return {
        paymentIntent: client_secret.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customerId: customer.id,
      }
    } catch (error) {
      console.error(`error: %j`, error)
      return {
        title: `エラーが発生しました`,
        message: error,
      }
    }
  })

// Premiumプラン登録処理
const updatePremiumPlan = functions
  .region('asia-northeast1')
  .https.onCall(async (data: User) => {
    const uid = data.uid
    // Premiumプランに変更
    const customClaims = {
      premium: true,
    }
    try {
      await getAuth().setCustomUserClaims(uid, customClaims)
    } catch (error) {
      console.log(error)
    }
  })

export {
  getAllProducts,
  createPaymentIntent,
  createSubscription,
  updatePremiumPlan,
}
