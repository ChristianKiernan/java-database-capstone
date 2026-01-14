package com.project.back_end.repo;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.project.back_end.models.Prescription;

/**
 * Prescription Repository
 *
 * Provides CRUD operations for Prescription documents in MongoDB
 * and supports lookup by appointment ID.
 */
@Repository
public interface PrescriptionRepository extends MongoRepository<Prescription, String> {

    /**
     * Find prescriptions by appointment ID.
     *
     * @param appointmentId the related appointment ID
     * @return list of matching prescriptions
     */
    List<Prescription> findByAppointmentId(Long appointmentId);
}


