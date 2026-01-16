/*
  doctorDashboard.js (MODULE)

  - Fetches appointments for a selected date
  - Filters by patient name
  - Renders rows using createPatientRow
*/

import { getAllAppointments } from "/js/services/appointmentRecordService.js";
import { createPatientRow } from "/js/components/patientRows.js";

function formatTodayYYYYMMDD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

document.addEventListener("DOMContentLoaded", () => {
  // If your render.js defines this globally, call it safely.
  if (typeof window.renderContent === "function") window.renderContent();

  const patientTableBody = document.getElementById("patientTableBody");
  const searchBar = document.getElementById("searchBar");
  const todayButton = document.getElementById("todayButton");
  const datePicker = document.getElementById("datePicker");

  if (!patientTableBody) {
    console.warn("patientTableBody not found on page. Check your HTML id.");
    return;
  }

  // Auth token
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Session expired. Please log in again.");
    localStorage.removeItem("userRole");
    window.location.href = "/";
    return;
  }

  // State
  let selectedDate = formatTodayYYYYMMDD();
  let patientName = "null"; // backend expects string "null" in path-based routes

  // Default date picker UI to today
  if (datePicker) datePicker.value = selectedDate;

  async function loadAppointments() {
    try {
      const result = await getAllAppointments(selectedDate, patientName, token);

      // Some backends return { appointments: [...] }, some return [...]
      const appointments = Array.isArray(result)
        ? result
        : (result?.appointments ?? []);

      patientTableBody.innerHTML = "";

      if (!appointments || appointments.length === 0) {
        patientTableBody.innerHTML = `
          <tr>
            <td colspan="6" class="noPatientRecord">No Appointments found for today.</td>
          </tr>`;
        return;
      }

      appointments.forEach((appt) => {
        const patient = {
          id: appt.patient?.id,
          name: appt.patient?.name,
          phone: appt.patient?.phone,
          email: appt.patient?.email,
        };

        const row = createPatientRow(appt, patient);
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

  // Search bar input listener
  if (searchBar) {
    searchBar.addEventListener("input", () => {
      const value = searchBar.value.trim();
      patientName = value.length > 0 ? value : "null";
      loadAppointments();
    });
  }

  // Today's appointments button
  if (todayButton) {
    todayButton.addEventListener("click", () => {
      selectedDate = formatTodayYYYYMMDD();
      if (datePicker) datePicker.value = selectedDate;
      loadAppointments();
    });
  }

  // Date picker change listener
  if (datePicker) {
    datePicker.addEventListener("change", () => {
      selectedDate = datePicker.value || formatTodayYYYYMMDD();
      loadAppointments();
    });
  }

  // initial load
  loadAppointments();
});


