import { createProductsTable } from "../models/productsTable.js";
import { createUsersTable } from "../models/userTable.js";
import { createOrdersTable } from "../models/ordersTable.js";
import { createPaymentsTable } from "../models/paymentsTable.js";
import { createShippingInfoTable } from "../models/shippingInfoTable.js";
import {createProductsReviewTable} from "../models/productsReviewTable.js";
import {createOrderItemTable} from "../models/orderitemsTable.js";
export const createTables = async () => {
    try {
        await createUsersTable();
        await createProductsTable();
        await createProductsReviewTable();
        await createOrdersTable();
        await createOrderItemTable();
        await createShippingInfoTable();
        await createPaymentsTable();
    } catch (error) {
        console.error("❌ Error Creating Tables:", error);
        process.exit(1);
    }
}