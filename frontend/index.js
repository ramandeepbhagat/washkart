import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { initContract } from "./near-api";
import { AuthProvider } from "./lib/Auth";

const reactRoot = createRoot(document.querySelector("#root"));

window.nearInitPromise = initContract()
  .then(({ contract, walletConnection }) => {
    reactRoot.render(
      <AuthProvider>
        <BrowserRouter>
          <App contract={contract} walletConnection={walletConnection} />
        </BrowserRouter>
      </AuthProvider>
    );
  })
  .catch((e) => {
    reactRoot.render(
      <div style={{ color: "red" }}>
        Error: <code>{e.message}</code>
      </div>
    );
    console.error(e);
  });
