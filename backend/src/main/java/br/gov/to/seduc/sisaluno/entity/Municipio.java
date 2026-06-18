package br.gov.to.seduc.sisaluno.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "municipios", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"nome"})
})
public class Municipio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String regiao;

    public Municipio() {}

    public Municipio(Long id, String nome, String regiao) {
        this.id = id;
        this.nome = nome;
        this.regiao = regiao;
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

    public String getRegiao() {
        return regiao;
    }

    public void setRegiao(String regiao) {
        this.regiao = regiao;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String nome;
        private String regiao;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder nome(String nome) {
            this.nome = nome;
            return this;
        }

        public Builder regiao(String regiao) {
            this.regiao = regiao;
            return this;
        }

        public Municipio build() {
            return new Municipio(id, nome, regiao);
        }
    }
}
