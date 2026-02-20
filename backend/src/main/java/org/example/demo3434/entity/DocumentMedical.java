package org.example.demo3434.entity;

import jakarta.persistence.*;
import lombok.Data;


@Data
@Entity
public class DocumentMedical {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nomFichier;
    private String type;
    private String cheminFichier;

    @ManyToOne
    @JoinColumn(name = "dossier_id")
    private DossierMedical dossierMedical;
}