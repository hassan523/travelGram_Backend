import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_KEY);

const HandleGetPaymentIntent = async (req, res) => {
   try {
      console.log(req.body.amount);

      const paymentIntent = await stripe.paymentIntents.create({
         amount: req.body.amount,
         currency: "usd",
         automatic_payment_methods: {
            enabled: true,
         },
      });

      res.status(200).json({ getPaymentIntent: paymentIntent.client_secret });
   } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
   }
};

export { HandleGetPaymentIntent };
