package org.example.demo3434.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
public class RendezVous {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idRendezVous;

    private LocalDateTime dateRdv;
    private String motif;

    @Enumerated(EnumType.STRING)
    private StatutRdv statutRdv;

    private String notes;

    @ManyToOne
    private Patient patient; // Relation "Demande"

    @ManyToOne
    private Medecin medecin; // Relation "Assure"

    @OneToOne(mappedBy = "rendezVous")
    private Consultation consultation;
}





