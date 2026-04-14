import { errorhandler, errorMiddleware } from "../middlewares/errorMiddleware.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import database from "../database/db.js";
import {generatePaymentIntent} from "../utils/generatePaymentIntent.js";

export const placeNewOrder = catchAsyncError(async (req, res, next) => {
    const {
        full_name,
        state,
        city,
        country,
        pincode,
        address,
        phone,
        orderItems
    } = req.body;
    if (!full_name || !state || !city || !country || !pincode || !address || !phone || !orderItems) {
        return next(new errorhandler("Please provide complete shipping details", 400));
    }
    const items = Array.isArray(orderItems) 
    ? orderItems 
    : JSON.parse(orderItems);

    if (!items || items.length === 0) {
        return next(new errorhandler("Order items cannot be empty", 400));
    }

    const productIds = items.map(item => item.product_id);
    const {rows: products} = await database.query(
        `SELECT id, price, stock, name FROM products WHERE id = ANY($1::uuid[])`,
        [productIds]
    );

    let total_price = 0;
    const values = [];
    const placeholders = [];

    items.forEach((item, index) => {
        const product = products.find(p => p.id === item.product_id);
        if (!product) {
            return next(new errorhandler(`Product with ID ${item.product_id} not found`, 404));
        }
        if (item.quantity > product.stock) {
            return next(
                new errorhandler(
                    `Only ${product.stock} units available for ${product.name}`,
                    400
                ));
            }

        const item_total = product.price * item.quantity;
        total_price += item_total;
        values.push(
            null, 
            item.product_id, 
            item.quantity,
            product.price, 
            product.images?.[0]?.url || "",
            product.name);

            const offset = index * 6;
            placeholders.push(`
                ($${offset + 1}, 
                $${offset + 2}, 
                $${offset + 3}, 
                $${offset + 4}, 
                $${offset + 5}, 
                $${offset + 6})`);

        });

    const tax_price = 0.008;
    const shipping_price = 2;
    total_price = Math.round(total_price + total_price * tax_price + shipping_price);

    const orderResult = await database.query(
        `INSERT INTO orders (buyer_id, total_price, tax_price, shipping_price) VALUES ($1, $2, $3, $4) RETURNING *`,
        [req.user.id, total_price, tax_price, shipping_price]
    );

    const orderId = orderResult.rows[0].id;

    for (let i = 0; i < values.length; i+= 6) {
        values[i] = orderId;
    }

    await database.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, image, title) 
         VALUES ${placeholders.join(", ")} RETURNING *`,
         values
    );

    await database.query(
        `INSERT INTO shipping_info (order_id, full_name, state, city, country, pincode, address, phone)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [orderId, full_name, state, city, country, pincode, address, phone]
    );

    const paymentResponse = await generatePaymentIntent(orderId, total_price);

    if (!paymentResponse.success) {
        return next(new errorhandler("Failed to create payment intent", 500));
    }
    // reduce stock
    const { rows: orderItemsFromDB } = await database.query(`
    SELECT product_id, quantity FROM order_items WHERE order_id = $1
    `, [orderId]);

    for (const item of orderItemsFromDB) {
        await database.query(`
        UPDATE products
        SET stock = stock - $1
        WHERE id = $2
    `, [item.quantity, item.product_id]);
    }

    res.status(201).json({
        success: true,
        message: "Order placed successfully, Please proceed to payment",
        paymentIntent : paymentResponse.clientSecret,
        total_price,
    });
});

export const fetchSingleOrder = catchAsyncError(async (req, res, next) => {
    const { orderId } = req.params;
    const result = await database.query(
    `SELECT 
    o.*, 
    COALESCE(
        json_agg(
            json_build_object(
                'order_item_id', oi.id,
                'order_id', oi.order_id,
                'product_id', oi.product_id,
                'quantity', oi.quantity,
                'price', oi.price
            )
        ) FILTER (WHERE oi.id IS NOT NULL), '[]'
    ) AS order_items,
    json_build_object(
        'full_name', s.full_name,
        'state', s.state,
        'city', s.city,
        'country', s.country,
        'address', s.address,
        'pincode', s.pincode,
        'phone', s.phone
    ) AS shipping_info
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN shipping_info s ON o.id = s.order_id
        WHERE o.id = $1
        GROUP BY o.id, s.id;
    `, [orderId]);
    res.status(200).json({
        success: true,
        message: "Order fetched successfully",
        orders: result.rows[0]
    });
});

export const fetchMyOrders = catchAsyncError(async (req, res, next) => {
    const result = await database.query(
    `
        SELECT o.*, COALESCE(
 json_agg(
  json_build_object(
 'order_item_id', oi.id,
 'order_id', oi.order_id,
 'product_id', oi.product_id,
 'quantity', oi.quantity,
 'price', oi.price,
 'image', oi.image,
 'title', oi.title
  ) 
 ) FILTER (WHERE oi.id IS NOT NULL), '[]'
 ) AS order_items,
json_build_object(
 'full_name', s.full_name,
 'state', s.state,
 'city', s.city,
 'country', s.country,
 'address', s.address,
 'pincode', s.pincode,
 'phone', s.phone
 ) AS shipping_info 
 FROM orders o
 LEFT JOIN order_items oi ON o.id = oi.order_id
 LEFT JOIN shipping_info s ON o.id = s.order_id
WHERE o.buyer_id = $1
GROUP BY o.id, s.id
        `,
    [req.user.id]
  );

  res.status(200).json({
    success: true,
    message: "All your orders are fetched.",
    myOrders: result.rows,
  });
});

export const fetchAllOrders = catchAsyncError(async (req, res, next) => {
  const result = await database.query(`
            SELECT o.*,
 COALESCE(json_agg(
 json_build_object(
 'order_item_id', oi.id,
 'order_id', oi.order_id,
 'product_id', oi.product_id,
 'quantity', oi.quantity,
 'price', oi.price,
 'image', oi.image,
 'title', oi.title
)
) FILTER (WHERE oi.id IS NOT NULL), '[]' ) AS order_items, json_build_object(
'full_name', s.full_name,
 'state', s.state,
 'city', s.city,
 'country', s.country,
 'address', s.address,
 'pincode', s.pincode,
 'phone', s.phone 
) AS shipping_info
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN shipping_info s ON o.id = s.order_id
WHERE o.paid_at IS NOT NULL
GROUP BY o.id, s.id
        `);

  res.status(200).json({
    success: true,
    message: "All orders fetched.",
    orders: result.rows,
  });
});

export const updateOrderStatus = catchAsyncError(async (req, res, next) => {
  const { status } = req.body;
  if (!status) {
    return next(new errorhandler("Provide a valid status for order.", 400));
  }
  const { orderId } = req.params;
  const results = await database.query(
    `
    SELECT * FROM orders WHERE id = $1
    `,
    [orderId]
  );

  if (results.rows.length === 0) {
    return next(new errorhandler("Invalid order ID.", 404));
  }

  const updatedOrder = await database.query(
    `
    UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *
    `,
    [status, orderId]
  );

  res.status(200).json({
    success: true,
    message: "Order status updated.",
    updatedOrder: updatedOrder.rows[0],
  });
});

export const deleteOrder = catchAsyncError(async (req, res, next) => {
  const { orderId } = req.params;
  const results = await database.query(
    `
        DELETE FROM orders WHERE id = $1 RETURNING *
        `,
    [orderId]
  );
  if (results.rows.length === 0) {
    return next(new errorhandler("Invalid order ID.", 404));
  }

  res.status(200).json({
    success: true,
    message: "Order deleted.",
    order: results.rows[0],
  });
});