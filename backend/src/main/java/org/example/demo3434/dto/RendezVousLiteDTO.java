package org.example.demo3434.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.demo3434.entity.StatutRdv;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RendezVousLiteDTO {
    private Integer id; // Mappé depuis idRendezVous

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateRdv;

    private String motif;
    private String notes;
    private StatutRdv statut;

    // Pour la lecture (GET)
    private PatientLiteDTO patient;

    // Pour l'écriture (POST/PUT)
    private Integer patientId;
    private Integer medecinId; // Optionnel si auto-assigné
}