package org.example.demo3434.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Utilisateur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String login;
    private String pwd;
    private String nom;
    private String prenom;
    private String numTel;

    @Enumerated(EnumType.STRING)
    private Role role;

    public boolean seConnecter (String login, String pwd) { return true; }
    public void seDeconnecter () {}
}

