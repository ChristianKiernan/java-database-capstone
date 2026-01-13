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
  This function will be triggered when the admin submits their login credentials
  ...
  Define a function named doctorLoginHandler on the global window object
  ...
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

  const doctorBtn = document.getElementById("doctorLogin");
  if (doctorBtn) {
    doctorBtn.addEventListener("click", () => {
      openModal("doctorLogin");
    });
  }
};

// Admin login handler (must be globally accessible)
window.adminLoginHandler = async function adminLoginHandler() {
  try {
    const username = document.getElementById("adminUsername")?.value?.trim();
    const password = document.getElementById("adminPassword")?.value?.trim();

    const admin = { username, password };

    const res = await fetch(ADMIN_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(admin),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      selectRole("admin");
    } else {
      alert("Invalid credentials!");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again.");
  }
};

// Doctor login handler (must be globally accessible)
window.doctorLoginHandler = async function doctorLoginHandler() {
  try {
    const email = document.getElementById("doctorEmail")?.value?.trim();
    const password = document.getElementById("doctorPassword")?.value?.trim();

    const doctor = { email, password };

    const res = await fetch(DOCTOR_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doctor),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      selectRole("doctor");
    } else {
      alert("Invalid credentials!");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again.");
  }
};
