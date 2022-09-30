import {
  connect,
  Contract,
  keyStores,
  WalletConnection,
  utils,
} from "near-api-js";
import { getConfig } from "./near-config";

const nearConfig = getConfig(process.env.NODE_ENV || "development");

console.log("NODE_ENV: ", process.env.NODE_ENV);

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
      viewMethods: ["about_project", "view_admins"],
      // Change methods can modify the state. But you don't receive the returned value when called.
      changeMethods: [
        "call_create_customer",
        "call_update_customer",
        "call_customers",
        "call_customer_by_account_id",
        "call_create_order",
        "call_update_order_status",
        "call_orders",
        "call_order_by_id",
        "call_orders_by_customer_account_id",
        "call_customer_feedback",
      ],
    }
  );
}

export function signOutNearWallet() {
  window.walletConnection.signOut();
  // reload page
  window.location.replace(window.location.origin);
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
  let response = await window.contract.call_order_by_id({
    args: { order_id },
    gas: "900000000000000",
  });
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
    args: {
      name,
      full_address,
      landmark,
      google_plus_code_address,
      email,
      phone,
    },
    gas: "900000000000000",
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
    args: {
      name: name,
      full_address: full_address,
      landmark: landmark,
      google_plus_code_address: google_plus_code_address,
      email: email,
      phone: phone,
    },
    gas: "900000000000000",
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
      args: { account_id },
      gas: "900000000000000",
    });
    return response;
  } catch (error) {
    console.error(`[fetchCustomerByAccountId] ${error?.message}`);
    return { id: window.accountId, role: 1 };
  }
}

export async function createOrder(
  id,
  description,
  weight_in_grams,
  price_in_near
) {
  const price_in_yocto_near = utils.format.parseNearAmount(`${price_in_near}`);

  // works on vercel or netliify
  const callback_url = `${window.location.origin}`;

  const response = await window.contract.call_create_order({
    callbackUrl: callback_url,
    meta: "create order",
    args: {
      id,
      description,
      weight_in_grams,
      price_in_yocto_near,
    },
    gas: "900000000000000", // attached GAS
    amount: price_in_yocto_near, // attached deposit in yoctoNEAR
  });
  return response;
}

export async function updateOrderStatus(order_id, order_status) {
  const response = await window.contract.call_update_order_status({
    args: { order_id, order_status },
    gas: "900000000000000",
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
    args: { customer_account_id },
    gas: "900000000000000",
  });
  return response;
}

export async function submitCustomerFeedbackByOrderId(
  order_id,
  customer_feedback,
  customer_feedback_comment
) {
  const response = await window.contract.call_customer_feedback({
    args: { order_id, customer_feedback, customer_feedback_comment },
    gas: "900000000000000",
  });
  return response;
}
