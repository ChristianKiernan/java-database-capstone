package com.project.back_end.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.project.back_end.models.Prescription;
import com.project.back_end.repo.PrescriptionRepository;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;

    public PrescriptionService(PrescriptionRepository prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
    }

    /**
     * Saves a prescription to MongoDB.
     * - If a prescription already exists for the same appointmentId, returns 400.
     * - If saved, returns 201 with "Prescription saved".
     */
    public ResponseEntity<Map<String, String>> savePrescription(Prescription prescription) {
        Map<String, String> res = new HashMap<>();

        try {
            Long appointmentId = prescription.getAppointmentId();

            // Prevent multiple prescriptions for the same appointment
            List<Prescription> existing = prescriptionRepository.findByAppointmentId(appointmentId);
            if (existing != null && !existing.isEmpty()) {
                res.put("message", "Prescription already exists for this appointment.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
            }

            prescriptionRepository.save(prescription);
            res.put("message", "Prescription saved");
            return ResponseEntity.status(HttpStatus.CREATED).body(res);

        } catch (Exception e) {
            res.put("message", "Error saving prescription.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }

    /**
     * Fetches prescription(s) for a given appointmentId.
     * Returns 200 with "prescriptions" key (list), or 500 on error.
     */
    public ResponseEntity<Map<String, Object>> getPrescription(Long appointmentId) {
        Map<String, Object> res = new HashMap<>();

        try {
            List<Prescription> prescriptions = prescriptionRepository.findByAppointmentId(appointmentId);
            res.put("prescriptions", prescriptions);
            return ResponseEntity.ok(res);

        } catch (Exception e) {
            res.put("message", "Error fetching prescription.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);
        }
    }
}

