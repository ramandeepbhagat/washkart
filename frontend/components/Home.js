import React from "react";
import Orders from "./Orders";

export default function Home() {
  if (window.walletConnection.isSignedIn()) {
    return <Orders />;
  }
  return (
    <div className="container">
      <img
        src="https://laundromint.co/wp-content/uploads/2018/02/Laundro-mint-banner-3.png"
        className="img-fluid"
        alt="banner image"
      ></img>

      <div className="my-2 px-2">
        <h4>
          <a href="https://github.com/ramandeepbhagat/washkart" target="_blank">
            Source code
          </a>
        </h4>
      </div>
    </div>
  );
}
