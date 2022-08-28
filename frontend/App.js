import "regenerator-runtime/runtime";
import React, { useEffect, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import "./assets/global.css";

import {
  fetchCustomerByAccountId,
  getAdminList,
  fetchOrdersByCustomerAccountId,
} from "./near-api";
import { AuthContext } from "./lib/Auth";

import Header from "./components/Header";
import Spinner from "./components/Spinner";
import Home from "./components/Home";
import UserForm from "./components/UserForm";
import OrderForm from "./components/OrderForm";
import Feedback from "./components/Feedback";

export default function App() {
  const { user, setUser, setLoader, admins, setAdmins } =
    useContext(AuthContext);

  const fetchCurrentUser = async () => {
    try {
      const result = await fetchCustomerByAccountId(window.accountId);
      setUser(result);
    } catch (error) {
      setUser({ id: window.accountId, role: 1 });
      console.error(`[fetchCurrentUser] ${error?.message}`);
    } finally {
      setLoader(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      setLoader(true);
      const adminResult = await getAdminList();
      setAdmins(adminResult);

      if (admins.includes(window.accountId)) {
        setUser({ id: window.accountId, role: 2 });
      }
    } catch (error) {
      console.error(`[fetchAdmins] ${error?.message}`);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (window?.walletConnection?.isSignedIn()) {
      (async () => {
        await fetchAdmins();

        if (!admins.includes(window?.accountId)) {
          await fetchCurrentUser();
        }
      })();
    }
  }, []);

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
