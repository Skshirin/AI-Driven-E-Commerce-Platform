import { errorhandler, errorMiddleware } from "../middlewares/errorMiddleware.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import database from "../database/db.js";
import {v2 as cloudinary} from 'cloudinary';

export const getAllUsers = catchAsyncError(async (req, res, next) => {

    const page = parseInt(req.query.page) || 1;

    const totalUsersResult = await database.query(
        "SELECT COUNT(*) FROM users WHERE role = $1", 
        ['user']
    );

    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    const offset = (page - 1) * 10;

    const users = await database.query(
        `SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, 
        ['user', 10, offset]
    );

    res.status(200).json({
        success: true,
        totalUsers,
        currentPage: page,
        users: users.rows,
    });

});

export const deleteUser = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    const deleteUser = await database.query(
        "DELETE FROM users WHERE id = $1 RETURNING *",
        [id]
    );

    if(deleteUser.rows.length === 0) {
        return next(new errorhandler("User not found", 404));
    }

    const avatar = deleteUser.rows[0].avatar;
    if(avatar?.public_id) {
            await cloudinary.uploader.destroy(avatar.public_id);
    }

    res.status(200).json({
        success: true,
        message: "User deleted successfully",
        user: deleteUser.rows[0],
    });
});

export const dashboardStats = catchAsyncError(async (req, res, next) => {
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];

    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    //total revenue
    const totalRevenueAllTimeQuery = await database.query(`
        SELECT SUM(total_price) FROM orders
        `);
    const totalRevenueAllTime = totalRevenueAllTimeQuery.rows[0].sum || 0;

    //total users

    const totalUsersQuery = await database.query(`
        SELECT COUNT(*) FROM users WHERE role = 'user'
    `);
    const totalUsers = parseInt(totalUsersQuery.rows[0].count) || 0;

    //order status count

    const orderStatusCountsQuery = await database.query(`
        SELECT order_status, COUNT(*) FROM orders GROUP BY order_status
    `);
    const orderStatusCount = {
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
    };
    orderStatusCountsQuery.rows.forEach(row => {
        orderStatusCount[row.order_status] = parseInt(row.count);
    });

    //today's revenue

    const todayRevenueQuery = await database.query(`
        SELECT SUM(total_price) FROM orders WHERE DATE(created_at) = $1
    `, [todayDate]);
    const todayRevenue = todayRevenueQuery.rows[0].sum || 0;

    //yesterday's revenue

    const yesterdayRevenueQuery = await database.query(`
        SELECT SUM(total_price) FROM orders WHERE DATE(created_at) = $1
    `, [yesterdayDate]);
    const yesterdayRevenue = yesterdayRevenueQuery.rows[0].sum || 0;

    //monthly sales for line chart

    const monthlySalesQuery = await database.query(`
        SELECT 
        TO_CHAR(created_at, 'YYYY-MM') AS month,
        DATE_TRUNC('month', created_at) AS date,
        SUM(total_price) AS total_sales
        FROM orders
        GROUP BY month, date
        ORDER BY date ASC
    `);

    const monthlySales = monthlySalesQuery.rows.map(row => ({
        month : row.month,
        totalSales: parseFloat(row.total_sales) || 0,
    }));

    //top 5 best selling products

    const topSellingProductsQuery = await database.query(`
        SELECT p.name,
        p.images->0->>'url' AS image,
        p.category,
        p.ratings,
        SUM(oi.quantity) AS total_sold
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        GROUP BY p.name, p.images, p.category, p.ratings
        order BY total_sold DESC
        LIMIT 5
    `);

    const topSellingProducts = topSellingProductsQuery.rows;

    //total sales of current month
    const currentMonthSalesQuery = await database.query(`
        SELECT SUM(total_price) AS total 
        FROM orders
        WHERE created_at BETWEEN $1 AND $2
    `, [currentMonthStart, currentMonthEnd]);


    const currentMonthSales = parseFloat(currentMonthSalesQuery.rows[0].total) || 0;

    //products with stock <= 5

    const lowStockProductsQuery = await database.query(`
        SELECT name, stock FROM products WHERE stock <= 5
    `);

    const lowStockProducts = lowStockProductsQuery.rows;


    //revenue growth rate

    const lastMonthRevenueQuery = await database.query(`
        SELECT SUM(total_price) AS total
        FROM orders
        WHERE created_at BETWEEN $1 AND $2
    `, [previousMonthStart, previousMonthEnd]);

    const lastMonthRevenue = parseFloat(lastMonthRevenueQuery.rows[0].total) || 0;

    let revenueGrowth = "0%";

    if(lastMonthRevenue > 0) {
        const growthRate = ((currentMonthSales - lastMonthRevenue) / lastMonthRevenue) * 100;
        revenueGrowth = `${growthRate >=0 ? '+' : ''}${growthRate.toFixed(2)}%`;
    }

    const newUserThisMonthQuery = await database.query(`
        SELECT COUNT(*) FROM users
        WHERE role = 'user' AND created_at BETWEEN $1 AND $2
    `, [currentMonthStart, currentMonthEnd]);

    const newUserThisMonth = parseInt(newUserThisMonthQuery.rows[0].count) || 0;

    //final response
    res.status(200).json({
        success: true,
        message: "Dashboard stats fetched successfully",
        totalRevenueAllTime,
        totalUsers,
        orderStatusCount,
        todayRevenue,
        yesterdayRevenue,
        monthlySales,
        topSellingProducts,
        currentMonthSales,
        lowStockProducts,
        revenueGrowth,
        newUserThisMonth,
    });



});