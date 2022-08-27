import React from "react";
import { Link } from "react-router-dom";
import { signInWithNearWallet, signOutNearWallet } from "../near-api";

export default function Header({ user }) {
  return (
    <div className="container">
      <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom">
        <Link
          to="/"
          className="d-flex align-items-center col-md-3 mb-2 mb-md-0 text-dark text-decoration-none"
        >
          <span className="fs-4">Washkart</span>
        </Link>

        <ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
          <li>
            <Link to="/" className="nav-link px-2 link-secondary">
              Home
            </Link>
          </li>

          {user?.role != 2 && (
            <>
              <li>
                <Link to="/account" className="nav-link px-2 link-dark">
                  Account
                </Link>
              </li>
              <li>
                <Link
                  to="/o/new"
                  className=" btn btn-sm nav-link px-2 link-success"
                >
                  New Order
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="col-md-4 text-end">
          {user === null ? (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary me-2"
              onClick={signInWithNearWallet}
            >
              Login
            </button>
          ) : (
            <>
              <span className="fs-6 me-2">{user?.id}</span>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={signOutNearWallet}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>
    </div>
  );
}
