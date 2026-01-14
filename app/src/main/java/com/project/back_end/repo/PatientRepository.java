package com.project.back_end.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.back_end.models.Patient;

/**
 * Patient Repository
 *
 * Provides CRUD operations for Patient entities
 * and supports lookup by email or phone.
 */
@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    /**
     * Find a patient by email address.
     *
     * @param email the patient's email
     * @return the matching Patient, or null if not found
     */
    Patient findByEmail(String email);

    /**
     * Find a patient by either email or phone number.
     *
     * @param email the patient's email
     * @param phone the patient's phone number
     * @return the matching Patient, or null if not found
     */
    Patient findByEmailOrPhone(String email, String phone);
}


