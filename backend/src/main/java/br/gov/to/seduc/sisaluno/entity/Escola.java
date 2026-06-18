package br.gov.to.seduc.sisaluno.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "escolas", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"codigo_inep"})
})
public class Escola {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(name = "codigo_inep")
    private String codigoInep;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "municipio_id", nullable = false)
    private Municipio municipio;

    private String tipo;

    public Escola() {}

    public Escola(Long id, String nome, String codigoInep, Municipio municipio, String tipo) {
        this.id = id;
        this.nome = nome;
        this.codigoInep = codigoInep;
        this.municipio = municipio;
        this.tipo = tipo;
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

    public String getCodigoInep() {
        return codigoInep;
    }

    public void setCodigoInep(String codigoInep) {
        this.codigoInep = codigoInep;
    }

    public Municipio getMunicipio() {
        return municipio;
    }

    public void setMunicipio(Municipio municipio) {
        this.municipio = municipio;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String nome;
        private String codigoInep;
        private Municipio municipio;
        private String tipo;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder nome(String nome) {
            this.nome = nome;
            return this;
        }

        public Builder codigoInep(String codigoInep) {
            this.codigoInep = codigoInep;
            return this;
        }

        public Builder municipio(Municipio municipio) {
            this.municipio = municipio;
            return this;
        }

        public Builder tipo(String tipo) {
            this.tipo = tipo;
            return this;
        }

        public Escola build() {
            return new Escola(id, nome, codigoInep, municipio, tipo);
        }
    }
}
