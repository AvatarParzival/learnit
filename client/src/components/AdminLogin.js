import React from "react";
import LoginBaseAdmin from "./auth/LoginBaseAdmin";

export default function AdminLogin() {
  return (
    <LoginBaseAdmin
      apiPath="/auth/login"
      onSuccessRedirect="/AdminDashboard"
    />
  );
}
