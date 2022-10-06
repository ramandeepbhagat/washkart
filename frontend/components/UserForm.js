import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../lib/Auth";
import { isEmpty } from "../lib/utils";

export default function UserForm() {
  const { user, setUser, loader, setLoader, contract, isAdmin, isSignedIn } =
    useContext(AuthContext);
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
      setLoader(true);
      await contract.createCustomer(
        inputNameValue,
        inputAddressValue,
        inputLandmarkValue,
        googlePlusCodeAddressValue,
        inputEmailValue,
        inputPhoneValue
      );

      const result = await contract.fetchCustomerByAccountId(window.accountId);
      setUser(result);
      console.log("customer", result);

      alert("customer created");
      console.log("customer created");
      navigate(`/`);
    } catch (error) {
      console.error(`[saveCustomer] ${error?.message}`);
      alert(`[saveCustomer] Error: \n${error?.message}`);
    } finally {
      setLoader(false);
    }
  };

  const editCustomer = async (
    inputNameValue,
    inputPhoneValue,
    inputEmailValue,
    inputAddressValue,
    inputLandmarkValue,
    googlePlusCodeAddressValue
  ) => {
    try {
      setLoader(true);
      await contract.updateCustomer(
        inputNameValue,
        inputPhoneValue,
        inputEmailValue,
        inputAddressValue,
        inputLandmarkValue,
        googlePlusCodeAddressValue
      );

      const result = await contract.fetchCustomerByAccountId(window.accountId);
      setUser(result);
      console.log("customer", result);

      alert("customer updated");
      console.log("customer updated");
      navigate(`/`);
    } catch (error) {
      console.error(`[editCustomer] ${error?.message}`);
      alert(`[editCustomer] Error: \n${error?.message}`);
    } finally {
      setLoader(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isAdmin) {
      return;
    }

    if (isSignedIn) {
      if (confirm("Are you sure?") != true) {
        console.log("action cancelled");
        return false;
      }

      setLoader(true);

      const {
        inputName,
        inputPhone,
        inputEmail,
        inputAddress,
        inputLandmark,
        googlePlusCodeAddress,
      } = e.target.elements;

      const isFormValid =
        !isEmpty(inputName.value || "") &&
        !isEmpty(inputAddress.value || "") &&
        !isEmpty(inputPhone.value || "");

      if (isFormValid) {
        if (isEmpty(user?.name || "") || isEmpty(user?.fullAddress || "")) {
          console.log("createCustomer");
          await saveCustomer(
            inputName.value,
            inputPhone.value,
            inputEmail.value,
            inputAddress.value,
            inputLandmark.value,
            googlePlusCodeAddress.value
          );
        } else {
          console.log("updateCustomer");
          await editCustomer(
            inputName.value,
            inputPhone.value,
            inputEmail.value,
            inputAddress.value,
            inputLandmark.value,
            googlePlusCodeAddress.value
          );
        }
      } else {
        setLoader(false);
        console.error(`Name, phone and address are required`);
        alert("Name, phone and address are required.");
        return;
      }
    } else {
      setLoader(false);
      console.error("You must be logged in");
      alert("You must be logged in");
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      if (isAdmin) {
        navigate(`/`);
      }
    } else {
      navigate(`/`);
    }
  }, [isSignedIn]);

  return (
    <form onSubmit={(e) => loader == false && !isAdmin && handleSubmit(e)}>
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

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isAdmin || loader === true}
      >
        Submit
      </button>
    </form>
  );
}
