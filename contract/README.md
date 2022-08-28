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

`near create-account washkart.YOUR-NAME.testnet --masterAccount YOUR-NAME.testnet --initialBalance 100`

## 2. Deploy the contract

`near deploy --accountId washkart.YOUR-NAME.testnet --wasmFile ./contract/build/release/washkart.wasm --initFunction init --initArgs '{"admin_account_id": "YOUR-NAME.testnet"}'`

## 3. View list of admins

`near view washkart.YOUR-NAME.testnet view_admins`

## 4. View list of customers

`near call washkart.YOUR-NAME.testnet call_customers --accountId YOUR-NAME.testnet`

## 5. Get a customer by accountId

`near call dev-1661436227767-18545050606864 call_customer_by_account_id '{"account_id": "YOUR-ANOTHER-NAME.testnet"}' --accountId YOUR-NAME.testnet`

## 6. Get list of orders

`near call washkart.YOUR-NAME.testnet call_orders --accountId YOUR-NAME.testnet`

## 7. Get an order by orderId

`near view washkart.YOUR-NAME.testnet view_order_by_id '{"order_id": "wergjltg"}'`

## 8. Get orders by customer accountId

`near call washkart.YOUR-NAME.testnet call_orders_by_customer_account_id '{"customer_account_id": "YOUR-ANOTHER-NAME.testnet"}' --accountId YOUR-NAME.testnet`

## 9. Create a new customer

`near call washkart.YOUR-NAME.testnet call_create_customer '{"name": "john doe", "full_address": "369, wall street", "landmark": "", "google_plus_code_address": "", "phone": "", "email": "example@email.com"}' --accountId YOUR-ANOTHER-NAME.testnet`

## 10. Update a customer by accountId

`near call washkart.YOUR-NAME.testnet call_update_customer '{"name": "john doe", "full_address": "369, wall street, new york", "landmark": "city center", "google_plus_code_address": "", "phone": "9999567999", "email": "johndoe@email.com"}' --accountId YOUR-ANOTHER-NAME.testnet`

## 11. Create an order

`near call washkart.YOUR-NAME.testnet call_create_order '{"id": "fhjgjltg", "description": "simple order", "weight_in_grams": '9000', "price_in_yocto_near": '100'}' --deposit 10 --accountId YOUR-ANOTHER-NAME.testnet`

## 12. Update status of an order by orderId

`near call washkart.YOUR-NAME.testnet call_update_order_status '{"order_id": "fhjgjltg", "order_status": 2}' --accountId YOUR-NAME.testnet`

## 13. Delete sub-account

`near delete washkart.YOUR-NAME.testnet YOUR-NAME.testnet`
