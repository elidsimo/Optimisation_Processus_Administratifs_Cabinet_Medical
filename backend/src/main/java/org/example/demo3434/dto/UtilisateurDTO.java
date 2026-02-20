package org.example.demo3434.dto;

import lombok.Data;
import org.example.demo3434.entity.Role;

@Data
public class UtilisateurDTO {
    private Long id;
    private String login;
    private String nom;
    private String prenom;
    private String numTel;
    private Role role;

    // Uniquement pour la création/modification
    private String password;

    // Uniquement pour Médecin/Secrétaire
    private Integer cabinetId;
    private String cabinetNom; // Pour l'affichage facile coté front
}