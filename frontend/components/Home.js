import React, { useContext } from "react";
import { AuthContext } from "../lib/Auth";
import Orders from "./Orders";

export default function Home() {
  const { isSignedIn } = useContext(AuthContext);

  if (isSignedIn) {
    return <Orders />;
  }
  return (
    <div className="container">
      <img
        src="https://laundromint.co/wp-content/uploads/2018/02/Laundro-mint-banner-3.png"
        className="img-fluid"
        alt="banner image"
      ></img>

      <div className="my-2">
        <h6>Developed by Ramandeep Bhagat</h6>
      </div>
    </div>
  );
}
