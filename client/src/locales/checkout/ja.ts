/**
 * Japanese (ja) checkout translations
 */

import { CheckoutTranslations } from '@/types';

const translations: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "お支払い",
  yourPurchase: "ご購入内容",
  
  // Form fields
  emailAddress: "メールアドレス",
  emailPlaceholder: "your.email@example.jp",
  firstName: "名",
  firstNamePlaceholder: "太郎",
  lastName: "姓",
  lastNamePlaceholder: "山田",
  phoneNumber: "電話番号",
  phonePlaceholder: "+81 90 1234 5678",
  companyName: "会社名",
  companyNameOptional: "会社名（任意）",
  companyPlaceholder: "株式会社サンプル",
  
  // Shipping address
  shippingAddress: "配送先住所",
  fullName: "氏名",
  fullNamePlaceholder: "山田 太郎",
  country: "国",
  selectCountry: "国を選択",
  address: "住所",
  addressPlaceholder: "〇〇区〇〇町1-2-3",
  zipCode: "郵便番号",
  zipPlaceholder: "123-4567",
  city: "市区町村",
  cityPlaceholder: "東京都",
  
  // Order summary
  subtotal: "小計",
  price: "価格",
  tax: "消費税",
  total: "合計",
  
  // Payment related
  paymentInformation: "お支払い情報",
  cardInformation: "カード情報",
  paymentMethods: "お支払い方法",
  payButton: "支払う",
  processingPayment: "処理中...",
  
  // Errors
  paymentError: "支払いエラー",
  paymentNotLoadedError: "決済システムが読み込まれていません。再試行するかサポートにお問い合わせください。",
  missingInformation: "情報が不足しています",
  missingNameError: "お名前を入力してください",
  missingPhoneError: "電話番号を入力してください",
  missingShippingError: "配送先住所を入力してください",
  paymentFailedTitle: "支払い失敗",
  paymentFailedDefault: "お支払い処理中にエラーが発生しました。もう一度お試しください。",
  unexpectedError: "予期せぬエラーが発生しました。もう一度お試しください。"
};

export default translations;