package org.example.demo3434.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class FactureDTO {
    private Integer id;
    private Double montant;
    private String statut;       // StatutFacture en String
    private String modePaiement; // ModePaiement en String

    // Infos aplaties pour l'affichage direct
    private Integer consultationId;
    private LocalDate dateConsultation;
    private String patientNom;
    private String patientPrenom;
    private String patientCin;
}