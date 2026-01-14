package com.project.back_end.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.back_end.models.Appointment;
import com.project.back_end.models.Doctor;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.DoctorRepository;
import com.project.back_end.repo.PatientRepository;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final TokenService tokenService;

    // Constructor injection
    public AppointmentService(
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            TokenService tokenService
    ) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.tokenService = tokenService;
    }

    /**
     * Books a new appointment.
     * @return 1 if successful, 0 otherwise
     */
    @Transactional
    public int bookAppointment(Appointment appointment) {
        try {
            appointmentRepository.save(appointment);
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Updates an existing appointment after validating existence and rules.
     */
    @Transactional
    public ResponseEntity<Map<String, String>> updateAppointment(Appointment appointment) {
        Map<String, String> res = new HashMap<>();

        try {
            Optional<Appointment> existingOpt = appointmentRepository.findById(appointment.getId());
            if (existingOpt.isEmpty()) {
                res.put("message", "Appointment not found.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
            }

            // Validate the updated appointment (lab hint mentions: service.validateAppointment())
            // If your project already has a shared Service class with validateAppointment(...),
            // replace this with that call. Here we do minimal, safe checks.
            ResponseEntity<Map<String, String>> validation = validateAppointment(appointment);
            if (validation.getStatusCode().isError()) {
                return validation;
            }

            appointmentRepository.save(appointment);
            res.put("message", "Appointment updated successfully.");
            return ResponseEntity.ok(res);

        } catch (Exception e) {
            res.put("message", "Failed to update appointment.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }

    /**
     * Cancels (deletes) an appointment. Ensures the caller is authorized to cancel.
     */
    @Transactional
    public ResponseEntity<Map<String, String>> cancelAppointment(long id, String token) {
        Map<String, String> res = new HashMap<>();

        try {
            Optional<Appointment> apptOpt = appointmentRepository.findById(id);
            if (apptOpt.isEmpty()) {
                res.put("message", "Appointment not found.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
            }

            Appointment appointment = apptOpt.get();

            // Ensure patient attempting to cancel owns the appointment
            // (TokenService extraction depends on your implementation; adjust as needed.)
            
            Long patientIdFromToken = tokenService.extractUserId(token, "patient");
            if (patientIdFromToken == null) {
                res.put("message", "Unauthorized.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
            }

            if (appointment.getPatient() == null || appointment.getPatient().getId() == null
                    || !appointment.getPatient().getId().equals(patientIdFromToken)) {
                res.put("message", "Unauthorized to cancel this appointment.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
            }

            appointmentRepository.delete(appointment);
            res.put("message", "Appointment cancelled successfully.");
            return ResponseEntity.ok(res);

        } catch (Exception e) {
            res.put("message", "Failed to cancel appointment.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }

    /**
     * Retrieves appointments for the authenticated doctor on a given date,
     * optionally filtered by patient name.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAppointment(String pname, LocalDate date, String token) {
        Map<String, Object> res = new HashMap<>();

        // Derive doctorId from token
        Long doctorId = tokenService.extractUserId(token, "doctor");
        if (doctorId == null) {
            res.put("message", "Unauthorized.");
            return res;
        }


        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay().minusNanos(1);

        List<Appointment> appointments;

        if (pname != null && !pname.isBlank()) {
            appointments = appointmentRepository
                    .findByDoctorIdAndPatient_NameContainingIgnoreCaseAndAppointmentTimeBetween(
                            doctorId, pname, start, end
                    );
        } else {
            appointments = appointmentRepository
                    .findByDoctorIdAndAppointmentTimeBetween(doctorId, start, end);
        }

        res.put("appointments", appointments);
        return res;
    }

    /**
     * Minimal validation helper.
     * If your project has a shared Service.validateAppointment(), replace this with that.
     */
    private ResponseEntity<Map<String, String>> validateAppointment(Appointment appointment) {
        Map<String, String> res = new HashMap<>();

        // Doctor must exist (if doctor is provided)
        if (appointment.getDoctor() == null || appointment.getDoctor().getId() == null) {
            res.put("message", "Invalid doctor.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
        }

        Optional<Doctor> doctorOpt = doctorRepository.findById(appointment.getDoctor().getId());
        if (doctorOpt.isEmpty()) {
            res.put("message", "Doctor not found.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
        }

        // Patient must exist (if patient is provided)
        if (appointment.getPatient() == null || appointment.getPatient().getId() == null) {
            res.put("message", "Invalid patient.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
        }

        if (patientRepository.findById(appointment.getPatient().getId()).isEmpty()) {
            res.put("message", "Patient not found.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
        }

        // Appointment time must exist
        if (appointment.getAppointmentTime() == null) {
            res.put("message", "Appointment time is required.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
        }

        return ResponseEntity.ok(res);
    }
}

