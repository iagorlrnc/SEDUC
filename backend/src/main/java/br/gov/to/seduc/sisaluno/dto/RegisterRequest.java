package br.gov.to.seduc.sisaluno.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank(message = "O nome é obrigatório")
    @Size(min = 3, max = 100, message = "O nome deve ter entre 3 e 100 caracteres")
    private String nome;

    @NotBlank(message = "O e-mail é obrigatório")
    @Size(max = 100, message = "O e-mail deve ter no máximo 100 caracteres")
    @Email(message = "O e-mail informado é inválido")
    private String email;

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 6, max = 40, message = "A senha deve ter entre 6 e 40 caracteres")
    private String password;

    private String telefone;
    private String cpf;
    private String setor;

    public RegisterRequest() {}

    public RegisterRequest(String nome, String email, String password, String telefone, String cpf, String setor) {
        this.nome = nome;
        this.email = email;
        this.password = password;
        this.telefone = telefone;
        this.cpf = cpf;
        this.setor = setor;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
}
