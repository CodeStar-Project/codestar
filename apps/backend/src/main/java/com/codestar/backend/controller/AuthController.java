package com.codestar.backend.controller;

import com.codestar.backend.dto.ApiResponseDto;
import com.codestar.backend.dto.LoginRequestDto;
import com.codestar.backend.dto.LoginResponseDto;
import com.codestar.backend.model.User;
import com.codestar.backend.repository.IUserRepository;
import com.codestar.backend.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final IUserRepository userRepository;
    private final JwtUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthController(IUserRepository userRepository, JwtUtils jwtUtils){
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponseDto<LoginResponseDto>> login(@RequestBody LoginRequestDto request){

        Optional<User> userOptionnal = userRepository.findByUsername(request.getUsername());

        if (userOptionnal.isEmpty()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponseDto<>(false, "Identifiants invalides", null));
        }

        User user = userOptionnal.get();
        if (passwordEncoder.matches(request.getPassword(), user.getPassword())){
            String token = jwtUtils.generateToken(user.getUsername());
            LoginResponseDto loginData = new LoginResponseDto(token, "Bearer");
            return ResponseEntity.ok(new ApiResponseDto<>(true, "Connexion réussie", loginData));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponseDto<>(false, "Identifiants invalides", null));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponseDto<Object>> register(@RequestBody User user){
        if(userRepository.findByUsername(user.getUsername()).isPresent()){
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiResponseDto<>(false, "Nom d'utilisateur non disponible", null));
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponseDto<>(true, "Compte créé", null));
    }



}





































