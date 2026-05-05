import Stripe from 'stripe';

let _stripe = null;

const getStripe = () => {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
};

export default getStripe;
