package org.example.demo3434.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RecentConsultationDTO {
    private Integer id;
    private String patient;
    private String diagnostic;
    private String date;
}