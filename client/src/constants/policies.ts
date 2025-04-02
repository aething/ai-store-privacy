import { Policy } from "@/types";

const policies: Policy[] = [
  {
    id: "data-safety",
    title: "Data Safety for Google Play",
    content: `
      <h3 class="font-medium text-lg mb-2">Data Safety Information for Google Play</h3>
      <p class="mb-4 text-text-secondary">This document details the data handling practices and external services used in our application, as required by the Google Play Store Data Safety section.</p>
      
      <h4 class="font-medium mb-2">Third-Party Services and SDKs</h4>
      <p class="mb-4 text-text-secondary">Our application uses the following third-party services that may collect data:</p>
      
      <div class="mb-4 p-4 bg-gray-50 rounded-md">
        <h5 class="font-medium mb-2">Firebase (Google)</h5>
        <ul class="list-disc pl-5 mb-2 text-text-secondary">
          <li><strong>Data Collected:</strong> User authentication data, device tokens</li>
          <li><strong>Purpose:</strong> Authentication and Push notifications</li>
          <li><strong>Data Sharing:</strong> Not shared with third parties</li>
          <li><strong>Data Protection:</strong> Encrypted during transmission and storage</li>
        </ul>
      </div>
      
      <div class="mb-4 p-4 bg-gray-50 rounded-md">
        <h5 class="font-medium mb-2">Google Sheets API</h5>
        <ul class="list-disc pl-5 mb-2 text-text-secondary">
          <li><strong>Data Collected:</strong> User account info, order history</li>
          <li><strong>Purpose:</strong> Data storage and synchronization</li>
          <li><strong>Data Sharing:</strong> Not shared with third parties</li>
          <li><strong>Data Protection:</strong> Processed according to Google's security standards</li>
        </ul>
      </div>
      
      <div class="mb-4 p-4 bg-gray-50 rounded-md">
        <h5 class="font-medium mb-2">Stripe</h5>
        <ul class="list-disc pl-5 mb-2 text-text-secondary">
          <li><strong>Data Collected:</strong> Payment info, transaction details</li>
          <li><strong>Purpose:</strong> Payment processing</li>
          <li><strong>Data Sharing:</strong> Shared only with financial institutions to process payments</li>
          <li><strong>Data Protection:</strong> PCI DSS compliant</li>
        </ul>
      </div>
      
      <div class="mb-4 p-4 bg-gray-50 rounded-md">
        <h5 class="font-medium mb-2">Google Fonts</h5>
        <ul class="list-disc pl-5 mb-2 text-text-secondary">
          <li><strong>Data Collected:</strong> IP addresses (temporarily)</li>
          <li><strong>Purpose:</strong> Font rendering</li>
          <li><strong>Data Sharing:</strong> Not shared with third parties</li>
          <li><strong>Data Protection:</strong> Temporary storage only</li>
        </ul>
      </div>
      
      <h4 class="font-medium mb-2">User Data Deletion</h4>
      <p class="mb-4 text-text-secondary">Users can request deletion of their data by:</p>
      <ul class="list-disc pl-5 mb-4 text-text-secondary">
        <li>Emailing privacy@aething.com with subject "Data Deletion Request"</li>
        <li>Using the in-app account deletion feature</li>
        <li>Submitting a request through our website contact form</li>
      </ul>
      
      <p class="text-text-secondary">All deletion requests are processed within 30 days as required by applicable regulations.</p>
    `
  },
  {
    id: "delivery-policy",
    title: "Delivery Policy",
    content: `
      <h3 class="font-medium text-lg mb-2">Aething Inc. - Unified Policies</h3>
      <p class="mb-4 text-text-secondary"><strong>Last Updated:</strong> April 1, 2025</p>
      
      <h4 class="font-medium mb-2">1. Delivery Policy</h4>
      <p class="mb-4 text-text-secondary">We comply with EU (Directive 2011/83/EU, GDPR) and US (FTC, UCC) laws.</p>
      
      <h5 class="font-medium mb-2">Delivery Regions:</h5>
      <ul class="list-disc pl-5 mb-4 text-text-secondary">
        <li><strong>EU & USA</strong> only.</li>
        <li>EU prices include VAT. Non-EU/US orders may incur customs fees (customer's responsibility).</li>
      </ul>
      
      <h5 class="font-medium mb-2">Methods:</h5>
      <ul class="list-disc pl-5 mb-4 text-text-secondary">
        <li>Standard (3–7 business days). Cost included in item price.</li>
      </ul>
      
      <h5 class="font-medium mb-2">Timeframes:</h5>
      <ul class="list-disc pl-5 mb-4 text-text-secondary">
        <li>Processing: 1–3 days. Max 30 days to EU (per Directive 2011/83/EU). Delays notified via email.</li>
      </ul>
      
      <h5 class="font-medium mb-2">Tracking:</h5>
      <ul class="list-disc pl-5 mb-4 text-text-secondary">
        <li>GDPR-compliant tracking link provided post-dispatch.</li>
      </ul>
      
      <h5 class="font-medium mb-2">Damages:</h5>
      <ul class="list-disc pl-5 mb-4 text-text-secondary">
        <li>Report within 14 days (EU) or 7 days (USA). Free returns with photo proof.</li>
      </ul>
      
      <h5 class="font-medium mb-2">Right of Withdrawal:</h5>
      <ul class="list-disc pl-5 mb-4 text-text-secondary">
        <li>Cancel within 14 days (see <a href="/policy/return-policy" class="text-blue-600 hover:underline">Returns</a>).</li>
      </ul>
      
      <p class="text-text-secondary"><strong>Contact:</strong> support@aething.com</p>
    `
  },
  {
    id: "return-policy",
    title: "Return & Exchange Policy",
    content: `
      <h3 class="font-medium text-lg mb-2">Return & Exchange Policy</h3>
      <p class="mb-4 text-text-secondary">We want you to be completely satisfied with your purchase. If you are not satisfied, we offer a generous return and exchange policy.</p>
      
      <h4 class="font-medium mb-2">Returns</h4>
      <p class="mb-4 text-text-secondary">You may return any unopened and unused product within 30 days of delivery for a full refund. Opened products may be returned within 14 days if found to be defective.</p>
      
      <h4 class="font-medium mb-2">Exchanges</h4>
      <p class="mb-4 text-text-secondary">Exchanges can be made within 30 days of delivery. The replacement product will be shipped once the original product has been received by our returns department.</p>
      
      <h4 class="font-medium mb-2">Process</h4>
      <p class="text-text-secondary">To initiate a return or exchange, please contact our customer service team with your order number and reason for return.</p>
    `
  },
  {
    id: "contact-info",
    title: "Contact Information",
    content: `
      <h3 class="font-medium text-lg mb-2">Contact Information</h3>
      <p class="mb-4 text-text-secondary">We are here to help with any questions or concerns you may have about our products or services.</p>
      
      <h4 class="font-medium mb-2">Customer Support</h4>
      <p class="mb-4 text-text-secondary">Email: support@aething.com<br>Phone: +1 (555) 123-4567<br>Hours: Monday-Friday, 9am-6pm EST</p>
      
      <h4 class="font-medium mb-2">Technical Support</h4>
      <p class="mb-4 text-text-secondary">Email: tech@aething.com<br>Phone: +1 (555) 987-6543<br>Hours: 24/7 support available</p>
      
      <h4 class="font-medium mb-2">Corporate Headquarters</h4>
      <p class="text-text-secondary">Aething AI Inc.<br>123 Innovation Drive<br>Tech Valley, CA 94123<br>United States</p>
    `
  },
  {
    id: "privacy-policy",
    title: "Privacy Policy",
    content: `
      <h3 class="font-medium text-lg mb-2">Privacy Policy</h3>
      <p class="mb-4 text-text-secondary">Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.</p>
      
      <h4 class="font-medium mb-2">Information Collection</h4>
      <p class="mb-4 text-text-secondary">We collect information such as your name, email address, shipping address, and payment information when you make a purchase. We may also collect usage data when you interact with our AI products.</p>
      
      <h4 class="font-medium mb-2">Use of Information</h4>
      <p class="mb-4 text-text-secondary">We use your information to process orders, improve our products and services, and provide customer support. We may also use your data to personalize your experience with our AI products.</p>
      
      <h4 class="font-medium mb-2">Data Protection</h4>
      <p class="mb-4 text-text-secondary">We implement a variety of security measures to maintain the safety of your personal information. Your data is encrypted during transmission and stored on secure servers.</p>
      
      <h4 class="font-medium mb-2">Third-Party Services and SDKs</h4>
      <p class="mb-4 text-text-secondary">Our application uses the following third-party services:</p>
      
      <h5 class="font-medium mb-2">1. Firebase (Google)</h5>
      <p class="mb-4 text-text-secondary">
        <strong>Purpose:</strong> Authentication and Push notifications<br>
        <strong>Data Collected:</strong> User authentication data, device tokens for push notifications<br>
        <strong>Privacy Policy:</strong> <a href="https://firebase.google.com/support/privacy" class="text-blue-600 hover:underline" target="_blank">https://firebase.google.com/support/privacy</a>
      </p>
      
      <h5 class="font-medium mb-2">2. Google Sheets API</h5>
      <p class="mb-4 text-text-secondary">
        <strong>Purpose:</strong> Data storage and synchronization<br>
        <strong>Data Collected:</strong> User account information, order history, verification tokens<br>
        <strong>Privacy Policy:</strong> <a href="https://www.google.com/policies/privacy/" class="text-blue-600 hover:underline" target="_blank">https://www.google.com/policies/privacy/</a>
      </p>
      
      <h5 class="font-medium mb-2">3. Stripe</h5>
      <p class="mb-4 text-text-secondary">
        <strong>Purpose:</strong> Payment processing<br>
        <strong>Data Collected:</strong> Payment method information, transaction details, billing information<br>
        <strong>Privacy Policy:</strong> <a href="https://stripe.com/privacy" class="text-blue-600 hover:underline" target="_blank">https://stripe.com/privacy</a>
      </p>
      
      <h5 class="font-medium mb-2">4. Google Fonts</h5>
      <p class="mb-4 text-text-secondary">
        <strong>Purpose:</strong> Font rendering<br>
        <strong>Data Collected:</strong> IP addresses (temporarily), user agent information<br>
        <strong>Privacy Policy:</strong> <a href="https://policies.google.com/privacy" class="text-blue-600 hover:underline" target="_blank">https://policies.google.com/privacy</a>
      </p>
      
      <h4 class="font-medium mb-2">Your Data Rights</h4>
      <p class="mb-4 text-text-secondary">You have the right to access, correct, or delete your personal information. You can request a copy of your data or ask us to erase your account by contacting us at privacy@aething.com.</p>
    `
  },
  {
    id: "payment-terms",
    title: "Payment Terms",
    content: `
      <h3 class="font-medium text-lg mb-2">Payment Terms</h3>
      <p class="mb-4 text-text-secondary">We offer various payment options to make purchasing our AI products as convenient as possible.</p>
      
      <h4 class="font-medium mb-2">Accepted Payment Methods</h4>
      <p class="mb-4 text-text-secondary">We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and Apple Pay. All payments are processed securely through Stripe.</p>
      
      <h4 class="font-medium mb-2">Billing Cycle</h4>
      <p class="mb-4 text-text-secondary">For subscription-based products, billing occurs on the same day each month or year, depending on your chosen billing cycle. You can cancel your subscription at any time.</p>
      
      <h4 class="font-medium mb-2">Pricing & Taxes</h4>
      <p class="text-text-secondary">All prices are listed in USD and do not include applicable taxes. Taxes will be calculated at checkout based on your location.</p>
    `
  },
  {
    id: "warranty",
    title: "Warranty & Liability",
    content: `
      <h3 class="font-medium text-lg mb-2">Warranty & Liability</h3>
      <p class="mb-4 text-text-secondary">We stand behind the quality of our AI products and offer warranty coverage for your peace of mind.</p>
      
      <h4 class="font-medium mb-2">Standard Warranty</h4>
      <p class="mb-4 text-text-secondary">All our products come with a standard one-year limited warranty that covers manufacturing defects and malfunctions. This warranty does not cover damage caused by misuse, accidents, or unauthorized modifications.</p>
      
      <h4 class="font-medium mb-2">Extended Warranty</h4>
      <p class="mb-4 text-text-secondary">Extended warranty options are available for purchase at checkout, offering additional coverage for up to three years from the date of purchase.</p>
      
      <h4 class="font-medium mb-2">Limitation of Liability</h4>
      <p class="text-text-secondary">Our liability is limited to the purchase price of the product. We are not liable for any indirect, incidental, special, or consequential damages arising from the use of our products.</p>
    `
  },
  {
    id: "terms",
    title: "Terms of Service",
    content: `
      <h3 class="font-medium text-lg mb-2">Terms of Service</h3>
      <p class="mb-4 text-text-secondary">By using our website and purchasing our AI products, you agree to comply with and be bound by the following terms and conditions.</p>
      
      <h4 class="font-medium mb-2">Account Responsibilities</h4>
      <p class="mb-4 text-text-secondary">You are responsible for maintaining the confidentiality of your account information and password. You agree to accept responsibility for all activities that occur under your account.</p>
      
      <h4 class="font-medium mb-2">Acceptable Use</h4>
      <p class="mb-4 text-text-secondary">You agree to use our products and services only for lawful purposes and in accordance with these terms. You may not use our products for any illegal or unauthorized purpose.</p>
      
      <h4 class="font-medium mb-2">Intellectual Property</h4>
      <p class="text-text-secondary">All content, trademarks, services marks, trade names, logos, and icons are the property of Aething AI Inc. Nothing in these terms shall grant you any rights to use our intellectual property.</p>
    `
  },
  {
    id: "gdpr",
    title: "GDPR",
    content: `
      <h3 class="font-medium text-lg mb-2">GDPR Compliance</h3>
      <p class="mb-4 text-text-secondary">We are committed to ensuring that our practices comply with the General Data Protection Regulation (GDPR) for our users in the European Union.</p>
      
      <h4 class="font-medium mb-2">Your Rights</h4>
      <p class="mb-4 text-text-secondary">Under the GDPR, you have the right to access, rectify, port, and erase your data. You also have the right to restrict or object to certain processing of your data.</p>
      
      <h4 class="font-medium mb-2">Data Processing</h4>
      <p class="mb-4 text-text-secondary">We process personal data only with your consent, to fulfill contractual obligations, or when we have a legitimate interest that is not overridden by your data protection rights.</p>
      
      <h4 class="font-medium mb-2">Data Transfers</h4>
      <p class="text-text-secondary">If we transfer your data outside the EU, we ensure that appropriate safeguards are in place to protect your privacy rights and enforce legal protection for your data.</p>
    `
  },
  {
    id: "ftc",
    title: "FTC Rules",
    content: `
      <h3 class="font-medium text-lg mb-2">FTC Compliance</h3>
      <p class="mb-4 text-text-secondary">We adhere to the Federal Trade Commission (FTC) rules and regulations to ensure fair and transparent business practices.</p>
      
      <h4 class="font-medium mb-2">Truth in Advertising</h4>
      <p class="mb-4 text-text-secondary">All our product descriptions, advertisements, and claims are truthful and not misleading. We provide accurate information about our products' capabilities and limitations.</p>
      
      <h4 class="font-medium mb-2">Endorsements & Testimonials</h4>
      <p class="mb-4 text-text-secondary">Any endorsements or testimonials featured in our marketing materials reflect the honest opinions, findings, beliefs, or experiences of the endorser. We disclose any material connections between endorsers and our company.</p>
      
      <h4 class="font-medium mb-2">Privacy Practices</h4>
      <p class="text-text-secondary">Our privacy practices comply with the FTC's Fair Information Practice Principles, including notice, choice, access, security, and enforcement.</p>
    `
  }
];

export const getPolicyById = (id: string): Policy | undefined => {
  return policies.find(policy => policy.id === id);
};

export default policies;
