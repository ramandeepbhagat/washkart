/* Talking with a contract often involves transforming data, we recommend you to encapsulate that logic into a class */
import { utils } from "near-api-js";

export class NearContract {
  constructor({ contractId, walletToUse }) {
    this.contractId = contractId;
    this.wallet = walletToUse;
  }

  // view_methods
  async getProjectInfo() {
    return await this.wallet.viewMethod({
      contractId: this.contractId,
      method: "about_project",
      args: {},
    });
  }

  async getAdminList() {
    return await this.wallet.viewMethod({
      contractId: this.contractId,
      method: "view_admins",
      args: {},
    });
  }

  // change_methods

  async getOrderById(order_id) {
    return await this.wallet.callMethod({
      contractId: this.contractId,
      method: "call_order_by_id",
      args: { order_id },
    });
  }

  async fetchCustomerList() {
    return await this.wallet.callMethod({
      contractId: this.contractId,
      method: "call_customers",
      args: {},
    });
  }

  async fetchCustomerByAccountId(account_id) {
    return await this.wallet.callMethod({
      contractId: this.contractId,
      method: "call_customer_by_account_id",
      args: { account_id },
    });
  }

  async createCustomer(
    name,
    phone,
    email,
    full_address,
    landmark,
    google_plus_code_address
  ) {
    return await this.wallet.callMethod({
      contractId: this.contractId,
      method: "call_create_customer",
      args: {
        name,
        phone,
        email,
        full_address,
        landmark,
        google_plus_code_address,
      },
    });
  }

  async updateCustomer(
    name,
    phone,
    email,
    full_address,
    landmark,
    google_plus_code_address
  ) {
    return await this.wallet.callMethod({
      contractId: this.contractId,
      method: "call_update_customer",
      args: {
        name,
        phone,
        email,
        full_address,
        landmark,
        google_plus_code_address,
      },
    });
  }

  async createOrder(id, description, weight_in_grams, price_in_near) {
    const price_in_yocto_near = utils.format.parseNearAmount(
      `${price_in_near}`
    );

    console.log("price_in_near", price_in_near);
    console.log("price_in_yocto_near", price_in_yocto_near);

    // price_in_near 3
    // price_in_yocto_near 3000000000000000000000000

    return await this.wallet.callMethod({
      contractId: this.contractId,
      method: "call_create_order",
      args: {
        id,
        description,
        weight_in_grams,
        price_in_yocto_near: `${price_in_near}`,
      },
      deposit: price_in_yocto_near,
    });
  }

  async updateOrderStatus(order_id, order_status) {
    return await this.wallet.callMethod({
      contractId: this.contractId,
      method: "call_update_order_status",
      args: {
        order_id,
        order_status,
      },
    });
  }

  async fetchOrderList() {
    return await this.wallet.callMethod({
      contractId: this.contractId,
      method: "call_orders",
      args: {},
    });
  }

  async fetchOrdersByCustomerAccountId(customer_account_id) {
    return await this.wallet.callMethod({
      contractId: this.contractId,
      method: "call_orders_by_customer_account_id",
      args: { customer_account_id },
    });
  }

  async submitCustomerFeedbackByOrderId(
    order_id,
    customer_feedback,
    customer_feedback_comment = ""
  ) {
    const deposit = utils.format.parseNearAmount(`${1}`);

    return await this.wallet.callMethod({
      contractId: this.contractId,
      method: "call_customer_feedback",
      args: {
        order_id,
        customer_feedback,
        customer_feedback_comment,
      },
      deposit,
    });
  }
}
