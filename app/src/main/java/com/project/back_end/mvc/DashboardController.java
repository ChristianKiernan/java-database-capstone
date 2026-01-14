package com.project.back_end.mvc;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Dashboard controller
 *
 * Purpose:
 * This controller serves as a gatekeeper to Thymeleaf dashboard views
 * (adminDashboard and doctorDashboard) by verifying access tokens for authenticated users.
 */
@Controller
public class DashboardController {

    // Autowire the required service for token validation logic
    @Autowired
    private Service service;

    /**
     * Admin dashboard route
     * GET /adminDashboard/{token}
     */
    @GetMapping("/adminDashboard/{token}")
    public String adminDashboard(@PathVariable String token) {
        Map<String, Object> validation = service.validateToken(token, "admin");

        // If empty -> token valid
        if (validation == null || validation.isEmpty()) {
            return "admin/adminDashboard";
        }

        // If invalid -> redirect to login/home
        return "redirect:http://localhost:8080/";
    }

    /**
     * Doctor dashboard route
     * GET /doctorDashboard/{token}
     */
    @GetMapping("/doctorDashboard/{token}")
    public String doctorDashboard(@PathVariable String token) {
        Map<String, Object> validation = service.validateToken(token, "doctor");

        // If empty -> token valid
        if (validation == null || validation.isEmpty()) {
            return "doctor/doctorDashboard";
        }

        // If invalid -> redirect to login/home
        return "redirect:http://localhost:8080/";
    }
}
