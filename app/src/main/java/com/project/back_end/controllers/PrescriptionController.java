package com.project.back_end.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.project.back_end.models.Prescription;
import com.project.back_end.services.PrescriptionService;
import com.project.back_end.services.Service;

@RestController
@RequestMapping("${api.path}prescription")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final Service service;

    public PrescriptionController(PrescriptionService prescriptionService, Service service) {
        this.prescriptionService = prescriptionService;
        this.service = service;
    }

    // ----------------------------------------------------
    // 1) Save Prescription
    // POST /{token}
    // ----------------------------------------------------
    @PostMapping("/{token}")
    public ResponseEntity<Map<String, String>> savePrescription(
            @PathVariable String token,
            @RequestBody Prescription prescription
    ) {
        // Validate doctor token
        ResponseEntity<Map<String, String>> tokenCheck = service.validateToken(token, "doctor");
        if (tokenCheck.getBody() != null && !tokenCheck.getBody().isEmpty()) {
            return tokenCheck;
        }

        // Save prescription
        return prescriptionService.savePrescription(prescription);
    }

    // ----------------------------------------------------
    // 2) Get Prescription by Appointment ID
    // GET /{appointmentId}/{token}
    // ----------------------------------------------------
    @GetMapping("/{appointmentId}/{token}")
    public ResponseEntity<Map<String, Object>> getPrescription(
            @PathVariable Long appointmentId,
            @PathVariable String token
    ) {
        // Validate doctor token
        ResponseEntity<Map<String, String>> tokenCheck = service.validateToken(token, "doctor");
        if (tokenCheck.getBody() != null && !tokenCheck.getBody().isEmpty()) {
            Map<String, Object> err = new HashMap<>();
            err.putAll(tokenCheck.getBody());
            return ResponseEntity.status(tokenCheck.getStatusCode()).body(err);
        }

        // Fetch prescription
        return prescriptionService.getPrescription(appointmentId);
    }
}
