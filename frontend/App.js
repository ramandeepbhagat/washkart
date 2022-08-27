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
import UserForm from "./components/UserForm";
import OrderForm from "./components/OrderForm";
import Feedback from "./components/Feedback";

export default function App() {
  const { user, setUser, setLoader, setAdmins } = useContext(AuthContext);

  useEffect(() => {
    if (window.walletConnection.isSignedIn()) {
      (async () => {
        try {
          setLoader(true);
          const adminResult = await getAdminList();
          setAdmins(adminResult);

          if (adminResult.includes(window.accountId)) {
            setUser({ id: window.accountId, role: 2 });
          } else {
            const result = await fetchCustomerByAccountId(window.accountId);

            const user = result ? result : { id: window.accountId, role: 1 };
            setUser(user);
          }
        } catch (error) {
          console.error("[fetchCustomerByAccountId]: ", error?.message);
          setUser({ id: window.accountId, role: 1 });
        }
      })();
    }
  }, [
    window.walletConnection.isSignedIn,
    window.accountId,
    getAdminList,
    fetchCustomerByAccountId,
    fetchOrdersByCustomerAccountId,
    // setOrders,
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
          <Route path="o/new" element={<OrderForm />} />
          <Route path="o/:orderId" element={<Feedback />} />
        </Routes>
      </main>
    </>
  );
}
