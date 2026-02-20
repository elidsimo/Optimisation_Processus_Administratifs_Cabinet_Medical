package org.example.demo3434.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
public class Consultation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idConsultation;

    @Enumerated(EnumType.STRING)
    private TypeConsultation typeConsultation;

    private LocalDate dateConsultation;
    private String examenClinique;
    private String diagnostic;
    private String observations;

    @OneToOne
    @JoinColumn(name = "rendez_vous_id")
    private RendezVous rendezVous;

    @ManyToOne
    @JoinColumn(name = "dossier_id")
    private DossierMedical dossierMedical;

    @OneToOne(mappedBy = "consultation", cascade = CascadeType.ALL)
    private Facture facture;
}