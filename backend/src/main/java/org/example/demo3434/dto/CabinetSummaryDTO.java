package org.example.demo3434.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CabinetSummaryDTO {
    private Integer id;
    private String name;
    private String specialite;
    private String ville;
    private String status;
    private int users;
    private String logoUrl;
}