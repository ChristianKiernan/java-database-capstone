import { openModal } from "../components/modals.js";
import { API_BASE_URL } from "../config/config.js";

const ADMIN_LOGIN_API = `${API_BASE_URL}/admin`;
const DOCTOR_LOGIN_API = `${API_BASE_URL}/doctor/login`;
const PATIENT_LOGIN_API = `${API_BASE_URL}/patient/login`;
const PATIENT_SIGNUP_API = `${API_BASE_URL}/patient`;

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM ready");

  const adminBtn = document.getElementById("adminBtn");
  const patientBtn = document.getElementById("patientBtn");
  const doctorBtn = document.getElementById("doctorBtn");

  // These are the 3 buttons on index.html
  adminBtn?.addEventListener("click", () => openModal("adminLogin"));
  patientBtn?.addEventListener("click", () => openModal("patientLogin")); // or "patientSignup" if you want signup first
  doctorBtn?.addEventListener("click", () => openModal("doctorLogin"));
});

/**
 * ADMIN login handler (called by modals.js when Admin modal button is clicked)
 * Modal inputs are: #username, #password
 */
window.adminLoginHandler = async function adminLoginHandler() {
  try {
    const username = document.getElementById("username")?.value?.trim();
    const password = document.getElementById("password")?.value?.trim();

    if (!username || !password) {
      alert("Please enter username and password.");
      return;
    }

    const res = await fetch(ADMIN_LOGIN_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data?.message || "Invalid admin credentials.");
      return;
    }

    // store token & redirect to dashboard
    localStorage.setItem("token", data.token);
    window.location.href = `/adminDashboard/${data.token}`;
  } catch (err) {
    console.error(err);
    alert("Something went wrong during admin login.");
  }
};

/**
 * DOCTOR login handler (called by modals.js when Doctor modal button is clicked)
 * Modal inputs are: #email, #password
 */
window.doctorLoginHandler = async function doctorLoginHandler() {
  try {
    const email = document.getElementById("email")?.value?.trim();
    const password = document.getElementById("password")?.value?.trim();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    const res = await fetch(DOCTOR_LOGIN_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data?.message || "Invalid doctor credentials.");
      return;
    }

    localStorage.setItem("token", data.token);
    window.location.href = `/doctorDashboard/${data.token}`;
  } catch (err) {
    console.error(err);
    alert("Something went wrong during doctor login.");
  }
};

/**
 * PATIENT login handler (called by modals.js when Patient Login modal button is clicked)
 * Modal inputs are: #email, #password
 */
window.loginPatient = async function loginPatient() {
  try {
    const email = document.getElementById("email")?.value?.trim();
    const password = document.getElementById("password")?.value?.trim();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    const res = await fetch(PATIENT_LOGIN_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data?.message || "Invalid patient credentials.");
      return;
    }

    localStorage.setItem("token", data.token);

    // If you have a patient dashboard route, change this:
    alert("Patient login success. Token saved to localStorage.");
    // window.location.href = `/patientDashboard/${data.token}`;
  } catch (err) {
    console.error(err);
    alert("Something went wrong during patient login.");
  }
};

/**
 * PATIENT signup handler (called by modals.js when Patient Signup modal button is clicked)
 * Modal inputs: #name #email #password #phone #address
 */
window.signupPatient = async function signupPatient() {
  try {
    const name = document.getElementById("name")?.value?.trim();
    const email = document.getElementById("email")?.value?.trim();
    const password = document.getElementById("password")?.value?.trim();
    const phone = document.getElementById("phone")?.value?.trim();
    const address = document.getElementById("address")?.value?.trim();

    if (!name || !email || !password || !phone || !address) {
      alert("Please fill out all signup fields.");
      return;
    }

    const res = await fetch(PATIENT_SIGNUP_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone, address }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data?.message || "Signup failed.");
      return;
    }

    alert(data?.message || "Signup successful. Now log in.");
    // Optionally open login after signup:
    openModal("patientLogin");
  } catch (err) {
    console.error(err);
    alert("Something went wrong during signup.");
  }
};
