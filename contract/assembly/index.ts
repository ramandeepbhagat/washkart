/*
 * Example smart contract written in AssemblyScript
 *
 * Learn more about writing NEAR smart contracts with AssemblyScript:
 * https://near-docs.io/develop/welcome
 *
 */

import {
    context,
    ContractPromiseBatch,
    logging,
    PersistentVector,
    u128,
} from "near-sdk-as";
import {
    Admin,
    adminsUmap,
    CustomerFeedback,
    customersUmap,
    Order,
    OrderId,
    OrderStatus,
    ordersUmap,
    PaymentType,
    User,
    UserRole,
} from "./model";
import {AccountId, assert_self, MIN_ACCOUNT_BALANCE, toYocto} from "./utils";

/**
 * Get details about the project
 * @return Details about the project
 */
export function about_project(): string {
    return "This is a sample project";
}


/**
 * Get details about the registered customers. Only admin can call this method
 * @return Array of customers
 */
export function call_customers(): User[] {
    const account_id = context.sender;
    assert(adminsUmap.contains(account_id), "Only admins can get customers.");

    return customersUmap.values();
}


/**
 * Get customer details for the given customer ID. Only admins can view details about the other customers.
 * However, normal users can view their own details
 * @return Customer details object for the given ID.
 */
export function call_customer_by_account_id(account_id: AccountId): User {
    assert(account_id.length > 5, "AccountId is required.");

    const isAdmin = adminsUmap.contains(context.sender);
    const isSelf = account_id == context.sender;

    assert(
        isAdmin || isSelf,
        "You are not authorized to view details of this user."
    );

    assert(customersUmap.contains(account_id), "Customer not found.");

    return customersUmap.getSome(account_id);
}


/**
 * Get details about the registered orders in the contract. Only admin can call this method
 * @return Array of orders
 */
export function call_orders(): Order[] {
    const account_id = context.sender;
    assert(adminsUmap.contains(account_id), "Only admins can get orders.");

    return ordersUmap.values();
}


/**
 * Get order details for the given order ID. Only admins can view details about the other customer orders.
 * However, normal users can view their own orders.
 * @return Order details object for the given ID.
 */
export function view_order_by_id(order_id: OrderId): Order {
    assert(order_id.length > 5, "OrderId is required.");

    assert(ordersUmap.contains(order_id), "Order not found.");

    const order = ordersUmap.getSome(order_id);

    const isSelf = order.customerId == context.sender;
    const isAdmin = adminsUmap.contains(context.sender);

    assert(
        isAdmin || isSelf,
        "You are not authorized to view details of this order."
    );

    return order;
}


/**
 * Get orders details for the given customer. Only admins can view details about the other customer orders.
 * However, normal users can view their own orders.
 * @return Array of orders placed by the given customer.
 */
export function call_orders_by_customer_account_id(customer_account_id: AccountId): Order[] {
    assert(customer_account_id.length > 5, "AccountId is required.");

    const account_id = context.sender;

    const isSelf = customer_account_id == account_id;
    const isAdmin = adminsUmap.contains(account_id);

    assert(
        isAdmin || isSelf,
        "You are not authorized to view details of the given customer orders."
    );

    assert(customersUmap.contains(customer_account_id), "Customer not found.");

    const customer = customersUmap.getSome(customer_account_id);

    const orderIdsLength = customer.orderIds ? customer.orderIds.length : 0;

    const orderList: Order[] = [];

    if (orderIdsLength > 0) {
        for (let i = 0; i < orderIdsLength; ++i) {
            if (ordersUmap.contains(customer.orderIds[i])) {
                orderList[i] = ordersUmap.getSome(customer.orderIds[i]);
            }
        }
    }

    return orderList;
}


/**
 * Create a new customer.
 * @param name Name of the customer.
 * @param full_address Address of the customer.
 * @param landmark Landmark details of the customer.
 * @param google_plus_code_address Google map address of the customer
 * @param phone Mobile number of the customer
 * @param email Email of the customer
 */
export function call_create_customer(
    name: string,
    full_address: string,
    landmark: string,
    google_plus_code_address: string,
    phone: string,
    email: string
): void {
    const account_id = context.sender;

    assert(account_id.length > 5, "AccountId is required.");

    assert(name.length > 2, "Customer Name is required.");

    assert(full_address.length > 5, "Customer address is required.");

    assert(phone.length > 7, "Customer phone is required.");

    assert(!customersUmap.contains(account_id), "Customer already exists.");

    const customer = new User(
        account_id,
        name,
        full_address,
        landmark,
        google_plus_code_address,
        phone,
        email,
        UserRole.customer,
    );

    customersUmap.set(account_id, customer);

    logging.log(`Customer with account_id: ${account_id} created.`);
}


/**
 * Update a customer. Only customer can update their own details.
 * @param name Name of the customer.
 * @param full_address Address of the customer.
 * @param landmark Landmark details of the customer.
 * @param google_plus_code_address Google map address of the customer
 * @param phone Mobile number of the customer
 * @param email Email of the customer
 */
export function call_update_customer(
    name: string,
    full_address: string,
    landmark: string,
    google_plus_code_address: string,
    phone: string,
    email: string
): void {
    const account_id = context.sender;

    assert(account_id.length > 5, "AccountId is required.");

    assert(name.length > 2, "Customer Name is required.");

    assert(full_address.length > 5, "Customer address is required.");

    assert(phone.length > 7, "Customer phone is required.");

    assert(customersUmap.contains(account_id), "Customer not found.");

    const customer = customersUmap.getSome(account_id);

    assert(customer.id == account_id, "Only customer can update their details.");

    customer.updateCustomter(name, full_address, landmark, google_plus_code_address, phone, email);

    customersUmap.set(account_id, customer);

    logging.log(`Customer with account_id: ${account_id} updated.`);
}


/**
 * Create an order. Only normal customers can create orders.
 * @param id ID of the order.
 * @param description Description of the order.
 * @param weight_in_grams Weight of the order in grams.
 * @param price_in_yocto_near Price of the order
 */
export function call_create_order(
    id: OrderId,
    description: string,
    weight_in_grams: string,
    price_in_yocto_near: u128
): void {
    const account_id = context.sender;
    const attachedDeposit = context.attachedDeposit;

    assert(!adminsUmap.contains(account_id), "Admins cannot create orders.");

    logging.log(
        `account_id: ${account_id}, attachedDeposit: ${attachedDeposit}, priceInYoctoNear: ${price_in_yocto_near}.`
    );

    assert(price_in_yocto_near >= u128.from(3), "Minimum order price is 3 Near.");
    assert(attachedDeposit >= price_in_yocto_near, "Insufficient deposit.");

    const weightInGrams = parseInt(weight_in_grams);

    const isWeightValid = weightInGrams >= 1000 && weightInGrams <= 10_000;
    assert(isWeightValid, "Weight must be between 1000 and 10,000 grams.");

    const priceInYoctoNearFor7000Grams = toYocto(7);
    const priceInYoctoNearFor10_000Grams = toYocto(10);

    if (weightInGrams >= 3000 && weightInGrams <= 7000) {
        assert(
            priceInYoctoNearFor7000Grams <= attachedDeposit,
            "Order price for upto 7kg weight is 7 Near."
        );
    } else if (weightInGrams <= 10_000) {
        assert(
            priceInYoctoNearFor10_000Grams <= attachedDeposit,
            "Order price for upto 10kg weight is 10 Near."
        );
    }

    assert(account_id.length > 5, "CustomerId is required.");

    assert(customersUmap.contains(account_id), "Customer not found.");

    assert(id.length > 5, "OrderId is required.");

    assert(!ordersUmap.contains(id), "OrderId already exists.");

    const customer = customersUmap.getSome(account_id);

    const order = new Order(
        id,
        account_id,
        description,
        weightInGrams,
        PaymentType.prepaid,
        attachedDeposit,
        OrderStatus.confirmed,
        CustomerFeedback.none,
        "",
        0
    );

    ordersUmap.set(id, order);

    customer.orderIds.push(id.toString());

    customersUmap.set(account_id, customer);

    const beneficiary = ContractPromiseBatch.create(context.contractName);
    beneficiary.transfer(attachedDeposit);

    logging.log(
        `Order with order_id: ${id} created for customer with account_id: ${account_id}.`
    );

    logging.log(
        `Transferred ${attachedDeposit} yoctoNear to contract account: ${context.contractName}`
    );
}


/**
 * Update the order status after processing each step. Only admins can call this function.
 * @param order_id ID of the order.
 * @param order_status Latest status of the order.
 */
export function call_update_order_status(
    order_id: OrderId,
    order_status: OrderStatus
): void {
    const admin_account_id = context.sender;

    assert(admin_account_id.length > 5, "AccountId is required.");

    assert(adminsUmap.contains(admin_account_id), "Only admins can update order status.");

    const isOrderStatusValid =
        order_status == OrderStatus.confirmed ||
        order_status == OrderStatus.inProgress ||
        order_status == OrderStatus.delivered ||
        order_status == OrderStatus.cancelled;

    assert(isOrderStatusValid, "Invalid order status.");

    assert(order_id.length > 5, "OrderId is required.");

    assert(ordersUmap.contains(order_id), "Order not found.");

    const order = ordersUmap.getSome(order_id);

    if (order_status == order.status) {

        assert(order.status != OrderStatus.confirmed, "Order already confirmed.");
        assert(order.status != OrderStatus.inProgress, "Order already inProgress.");
        assert(order.status != OrderStatus.delivered, "Order already delivered.");
        assert(order.status != OrderStatus.cancelled, "Order already cancelled.");

    } else if (order_status == OrderStatus.inProgress) {

        assert(order.status == OrderStatus.confirmed, "Order must have confirmed status.");
        order.updateStatus(order_status);

    } else if (order_status == OrderStatus.delivered) {

        assert(order.status == OrderStatus.inProgress, "Order must have inProgress status.");
        order.deliverOrder();

        const beneficiary = ContractPromiseBatch.create(admin_account_id);
        beneficiary.transfer(order.priceInYoctoNear);

        logging.log(`Transferred ${order.priceInYoctoNear} yoctoNear to account_id: ${admin_account_id}`);

    } else if (order_status == OrderStatus.cancelled) {
        assert(order.status != OrderStatus.cancelled, "Order already cancelled.");
        assert(order.status != OrderStatus.delivered, "Order already delivered.");

        order.updateStatus(order_status);

        const beneficiary = ContractPromiseBatch.create(order.customerId);
        beneficiary.transfer(order.priceInYoctoNear);

        logging.log(`Refunded ${order.priceInYoctoNear} yoctoNear to account_id: ${order.customerId}`);
    }

    ordersUmap.set(order_id, order);

    logging.log(`Order with order_id: ${order_id} has updated status: ${order_status}.`);
}


/**
 * Get customer feedback for the delivered order.
 * @param order_id ID of the order.
 * @param customer_feedback Feedback rating.
 * @param customer_feedback_comment Feedback comment
 */
export function call_customer_feedback(
    order_id: OrderId,
    customer_feedback: string,
    customer_feedback_comment: string
): void {
    const customerId = context.sender;

    assert(customerId.length > 5, "CustomerId is required.");

    assert(customersUmap.contains(customerId), "Customer not found.");

    assert(order_id.length > 5, "OrderId is required.");

    assert(ordersUmap.contains(order_id), "Order not found.");

    const order = ordersUmap.getSome(order_id);

    assert(order.status == 3, "Order must be masked as Delivered to submit feedback.");
    assert(order.customerId == customerId, "Only customer have access.");

    order.addFeedback(customer_feedback, customer_feedback_comment);

    ordersUmap.set(order_id, order);

    logging.log(`Customer with account_id: ${customerId} has provided feedback for order with order_id: ${order_id}.`);
}


/**
 * Get admin IDs of the contract.
 * @return Array of admin account IDs.
 */
export function view_admins(): string[] {
    const keys = adminsUmap.keys();

    const adminList: string[] = [];

    if (keys.length > 0) {
        for (let i = 0; i < keys.length; ++i) {
            if (adminsUmap.contains(keys[i])) {
                const adm = adminsUmap.getSome(keys[i]);
                adminList[i] = adm.id;
            }
        }
    }

    return adminList;
}


/**
 * Add admins to the contract. Only accessible to contract deployed account.
 * @param admin_account_id Account ID of the admin.
 */
export function init(admin_account_id: string): void {
    const account_id = context.sender;
    const predecessor = context.predecessor;
    const account_balance = context.accountBalance;
    const attachedDeposit = context.attachedDeposit;

    assert_self();

    logging.log(`account_id: ${account_id}, predecessor: ${predecessor}, account_balance: ${account_balance}, attachedDeposit: ${attachedDeposit}.`);

    assert(admin_account_id.length > 5, "AccountId is required.");

    assert(!adminsUmap.contains(admin_account_id), "Admin already exists.");

    const admin = new Admin(admin_account_id);

    adminsUmap.set(admin_account_id, admin);

    logging.log(`Admin with account_id: ${admin_account_id} created.`);
}
