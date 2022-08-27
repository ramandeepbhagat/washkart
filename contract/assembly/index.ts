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
import { AccountId, assert_self, MIN_ACCOUNT_BALANCE, toYocto } from "./utils";

export function about_project(): string {
  return "This is a sample project";
}

export function call_customers(): User[] {
  const account_id = context.sender;
  assert(adminsUmap.contains(account_id), "Only admins can get customers.");

  const keys = customersUmap.keys();

  const customerList: User[] = [];

  if (keys.length > 0) {
    for (let i = 0; i < keys.length; ++i) {
      if (customersUmap.contains(keys[i])) {
        customerList[i] = customersUmap.getSome(keys[i]);
      }
    }
  }

  return customerList;
}

export function call_customer_by_account_id(account_id: AccountId): User {
  assert(account_id.length > 5, "AccountId is required.");

  // assert(
  //   account_id.endsWith(".testnet"),
  //   "AccountId must be a testnet account"
  // );

  const isAdmin = adminsUmap.contains(context.sender);

  const isSelf = account_id == context.sender;

  assert(
    isAdmin || isSelf,
    "You are not authorized to view details of this user."
  );

  assert(customersUmap.contains(account_id), "Customer not found.");

  return customersUmap.getSome(account_id);
}

export function call_orders(): Order[] {
  const account_id = context.sender;
  assert(adminsUmap.contains(account_id), "Only admins can get orders.");

  const keys = ordersUmap.keys();

  const orderList: Order[] = [];

  if (keys.length > 0) {
    for (let i = 0; i < keys.length; ++i) {
      if (ordersUmap.contains(keys[i])) {
        orderList[i] = ordersUmap.getSome(keys[i]);
      }
    }
  }

  return orderList;
}

export function view_order_by_id(order_id: OrderId): Order {
  assert(order_id.length > 5, "OrderId is required.");

  assert(ordersUmap.contains(order_id), "Order not found.");

  return ordersUmap.getSome(order_id);
}

export function call_orders_by_customer_account_id(
  customer_account_id: AccountId
): Order[] {
  assert(customer_account_id.length > 5, "AccountId is required.");

  // assert(
  //   customer_account_id.endsWith(".testnet"),
  //   "AccountId must be a testnet account"
  // );

  const account_id = context.sender;

  if (account_id != customer_account_id) {
    assert(
      adminsUmap.contains(account_id),
      "Only admins can get orders of other customers."
    );
  }

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

  assert(
    MIN_ACCOUNT_BALANCE >= u128.from(25),
    "Minimum account balance required is 25N."
  );

  // assert(
  //   account_id.endsWith(".testnet"),
  //   "AccountId must be a testnet account"
  // );

  assert(name.length > 2, "Customer Name is required.");

  assert(full_address.length > 5, "Customer address is required.");

  assert(!customersUmap.contains(account_id), "Customer already exists.");

  const customerOrderIds = new PersistentVector<OrderId>("co:" + account_id);

  const customer = new User(
    account_id,
    name,
    full_address,
    landmark,
    google_plus_code_address,
    phone,
    email,
    UserRole.customer,
    customerOrderIds,
    context.blockTimestamp,
    context.blockTimestamp
  );

  assert(customer != null, "Customer is null.");

  customersUmap.set(account_id, customer);

  logging.log(`Customer with account_id: ${account_id} created.`);
}

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

  assert(
    MIN_ACCOUNT_BALANCE >= u128.from(25),
    "Minimum account balance required is 25N."
  );

  // assert(
  //   account_id.endsWith(".testnet"),
  //   "AccountId must be a testnet account"
  // );

  assert(name.length > 2, "Customer Name is required.");

  assert(full_address.length > 5, "Customer address is required.");

  assert(customersUmap.contains(account_id), "Customer not found.");

  const customer = customersUmap.getSome(account_id);

  assert(customer != null, "Customer is null.");

  assert(customer.id == account_id, "Only customer can update their details.");

  customer.name = name;
  customer.fullAddress = full_address;
  customer.landmark = landmark;
  customer.googlePlusCodeAddress = google_plus_code_address;
  customer.phone = phone;
  customer.email = email;
  customer.updated = context.blockTimestamp;

  customersUmap.set(account_id, customer);

  logging.log(`Customer with account_id: ${account_id} updated.`);
}

export function call_create_order(
  id: OrderId,
  description: string,
  weight_in_grams: string,
  price_in_yocto_near: u128
): void {
  const account_id = context.sender;
  const account_balance = context.accountBalance;
  const attachedDeposit = context.attachedDeposit;

  assert(!adminsUmap.contains(account_id), "Admins cannot create orders.");

  logging.log(
    `account_id: ${account_id}, account_balance: ${account_balance}, attachedDeposit: ${attachedDeposit}, priceInYoctoNear: ${price_in_yocto_near}.`
  );

  assert(price_in_yocto_near >= u128.from(3), "Minimum order price is 3 Near.");
  assert(attachedDeposit >= price_in_yocto_near, "Insufficient deposit.");

  const weightInGrams = I32.parseInt(weight_in_grams);

  const isWeightValid = weightInGrams >= 1000 && weightInGrams <= 10_000;
  assert(isWeightValid, "Weight must be between 1000 and 10,000 grams.");

  const priceInYoctoNearFor3000Grams = toYocto(3);
  const priceInYoctoNearFor7000Grams = toYocto(7);
  const priceInYoctoNearFor10_000Grams = toYocto(10);

  if (weightInGrams >= 1000 && weightInGrams <= 3000) {
    assert(
      priceInYoctoNearFor3000Grams <= attachedDeposit,
      "Order price for upto 3kg weight is 3 Near."
    );
  } else if (weightInGrams <= 7000) {
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

  assert(
    account_balance >= MIN_ACCOUNT_BALANCE,
    `Minimum account balance required is ${MIN_ACCOUNT_BALANCE}N.`
  );

  // assert(
  //   account_id.endsWith(".testnet"),
  //   "CustomerId must be a testnet account"
  // );

  assert(customersUmap.contains(account_id), "Customer not found.");

  assert(id.length > 5, "OrderId is required.");

  assert(!ordersUmap.contains(id), "OrderId already exists.");

  const customer = customersUmap.getSome(account_id);

  assert(customer != null, "Customer is null.");

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
    context.blockTimestamp,
    0
  );

  assert(order != null, "Order is null.");

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

export function call_update_order_status(
  order_id: OrderId,
  order_status: OrderStatus
): void {
  const admin_account_id = context.sender;

  assert(admin_account_id.length > 5, "AccountId is required.");

  // assert(
  //   admin_account_id.endsWith(".testnet"),
  //   "AccountId must be a testnet account"
  // );

  assert(adminsUmap.contains(admin_account_id), "Admin not found.");

  const admin = adminsUmap.getSome(admin_account_id);

  assert(admin != null, "Admin is null.");

  assert(admin.role == UserRole.admin, "Only admins can update order status.");

  const isOrderStatusValid =
    order_status == OrderStatus.confirmed ||
    order_status == OrderStatus.inProgress ||
    order_status == OrderStatus.delivered ||
    order_status == OrderStatus.cancelled;

  assert(isOrderStatusValid, "Invalid order status.");

  assert(order_id.length > 5, "OrderId is required.");

  assert(ordersUmap.contains(order_id), "Order not found.");

  const order = ordersUmap.getSome(order_id);

  assert(order != null, "Order is null.");

  if (order_status == OrderStatus.confirmed) {
    assert(order.status != OrderStatus.confirmed, "Order already confirmed.");
    assert(order.status != OrderStatus.inProgress, "Order already inProgress.");
    assert(order.status != OrderStatus.delivered, "Order already delivered.");
    assert(order.status != OrderStatus.cancelled, "Order already cancelled.");
  } else if (order_status == OrderStatus.inProgress) {
    assert(
      order.status == OrderStatus.confirmed,
      "Order must have confirmed status."
    );
    order.status = order_status;
  } else if (order_status == OrderStatus.delivered) {
    assert(
      order.status == OrderStatus.inProgress,
      "Order must have inProgress status."
    );

    order.status = order_status;

    order.deliveryDateTime = context.blockTimestamp;

    const beneficiary = ContractPromiseBatch.create(admin_account_id);
    beneficiary.transfer(order.priceInYoctoNear);

    logging.log(
      `Transferred ${order.priceInYoctoNear} yoctoNear to account_id: ${admin_account_id}`
    );
  } else if (order_status == OrderStatus.cancelled) {
    assert(order.status != OrderStatus.cancelled, "Order already cancelled.");
    assert(order.status != OrderStatus.delivered, "Order already delivered.");

    order.status = order_status;

    const beneficiary = ContractPromiseBatch.create(order.customerId);
    beneficiary.transfer(order.priceInYoctoNear);

    logging.log(
      `Refunded ${order.priceInYoctoNear} yoctoNear to account_id: ${order.customerId}`
    );
  }

  ordersUmap.set(order_id, order);

  logging.log(
    `Order with order_id: ${order_id} has updated status: ${order_status}.`
  );
}

export function call_customer_feedback(
  order_id: OrderId,
  customer_feedback: string,
  customer_feedback_comment: string
): void {
  const customerId = context.sender;
  const account_balance = context.accountBalance;

  assert(customerId.length > 5, "CustomerId is required.");

  assert(
    account_balance >= MIN_ACCOUNT_BALANCE,
    `Minimum account balance required is ${MIN_ACCOUNT_BALANCE}N.`
  );

  // assert(
  //   customerId.endsWith(".testnet"),
  //   "CustomerId must be a testnet account"
  // );

  assert(customersUmap.contains(customerId), "Customer not found.");
  const customer = customersUmap.getSome(customerId);
  assert(customer != null, "Customer is null.");

  assert(order_id.length > 5, "OrderId is required.");
  assert(ordersUmap.contains(order_id), "Order not found.");
  const order = ordersUmap.getSome(order_id);
  assert(order != null, "Order is null.");
  assert(
    order.status == 3,
    "Order must be masked as Delivered to submit feedback."
  );
  assert(order.customerId == customerId, "Customer not authorized.");

  order.customerFeedback = I32.parseInt(customer_feedback, 10);
  order.customerFeedbackComment = customer_feedback_comment;

  ordersUmap.set(order_id, order);

  logging.log(
    `Customer with account_id: ${customerId} has provided feedback for order with order_id: ${order_id}.`
  );
}

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

export function init(admin_account_id: string): void {
  const account_id = context.sender;
  const predecessor = context.predecessor;
  const account_balance = context.accountBalance;
  const attachedDeposit = context.attachedDeposit;

  logging.log(
    `account_id: ${account_id}, predecessor: ${predecessor}, account_balance: ${account_balance}, attachedDeposit: ${attachedDeposit}.`
  );

  assert_self();

  assert(
    MIN_ACCOUNT_BALANCE >= u128.from(25),
    "Minimum account balance required is 25N."
  );

  // assert(
  //   admin_account_id.endsWith(".testnet"),
  //   "AccountId must be a testnet account"
  // );

  assert(!adminsUmap.contains(admin_account_id), "Admin already exists.");

  const admin = new Admin(
    admin_account_id,
    context.blockTimestamp,
    context.blockTimestamp
  );

  adminsUmap.set(admin_account_id, admin);

  logging.log(`Admin with account_id: ${admin_account_id} created.`);
}
