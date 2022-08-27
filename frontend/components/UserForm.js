import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchCustomerByAccountId,
  createCustomer,
  updateCustomer,
} from "../near-api";

import { AuthContext } from "../lib/Auth";

import { isEmpty } from "../lib/utils";

export default function UserForm() {
  const { user, setUser, setLoader } = useContext(AuthContext);
  const navigate = useNavigate();

  const saveCustomer = async (
    inputNameValue,
    inputAddressValue,
    inputLandmarkValue,
    googlePlusCodeAddressValue,
    inputEmailValue,
    inputPhoneValue
  ) => {
    try {
      await createCustomer(
        inputNameValue,
        inputAddressValue,
        inputLandmarkValue,
        googlePlusCodeAddressValue,
        inputEmailValue,
        inputPhoneValue
      );

      const result = await fetchCustomerByAccountId(window.accountId);
      setUser(result);
      console.log("customer", result);

      alert("customer created");
      console.log("customer created");
    } catch (error) {
      console.log(error?.message);
      alert(`Error: \n${error?.message}`);
    } finally {
      setLoader(false);
    }
  };

  const editCustomer = async (
    inputNameValue,
    inputAddressValue,
    inputLandmarkValue,
    googlePlusCodeAddressValue,
    inputEmailValue,
    inputPhoneValue
  ) => {
    try {
      await updateCustomer(
        inputNameValue,
        inputAddressValue,
        inputLandmarkValue,
        googlePlusCodeAddressValue,
        inputEmailValue,
        inputPhoneValue
      );

      const result = await fetchCustomerByAccountId(window.accountId);
      setUser(result);
      console.log("customer", result);

      alert("customer updated");
      console.log("customer updated");
    } catch (error) {
      console.log(error?.message);
      alert(`Error: \n${error?.message}`);
    } finally {
      setLoader(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (window.walletConnection.isSignedIn()) {
      if (confirm("Are you sure?") != true) {
        console.log("action cancelled");
        return false;
      }

      setLoader(true);

      const {
        inputName,
        inputEmail,
        inputPhone,
        inputAddress,
        inputLandmark,
        googlePlusCodeAddress,
      } = e.target.elements;

      const isFormValid =
        !isEmpty(inputName.value) && !isEmpty(inputAddress.value);

      if (isFormValid) {
        if (!user?.name || !user?.fullAddress) {
          await saveCustomer(
            inputName.value,
            inputAddress.value,
            inputLandmark.value,
            googlePlusCodeAddress.value,
            inputEmail.value,
            inputPhone.value
          );
        } else {
          await editCustomer(
            inputName.value,
            inputAddress.value,
            inputLandmark.value,
            googlePlusCodeAddress.value,
            inputEmail.value,
            inputPhone.value
          );
        }
      } else {
        console.log("invalid_input");
        return;
      }
    } else {
      console.log("You must be logged in");
      alert("You must be logged in");
    }
  };

  useEffect(() => {
    if (window.walletConnection.isSignedIn()) {
      if (user?.role == 2) {
        navigate(`/`);
      }
    } else {
      navigate(`/`);
    }
  }, [window.walletConnection.isSignedIn]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-floating mb-3">
        <input
          type="text"
          className="form-control form-control-sm"
          id="inputName"
          defaultValue={user?.name}
          placeholder="John doe"
        />
        <label htmlFor="inputName">Full name</label>
      </div>

      <div className="form-floating mb-3">
        <input
          type="email"
          className="form-control form-control-sm"
          id="inputEmail"
          defaultValue={user?.email}
          placeholder="name@example.com"
        />
        <label htmlFor="inputEmail">Email address</label>
      </div>

      <div className="form-floating mb-3">
        <input
          type="tel"
          className="form-control form-control-sm"
          id="inputPhone"
          defaultValue={user?.phone}
          placeholder="1234567890"
        />
        <label htmlFor="inputPhone">Phone number</label>
      </div>

      <div className="form-floating mb-3">
        <input
          type="text"
          className="form-control form-control-sm"
          id="inputAddress"
          defaultValue={user?.fullAddress}
          placeholder="1234567890"
        />
        <label htmlFor="inputAddress">Full street address</label>
      </div>

      <div className="form-floating mb-3">
        <input
          type="text"
          className="form-control form-control-sm"
          id="inputLandmark"
          defaultValue={user?.landmark}
          placeholder="City center"
        />
        <label htmlFor="inputLandmark">Landmark</label>
      </div>

      <div className="form-floating mb-3">
        <input
          type="text"
          className="form-control form-control-sm"
          id="googlePlusCodeAddress"
          defaultValue={user?.googlePlusCodeAddress}
          placeholder="GPH90"
        />
        <label htmlFor="googlePlusCodeAddress">
          Google plus (precision) code address
        </label>
      </div>

      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
}
