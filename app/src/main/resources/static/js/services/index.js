// app/src/main/resources/static/js/services/index.js

/*
  Import the openModal function to handle showing login popups/modals
  Import the base API URL from the config file
  Define constants for the admin and doctor login API endpoints using the base URL

  Use the window.onload event to ensure DOM elements are available after page load
  Inside this function:
    - Select the "adminLogin" and "doctorLogin" buttons using getElementById
    - If the admin login button exists:
        - Add a click event listener that calls openModal('adminLogin') to show the admin login modal
    - If the doctor login button exists:
        - Add a click event listener that calls openModal('doctorLogin') to show the doctor login modal

  Define a function named adminLoginHandler on the global window object
  Define a function named doctorLoginHandler on the global window object
*/

import { openModal } from "../components/modals.js";
import { API_BASE_URL } from "../config/config.js";

const ADMIN_API = API_BASE_URL + "/admin";
const DOCTOR_API = API_BASE_URL + "/doctor/login";

window.onload = function () {
  const adminBtn = document.getElementById("adminLogin");
  if (adminBtn) {
    adminBtn.addEventListener("click", () => {
      openModal("adminLogin");
    });
  }

  const patientBtn = document.getElementById("patientLogin");
  if (patientBtn) {
    patientBtn.addEventListener("click", () => selectRole("patient"));
  }

  const doctorBtn = document.getElementById("doctorLogin");
  if (doctorBtn) {
    doctorBtn.addEventListener("click", () => {
      openModal("doctorLogin");
    });
  }
};

// -----------------------------
// Admin Login Handler (global)
// -----------------------------
window.adminLoginHandler = async function adminLoginHandler() {
  try {
    // Step 1: Get entered username and password
    const username = (document.getElementById("username")?.value || "").trim();
    const password = document.getElementById("password")?.value || "";

    // Step 2: Create admin object
    const admin = { username, password };

    // Step 3: POST request to ADMIN_API
    const response = await fetch(ADMIN_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(admin),
    });

    // Step 5: If login fails
    if (!response.ok) {
      alert("Invalid credentials!");
      return;
    }

    // Step 4: If successful, store token + select role
    const data = await response.json();
    const token = data?.token;

    localStorage.setItem("token", token);
    if (typeof window.selectRole === "function") {
      window.selectRole("admin");
    }
  } catch (error) {
    alert("Something went wrong. Please try again.");
  }
};

// -----------------------------
// Doctor Login Handler (global)
// -----------------------------
window.doctorLoginHandler = async function doctorLoginHandler() {
  try {
    // Step 1: Get entered email and password
    const email = (document.getElementById("email")?.value || "").trim();
    const password = document.getElementById("password")?.value || "";

    // Step 2: Create doctor object
    const doctor = { email, password };

    // Step 3: POST request to DOCTOR_API
    const response = await fetch(DOCTOR_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doctor),
    });

    // Step 5: If login fails
    if (!response.ok) {
      alert("Invalid credentials!");
      return;
    }

    // Step 4: If successful, store token + select role
    const data = await response.json();
    const token = data?.token;

    localStorage.setItem("token", token);
    if (typeof window.selectRole === "function") {
      window.selectRole("doctor");
    }
  } catch (error) {
    console.error("Doctor login error:", error);
    alert("Something went wrong. Please try again.");
  }
};

