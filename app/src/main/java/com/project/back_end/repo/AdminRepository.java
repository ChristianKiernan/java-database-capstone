package com.project.back_end.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.back_end.models.Admin;

/**
 * Admin Repository
 *
 * Provides CRUD operations for Admin entities
 * and supports lookup by username.
 */
@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {

    /**
     * Find an admin by username.
     *
     * @param username the admin's username
     * @return the matching Admin, or null if not found
     */
    Admin findByUsername(String username);
}
