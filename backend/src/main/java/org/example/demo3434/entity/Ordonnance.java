package org.example.demo3434.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Ordonnance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private LocalDate date;

    @Lob
    private byte[] signatureMedecin;

    @ManyToOne
    @JoinColumn(name = "consultation_id")
    private Consultation consultation;
}
