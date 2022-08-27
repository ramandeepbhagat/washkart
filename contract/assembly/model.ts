import { PersistentUnorderedMap, PersistentVector } from "near-sdk-core";
import { AccountId, Amount, Timestamp } from "./utils";

/**
 * all available order statuses
 **/
export enum OrderStatus {
  confirmed = 1,
  inProgress,
  delivered,
  cancelled,
}

/**
 * all available payment types
 **/
export enum PaymentType {
  prepaid = 1,
}

/**
 * all available customer feedback responses
 **/
export enum CustomerFeedback {
  none = 1,
  excellent,
  good,
  average,
  bad,
  veryBad,
}

export enum UserRole {
  customer = 1,
  admin,
}

export type OrderId = string;

@nearBindgen
export class Admin {
  id: AccountId;
  role: UserRole = UserRole.admin;
  created: Timestamp;
  updated: Timestamp;

  constructor(id: AccountId, created: Timestamp, updated: Timestamp) {
    this.id = id;
    this.created = created;
    this.updated = updated;
  }
}

@nearBindgen
export class User {
  id: AccountId;
  name: string;
  fullAddress: string;
  landmark: string;
  googlePlusCodeAddress: string;
  phone: string;
  email: string;
  role: UserRole = UserRole.customer;
  orderIds: PersistentVector<OrderId>;
  created: Timestamp;
  updated: Timestamp;

  constructor(
    id: AccountId,
    name: string,
    fullAddress: string,
    landmark: string,
    googlePlusCodeAddress: string,
    phone: string,
    email: string,
    role: UserRole,
    orderIds: PersistentVector<OrderId>,
    created: Timestamp,
    updated: Timestamp
  ) {
    this.id = id;
    this.name = name;
    this.fullAddress = fullAddress;
    this.landmark = landmark;
    this.googlePlusCodeAddress = googlePlusCodeAddress;
    this.phone = phone;
    this.email = email;
    this.role = role;
    this.orderIds = orderIds;
    this.created = created;
    this.updated = updated;
  }
}

@nearBindgen
export class Order {
  id: OrderId;
  customerId: AccountId;
  description: string;
  weightInGrams: i32;
  priceInYoctoNear: Amount;
  paymentType: PaymentType = PaymentType.prepaid;
  status: OrderStatus = OrderStatus.confirmed;
  customerFeedback: CustomerFeedback;
  customerFeedbackComment: string;
  pickupDateTime: Timestamp;
  deliveryDateTime: Timestamp;

  constructor(
    id: OrderId,
    customerId: AccountId,
    description: string,
    weightInGrams: i32,
    paymentType: PaymentType,
    priceInYoctoNear: Amount,
    status: OrderStatus,
    customerFeedback: CustomerFeedback,
    customerFeedbackComment: string,
    pickupDateTime: Timestamp,
    deliveryDateTime: Timestamp
  ) {
    this.id = id;
    this.customerId = customerId;
    this.description = description;
    this.weightInGrams = weightInGrams;
    this.paymentType = paymentType;
    this.priceInYoctoNear = priceInYoctoNear;
    this.status = status;
    this.customerFeedback = customerFeedback;
    this.customerFeedbackComment = customerFeedbackComment;
    this.pickupDateTime = pickupDateTime;
    this.deliveryDateTime = deliveryDateTime;
  }
}

export const customersUmap = new PersistentUnorderedMap<AccountId, User>("c");

export const adminsUmap = new PersistentUnorderedMap<AccountId, Admin>("a");

export const ordersUmap = new PersistentUnorderedMap<OrderId, Order>("o");
