package br.gov.to.seduc.sisaluno.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"username"})
})
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private Role role;

    @Column(nullable = false)
    private Boolean approved = false;

    @Column(nullable = true)
    private String email;

    @Column(nullable = true)
    private String telefone;

    @Column(nullable = true)
    private String cpf;

    @Column(nullable = true)
    private String setor;

    public Usuario() {}

    public Usuario(Long id, String username, String password, String nome, Role role, Boolean approved, String email, String telefone, String cpf, String setor) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.nome = nome;
        this.role = role;
        this.approved = approved != null ? approved : false;
        this.email = email;
        this.telefone = telefone;
        this.cpf = cpf;
        this.setor = setor;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Boolean getApproved() {
        return approved;
    }

    public void setApproved(Boolean approved) {
        this.approved = approved != null ? approved : false;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getSetor() {
        return setor;
    }

    public void setSetor(String setor) {
        this.setor = setor;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String username;
        private String password;
        private String nome;
        private Role role;
        private Boolean approved;
        private String email;
        private String telefone;
        private String cpf;
        private String setor;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder password(String password) { this.password = password; return this; }
        public Builder nome(String nome) { this.nome = nome; return this; }
        public Builder role(Role role) { this.role = role; return this; }
        public Builder approved(Boolean approved) { this.approved = approved; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder telefone(String telefone) { this.telefone = telefone; return this; }
        public Builder cpf(String cpf) { this.cpf = cpf; return this; }
        public Builder setor(String setor) { this.setor = setor; return this; }

        public Usuario build() {
            return new Usuario(id, username, password, nome, role, approved, email, telefone, cpf, setor);
        }
    }
}
