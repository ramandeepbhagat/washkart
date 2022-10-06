import React, { useState } from "react";

const DEFAULT_USER = {
  id: null,
  name: null,
  role: null,
  email: null,
  phone: null,
  fullAddress: null,
  googlePlusCodeAddress: null,
  landmark: null,
  created: null,
  updated: null,
  orderIds: [],
};

export const AuthContext = React.createContext(DEFAULT_USER);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loader, setLoader] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [contract, setContract] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [wallet, setWallet] = useState(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        customers,
        setCustomers,
        orders,
        setOrders,
        admins,
        setAdmins,
        loader,
        setLoader,
        isSignedIn,
        setIsSignedIn,
        contract,
        setContract,
        wallet,
        setWallet,
        isAdmin,
        setIsAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
