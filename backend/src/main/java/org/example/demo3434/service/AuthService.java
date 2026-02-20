package org.example.demo3434.service;


import org.example.demo3434.dto.LoginRequest;
import org.example.demo3434.dto.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);
}
