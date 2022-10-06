import "regenerator-runtime/runtime";
import React, { useEffect, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import "./assets/global.css";
import { AuthContext } from "./lib/Auth";

import Header from "./components/Header";
import Spinner from "./components/Spinner";
import Home from "./components/Home";
import UserForm from "./components/UserForm";
import OrderForm from "./components/OrderForm";
import Feedback from "./components/Feedback";
import ProjectDemo from "./components/ProjectDemo";

export default function App({ isSignedIn, accountId, contract, wallet }) {
  const {
    user,
    setUser,
    setLoader,
    setAdmins,
    setOrders,
    setContract,
    setIsSignedIn,
    setWallet,
    setIsAdmin,
  } = useContext(AuthContext);

  const fetchCurrentUser = async () => {
    console.log("exec: [fetchCurrentUser]");
    try {
      setLoader(true);
      const result = await contract.fetchCustomerByAccountId(accountId);
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
      setLoader(true);
      const adminResult = await contract.getAdminList();
      setAdmins(adminResult);

      let isUserAdmin = adminResult.find((admin) => admin.id == accountId);

      if (isUserAdmin) {
        setUser(isUserAdmin);
        setIsAdmin(true);
        await fetchOrdersForAdmin();
      } else {
        setUser({ id: accountId, role: 1 });
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
      const result = await contract.fetchOrderList();
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
      const result = await contract.fetchOrdersByCustomerAccountId(accountId);
      setOrders(result);
    } catch (error) {
      setLoader(false);
      console.error(`[fetchOrdersForCustomer] ${error?.message}`);
    } finally {
      console.log("finally: [fetchOrdersForCustomer]");
    }
  };

  useEffect(() => {
    setIsSignedIn(isSignedIn);
    (async () => {
      setWallet(wallet);
      setContract(contract);
      isSignedIn && (await fetchAdmins());
    })();
  }, []);

  return (
    <>
      <Header />
      <main className="container mb-4">
        {isSignedIn && <Spinner />}
        <Routes path="/" element={<Home />}>
          <Route path="account" element={<UserForm />} />
          <Route path="about" element={<ProjectDemo />} />
          <Route path="new" element={<OrderForm />} />
          <Route path=":orderId" element={<Feedback />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </>
  );
}
