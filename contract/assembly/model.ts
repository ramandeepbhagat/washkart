import { PersistentUnorderedMap, PersistentVector } from "near-sdk-core";
import { AccountId, Amount, Timestamp } from "./utils";
import { context } from "near-sdk-as";

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

  constructor(id: AccountId) {
    this.id = id;
    this.created = context.blockTimestamp;
    this.updated = context.blockTimestamp;
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
    role: UserRole
  ) {
    this.id = id;
    this.name = name;
    this.fullAddress = fullAddress;
    this.landmark = landmark;
    this.googlePlusCodeAddress = googlePlusCodeAddress;
    this.phone = phone;
    this.email = email;
    this.role = role;
    this.orderIds = new PersistentVector<OrderId>("co:" + id);
    this.created = context.blockTimestamp;
    this.updated = context.blockTimestamp;
  }

  public updateCustomter(
    name: string,
    fullAddress: string,
    landmark: string,
    googlePlusCodeAddress: string,
    phone: string,
    email: string
  ): void {
    this.name = name;
    this.fullAddress = fullAddress;
    this.landmark = landmark;
    this.googlePlusCodeAddress = googlePlusCodeAddress;
    this.phone = phone;
    this.email = email;
    this.updated = context.blockTimestamp;
  }
}

@nearBindgen
export class Order {
  id: OrderId;
  customerId: AccountId;
  description: string;
  weightInGrams: u32;
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
    weightInGrams: u32,
    paymentType: PaymentType,
    priceInYoctoNear: Amount,
    status: OrderStatus,
    customerFeedback: CustomerFeedback,
    customerFeedbackComment: string,
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
    this.pickupDateTime = context.blockTimestamp;
    this.deliveryDateTime = deliveryDateTime;
  }

  public deliverOrder(): void {
    this.status = OrderStatus.delivered;
    this.deliveryDateTime = context.blockTimestamp;
  }

  public updateStatus(status: OrderStatus): void {
    this.status = status;
  }

  public addFeedback(
    customer_feedback: string,
    customer_feedback_comment: string
  ): void {
    this.customerFeedback = U32.parseInt(customer_feedback, 10);
    this.customerFeedbackComment = customer_feedback_comment;
  }
}

export const customersUmap = new PersistentUnorderedMap<AccountId, User>("c");

export const adminsUmap = new PersistentUnorderedMap<AccountId, Admin>("a");

export const ordersUmap = new PersistentUnorderedMap<OrderId, Order>("o");
