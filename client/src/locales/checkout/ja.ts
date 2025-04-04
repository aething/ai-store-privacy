import { CheckoutTranslations } from '@/types';

export const ja: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "チェックアウト",
  yourPurchase: "お買い物内容",
  
  // Form fields
  emailAddress: "メールアドレス",
  emailPlaceholder: "例：sample@domain.com",
  firstName: "名前",
  firstNamePlaceholder: "名前を入力してください",
  lastName: "姓",
  lastNamePlaceholder: "姓を入力してください",
  phoneNumber: "電話番号",
  phonePlaceholder: "例：080-XXXX-XXXX",
  companyName: "会社名",
  companyNameOptional: "会社名（任意）",
  companyPlaceholder: "会社名を入力してください",
  
  // Shipping address
  shippingAddress: "配送先住所",
  fullName: "氏名",
  fullNamePlaceholder: "氏名を入力してください",
  country: "国",
  selectCountry: "国を選択してください",
  address: "住所",
  addressPlaceholder: "番地・建物名など",
  zipCode: "郵便番号",
  zipPlaceholder: "例：123-4567",
  city: "市区町村",
  cityPlaceholder: "例：東京都新宿区",
  
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
  paymentNotLoadedError: "支払い情報を読み込めませんでした。もう一度お試しください。",
  missingInformation: "情報不足",
  missingNameError: "氏名を入力してください",
  missingPhoneError: "有効な電話番号を入力してください",
  missingShippingError: "すべての配送情報を入力してください",
  paymentFailedTitle: "支払い失敗",
  paymentFailedDefault: "支払いを処理できませんでした。詳細を確認してもう一度お試しください。",
  unexpectedError: "予期せぬエラーが発生しました。もう一度お試しください。"
};