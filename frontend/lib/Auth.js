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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
