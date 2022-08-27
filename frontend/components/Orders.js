import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { utils } from "near-api-js";
import { AuthContext } from "../lib/Auth";
import {
  fetchOrdersByCustomerAccountId,
  fetchOrderList,
  updateOrderStatus,
} from "../near-api";

export default function Orders() {
  const { user, orders, setOrders, loader, setLoader } =
    useContext(AuthContext);

  const navigate = useNavigate();

  const handleStatusChange = async (status, order) => {
    try {
      if (user?.role === 2 && confirm("Are you sure?") == true) {
        setLoader(true);

        const result = await updateOrderStatus(order?.id, parseInt(status, 10));
        console.log(result);

        const updatedOrders = orders.map((o) => {
          if (o.id === order?.id) {
            o.status = parseInt(status, 10);
          }
          return o;
        });

        setOrders(updatedOrders);

        alert("Order status updated");
        console.log("Order status updated");
      }
    } catch (error) {
      console.log(error.message);
      alert(`handleStatusChange Error: \n${error?.message}`);
    } finally {
      setLoader(false);
    }
  };

  const fetchOrders = async () => {
    try {
      if (user?.role === 1) {
        const result = await fetchOrdersByCustomerAccountId(user?.id);
        setOrders(result);
      } else if (user?.role === 2) {
        const result = await fetchOrderList();
        setOrders(result);
      } else {
        return;
      }
    } catch (error) {
      console.log(error.message);
      alert(`fetchOrders Error: \n${error?.message}`);
    } finally {
    }
  };

  useEffect(() => {
    if (window.walletConnection.isSignedIn()) {
      (async () => {
        await fetchOrders();
      })();
    } else {
      navigate(`/`);
    }
  }, [window.walletConnection.isSignedIn, fetchOrders, loader]);

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
                    <Link to={`/orders/${o?.id}`}>{o?.id}</Link>
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
