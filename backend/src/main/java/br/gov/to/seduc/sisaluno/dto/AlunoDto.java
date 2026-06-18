package br.gov.to.seduc.sisaluno.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;

public class AlunoDto {
    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    @NotBlank(message = "CPF é obrigatório")
    @Pattern(regexp = "\\d{11}|\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}", message = "CPF inválido. Deve possuir 11 dígitos ou formato XXX.XXX.XXX-XX")
    private String cpf;

    @NotNull(message = "Data de nascimento é obrigatória")
    private LocalDate dataNascimento;

    @NotBlank(message = "Sexo é obrigatório")
    @Pattern(regexp = "[MF]", message = "Sexo deve ser 'M' ou 'F'")
    private String sexo;

    private String email;
    private String telefone;

    @NotNull(message = "Id da série é obrigatório")
    private Long serieId;
    private String serieNome;

    @NotNull(message = "Id da escola é obrigatório")
    private Long escolaId;
    private String escolaNome;

    private Long municipioId;
    private String municipioNome;

    private Integer idade;

    public AlunoDto() {}

    public AlunoDto(Long id, String nome, String cpf, LocalDate dataNascimento, String sexo, 
                    String email, String telefone, Long serieId, String serieNome, 
                    Long escolaId, String escolaNome, Long municipioId, String municipioNome, Integer idade) {
        this.id = id;
        this.nome = nome;
        this.cpf = cpf;
        this.dataNascimento = dataNascimento;
        this.sexo = sexo;
        this.email = email;
        this.telefone = telefone;
        this.serieId = serieId;
        this.serieNome = serieNome;
        this.escolaId = escolaId;
        this.escolaNome = escolaNome;
        this.municipioId = municipioId;
        this.municipioNome = municipioNome;
        this.idade = idade;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }

    public String getSexo() { return sexo; }
    public void setSexo(String sexo) { this.sexo = sexo; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public Long getSerieId() { return serieId; }
    public void setSerieId(Long serieId) { this.serieId = serieId; }

    public String getSerieNome() { return serieNome; }
    public void setSerieNome(String serieNome) { this.serieNome = serieNome; }

    public Long getEscolaId() { return escolaId; }
    public void setEscolaId(Long escolaId) { this.escolaId = escolaId; }

    public String getEscolaNome() { return escolaNome; }
    public void setEscolaNome(String schoolNome) { this.escolaNome = schoolNome; }

    public Long getMunicipioId() { return municipioId; }
    public void setMunicipioId(Long municipioId) { this.municipioId = municipioId; }

    public String getMunicipioNome() { return municipioNome; }
    public void setMunicipioNome(String municipioNome) { this.municipioNome = municipioNome; }

    public Integer getIdade() { return idade; }
    public void setIdade(Integer idade) { this.idade = idade; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String nome;
        private String cpf;
        private LocalDate dataNascimento;
        private String sexo;
        private String email;
        private String telefone;
        private Long serieId;
        private String serieNome;
        private Long escolaId;
        private String escolaNome;
        private Long municipioId;
        private String municipioNome;
        private Integer idade;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder nome(String nome) { this.nome = nome; return this; }
        public Builder cpf(String cpf) { this.cpf = cpf; return this; }
        public Builder dataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; return this; }
        public Builder sexo(String sexo) { this.sexo = sexo; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder telefone(String telefone) { this.telefone = telefone; return this; }
        public Builder serieId(Long serieId) { this.serieId = serieId; return this; }
        public Builder serieNome(String serieNome) { this.serieNome = serieNome; return this; }
        public Builder escolaId(Long escolaId) { this.escolaId = escolaId; return this; }
        public Builder escolaNome(String schoolNome) { this.escolaNome = schoolNome; return this; }
        public Builder municipioId(Long municipioId) { this.municipioId = municipioId; return this; }
        public Builder municipioNome(String municipioNome) { this.municipioNome = municipioNome; return this; }
        public Builder idade(Integer idade) { this.idade = idade; return this; }

        public AlunoDto build() {
            return new AlunoDto(id, nome, cpf, dataNascimento, sexo, email, telefone, serieId, serieNome, escolaId, escolaNome, municipioId, municipioNome, idade);
        }
    }
}
