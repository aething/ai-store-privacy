import { loadStripe } from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_placeholder";
const stripePromise = loadStripe(stripeKey);

export default stripePromise;
