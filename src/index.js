import React from "react";
import ReactDOM from "react-dom/client";

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import ErrorPage from "./ErrorPage";
import QRCodeScanner from "./routes/QRCodeScanner";

const router = createBrowserRouter([
  {
    path: "/",
    element: <QRCodeScanner />,
    errorElement: <ErrorPage />,
  },

  {
    path: "scan",
    element: <QRCodeScanner />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
