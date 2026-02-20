package org.example.demo3434.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {

    private Long id;
    private String nom;
    private String prenom;
    private String role;
    private String logo;
    private String nom_cabinet;
    private String adresse;
    private String tel;
}

