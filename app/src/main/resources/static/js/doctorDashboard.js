// doctorDashboard.js

import { getAllAppointments } from "/js/services/appointmentRecordService.js";
import { createPatientRow } from "/js/components/patientRows.js";

const patientTableBody = document.getElementById("patientTableBody");

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
let selectedDate = `${yyyy}-${mm}-${dd}`;

const token = localStorage.getItem("token");

// patient name filter
let patientName = null;

const searchBar = document.getElementById("searchBar");
if (searchBar) {
  searchBar.addEventListener("input", () => {
    const value = searchBar.value.trim();
    patientName = value ? value : "null";
    loadAppointments();
  });
}

const todayButton = document.getElementById("todayButton");
const datePicker = document.getElementById("datePicker");

if (todayButton) {
  todayButton.addEventListener("click", () => {
    selectedDate = `${yyyy}-${mm}-${dd}`;
    if (datePicker) datePicker.value = selectedDate;
    loadAppointments();
  });
}

if (datePicker) {
  datePicker.addEventListener("change", () => {
    selectedDate = datePicker.value;
    loadAppointments();
  });

  datePicker.value = selectedDate;
}

async function loadAppointments() {
  if (!patientTableBody) return;

  try {
    const data = await getAllAppointments(selectedDate, patientName, token);

    // normalize in case service returns {appointments: [...]}
    const appointments = Array.isArray(data) ? data : (data?.appointments ?? []);

    patientTableBody.innerHTML = "";

    if (!appointments || appointments.length === 0) {
      patientTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="noPatientRecord">No Appointments found for today.</td>
        </tr>`;
      return;
    }

    appointments.forEach((appt) => {
      // ✅ pass appointment directly; patientRows.js handles nested vs DTO
      const row = createPatientRow(appt);
      patientTableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading appointments:", err);
    patientTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="noPatientRecord">Error loading appointments. Try again later.</td>
      </tr>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof renderContent === "function") renderContent();
  loadAppointments();
});

