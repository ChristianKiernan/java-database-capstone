/*
  Import getAllAppointments to fetch appointments from the backend
  Import createPatientRow to generate a table row for each patient appointment

  Get the table body where patient rows will be added
  Initialize selectedDate with today's date in 'YYYY-MM-DD' format
  Get the saved token from localStorage (used for authenticated API calls)
  Initialize patientName to null (used for filtering by name)

  Add an 'input' event listener to the search bar
  On each keystroke:
    - Trim and check the input value
    - If not empty, use it as the patientName for filtering
    - Else, reset patientName to "null" (as expected by backend)
    - Reload the appointments list with the updated filter

  Add a click listener to the "Today" button
  When clicked:
    - Set selectedDate to today's date
    - Update the date picker UI to match
    - Reload the appointments for today

  Add a change event listener to the date picker
  When the date changes:
    - Update selectedDate with the new value
    - Reload the appointments for that specific date

  Function: loadAppointments
  Purpose: Fetch and display appointments based on selected date and optional patient name

  Step 1: Call getAllAppointments with selectedDate, patientName, and token
  Step 2: Clear the table body content before rendering new rows

  Step 3: If no appointments are returned:
    - Display a message row: "No Appointments found for today."

  Step 4: If appointments exist:
    - Loop through each appointment and construct a 'patient' object with id, name, phone, and email
    - Call createPatientRow to generate a table row for the appointment
    - Append each row to the table body

  Step 5: Catch and handle any errors during fetch:
    - Show a message row: "Error loading appointments. Try again later."

  When the page is fully loaded (DOMContentLoaded):
    - Call renderContent() (assumes it sets up the UI layout)
    - Call loadAppointments() to display today's appointments by default
*/

import { getAllAppointments } from "../services/appointmentRecordService.js";
import { createPatientRow } from "../components/patientRows.js";

// Table body where rows will be rendered
const patientTableBody = document.getElementById("patientTableBody");

// Initialize selectedDate to today's date (YYYY-MM-DD)
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
let selectedDate = `${yyyy}-${mm}-${dd}`;

// Token for auth
const token = localStorage.getItem("token");

// Patient name filter (null by default)
let patientName = null;

// Search bar input listener
const searchBar = document.getElementById("searchBar");
if (searchBar) {
  searchBar.addEventListener("input", () => {
    const value = searchBar.value.trim();
    patientName = value ? value : "null";
    loadAppointments();
  });
}

// Today's appointments button
const todayButton = document.getElementById("todayButton");
const datePicker = document.getElementById("datePicker");

if (todayButton) {
  todayButton.addEventListener("click", () => {
    selectedDate = `${yyyy}-${mm}-${dd}`;
    if (datePicker) datePicker.value = selectedDate;
    loadAppointments();
  });
}

// Date picker change listener
if (datePicker) {
  datePicker.addEventListener("change", () => {
    selectedDate = datePicker.value;
    loadAppointments();
  });

  // Default date picker UI to today
  datePicker.value = selectedDate;
}

// Load appointments function
async function loadAppointments() {
  if (!patientTableBody) return;

  try {
    const appointments = await getAllAppointments(selectedDate, patientName, token);

    // Clear existing content
    patientTableBody.innerHTML = "";

    // No appointments case
    if (!appointments || appointments.length === 0) {
      patientTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="noPatientRecord">No Appointments found for today.</td>
        </tr>`;
      return;
    }

    // Render appointments
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

// Initial render on page load
document.addEventListener("DOMContentLoaded", () => {
  if (typeof renderContent === "function") renderContent();
  loadAppointments();
});

