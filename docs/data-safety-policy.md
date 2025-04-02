# Data Safety Policy for Google Play Store

This document details the data handling practices and external services used in our application, as required by the Google Play Store policies. This information should be included in the Data Safety section of your Google Play Console when submitting the PWA for review.

## Data Collection and Usage

### Types of Data Collected

1. **User Information**:
   - Email addresses (for account creation and communication)
   - Usernames and passwords (for authentication)
   - Country location (for tax calculation and currency selection)

2. **Transaction Information**:
   - Purchase history
   - Payment method information (handled securely by Stripe)
   - Billing addresses

3. **Device Information**:
   - Device type and model
   - Operating system version
   - Screen resolution
   - Browser information

### Data Collection Purposes

- **App Functionality**: To provide core features of the application
- **Analytics**: To improve user experience and application performance
- **Tax Compliance**: To calculate and apply correct tax rates based on user location
- **Payment Processing**: To facilitate secure product purchases

## Third-Party Services and SDKs

Our application uses the following third-party services:

### 1. Firebase (Google)

**Purpose**: Authentication and Push notifications
**Data Collected**:
- User authentication data
- Device tokens for push notifications

**Privacy Policy**: https://firebase.google.com/support/privacy

### 2. Google Sheets API

**Purpose**: Data storage and synchronization
**Data Collected**:
- User account information
- Order history
- Verification tokens

**Privacy Policy**: https://www.google.com/policies/privacy/

### 3. Stripe

**Purpose**: Payment processing
**Data Collected**:
- Payment method information
- Transaction details
- Billing information

**Privacy Policy**: https://stripe.com/privacy

### 4. Google Fonts

**Purpose**: Font rendering
**Data Collected**:
- IP addresses (temporarily)
- User agent information

**Privacy Policy**: https://policies.google.com/privacy

## Data Security Practices

1. **Encryption**: All data transmitted between our application and servers is encrypted using HTTPS.

2. **Data Minimization**: We only collect information that is necessary for the functioning of the application.

3. **Secure Storage**: User credentials are securely hashed and stored.

4. **Payment Security**: We do not store payment card details directly. All payment information is handled securely by Stripe.

5. **Limited Retention**: We retain user data only as long as necessary to provide services and comply with legal obligations.

## User Data Rights

Users have the following rights regarding their data:

1. **Access**: Users can request a copy of their personal data.

2. **Correction**: Users can update or correct their account information.

3. **Deletion**: Users can request deletion of their account and associated data.

4. **Opt-out**: Users can opt out of non-essential data collection and marketing communications.

## Children's Privacy

Our application is not directed to children under the age of 13, and we do not knowingly collect personal information from children under 13.

## Changes to This Policy

We may update our Data Safety Policy from time to time. We will notify users of any changes by posting the new policy on this page and updating the "Last Updated" date.

## Contact Information

For questions or concerns about our data safety practices, please contact:
- Email: privacy@aething.com
- Address: Aething Inc., 1111B S. Grove Ave, Suite 200, US, CA, 95008

## Last Updated

[Current Date]