package org.example.demo3434.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank
    private String login;

    @NotBlank
    private String pwd;

    public String getUsername() {
        return login;
    }

    public String getPassword() {
        return pwd;
    }
}
