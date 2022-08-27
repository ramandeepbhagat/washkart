import "regenerator-runtime/runtime";
import React, { useEffect, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import "./assets/global.css";

import {
  fetchCustomerByAccountId,
  getAdminList,
  fetchOrdersByCustomerAccountId,
  fetchOrderList,
} from "./near-api";
import { AuthContext } from "./lib/Auth";

import Header from "./components/Header";
import Spinner from "./components/Spinner";
import Home from "./components/Home";
import Orders from "./components/Orders";
import UserForm from "./components/UserForm";
import OrderForm from "./components/OrderForm";
import Feedback from "./components/Feedback";

export default function App() {
  const { user, setUser, setLoader, setAdmins, setOrders } =
    useContext(AuthContext);

  useEffect(() => {
    if (window.walletConnection.isSignedIn()) {
      (async () => {
        try {
          setLoader(true);
          const adminResult = await getAdminList();
          setAdmins(adminResult);

          if (adminResult.includes(window.accountId)) {
            setUser({ id: window.accountId, role: 2 });
            const orders = await fetchOrderList();
            setOrders(orders);
          } else {
            const result = await Promise.all([
              fetchCustomerByAccountId(window.accountId),
              fetchOrdersByCustomerAccountId(window.accountId),
            ]);

            if (result?.length) {
              const userResult = result[0];
              const orders = result[1];

              const user = userResult
                ? userResult
                : { id: window.accountId, role: 1 };
              setUser(user);
              setOrders(orders);
            }
          }
        } catch (error) {
          console.error("[fetchCustomerByAccountId]: ", error?.message);
          setUser({ id: window.accountId, role: 1 });
          setOrders([]);
        } finally {
          console.log("finally");
          setLoader(false);
        }
      })();
    } else {
      setLoader(false);
    }
  }, [
    window.walletConnection.isSignedIn,
    window.accountId,
    getAdminList,
    fetchCustomerByAccountId,
    fetchOrdersByCustomerAccountId,
    setOrders,
    setUser,
    setLoader,
  ]);

  return (
    <>
      <Header user={user} />
      <main className="container mb-4">
        {window.walletConnection.isSignedIn() && <Spinner />}
        <Routes>
          <Route path="*" element={<Home />} />
          <Route path="account" element={<UserForm />} />
          <Route path="new-order" element={<OrderForm />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:orderId" element={<Feedback />} />
        </Routes>
      </main>
    </>
  );
}
