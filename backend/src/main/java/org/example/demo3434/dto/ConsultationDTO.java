package org.example.demo3434.dto;

import lombok.Data;
import org.example.demo3434.entity.TypeConsultation;
import java.time.LocalDate;

@Data
public class ConsultationDTO {
    private Integer id;
    private LocalDate dateConsultation;
    private TypeConsultation typeConsultation;
    private String diagnostic;
    private String examenClinique;
    private String observations;

    // Infos Patient (Aplaties pour faciliter l'affichage React)
    private Integer patientId;
    private String patientNom;
    private String patientPrenom;
    private String patientCin;

    // Infos Dossier
    private Integer dossierId;
    private String antMedicaux;
    private String antChirurg;
    private String allergies;
}