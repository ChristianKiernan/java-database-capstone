/*
  This script handles the admin dashboard functionality for managing doctors:
  - Loads all doctor cards
  - Filters doctors by name, time, or specialty
  - Adds a new doctor via modal form
*/

import { openModal } from "/js/components/modals.js";
import { getDoctors, filterDoctors, saveDoctor } from "/js/services/doctorServices.js";
import { createDoctorCard } from "/js/components/doctorCard.js";

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
  const filterTime = document.getElementById("timeSort");
  const filterSpecialty = document.getElementById("specialtyFilter");

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
    const result = await getDoctors();
    const doctors = result?.doctors ?? [];
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
    const time = document.getElementById("timeSort")?.value || null;
    const specialty = document.getElementById("specialtyFilter")?.value || null;

    const result = await filterDoctors(name, time, specialty);
    const doctors = result?.doctors ?? [];

    if (doctors.length > 0) {
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
    const name = document.getElementById("doctorName")?.value?.trim();
    const email = document.getElementById("doctorEmail")?.value?.trim();
    const phone = document.getElementById("doctorPhone")?.value?.trim();
    const password = document.getElementById("doctorPassword")?.value?.trim();
    const specialty = document.getElementById("specialization")?.value?.trim();

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
}