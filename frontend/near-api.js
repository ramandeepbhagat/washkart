import {
  connect,
  Contract,
  keyStores,
  WalletConnection,
  utils,
} from "near-api-js";
import { getConfig } from "./near-config";

const nearConfig = getConfig(process.env.NODE_ENV || "development");

// Initialize contract & set global variables
export async function initContract() {
  // Initialize connection to the NEAR testnet

  const near = await connect(
    Object.assign(
      { deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } },
      nearConfig
    )
  );

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near);

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId();

  window.contractName = nearConfig.contractName;

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(
    window.walletConnection.account(),
    nearConfig.contractName,
    {
      // View methods are read only. They don't modify the state, but usually return some value.
      viewMethods: ["about_project", "view_order_by_id", "view_admins"],
      // Change methods can modify the state. But you don't receive the returned value when called.
      changeMethods: [
        "call_create_customer",
        "call_update_customer",
        "call_customers",
        "call_customer_by_account_id",
        "call_create_order",
        "call_update_order_status",
        "call_orders",
        "call_orders_by_customer_account_id",
        "call_customer_feedback",
      ],
    }
  );
}

export function signOutNearWallet() {
  window.walletConnection.signOut();
  // reload page
  window.location.replace(window.location.origin + window.location.pathname);
}

export function signInWithNearWallet() {
  // Allow the current app to make calls to the specified contract on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.
  window.walletConnection.requestSignIn(nearConfig.contractName);
}

// view functions
export async function getProjectInfo() {
  let response = await window.contract.about_project();
  return response;
}

export async function getOrderById(order_id) {
  let response = await window.contract.view_order_by_id({ order_id });
  return response;
}

export async function getAdminList() {
  let response = await window.contract.view_admins();
  return response;
}

// change functions
export async function createCustomer(
  name,
  full_address,
  landmark,
  google_plus_code_address,
  email,
  phone
) {
  const response = await window.contract.call_create_customer({
    name,
    full_address,
    landmark,
    google_plus_code_address,
    email,
    phone,
  });
  return response;
}

export async function updateCustomer(
  name,
  full_address,
  landmark,
  google_plus_code_address,
  email,
  phone
) {
  const response = await window.contract.call_update_customer({
    name: name,
    full_address: full_address,
    landmark: landmark,
    google_plus_code_address: google_plus_code_address,
    email: email,
    phone: phone,
  });
  return response;
}

export async function fetchCustomerList() {
  const response = await window.contract.call_customers({
    args: {},
  });
  return response;
}

export async function fetchCustomerByAccountId(account_id) {
  try {
    const response = await window.contract.call_customer_by_account_id({
      account_id,
    });
    return response;
  } catch (error) {
    return null;
  }
}

export async function createOrder(
  id,
  description,
  weight_in_grams,
  price_in_near
) {
  const price_in_yocto_near = utils.format.parseNearAmount(`${price_in_near}`);

  const response = await window.contract.call_create_order({
    callbackUrl: `${window.location.origin}/orders`,
    meta: "create order",
    args: {
      id,
      description,
      weight_in_grams,
      price_in_yocto_near,
    },
    gas: "300000000000000", // attached GAS
    amount: price_in_yocto_near, // attached deposit in yoctoNEAR
  });
  return response;
}

export async function updateOrderStatus(order_id, order_status) {
  const response = await window.contract.call_update_order_status({
    order_id,
    order_status,
  });
  return response;
}

export async function fetchOrderList() {
  const response = await window.contract.call_orders({
    args: {},
  });
  return response;
}

export async function fetchOrdersByCustomerAccountId(customer_account_id) {
  const response = await window.contract.call_orders_by_customer_account_id({
    customer_account_id,
  });
  return response;
}

export async function submitCustomerFeedbackByOrderId(
  order_id,
  customer_feedback,
  customer_feedback_comment
) {
  const response = await window.contract.call_customer_feedback({
    order_id,
    customer_feedback,
    customer_feedback_comment,
  });
  return response;
}
