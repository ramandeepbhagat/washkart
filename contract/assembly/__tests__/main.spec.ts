import { context, VMContext } from "near-sdk-as";
import {
  about_project,
  call_create_customer,
  call_create_order,
  call_customer_feedback,
  call_update_order_status,
  init,
} from "..";
import {
  customersUmap,
  ordersUmap,
  User,
  Order,
  OrderStatus,
  adminsUmap,
  CustomerFeedback,
} from "../model";
import { toYocto } from "../utils";

const admin_accountId = "millefolium.testnet";
const customer_accountId = "envoy.testnet";
const order_id = "fhjgjltg";

describe("Washkart Contract ", () => {
  it("should return project info", () => {
    expect(about_project()).toBe("This is a sample project");
  });

  it("should create a customer", () => {
    VMContext.setSigner_account_id(customer_accountId);

    call_create_customer(
      "envoy",
      "369, wall street",
      "city center",
      "",
      "9999999999",
      ""
    );

    const newCustomer: User = customersUmap.getSome(customer_accountId);
    expect(newCustomer.id).toStrictEqual(customer_accountId);
  });

  it("should create an order", () => {
    VMContext.setSigner_account_id(customer_accountId);
    VMContext.setAttached_deposit(toYocto(3));
    VMContext.setAccount_balance(toYocto(50));

    call_create_customer(
      "envoy",
      "369, wall street",
      "city center",
      "",
      "9999999999",
      ""
    );

    call_create_order(order_id, "simple order", "2000", toYocto(3));

    const order: Order = ordersUmap.getSome(order_id);

    expect(order.id).toStrictEqual(order_id);
  });

  it("should update an order status", () => {
    VMContext.setCurrent_account_id(context.contractName);
    VMContext.setPredecessor_account_id(context.contractName);
    VMContext.setSigner_account_id(context.contractName);
    VMContext.setAttached_deposit(toYocto(50));
    VMContext.setAccount_balance(toYocto(100));

    init(admin_accountId);
    const admin = adminsUmap.getSome(admin_accountId);
    assert(admin.id == admin_accountId, "admin not created");
    expect(admin.id).toStrictEqual(admin_accountId);

    VMContext.setSigner_account_id(customer_accountId);
    VMContext.setCurrent_account_id(customer_accountId);
    VMContext.setPredecessor_account_id(customer_accountId);
    VMContext.setAccount_balance(toYocto(100));
    VMContext.setAttached_deposit(toYocto(50));

    call_create_customer(
      "envoy",
      "369, wall street",
      "city center",
      "",
      "9999999999",
      ""
    );
    const customer: User = customersUmap.getSome(customer_accountId);
    assert(customer.id == customer_accountId, "customer not created");
    expect(customer.id).toStrictEqual(customer_accountId);

    call_create_order(order_id, "simple order", "2000", toYocto(3));
    const order: Order = ordersUmap.getSome(order_id);
    assert(order.customerId == customer_accountId, "order not created");
    assert(order.status == OrderStatus.confirmed, "order not confirmed");
    expect(order.id).toStrictEqual(order_id);
    expect(order.status).toStrictEqual(OrderStatus.confirmed);

    VMContext.setSigner_account_id(admin_accountId);
    VMContext.setCurrent_account_id(admin_accountId);

    VMContext.setPredecessor_account_id(admin_accountId);
    VMContext.setAccount_balance(toYocto(100));
    VMContext.setAttached_deposit(toYocto(50));

    assert(context.sender == admin_accountId, "admin not set");

    call_update_order_status(order_id, OrderStatus.inProgress);
    const updatedOrder: Order = ordersUmap.getSome(order_id);
    assert(updatedOrder.id == order_id, "order not created");
    assert(
      updatedOrder.status == OrderStatus.inProgress,
      "order not inProgress"
    );

    expect(updatedOrder.status).toStrictEqual(OrderStatus.inProgress);
  });

  it("should submit customer feedback", () => {
    VMContext.setSigner_account_id(customer_accountId);
    VMContext.setAttached_deposit(toYocto(3));
    VMContext.setAccount_balance(toYocto(50));

    call_create_customer(
      "envoy",
      "369, wall street",
      "city center",
      "",
      "9999999999",
      ""
    );

    call_create_order(order_id, "simple order", "2000", toYocto(3));

    assert(ordersUmap.contains(order_id), "Order not found");

    const order = ordersUmap.getSome(order_id);

    VMContext.setSigner_account_id(admin_accountId);
    order.deliverOrder();
    ordersUmap.set(order_id, order);

    VMContext.setSigner_account_id(customer_accountId);
    call_customer_feedback(order_id, "3", "good service");

    const updatedOrder: Order = ordersUmap.getSome(order_id);

    expect(updatedOrder.status).toStrictEqual(OrderStatus.delivered);
    expect(updatedOrder.customerFeedback).toStrictEqual(CustomerFeedback.good);
    expect(updatedOrder.customerFeedbackComment).toStrictEqual("good service");
  });
});
