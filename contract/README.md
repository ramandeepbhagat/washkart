# WASHKART

A [smart contract] written in [AssemblyScript] for an app initialized with [create-near-app]

# Quick Start

Before you compile this code, you will need to install [Node.js] ≥ 16

# Exploring The Code

1. The main smart contract code lives in `assembly/index.ts`.

2. Tests: You can run smart contract tests with the `npm run test` script. This runs
   standard AssemblyScript tests using [as-pect].

# Commands

## 1. Create a sub-account

`near create-account test.millefolium.testnet --masterAccount millefolium.testnet --initialBalance 100`

## 2. Deploy the contract

`near deploy --accountId test.millefolium.testnet --wasmFile ./contract/build/release/washkart.wasm --initFunction init --initArgs '{"admin_account_id": "millefolium.testnet"}'`

## 3. View list of admins

`near view test.millefolium.testnet view_admins`

## 4. Create a new customer

`near call washkart.YOUR-NAME.testnet call_create_customer '{"name": "john doe", "full_address": "369, wall street", "landmark": "", "google_plus_code_address": "", "phone": "9999567999", "email": "example@email.com"}' --accountId YOUR_ANOTHER_NAME.testnet`

## 5. Update a customer by accountId

`near call washkart.YOUR-NAME.testnet call_update_customer '{"name": "john doe", "full_address": "369, wall street, new york", "landmark": "city center", "google_plus_code_address": "", "phone": "9999567999", "email": "johndoe@email.com"}' --accountId YOUR_ANOTHER_NAME.testnet`

## 6. View list of customers

`near call washkart.YOUR-NAME.testnet call_customers --accountId YOUR-NAME.testnet`

## 7. Get a customer by accountId

`near call test.millefolium.testnet call_customer_by_account_id '{"account_id": "envoy.testnet"}' --accountId millefolium.testnet`

## 8. Create an order

`near call washkart.YOUR-NAME.testnet call_create_order '{"id": "fhjgjltg", "description": "simple order", "weight_in_grams": "6000", "price_in_yocto_near": "7000000000000000000000000"}' --deposit 7 --accountId YOUR_ANOTHER_NAME.testnet`

## 9. Update status of an order by orderId

`near call washkart.YOUR-NAME.testnet call_update_order_status '{"order_id": "fhjgjltg", "order_status": 2}' --accountId YOUR-NAME.testnet`

## 10. Get list of orders

`near call washkart.YOUR-NAME.testnet call_orders --accountId YOUR-NAME.testnet`

## 11. Get an order by orderId

`near call washkart.YOUR-NAME.testnet call_order_by_id '{"order_id": "wergjltg"}' --accountId YOUR_ANOTHER_NAME.testnet`

## 12. Get orders by customer accountId

`near call washkart.YOUR-NAME.testnet call_orders_by_customer_account_id '{"customer_account_id": "YOUR_ANOTHER_NAME.testnet"}' --accountId YOUR-NAME.testnet`

## 13. Delete sub-account

`near delete test.millefolium.testnet millefolium.testnet`
