import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { utils } from "near-api-js";
import { AuthContext } from "../lib/Auth";
import { updateOrderStatus } from "../near-api";

export default function Orders() {
  const { user, orders, setOrders, setLoader } = useContext(AuthContext);

  const handleStatusChange = async (status, order) => {
    console.log("exec: handleStatusChange");
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

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center">
        <h5>List of orders</h5>
        <Link to="/o/new" className="btn btn-sm px-2 btn-success">
          New order
        </Link>
      </div>
      <div className="table-responsive">
        <table className="table caption-top">
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
