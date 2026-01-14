package com.project.back_end.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.project.back_end.models.Doctor;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    /**
     * Find a doctor by email address.
     */
    Doctor findByEmail(String email);

    /**
     * Find doctors by partial name match (case-sensitive).
     */
    @Query("SELECT d FROM Doctor d WHERE d.name LIKE CONCAT('%', :name, '%')")
    List<Doctor> findByNameLike(String name);

    /**
     * Filter doctors by partial name and exact specialty (case-insensitive).
     */
    @Query("""
        SELECT d
        FROM Doctor d
        WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', :name, '%'))
          AND LOWER(d.specialty) = LOWER(:specialty)
        """)
    List<Doctor> findByNameContainingIgnoreCaseAndSpecialtyIgnoreCase(
            String name,
            String specialty
    );

    /**
     * Find doctors by specialty, ignoring case.
     */
    List<Doctor> findBySpecialtyIgnoreCase(String specialty);
}
