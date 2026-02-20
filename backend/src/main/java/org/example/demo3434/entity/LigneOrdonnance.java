package org.example.demo3434.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class LigneOrdonnance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String posologie;
    private String duree;

    @ManyToOne
    @JoinColumn(name = "ordonnance_med_id")
    private OrdonnanceMedicament ordonnanceMedicament;

    @ManyToOne
    @JoinColumn(name = "medicament_id")
    private Medicament medicament;
}
