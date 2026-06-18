package br.gov.to.seduc.sisaluno.controller;

import br.gov.to.seduc.sisaluno.dto.JwtResponse;
import br.gov.to.seduc.sisaluno.dto.LoginRequest;
import br.gov.to.seduc.sisaluno.security.jwt.JwtUtils;
import br.gov.to.seduc.sisaluno.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private br.gov.to.seduc.sisaluno.repository.UsuarioRepository usuarioRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority())
                .findFirst()
                .orElse("ROLE_VIEWER")
                .replace("ROLE_", "");

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getNome(),
                role
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody br.gov.to.seduc.sisaluno.dto.RegisterRequest registerRequest) {
        if (usuarioRepository.existsByUsername(registerRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(java.util.Map.of("message", "Erro: Este e-mail já está cadastrado!"));
        }

        br.gov.to.seduc.sisaluno.entity.Usuario usuario = br.gov.to.seduc.sisaluno.entity.Usuario.builder()
                .username(registerRequest.getEmail())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .nome(registerRequest.getNome())
                .telefone(registerRequest.getTelefone())
                .cpf(registerRequest.getCpf())
                .setor(registerRequest.getSetor())
                .role(br.gov.to.seduc.sisaluno.entity.Role.VIEWER) // Default role
                .approved(false) // Requires admin approval
                .build();

        usuarioRepository.save(usuario);

        return ResponseEntity.ok(java.util.Map.of("message", "Cadastro solicitado com sucesso! Aguarde a aprovação do administrador para acessar o sistema."));
    }
}
