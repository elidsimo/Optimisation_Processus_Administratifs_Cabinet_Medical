package org.example.demo3434.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor; // <--- AJOUTER CECI
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor; // <--- AJOUTER CECI
import org.example.demo3434.entity.Sexe;
import org.example.demo3434.entity.TypeMutuelle;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor // Indispensable pour Jackson (JSON)
@AllArgsConstructor // Indispensable pour que @Builder fonctionne avec @NoArgsConstructor
public class PatientDTO {

    private Integer id;

    @NotBlank(message = "Le CIN est obligatoire")
    private String cin;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @NotNull(message = "La date de naissance est obligatoire")
    private LocalDate dateNaissance;

    @NotNull(message = "Le sexe est obligatoire")
    private Sexe sexe;

    private String numTel;

    private TypeMutuelle typeMutuelle;
}