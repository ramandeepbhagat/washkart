import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { utils } from "near-api-js";
import { AuthContext } from "../lib/Auth";
import { submitCustomerFeedbackByOrderId } from "../near-api";

export default function Feedback() {
  let { orderId } = useParams();
  //   let params = useParams();
  const { user, orders, loader, setLoader, setOrders } =
    useContext(AuthContext);
  const navigate = useNavigate();

  const [order, setOrder] = useState({
    description: "",
    paymentType: 1,
    priceInYoctoNear: "",
    customerFeedback: 1,
    customerFeedbackComment: "",
  });

  const [feedbackRating, setFeedbackRating] = useState(
    order?.customerFeedback || 1
  );
  const [feedbackComment, setFeedbackComment] = useState(
    order?.customerFeedbackComment || ""
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (window.walletConnection.isSignedIn()) {
      if (confirm("Are you sure?") != true) {
        console.log("action cancelled");
        return false;
      }
      if (order?.status != 3) {
        alert("Order must be Delivered to submit feedback.");
        return;
      }
      if (user?.role === 2) {
        alert("Only customers can submit feedback.");
        return;
      }

      const { inputRating, inputFeedbackComment } = e.target.elements;

      try {
        setLoader(true);

        await submitCustomerFeedbackByOrderId(
          order?.id,
          inputRating?.value,
          inputFeedbackComment?.value
        );

        const updatedOrders = orders.map((o) => {
          if (o?.id === orderId) {
            o.customerFeedback = inputRating?.value;
            o.customerFeedbackComment = inputFeedbackComment?.value;
          }
          return o;
        });
        setOrders(updatedOrders);
        alert("Feedback submitted");
        console.log("Feedback submitted");
      } catch (error) {
        console.log(error?.message);
        alert(`[submitCustomerFeedbackByOrderId] Error: \n${error?.message}`);
      } finally {
        setLoader(false);
      }
    }
  };

  useEffect(() => {
    if (window.walletConnection.isSignedIn()) {
      if (!orderId) {
        navigate(`/orders`);
      }
      if (orders?.length) {
        setLoader(true);
        const found = orders.find((o) => o?.id == orderId);

        if (found) {
          setOrder(Object.assign({}, order, found));
          setFeedbackRating(found?.customerFeedback);
          setFeedbackComment(found?.customerFeedbackComment);
        }
        setLoader(false);
      }
    } else {
      navigate(`/`);
      setLoader(false);
    }
  }, [
    window.walletConnection.isSignedIn,
    navigate,
    setOrder,
    setFeedbackRating,
    setFeedbackComment,
    orders,
    orderId,
  ]);

  return (
    <div className="container">
      <div className="row mb-3">
        <div className="col-sm-6 col-lg-6">
          <h4>Order Details</h4>
          <div className="mb-1 row">
            <label htmlFor="staticOrderId" className="col-sm-2 col-form-label">
              OrderId
            </label>
            <div className="col-sm-10">
              <input
                type="text"
                readOnly
                className="form-control-plaintext"
                id="staticOrderId"
                value={orderId}
              />
            </div>
          </div>
          <div className="mb-1 row">
            <label
              htmlFor="staticDescription"
              className="col-sm-2 col-form-label"
            >
              Description
            </label>
            <div className="col-sm-10">
              <input
                type="text"
                readOnly
                className="form-control-plaintext"
                id="staticDescription"
                value={order?.description}
              />
            </div>
          </div>
          <div className="mb-1 row">
            <label
              htmlFor="staticPaymentType"
              className="col-sm-2 col-form-label"
            >
              Payment
            </label>
            <div className="col-sm-10">
              <input
                type="text"
                readOnly
                className="form-control-plaintext"
                id="staticPaymentType"
                value={order?.paymentType === 1 ? "Prepaid" : ""}
              />
            </div>
          </div>
          <div className="mb-1 row">
            <label htmlFor="staticTotal" className="col-sm-2 col-form-label">
              Total
            </label>
            <div className="col-sm-10">
              <input
                type="text"
                readOnly
                className="form-control-plaintext"
                id="staticTotal"
                value={
                  utils.format.formatNearAmount(order?.priceInYoctoNear) + " N"
                }
              />
            </div>
          </div>
          <div className="mb-1 row">
            <label htmlFor="staticStatus" className="col-sm-2 col-form-label">
              Status
            </label>
            <div className="col-sm-10">
              <input
                type="text"
                readOnly
                className="form-control-plaintext"
                id="staticStatus"
                value={
                  order?.status == 1
                    ? "Confirmed"
                    : order?.status == 2
                    ? "In Progress"
                    : order?.status == 3
                    ? "Delivered"
                    : "Cancelled"
                }
              />
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-6">
          {order?.status === 3 && (
            <>
              <h4>Feedback Form</h4>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="inputRating" className="form-label">
                    Rating
                  </label>
                  <select
                    id="inputRating"
                    className="form-select form-select-sm mb-3"
                    aria-label=".form-select-sm"
                    readOnly={user?.role === 2}
                    value={feedbackRating}
                    onChange={(e) =>
                      user?.role === 1 && setFeedbackRating(e?.target?.value)
                    }
                  >
                    <option value={1}>None</option>
                    <option value={2}>Excellent</option>
                    <option value={3}>Good</option>
                    <option value={4}>Average</option>
                    <option value={5}>Bad</option>
                    <option value={6}>Very Bad</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="inputFeedbackComment" className="form-label">
                    Comment
                  </label>
                  <textarea
                    className="form-control"
                    id="inputFeedbackComment"
                    placeholder="Cutomer feedback comment"
                    readOnly={user?.role === 2}
                    value={feedbackComment}
                    onChange={(e) =>
                      user?.role === 1 && setFeedbackComment(e?.target?.value)
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={user?.role === 2 || loader === true}
                >
                  Submit
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
