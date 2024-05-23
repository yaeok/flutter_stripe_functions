import * as admin from 'firebase-admin'
import {
  createSubscription,
  getAllProducts,
  createPaymentIntent,
  updatePremiumPlan,
} from './stripe'

admin.initializeApp()

module.exports = {
  createSubscription,
  getAllProducts,
  createPaymentIntent,
  updatePremiumPlan,
}
