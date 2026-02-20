package org.example.demo3434.dto;

import lombok.Data;


@Data
public class PrescriptionDTO {
    private Integer medicamentId;
    private String posologie;
    private String duree;
    private String instructions; // Mapping vers un champ note ou concaténé
}