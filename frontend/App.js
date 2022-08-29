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
import ProjectDemo from "./components/ProjectDemo";

export default function App() {
  const { user, setUser, setLoader, setAdmins, setOrders } =
    useContext(AuthContext);

  const fetchCurrentUser = async () => {
    console.log("exec: [fetchCurrentUser]");
    try {
      setLoader(true);
      const result = await fetchCustomerByAccountId(window.accountId);
      await fetchOrdersForCustomer();
      setUser(result);
    } catch (error) {
      console.error(`[fetchCurrentUser] ${error?.message}`);
      setLoader(false);
    } finally {
      console.log("finally: [fetchCurrentUser]");
    }
  };

  const fetchAdmins = async () => {
    console.log("exec: [fetchAdmins]");
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
      console.log("finally: [fetchAdmins]");
    }
  };

  const fetchOrdersForAdmin = async () => {
    console.log("exec: [fetchOrdersForAdmin]");
    try {
      setLoader(true);
      const result = await fetchOrderList();
      setOrders(result);
    } catch (error) {
      setLoader(false);
      console.error(`[fetchOrdersForAdmin] ${error?.message}`);
    } finally {
      console.log("finally: [fetchOrdersForAdmin]");
    }
  };

  const fetchOrdersForCustomer = async () => {
    console.log("exec: [fetchOrdersForCustomer]");
    try {
      setLoader(true);
      const result = await fetchOrdersByCustomerAccountId(window?.accountId);
      setOrders(result);
    } catch (error) {
      setLoader(false);
      console.error(`[fetchOrdersForCustomer] ${error?.message}`);
    } finally {
      console.log("finally: [fetchOrdersForCustomer]");
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
          <Route path="about" element={<ProjectDemo />} />
          <Route path="o/new" element={<OrderForm />} />
          <Route path="o/:orderId" element={<Feedback />} />
        </Routes>
      </main>
    </>
  );
}
