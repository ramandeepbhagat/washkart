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
  const { user, setUser, setLoader, admins, setAdmins, setOrders } =
    useContext(AuthContext);

  const fetchCurrentUser = async () => {
    console.log("exec: fetchCurrentUser");
    try {
      setLoader(true);
      const result = await fetchCustomerByAccountId(window.accountId);
      await fetchOrdersForCustomer();
      setUser(result);
    } catch (error) {
      console.error(`[fetchCurrentUser] ${error?.message}`);
    } finally {
      setLoader(false);
    }
  };

  const fetchAdmins = async () => {
    console.log("exec: fetchAdmins");
    try {
      setUser({ id: window?.accountId });
      setLoader(true);
      const adminResult = await getAdminList();
      setAdmins(adminResult);

      if (adminResult.includes(window?.accountId)) {
        setUser({ id: window?.accountId, role: 2 });
        await fetchOrdersForAdmin();
      } else {
        await fetchCurrentUser();
      }
    } catch (error) {
      console.error(`[fetchAdmins] ${error?.message}`);
    } finally {
      setLoader(false);
    }
  };

  const fetchOrdersForAdmin = async () => {
    console.log("exec: fetchOrdersForAdmin");
    try {
      setLoader(false);
      const result = await fetchOrderList();
      setOrders(result);
    } catch (error) {
      console.error(`[fetchOrdersForAdmin] ${error?.message}`);
    } finally {
      setLoader(false);
    }
  };

  const fetchOrdersForCustomer = async () => {
    console.log("exec: fetchOrdersForCustomer");
    try {
      setLoader(false);
      const result = await fetchOrdersByCustomerAccountId(window?.accountId);
      setOrders(result);
    } catch (error) {
      console.error(`[fetchOrdersForCustomer] ${error?.message}`);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (window?.walletConnection?.isSignedIn()) {
      (async () => {
        await fetchAdmins();
      })();
    }
  }, [window.walletConnection.isSignedIn]);

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
