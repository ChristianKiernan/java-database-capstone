package com.project.back_end.services;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.back_end.DTO.AppointmentDTO;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Patient;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.PatientRepository;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final TokenService tokenService;

    public PatientService(
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            TokenService tokenService
    ) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.tokenService = tokenService;
    }

    /**
     * Saves a new patient.
     * @return 1 on success, 0 on failure
     */
    @Transactional
    public int createPatient(Patient patient) {
        try {
            patientRepository.save(patient);
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Retrieves appointments for a patient, validating that the patient ID matches the token email.
     */
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getPatientAppointment(Long id, String token) {
        Map<String, Object> res = new HashMap<>();

        try {
            String email = tokenService.extractEmail(token);
            Patient patientFromToken = patientRepository.findByEmail(email);

            if (patientFromToken == null || !Objects.equals(patientFromToken.getId(), id)) {
                res.put("message", "Unauthorized: patient mismatch.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
            }

            List<Appointment> appts = appointmentRepository.findByPatientId(id);
            List<AppointmentDTO> dtos = appts.stream().map(this::toDTO).collect(Collectors.toList());

            res.put("appointments", dtos);
            return ResponseEntity.ok(res);

        } catch (Exception e) {
            res.put("message", "Failed to fetch appointments.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }

    /**
     * Filters appointments by condition ("past" or "future") for a specific patient.
     * Convention used in this lab: status 1 = past, status 0 = future
     */
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> filterByCondition(String condition, Long id) {
        Map<String, Object> res = new HashMap<>();

        try {
            if (condition == null) {
                res.put("message", "Condition is required.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
            }

            int status;
            String c = condition.trim().toLowerCase(Locale.ROOT);
            if ("past".equals(c)) status = 1;
            else if ("future".equals(c)) status = 0;
            else {
                res.put("message", "Invalid condition. Use 'past' or 'future'.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
            }

            List<Appointment> appts = appointmentRepository.findByPatient_IdAndStatusOrderByAppointmentTimeAsc(id, status);
            List<AppointmentDTO> dtos = appts.stream().map(this::toDTO).collect(Collectors.toList());

            res.put("appointments", dtos);
            return ResponseEntity.ok(res);

        } catch (Exception e) {
            res.put("message", "Failed to filter appointments.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }

    /**
     * Filters appointments by partial doctor name for a patient.
     */
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> filterByDoctor(String name, Long patientId) {
        Map<String, Object> res = new HashMap<>();

        try {
            String doctorName = (name == null) ? "" : name.trim();

            List<Appointment> appts = appointmentRepository.filterByDoctorNameAndPatientId(doctorName, patientId);
            List<AppointmentDTO> dtos = appts.stream().map(this::toDTO).collect(Collectors.toList());

            res.put("appointments", dtos);
            return ResponseEntity.ok(res);

        } catch (Exception e) {
            res.put("message", "Failed to filter appointments by doctor.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }

    /**
     * Filters appointments by partial doctor name AND condition ("past"/"future") for a patient.
     */
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> filterByDoctorAndCondition(String condition, String name, long patientId) {
        Map<String, Object> res = new HashMap<>();

        try {
            if (condition == null) {
                res.put("message", "Condition is required.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
            }

            int status;
            String c = condition.trim().toLowerCase(Locale.ROOT);
            if ("past".equals(c)) status = 1;
            else if ("future".equals(c)) status = 0;
            else {
                res.put("message", "Invalid condition. Use 'past' or 'future'.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
            }

            String doctorName = (name == null) ? "" : name.trim();

            List<Appointment> appts = appointmentRepository.filterByDoctorNameAndPatientIdAndStatus(doctorName, patientId, status);
            List<AppointmentDTO> dtos = appts.stream().map(this::toDTO).collect(Collectors.toList());

            res.put("appointments", dtos);
            return ResponseEntity.ok(res);

        } catch (Exception e) {
            res.put("message", "Failed to filter appointments.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }

    /**
     * Fetch patient details from token email.
     */
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getPatientDetails(String token) {
        Map<String, Object> res = new HashMap<>();

        try {
            String email = tokenService.extractEmail(token);
            Patient patient = patientRepository.findByEmail(email);

            if (patient == null) {
                res.put("message", "Patient not found.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
            }

            res.put("patient", patient);
            return ResponseEntity.ok(res);

        } catch (Exception e) {
            res.put("message", "Failed to fetch patient details.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }

    // -------------------------
    // Helpers
    // -------------------------

    private AppointmentDTO toDTO(Appointment a) {
        // Safely pull nested values
        Long doctorId = a.getDoctor() != null ? a.getDoctor().getId() : null;
        String doctorName = a.getDoctor() != null ? a.getDoctor().getName() : null;

        Long patientId = a.getPatient() != null ? a.getPatient().getId() : null;
        String patientName = a.getPatient() != null ? a.getPatient().getName() : null;
        String patientEmail = a.getPatient() != null ? a.getPatient().getEmail() : null;
        String patientPhone = a.getPatient() != null ? a.getPatient().getPhone() : null;
        String patientAddress = a.getPatient() != null ? a.getPatient().getAddress() : null;

        LocalDateTime apptTime = a.getAppointmentTime();

        return new AppointmentDTO(
                a.getId(),
                doctorId,
                doctorName,
                patientId,
                patientName,
                patientEmail,
                patientPhone,
                patientAddress,
                apptTime,
                a.getStatus()
        );
    }
}

