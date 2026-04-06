import database from "../database/db.js";
import Stripe from "stripe";

const stripe = new Stripe("sk_test_51TFVd4LVeZSEYsovDppyMt3DhVSpFzv9iWCEyOW4Gs4PxQ5pg7ctHxce7kcRzEmKwQYLGTKADQ4U6gC0LpmXdzha00SrxGFiMq");

export const generatePaymentIntent = async (orderId, totalPrice) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalPrice * 100, // Convert to cents
            currency: 'usd',
        })
        await database.query(`
            INSERT INTO payments (
            order_id, 
            payment_type, 
            payment_status,
            payment_intent_id
            )VALUES ($1, $2, $3, $4) RETURNING *`, 
            [orderId, 'Online', 'Pending', paymentIntent.id]);
        return { success: true, clientSecret: paymentIntent.client_secret };
    }
    catch (error) {
        console.log('Error generating payment intent:', error.message || error);
        return { success: false, message: 'Payment failed' };

    }
}