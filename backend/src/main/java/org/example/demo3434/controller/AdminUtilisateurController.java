package org.example.demo3434.controller;

import lombok.RequiredArgsConstructor;
import org.example.demo3434.dto.CabinetUserDTO;
import org.example.demo3434.dto.UtilisateurDTO;
import org.example.demo3434.service.AdminUtilisateurService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5000") // Pour React
public class AdminUtilisateurController {

    private final AdminUtilisateurService adminService;

    // Récupérer tous les utilisateurs
    @GetMapping("/utilisateurs")
    public ResponseEntity<List<UtilisateurDTO>> getAllUtilisateurs() {
        return ResponseEntity.ok(adminService.getAllUtilisateurs());
    }

    // Créer un utilisateur
    @PostMapping("/utilisateurs")
    public ResponseEntity<UtilisateurDTO> createUtilisateur(@RequestBody UtilisateurDTO dto) {
        return ResponseEntity.ok(adminService.createUtilisateur(dto));
    }

    // Mettre à jour un utilisateur
    @PutMapping("/utilisateurs/{id}")
    public ResponseEntity<UtilisateurDTO> updateUtilisateur(@PathVariable Long id, @RequestBody UtilisateurDTO dto) {
        return ResponseEntity.ok(adminService.updateUtilisateur(id, dto));
    }

    // Supprimer un utilisateur
    @DeleteMapping("/utilisateurs/{id}")
    public ResponseEntity<Void> deleteUtilisateur(@PathVariable Long id) {
        adminService.deleteUtilisateur(id);
        return ResponseEntity.noContent().build();
    }

    // Récupérer la liste des cabinets pour le menu déroulant
    @GetMapping("/cabinet")
    public ResponseEntity<List<CabinetUserDTO>> getAllCabinets() {
        return ResponseEntity.ok(adminService.getAllCabinets());
    }
}
