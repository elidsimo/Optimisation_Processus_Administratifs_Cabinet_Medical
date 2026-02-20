package org.example.demo3434.dto;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RendezVousDTO {
    private Integer id;
    private String patientName;
    private String time;   // Format "HH:mm"
    private String status; // 'confirmed', 'waiting', etc.
    private String phone;
}