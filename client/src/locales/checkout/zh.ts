import { CheckoutTranslations } from '@/types';

export const zh: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "结账",
  yourPurchase: "您的购物",
  
  // Form fields
  emailAddress: "电子邮箱",
  emailPlaceholder: "例如：example@domain.com",
  firstName: "名字",
  firstNamePlaceholder: "请输入您的名字",
  lastName: "姓氏",
  lastNamePlaceholder: "请输入您的姓氏",
  phoneNumber: "电话号码",
  phonePlaceholder: "例如：+86 XXX XXXX XXXX",
  companyName: "公司",
  companyNameOptional: "公司（可选）",
  companyPlaceholder: "公司名称",
  
  // Shipping address
  shippingAddress: "收货地址",
  fullName: "全名",
  fullNamePlaceholder: "请输入全名",
  country: "国家",
  selectCountry: "选择国家",
  address: "地址",
  addressPlaceholder: "街道、门牌号等",
  zipCode: "邮政编码",
  zipPlaceholder: "例如：100000",
  city: "城市",
  cityPlaceholder: "例如：北京",
  
  // Order summary
  subtotal: "小计",
  price: "价格",
  tax: "税费",
  total: "总计",
  
  // Payment related
  paymentInformation: "支付信息",
  cardInformation: "卡片信息",
  paymentMethods: "支付方式",
  payButton: "支付",
  processingPayment: "处理支付中...",
  
  // Errors
  paymentError: "支付错误",
  paymentNotLoadedError: "无法加载支付信息。请重试。",
  missingInformation: "缺少信息",
  missingNameError: "请提供您的全名",
  missingPhoneError: "请提供有效的电话号码",
  missingShippingError: "请完善所有配送信息",
  paymentFailedTitle: "支付失败",
  paymentFailedDefault: "我们无法处理您的支付。请检查详情并重试。",
  unexpectedError: "发生意外错误。请重试。"
};