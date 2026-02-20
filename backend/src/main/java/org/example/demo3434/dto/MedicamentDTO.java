package org.example.demo3434.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MedicamentDTO {
    private Integer id;
    private String nom;
    private String forme;
    private String dosage;
}