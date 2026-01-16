// /static/js/adminDashboard.js
/*
  Admin dashboard:
  - Loads all doctor cards
  - Filters doctors by name, time, or specialty
  - Adds a new doctor via modal form
*/

import { openModal } from "/js/components/modals.js";
import { getDoctors, filterDoctors, saveDoctor } from "/js/services/doctorServices.js";
import { createDoctorCard } from "/js/components/doctorCard.js";

/* Attach listeners on page load */
document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addDocBtn");
  if (addBtn) {
    addBtn.addEventListener("click", () => openModal("addDoctor"));
  }

  loadDoctorCards();

  const searchBar = document.getElementById("searchBar");
  const timeSort = document.getElementById("timeSort");
  const specialtyFilter = document.getElementById("specialtyFilter");

  if (searchBar) searchBar.addEventListener("input", filterDoctorsOnChange);
  if (timeSort) timeSort.addEventListener("change", filterDoctorsOnChange);
  if (specialtyFilter) specialtyFilter.addEventListener("change", filterDoctorsOnChange);
});

/* Fetch doctors and render cards */
async function loadDoctorCards() {
  try {
    const result = await getDoctors(); // { doctors: [...] }
    renderDoctorCards(result.doctors || []);
  } catch (err) {
    console.error("Error loading doctors:", err);
    const contentDiv = document.getElementById("content");
    if (contentDiv) contentDiv.innerHTML = "<p>Unable to load doctors right now.</p>";
  }
}

/* Filter doctors based on current inputs */
async function filterDoctorsOnChange() {
  try {
    // Your backend normalizes "null" path segments, so we send "null" when empty.
    const nameVal = document.getElementById("searchBar")?.value?.trim() || "";
    const timeVal = document.getElementById("timeSort")?.value || "";
    const specialtyVal = document.getElementById("specialtyFilter")?.value || "";

    const name = nameVal.length ? nameVal : "null";
    const time = timeVal.length ? timeVal : "null";
    const specialty = specialtyVal.length ? specialtyVal : "null";

    const result = await filterDoctors(name, time, specialty); // { doctors: [...] }
    const doctors = result.doctors || [];

    if (doctors.length > 0) {
      renderDoctorCards(doctors);
    } else {
      const contentDiv = document.getElementById("content");
      if (contentDiv) contentDiv.innerHTML = "<p>No doctors found with the given filters.</p>";
    }
  } catch (err) {
    console.error("Filtering failed:", err);
    alert("Unable to filter doctors. Please try again.");
  }
}

/* Render doctor cards */
function renderDoctorCards(doctors) {
  const contentDiv = document.getElementById("content");
  if (!contentDiv) return;

  contentDiv.innerHTML = "";

  if (!Array.isArray(doctors) || doctors.length === 0) {
    contentDiv.innerHTML = "<p>No doctors found</p>";
    return;
  }

  doctors.forEach((doctor) => {
    const card = createDoctorCard(doctor);
    contentDiv.appendChild(card);
  });
}

/*
  Called by modal Save button:
  In modals.js you do:
    btn.addEventListener("click", window.adminAddDoctor);
*/
window.adminAddDoctor = async function adminAddDoctor() {
  try {
    const name = document.getElementById("doctorName")?.value?.trim() || "";
    const email = document.getElementById("doctorEmail")?.value?.trim() || "";
    const phone = document.getElementById("doctorPhone")?.value?.trim() || "";
    const password = document.getElementById("doctorPassword")?.value?.trim() || "";
    const specialty = document.getElementById("specialization")?.value?.trim() || "";

    const availability = Array.from(
      document.querySelectorAll("input[name='availability']:checked")
    ).map((cb) => cb.value);

    if (!name || !email || !phone || !password || !specialty) {
      alert("Please fill out all doctor fields.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    const doctor = { name, email, phone, password, specialty, availability };

    const result = await saveDoctor(doctor, token);

    if (result.success) {
      alert(result.message || "Doctor added successfully.");
      const modal = document.getElementById("modal");
      if (modal) modal.classList.add("hidden");
      await loadDoctorCards();
    } else {
      alert(result.message || "Failed to add doctor.");
    }
  } catch (err) {
    console.error("Add doctor failed:", err);
    alert("Something went wrong while adding the doctor.");
  }
};
