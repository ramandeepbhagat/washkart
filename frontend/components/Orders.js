import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { utils } from "near-api-js";
import { AuthContext } from "../lib/Auth";
import {
  fetchOrdersByCustomerAccountId,
  fetchOrderList,
  updateOrderStatus,
} from "../near-api";

export default function Orders() {
  const { user, orders, setOrders, setLoader } = useContext(AuthContext);

  const handleStatusChange = async (status, order) => {
    try {
      if (user?.role === 2 && confirm("Are you sure?") == true) {
        setLoader(true);

        await updateOrderStatus(order?.id, parseInt(status, 10));

        const updatedOrders = orders.map((o) => {
          if (o?.id === order?.id) {
            o.status = parseInt(status, 10);
          }
          return o;
        });

        setOrders(updatedOrders);

        console.log("Order status updated");
        alert("Order status updated");
      }
    } catch (error) {
      console.log(`[handleStatusChange] Error: \n${error?.message}`);
      alert(`[handleStatusChange] Error: \n${error?.message}`);
    } finally {
      setLoader(false);
    }
  };

  const fetchOrdersForAdmin = async () => {
    try {
      const result = await fetchOrderList();
      setOrders(result);
    } catch (error) {
      console.error(`[fetchOrdersForAdmin] ${error?.message}`);
    } finally {
      setLoader(false);
    }
  };

  const fetchOrdersForCustomer = async () => {
    try {
      const result = await fetchOrdersByCustomerAccountId(user?.id);
      setOrders(result);
    } catch (error) {
      console.error(`[fetchOrdersForCustomer] ${error?.message}`);
    } finally {
      setLoader(false);
    }
  };

  const fetchOrders = async () => {
    setLoader(true);
    if (user?.role === 1) {
      await fetchOrdersForCustomer();
    } else if (user?.role === 2) {
      await fetchOrdersForAdmin();
    }
  };

  useEffect(() => {
    if (window.walletConnection.isSignedIn()) {
      (async () => {
        await fetchOrders();
      })();
    }
  }, [window.walletConnection.isSignedIn, fetchOrders]);

  return (
    <div className="container">
      <div className="table-responsive">
        <table className="table caption-top">
          <caption>List of orders</caption>
          <thead>
            <tr>
              <th scope="col">OrderId</th>
              {user?.role === 2 && <th scope="col">CustomerId</th>}
              <th scope="col">Payment</th>
              <th scope="col">Total (Near)</th>
              <th scope="col">Status</th>
              <th scope="col">Pickup</th>
              <th scope="col">Delivery</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((o) => {
              return (
                <tr key={o?.id}>
                  <td>
                    <Link to={`/o/${o?.id}`}>{o?.id}</Link>
                  </td>
                  {user?.role === 2 && <td>{o?.customerId}</td>}
                  <td>{o?.paymentType === 1 ? "Prepaid" : ""}</td>
                  <td>
                    {utils.format.formatNearAmount(o?.priceInYoctoNear)} N
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      aria-label=".form-select-sm"
                      value={o?.status}
                      onChange={(e) => handleStatusChange(e?.target?.value, o)}
                    >
                      <option value={1}>Confirmed</option>
                      <option value={2}>In Progress</option>
                      <option value={3}>Delivered</option>
                      <option value={4}>Cancelled</option>
                    </select>
                  </td>
                  <td>
                    {new Date(o?.pickupDateTime / 1000000).toLocaleString()}
                  </td>
                  <td>
                    {o?.deliveryDateTime == "0"
                      ? "-"
                      : new Date(
                          o?.deliveryDateTime / 1000000
                        ).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
