/*
Import the overlay function for booking appointments from loggedPatient.js

  Import the deleteDoctor API function to remove doctors (admin role) from docotrServices.js

  Import function to fetch patient details (used during booking) from patientServices.js

  Function to create and return a DOM element for a single doctor card
    Create the main container for the doctor card
    Retrieve the current user role from localStorage
    Create a div to hold doctor information
    Create and set the doctor’s name
    Create and set the doctor's specialization
    Create and set the doctor's email
    Create and list available appointment times
    Append all info elements to the doctor info container
    Create a container for card action buttons
    === ADMIN ROLE ACTIONS ===
      Create a delete button
      Add click handler for delete button
     Get the admin token from localStorage
        Call API to delete the doctor
        Show result and remove card if successful
      Add delete button to actions container
   
    === PATIENT (NOT LOGGED-IN) ROLE ACTIONS ===
      Create a book now button
      Alert patient to log in before booking
      Add button to actions container
  
    === LOGGED-IN PATIENT ROLE ACTIONS === 
      Create a book now button
      Handle booking logic for logged-in patient   
        Redirect if token not available
        Fetch patient data with token
        Show booking overlay UI with doctor and patient info
      Add button to actions container
   
  Append doctor info and action buttons to the car
  Return the complete doctor card element
*/

import { showBookingOverlay } from "./bookingOverlay.js";
import { deleteDoctor } from "../services/doctorServices.js";
import { getPatientData } from "../services/patientServices.js";

export function createDoctorCard(doctor) {
  // Create the main container for the doctor card
  const card = document.createElement("div");
  card.classList.add("doctor-card");

  // Retrieve the current user role from localStorage
  const role = localStorage.getItem("userRole");

  // Create a div to hold doctor information
  const infoDiv = document.createElement("div");
  infoDiv.classList.add("doctor-info");

  // Create and set the doctor’s name
  const name = document.createElement("h3");
  name.textContent = doctor.name;

  // Create and set the doctor's specialization
  const specialization = document.createElement("p");
  specialization.textContent = `Specialty: ${doctor.specialty || doctor.specialization || "N/A"}`;

  // Create and set the doctor's email
  const email = document.createElement("p");
  email.textContent = `Email: ${doctor.email || "N/A"}`;

  // Create and list available appointment times
  const availability = document.createElement("p");
  const times = Array.isArray(doctor.availability)
    ? doctor.availability.join(", ")
    : doctor.availability || "N/A";
  availability.textContent = `Availability: ${times}`;

  // Append all info elements to the doctor info container
  infoDiv.appendChild(name);
  infoDiv.appendChild(specialization);
  infoDiv.appendChild(email);
  infoDiv.appendChild(availability);

  // Create a container for card action buttons
  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("card-actions");

  // === ADMIN ROLE ACTIONS ===
  if (role === "admin") {
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Delete";

    removeBtn.addEventListener("click", async () => {
      const confirmed = confirm(`Delete ${doctor.name}?`);
      if (!confirmed) return;

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Session expired or invalid login. Please log in again.");
        localStorage.removeItem("userRole");
        window.location.href = "/";
        return;
      }

      try {
        await deleteDoctor(doctor.id, token);
        alert("Doctor deleted successfully.");
        card.remove();
      } catch (err) {
        console.error(err);
        alert("Failed to delete doctor.");
      }
    });

    actionsDiv.appendChild(removeBtn);
  }

  // === PATIENT (NOT LOGGED-IN) ROLE ACTIONS ===
  else if (role === "patient") {
    const bookNow = document.createElement("button");
    bookNow.textContent = "Book Now";
    bookNow.addEventListener("click", () => {
      alert("Patient needs to login first.");
    });
    actionsDiv.appendChild(bookNow);
  }

  // === LOGGED-IN PATIENT ROLE ACTIONS ===
  else if (role === "loggedPatient") {
    const bookNow = document.createElement("button");
    bookNow.textContent = "Book Now";

    bookNow.addEventListener("click", async (e) => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Session expired or invalid login. Please log in again.");
        localStorage.removeItem("userRole");
        window.location.href = "/";
        return;
      }

      try {
        const patientData = await getPatientData(token);
        showBookingOverlay(e, doctor, patientData);
      } catch (err) {
        console.error(err);
        alert("Unable to start booking. Please try again.");
      }
    });

    actionsDiv.appendChild(bookNow);
  }

  // Final assembly
  card.appendChild(infoDiv);
  card.appendChild(actionsDiv);

  return card;
}