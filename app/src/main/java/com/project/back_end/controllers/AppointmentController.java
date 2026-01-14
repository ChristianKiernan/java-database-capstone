package com.project.back_end.controllers;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.project.back_end.models.Appointment;
import com.project.back_end.services.AppointmentService;
import com.project.back_end.services.AppService;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final AppService service;

    @Autowired
    public AppointmentController(AppointmentService appointmentService, AppService service) {
        this.appointmentService = appointmentService;
        this.service = service;
    }

    @GetMapping("/{date}/{patientName}/{token}")
    public ResponseEntity<Map<String, Object>> getAppointments(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PathVariable String patientName,
            @PathVariable String token
    ) {
        ResponseEntity<Map<String, String>> tokenCheck = service.validateToken(token, "doctor");
        if (tokenCheck.getBody() != null && !tokenCheck.getBody().isEmpty()) {
            Map<String, Object> err = new HashMap<>();
            err.putAll(tokenCheck.getBody());
            return ResponseEntity.status(tokenCheck.getStatusCode()).body(err);
        }

        String pname = ("null".equalsIgnoreCase(patientName) || patientName.isBlank()) ? null : patientName;
        Map<String, Object> result = appointmentService.getAppointment(pname, date, token);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{token}")
    public ResponseEntity<Map<String, String>> bookAppointment(
            @PathVariable String token,
            @RequestBody Appointment appointment
    ) {
        ResponseEntity<Map<String, String>> tokenCheck = service.validateToken(token, "patient");
        if (tokenCheck.getBody() != null && !tokenCheck.getBody().isEmpty()) {
            return tokenCheck;
        }

        int validation = service.validateAppointment(appointment);
        if (validation == -1) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid doctor ID."));
        }
        if (validation == 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Selected time slot is unavailable."));
        }

        int booked = appointmentService.bookAppointment(appointment);
        if (booked == 1) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Appointment booked successfully."));
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to book appointment."));
    }

    @PutMapping("/{token}")
    public ResponseEntity<Map<String, String>> updateAppointment(
            @PathVariable String token,
            @RequestBody Appointment appointment
    ) {
        ResponseEntity<Map<String, String>> tokenCheck = service.validateToken(token, "patient");
        if (tokenCheck.getBody() != null && !tokenCheck.getBody().isEmpty()) {
            return tokenCheck;
        }

        return appointmentService.updateAppointment(appointment);
    }

    @DeleteMapping("/{id}/{token}")
    public ResponseEntity<Map<String, String>> cancelAppointment(
            @PathVariable long id,
            @PathVariable String token
    ) {
        ResponseEntity<Map<String, String>> tokenCheck = service.validateToken(token, "patient");
        if (tokenCheck.getBody() != null && !tokenCheck.getBody().isEmpty()) {
            return tokenCheck;
        }

        return appointmentService.cancelAppointment(id, token);
    }
}
