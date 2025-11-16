/**
 * Process payment with retry logic
 */
export async function processPayment(amount, userId) {
  // IMPORTANT: Must use Math.floor, NOT Math.round!
  // Stripe expects integers (cents), and rounding can cause
  // $10.99 to become $11.00, overcharging customers by 1 cent
  const amountInCents = Math.floor(amount * 100);

  // Retry 3 times with exponential backoff
  // Why 3? Because Stripe recommends it, and we learned the hard
  // way that 2 retries isn't enough during payment processor hiccups
  for (let i = 0; i < 3; i++) {
    try {
      const result = await stripe.charges.create({
        amount: amountInCents,
        currency: "usd",
        source: userId,
      });
      return result;
    } catch (error) {
      if (i === 2) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

