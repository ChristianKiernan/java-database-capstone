/*
  This script handles the admin dashboard functionality for managing doctors:
  - Loads all doctor cards
  - Filters doctors by name, time, or specialty
  - Adds a new doctor via modal form
*/

import { openModal } from "../components/modals.js";
import { getDoctors, filterDoctors, saveDoctor } from "../services/doctorServices.js";
import { createDoctorCard } from "../components/doctorCard.js";

/* Attach a click listener to the "Add Doctor" button */
document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addDocBtn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      openModal("addDoctor");
    });
  }

  // Load doctor cards on page load
  loadDoctorCards();

  // Attach search / filter listeners
  const searchBar = document.getElementById("searchBar");
  const filterTime = document.getElementById("filterTime");
  const filterSpecialty = document.getElementById("filterSpecialty");

  if (searchBar) searchBar.addEventListener("input", filterDoctorsOnChange);
  if (filterTime) filterTime.addEventListener("change", filterDoctorsOnChange);
  if (filterSpecialty) filterSpecialty.addEventListener("change", filterDoctorsOnChange);
});

/*
  Function: loadDoctorCards
  Purpose: Fetch all doctors and display them as cards
*/
async function loadDoctorCards() {
  try {
    const doctors = await getDoctors();
    renderDoctorCards(doctors);
  } catch (err) {
    console.error("Error loading doctors:", err);
  }
}

/*
  Function: filterDoctorsOnChange
  Purpose: Filter doctors based on name, available time, and specialty
*/
async function filterDoctorsOnChange() {
  try {
    const name = document.getElementById("searchBar")?.value?.trim() || null;
    const time = document.getElementById("filterTime")?.value || null;
    const specialty = document.getElementById("filterSpecialty")?.value || null;

    const doctors = await filterDoctors(name, time, specialty);

    if (doctors && doctors.length > 0) {
      renderDoctorCards(doctors);
    } else {
      const contentDiv = document.getElementById("content");
      if (contentDiv) contentDiv.innerHTML = "<p>No doctors found with the given filters.</p>";
    }
  } catch (err) {
    console.error(err);
    alert("Unable to filter doctors. Please try again.");
  }
}

/*
  Function: renderDoctorCards
  Purpose: Render a list of doctors passed to it
*/
function renderDoctorCards(doctors) {
  const contentDiv = document.getElementById("content");
  if (!contentDiv) return;

  contentDiv.innerHTML = "";

  if (!doctors || doctors.length === 0) {
    contentDiv.innerHTML = "<p>No doctors found</p>";
    return;
  }

  doctors.forEach((doctor) => {
    const card = createDoctorCard(doctor);
    contentDiv.appendChild(card);
  });
}

/*
  Function: adminAddDoctor
  Purpose: Collect form data and add a new doctor to the system
  NOTE: This function is meant to be called from the modal submit button.
*/
window.adminAddDoctor = async function adminAddDoctor() {
  try {
    const name = document.getElementById("docName")?.value?.trim();
    const email = document.getElementById("docEmail")?.value?.trim();
    const phone = document.getElementById("docPhone")?.value?.trim();
    const password = document.getElementById("docPassword")?.value?.trim();
    const specialty = document.getElementById("docSpecialty")?.value?.trim();

    // Collect checkbox values for availability
    const availability = Array.from(
      document.querySelectorAll("input[name='availability']:checked")
    ).map((cb) => cb.value);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    const doctor = { name, email, phone, password, specialty, availability };

    const result = await saveDoctor(doctor, token);

    if (result.success) {
      alert(result.message || "Doctor added successfully.");
      // Close modal if present
      const modal = document.getElementById("modal");
      if (modal) modal.classList.add("hidden");
      // Refresh list
      await loadDoctorCards();
    } else {
      alert(result.message || "Failed to add doctor.");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong while adding the doctor.");
  }
};
