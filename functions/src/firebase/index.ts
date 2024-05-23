import * as functions from 'firebase-functions'
import { getAuth, UserRecord } from 'firebase-admin/auth'

// ユーザ作成時にFreeプランで登録する処理
const processSignUp = functions
  .region('asia-northeast1')
  .auth.user()
  .onCreate(async (user: UserRecord) => {
    // 無料プランで登録
    const customClaims = {
      plan: 'free',
    }
    try {
      await getAuth().setCustomUserClaims(user.uid, customClaims)
    } catch (error) {
      console.log(error)
    }
  })

// Premiumプラン登録処理
const updPremium = functions
  .region('asia-northeast1')
  .https.onCall(async (data: User) => {
    const uid = data.uid
    // Premiumプランに変更
    const customClaims = {
      plan: 'premium',
    }
    try {
      await getAuth().setCustomUserClaims(uid, customClaims)
    } catch (error) {
      console.log(error)
    }
  })

export { processSignUp, updPremium }
