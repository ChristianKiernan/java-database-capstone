// patientRows.js

/**
 * Backwards compatible:
 * - New style (recommended): createPatientRow(appointment)
 * - Old style: createPatientRow(patient, appointmentId, doctorId)
 */
export function createPatientRow(arg1, arg2, arg3) {
  let patient;
  let appointmentId;
  let doctorId;

  // NEW STYLE: createPatientRow(appointment)
  // Detect "appointment-like" object (has id + appointmentTime or status)
  const looksLikeAppointment =
    arg1 && typeof arg1 === "object" && "id" in arg1 && ("appointmentTime" in arg1 || "status" in arg1);

  if (looksLikeAppointment) {
    const appt = arg1;
    appointmentId = appt.id;

    // doctor id can be nested or flat depending on API response
    doctorId = appt.doctor?.id ?? appt.doctorId ?? arg3;

    // patient can be nested or flat (DTO)
    if (appt.patient) {
      patient = appt.patient;
    } else {
      patient = {
        id: appt.patientId,
        name: appt.patientName,
        phone: appt.patientPhone,
        email: appt.patientEmail,
      };
    }
  } else {
    // OLD STYLE: createPatientRow(patient, appointmentId, doctorId)
    patient = arg1;
    appointmentId = arg2;
    doctorId = arg3;
  }

  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td class="patient-id">${patient?.id ?? ""}</td>
    <td>${patient?.name ?? ""}</td>
    <td>${patient?.phone ?? ""}</td>
    <td>${patient?.email ?? ""}</td>
    <td>
      <img
        src="/assets/images/addPrescriptionIcon/addPrescription.png"
        alt="addPrescriptionIcon"
        class="prescription-btn"
        data-id="${patient?.id ?? ""}"
      />
    </td>
  `;

  const idCell = tr.querySelector(".patient-id");
  if (idCell) {
    idCell.addEventListener("click", () => {
      // NOTE: keep your existing route style; adjust if your Spring routes differ
      window.location.href = `/pages/patientRecord.html?id=${patient.id}&doctorId=${doctorId ?? ""}`;
    });
  }

  const btn = tr.querySelector(".prescription-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      window.location.href = `/pages/addPrescription.html?appointmentId=${appointmentId}&patientName=${encodeURIComponent(
        patient?.name ?? ""
      )}`;
    });
  }

  return tr;
}

