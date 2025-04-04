/**
 * Japanese localization for checkout page
 */
import { CheckoutTranslations } from '@/types';

export const ja: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "お支払い",
  yourPurchase: "ご購入",
  
  // Form fields
  emailAddress: "メールアドレス",
  emailPlaceholder: "email@example.jp",
  firstName: "名",
  firstNamePlaceholder: "太郎",
  lastName: "姓",
  lastNamePlaceholder: "山田",
  phoneNumber: "電話番号",
  phonePlaceholder: "090-1234-5678",
  companyName: "会社名",
  companyNameOptional: "会社名（任意）",
  companyPlaceholder: "サンプル株式会社",
  
  // Shipping address
  shippingAddress: "配送先住所",
  fullName: "氏名",
  fullNamePlaceholder: "山田 太郎",
  country: "国",
  selectCountry: "国を選択",
  address: "住所",
  addressPlaceholder: "東京都新宿区サンプル町1-2-3",
  zipCode: "郵便番号",
  zipPlaceholder: "123-4567",
  city: "市区町村",
  cityPlaceholder: "新宿区",
  
  // Order summary
  subtotal: "小計",
  price: "価格",
  tax: "消費税",
  total: "合計",
  
  // Payment related
  paymentInformation: "支払い情報",
  cardInformation: "カード情報",
  paymentMethods: "支払い方法",
  payButton: "支払う",
  processingPayment: "決済処理中...",
  
  // Errors
  paymentError: "支払いエラー",
  paymentNotLoadedError: "支払いシステムが完全に読み込まれていません。もう一度お試しください。",
  missingInformation: "情報不足",
  missingNameError: "配送のために氏名を入力してください。",
  missingPhoneError: "配送状況の更新のために電話番号を入力してください。",
  missingShippingError: "すべての配送先住所欄を記入してください。",
  paymentFailedTitle: "支払い失敗",
  paymentFailedDefault: "支払いに失敗しました。もう一度お試しください。",
  unexpectedError: "支払い処理中に予期せぬエラーが発生しました。後ほど再度お試しください。"
};