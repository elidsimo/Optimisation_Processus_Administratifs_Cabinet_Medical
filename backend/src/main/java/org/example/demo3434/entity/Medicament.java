package org.example.demo3434.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Medicament {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nomCommercial;
    private String dosage;
    private String forme;
}






