import React from "react";
import RegisterBaseAdmin from "./auth/RegisterBaseAdmin";

export default function AdminSignup() {
  return (
    <RegisterBaseAdmin
      apiPath="/auth/register"
      onSuccessRedirect="/login/admin"
    />
  );
}
