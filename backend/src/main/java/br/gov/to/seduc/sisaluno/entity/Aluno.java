package br.gov.to.seduc.sisaluno.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "alunos", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"cpf"})
})
public class Aluno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, columnDefinition = "VARCHAR(255)")
    private String cpf;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    private String sexo;

    private String email;

    private String telefone;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "serie_id", nullable = false)
    private Serie serie;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "escola_id", nullable = false)
    private Escola escola;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "upload_log_id")
    private Long uploadLogId;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Aluno() {}

    public Aluno(Long id, String nome, String cpf, LocalDate dataNascimento, String sexo, 
                 String email, String telefone, Serie serie, Escola escola, 
                 LocalDateTime createdAt, LocalDateTime updatedAt, Long uploadLogId) {
        this.id = id;
        this.nome = nome;
        this.cpf = cpf;
        this.dataNascimento = dataNascimento;
        this.sexo = sexo;
        this.email = email;
        this.telefone = telefone;
        this.serie = serie;
        this.escola = escola;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.uploadLogId = uploadLogId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getSexo() {
        return sexo;
    }

    public void setSexo(String sexo) {
        this.sexo = sexo;
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

    public Serie getSerie() {
        return serie;
    }

    public void setSerie(Serie serie) {
        this.serie = serie;
    }

    public Escola getEscola() {
        return escola;
    }

    public void setEscola(Escola escola) {
        this.escola = escola;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getUploadLogId() {
        return uploadLogId;
    }

    public void setUploadLogId(Long uploadLogId) {
        this.uploadLogId = uploadLogId;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String nome;
        private String cpf;
        private LocalDate dataNascimento;
        private String sexo;
        private String email;
        private String telefone;
        private Serie serie;
        private Escola escola;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Long uploadLogId;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder nome(String nome) { this.nome = nome; return this; }
        public Builder cpf(String cpf) { this.cpf = cpf; return this; }
        public Builder dataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; return this; }
        public Builder sexo(String sexo) { this.sexo = sexo; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder telefone(String telefone) { this.telefone = telefone; return this; }
        public Builder serie(Serie serie) { this.serie = serie; return this; }
        public Builder escola(Escola escola) { this.escola = escola; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public Builder uploadLogId(Long uploadLogId) { this.uploadLogId = uploadLogId; return this; }

        public Aluno build() {
            return new Aluno(id, nome, cpf, dataNascimento, sexo, email, telefone, serie, escola, createdAt, updatedAt, uploadLogId);
        }
    }
}
