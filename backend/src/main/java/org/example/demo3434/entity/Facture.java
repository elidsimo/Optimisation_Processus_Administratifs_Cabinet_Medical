package org.example.demo3434.entity;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Facture {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idFacture;

    private double doubleMontant;

    @Enumerated(EnumType.STRING)
    private ModePaiement modePaiement;

    @Enumerated(EnumType.STRING)
    private StatutFacture statutFacture;

    @OneToOne
    @JoinColumn(name = "consultation_id")
    private Consultation consultation;

    @ManyToOne
    private Secretaire secretaire; // Relation "Valide"
}