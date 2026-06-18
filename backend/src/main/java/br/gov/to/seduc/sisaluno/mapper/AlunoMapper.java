package br.gov.to.seduc.sisaluno.mapper;

import br.gov.to.seduc.sisaluno.dto.AlunoDto;
import br.gov.to.seduc.sisaluno.entity.Aluno;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.Period;

@Component
public class AlunoMapper {

    public AlunoDto toDto(Aluno aluno) {
        if (aluno == null) {
            return null;
        }

        int idade = 0;
        if (aluno.getDataNascimento() != null) {
            idade = Period.between(aluno.getDataNascimento(), LocalDate.now()).getYears();
        }

        return AlunoDto.builder()
                .id(aluno.getId())
                .nome(aluno.getNome())
                .cpf(aluno.getCpf())
                .dataNascimento(aluno.getDataNascimento())
                .sexo(aluno.getSexo())
                .email(aluno.getEmail())
                .telefone(aluno.getTelefone())
                .serieId(aluno.getSerie() != null ? aluno.getSerie().getId() : null)
                .serieNome(aluno.getSerie() != null ? aluno.getSerie().getNome() : null)
                .escolaId(aluno.getEscola() != null ? aluno.getEscola().getId() : null)
                .escolaNome(aluno.getEscola() != null ? aluno.getEscola().getNome() : null)
                .municipioId(aluno.getEscola() != null && aluno.getEscola().getMunicipio() != null ? 
                        aluno.getEscola().getMunicipio().getId() : null)
                .municipioNome(aluno.getEscola() != null && aluno.getEscola().getMunicipio() != null ? 
                        aluno.getEscola().getMunicipio().getNome() : null)
                .idade(idade)
                .build();
    }

    public Aluno toEntity(AlunoDto dto) {
        if (dto == null) {
            return null;
        }

        return Aluno.builder()
                .id(dto.getId())
                .nome(dto.getNome())
                .cpf(dto.getCpf())
                .dataNascimento(dto.getDataNascimento())
                .sexo(dto.getSexo())
                .email(dto.getEmail())
                .telefone(dto.getTelefone())
                .build();
    }
}
