import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import { createTables } from './utils/createTables.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import authRouter from './router/auth_Routes.js';
import productRouter from './router/Product_Routes.js';
import adminRouter from './router/admin_Routes.js';
import orderRouter from './router/order_Routes.js';

const app = express(); 

config({path: './config/config.env'});

app.use(
    cors({
        origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
    })
);

app.post('/api/v1/webhook', express.raw({ type: 'application/json' }), async (req, res) => { 
    // Handle the webhook event here
    const sig = req.headers['stripe-signature'];
    let event;
    try{
        event = Stripe.webhooks.constructEvent(
            req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    }
    catch(error){
        return res.status(400).send(`Webhook Error: ${error.message || error}`);
    }

    //handling event 

    if (event.type === 'checkout.session.completed') {
        const paymentIntent_client_secret = event.data.object.paymentIntent_client_secret;
    
    try{
        const updatedpaymentstatus = "Paid";
        const paymentTableUpdateResult = await database.query(
            `UPDATE payment SET payment_status = $1 WHERE payment_intent_id = $2 RETURNING *`,
            [updatedpaymentstatus, paymentIntent_client_secret]
        );
        await database.query(
            `UPDATE orders SET paid_at = NOW() WHERE payment_intent_id = $1 RETURNING *`,
            [paymentTableUpdateResult.rows[0].order.id]
        );

        //reduce stock for each product

        const orderId = paymentTableUpdateResult.rows[0].order.id;

        const { rows: orderItems } = await database.query(`
            SELECT product_id, quantity FROM order_items WHERE order_id = $1
            `, [orderId]);
        for (const item of orderItems) {
            await database.query(`
                UPDATE products SET stock = stock - $1 WHERE id = $2
            `, [item.quantity, item.product_id]);
        }
    }
    catch(error){
        return res.status(500).send(`error updating paid_at time in order status: ${error.message || error}`);
    }
}
res.status(200).json({ received: true })

});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    fileUpload({
        tempFileDir: './uploads',
        useTempFiles: true 
    })
);

createTables();

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/order', orderRouter);

app.use(errorMiddleware);

export default app;