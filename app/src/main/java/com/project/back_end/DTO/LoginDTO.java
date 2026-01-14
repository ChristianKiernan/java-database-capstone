package com.project.back_end.DTO;

/**
 * Login Data Transfer Object (DTO)
 *
 * This class is used to receive login credentials from the client.
 * It is NOT a persistence entity and contains no database annotations.
 */
public class LoginDTO {

    // The unique identifier of the user (email for Doctor/Patient, username for Admin)
    private String identifier;

    // The password provided by the user
    private String password;

    // Default constructor (used by frameworks for deserialization)
    public LoginDTO() {}

    // ---------- Getters and Setters ----------

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() { return identifier; }
    
    public void setEmail(String email) { this.identifier = email; }
}

