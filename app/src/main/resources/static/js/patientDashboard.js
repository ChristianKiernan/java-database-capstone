// patientDashboard.js

// Import Required Modules
import { createDoctorCard } from "./components/doctorCard.js";
import { openModal } from "./components/modals.js";
import { getDoctors, filterDoctors } from "./services/doctorServices.js";
import { patientLogin, patientSignup } from "./services/patientServices.js";

// Load Doctor Cards on Page Load
document.addEventListener("DOMContentLoaded", () => {
  loadDoctorCards();

  // Bind Modal Triggers for Login and Signup
  const signupBtn = document.getElementById("patientSignup");
  if (signupBtn) signupBtn.addEventListener("click", () => openModal("patientSignup"));

  const loginBtn = document.getElementById("patientLogin");
  if (loginBtn) loginBtn.addEventListener("click", () => openModal("patientLogin"));

  // Search and Filter Logic
  const searchBar = document.getElementById("searchBar");
  const filterTimeEl = document.getElementById("filterTime");
  const filterSpecialtyEl = document.getElementById("filterSpecialty");

  if (searchBar) searchBar.addEventListener("input", filterDoctorsOnChange);
  if (filterTimeEl) filterTimeEl.addEventListener("change", filterDoctorsOnChange);
  if (filterSpecialtyEl) filterSpecialtyEl.addEventListener("change", filterDoctorsOnChange);
});

// Fetch doctors and render cards
async function loadDoctorCards() {
  try {
    const doctors = await getDoctors();
    renderDoctorCards(doctors);
  } catch (err) {
    console.error("Failed to load doctors:", err);
    const contentDiv = document.getElementById("content");
    if (contentDiv) contentDiv.innerHTML = "<p>Unable to load doctors right now.</p>";
  }
}

// Filter doctors based on input values
async function filterDoctorsOnChange() {
  try {
    const searchValue = document.getElementById("searchBar")?.value?.trim() || "";
    const timeValue = document.getElementById("filterTime")?.value || "";
    const specialtyValue = document.getElementById("filterSpecialty")?.value || "";

    const name = searchValue.length > 0 ? searchValue : null;
    const time = timeValue.length > 0 ? timeValue : null;
    const specialty = specialtyValue.length > 0 ? specialtyValue : null;

    const doctors = await filterDoctors(name, time, specialty);

    if (doctors && doctors.length > 0) {
      renderDoctorCards(doctors);
    } else {
      const contentDiv = document.getElementById("content");
      if (contentDiv) contentDiv.innerHTML = "<p>No doctors found with the given filters.</p>";
    }
  } catch (err) {
    console.error("Failed to filter doctors:", err);
    alert("❌ An error occurred while filtering doctors.");
  }
}

// Render Utility (can be reused by other modules)
function renderDoctorCards(doctors) {
  const contentDiv = document.getElementById("content");
  if (!contentDiv) return;

  contentDiv.innerHTML = "";

  if (!doctors || doctors.length === 0) {
    contentDiv.innerHTML = "<p>No doctors found.</p>";
    return;
  }

  doctors.forEach((doctor) => {
    const card = createDoctorCard(doctor);
    contentDiv.appendChild(card);
  });
}

// Handle Patient Signup
window.signupPatient = async function () {
  try {
    const name = document.getElementById("name")?.value?.trim();
    const email = document.getElementById("email")?.value?.trim();
    const password = document.getElementById("password")?.value?.trim();
    const phone = document.getElementById("phone")?.value?.trim();
    const address = document.getElementById("address")?.value?.trim();

    const data = { name, email, password, phone, address };

    const { success, message } = await patientSignup(data);

    if (success) {
      alert(message);
      const modal = document.getElementById("modal");
      if (modal) modal.style.display = "none";
      window.location.reload();
    } else {
      alert(message);
    }
  } catch (err) {
    console.error("Signup failed:", err);
    alert("❌ An error occurred while signing up.");
  }
};

// Handle Patient Login
window.loginPatient = async function () {
  try {
    const email = document.getElementById("email")?.value?.trim();
    const password = document.getElementById("password")?.value?.trim();

    const data = { email, password };

    const response = await patientLogin(data);

    if (response.ok) {
      const result = await response.json();
      localStorage.setItem("token", result.token);
      selectRole("loggedPatient");
      window.location.href = "/pages/loggedPatientDashboard.html";
    } else {
      alert("❌ Invalid credentials!");
    }
  } catch (err) {
    console.error("Login failed:", err);
    alert("❌ Failed to login.");
  }
};
