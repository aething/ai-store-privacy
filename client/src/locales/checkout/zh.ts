/**
 * Chinese localization for checkout page
 */
import { CheckoutTranslations } from '@/types';

export const zh: CheckoutTranslations = {
  // Page title and headers
  pageTitle: "结账",
  yourPurchase: "您的购买",
  
  // Form fields
  emailAddress: "电子邮件地址",
  emailPlaceholder: "email@example.cn",
  firstName: "名字",
  firstNamePlaceholder: "小明",
  lastName: "姓氏",
  lastNamePlaceholder: "李",
  phoneNumber: "电话号码",
  phonePlaceholder: "138 0000 0000",
  companyName: "公司名称",
  companyNameOptional: "公司名称（可选）",
  companyPlaceholder: "示例公司有限公司",
  
  // Shipping address
  shippingAddress: "送货地址",
  fullName: "全名",
  fullNamePlaceholder: "李小明",
  country: "国家",
  selectCountry: "选择国家",
  address: "地址",
  addressPlaceholder: "北京市朝阳区示例街123号",
  zipCode: "邮政编码",
  zipPlaceholder: "100000",
  city: "城市",
  cityPlaceholder: "北京市",
  
  // Order summary
  subtotal: "小计",
  price: "价格",
  tax: "税",
  total: "总计",
  
  // Payment related
  paymentInformation: "支付信息",
  cardInformation: "卡信息",
  paymentMethods: "支付方式",
  payButton: "立即支付",
  processingPayment: "处理付款中...",
  
  // Errors
  paymentError: "支付错误",
  paymentNotLoadedError: "支付系统尚未完全加载。请稍后再试。",
  missingInformation: "缺少信息",
  missingNameError: "请提供您的姓名以便配送。",
  missingPhoneError: "请提供您的电话号码以获取送货更新。",
  missingShippingError: "请完成所有送货地址字段。",
  paymentFailedTitle: "支付失败",
  paymentFailedDefault: "支付失败。请再试一次。",
  unexpectedError: "付款过程中发生意外错误。请稍后再试。"
};