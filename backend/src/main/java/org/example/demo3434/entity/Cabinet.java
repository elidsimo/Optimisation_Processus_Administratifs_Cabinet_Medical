package org.example.demo3434.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
public class Cabinet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Lob
    private String logo;
    private String nom;

    @Enumerated(EnumType.STRING)
    private Specialite specialite;

    private String adresse;
    private String tel;
    private boolean estActif;

    @OneToOne
    private Administrateur administrateur; // Relation "Gère"

    @OneToMany(mappedBy = "cabinet")
    private List<Medecin> medecins;

    @OneToMany(mappedBy = "cabinet")
    private List<Secretaire> secretaires;
}
