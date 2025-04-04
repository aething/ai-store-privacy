/**
 * Chinese (zh) checkout translations
 */

import { CheckoutTranslations } from '@/types';

const translations: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "结账",
  yourPurchase: "您的购买",
  
  // Form fields
  emailAddress: "电子邮件地址",
  emailPlaceholder: "your.email@example.cn",
  firstName: "名字",
  firstNamePlaceholder: "小明",
  lastName: "姓氏",
  lastNamePlaceholder: "李",
  phoneNumber: "电话号码",
  phonePlaceholder: "+86 123 4567 8901",
  companyName: "公司名称",
  companyNameOptional: "公司名称（可选）",
  companyPlaceholder: "您的公司有限公司",
  
  // Shipping address
  shippingAddress: "送货地址",
  fullName: "全名",
  fullNamePlaceholder: "李小明",
  country: "国家",
  selectCountry: "选择国家",
  address: "地址",
  addressPlaceholder: "示例街123号",
  zipCode: "邮编",
  zipPlaceholder: "100000",
  city: "城市",
  cityPlaceholder: "北京",
  
  // Order summary
  subtotal: "小计",
  price: "价格",
  tax: "税",
  total: "总计",
  
  // Payment related
  paymentInformation: "支付信息",
  cardInformation: "卡信息",
  paymentMethods: "支付方式",
  payButton: "支付",
  processingPayment: "处理付款中...",
  
  // Errors
  paymentError: "支付错误",
  paymentNotLoadedError: "支付系统未加载。请重试或联系客服。",
  missingInformation: "信息缺失",
  missingNameError: "请提供您的姓名",
  missingPhoneError: "请提供您的电话号码",
  missingShippingError: "请提供您的送货地址",
  paymentFailedTitle: "支付失败",
  paymentFailedDefault: "处理您的付款时出错。请重试。",
  unexpectedError: "发生意外错误。请重试。"
};

export default translations;