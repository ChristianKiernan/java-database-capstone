// ./src/main/resources/static/js/services/index.js

import { openModal } from "../components/modals.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM ready (index.js)");

  const adminBtn = document.getElementById("adminBtn");
  const patientBtn = document.getElementById("patientBtn");
  const doctorBtn = document.getElementById("doctorBtn");

  console.log({ adminBtn, patientBtn, doctorBtn });

  adminBtn?.addEventListener("click", () => {
    console.log("Admin clicked -> opening adminLogin modal");
    openModal("adminLogin");
  });

  patientBtn?.addEventListener("click", () => {
    console.log("Patient clicked -> opening patientLogin modal");
    openModal("patientLogin");
  });

  doctorBtn?.addEventListener("click", () => {
    console.log("Doctor clicked -> opening doctorLogin modal");
    openModal("doctorLogin");
  });
});
