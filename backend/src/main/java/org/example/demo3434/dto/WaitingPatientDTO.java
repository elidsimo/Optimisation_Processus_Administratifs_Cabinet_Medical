package org.example.demo3434.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class WaitingPatientDTO {
    private Integer idRdv;
    private String name;
    private int age;
    private String motif;
    private String waitTime;
    private String priority; // "high" ou "normal"
}