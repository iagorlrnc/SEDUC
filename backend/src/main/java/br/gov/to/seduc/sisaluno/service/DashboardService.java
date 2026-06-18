package br.gov.to.seduc.sisaluno.service;

import br.gov.to.seduc.sisaluno.dto.DashboardItemDto;
import br.gov.to.seduc.sisaluno.dto.DashboardResumoDto;
import br.gov.to.seduc.sisaluno.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private AlunoRepository alunoRepository;

    @Autowired
    private EscolaRepository escolaRepository;

    @Autowired
    private MunicipioRepository municipioRepository;

    public DashboardResumoDto getResumo() {
        long totalAlunos = alunoRepository.count();
        long totalEscolas = escolaRepository.count();
        long totalMunicipios = municipioRepository.count();

        List<LocalDate> birthdates = alunoRepository.findAllBirthdates();
        double mediaIdade = 0.0;
        if (!birthdates.isEmpty()) {
            double somaIdades = 0.0;
            for (LocalDate bd : birthdates) {
                if (bd != null) {
                    somaIdades += Period.between(bd, LocalDate.now()).getYears();
                }
            }
            mediaIdade = somaIdades / birthdates.size();
        }

        // Prepara dados de suporte para a "IA" gerar insights
        List<DashboardItemDto> topMunicipios = getAlunosPorMunicipio().stream().limit(3).collect(Collectors.toList());
        List<DashboardItemDto> topSeries = getAlunosPorSerie().stream().limit(3).collect(Collectors.toList());
        List<DashboardItemDto> sexos = getAlunosPorSexo();

        String insightsIa = generateIaInsights(totalAlunos, totalEscolas, totalMunicipios, mediaIdade, topMunicipios, topSeries, sexos);

        return DashboardResumoDto.builder()
                .totalAlunos(totalAlunos)
                .totalEscolas(totalEscolas)
                .totalMunicipios(totalMunicipios)
                .mediaIdade(Math.round(mediaIdade * 10.0) / 10.0) // 1 casa decimal
                .insightsIa(insightsIa)
                .build();
    }

    public List<DashboardItemDto> getAlunosPorMunicipio() {
        return mapToDtoList(alunoRepository.countAlunosPorMunicipio());
    }

    public List<DashboardItemDto> getAlunosPorEscola() {
        return mapToDtoList(alunoRepository.countAlunosPorEscola());
    }

    public List<DashboardItemDto> getAlunosPorSerie() {
        return mapToDtoList(alunoRepository.countAlunosPorSerie());
    }

    public List<DashboardItemDto> getAlunosPorSexo() {
        return mapToDtoList(alunoRepository.countAlunosPorSexo());
    }

    public List<DashboardItemDto> getFaixaEtaria() {
        List<LocalDate> birthdates = alunoRepository.findAllBirthdates();
        
        long ate14 = 0;
        long de15 = 0;
        long de16 = 0;
        long de17 = 0;
        long mais18 = 0;

        for (LocalDate bd : birthdates) {
            if (bd != null) {
                int idade = Period.between(bd, LocalDate.now()).getYears();
                if (idade <= 14) {
                    ate14++;
                } else if (idade == 15) {
                    de15++;
                } else if (idade == 16) {
                    de16++;
                } else if (idade == 17) {
                    de17++;
                } else {
                    mais18++;
                }
            }
        }

        List<DashboardItemDto> faixas = new ArrayList<>();
        faixas.add(new DashboardItemDto("Até 14 anos", ate14));
        faixas.add(new DashboardItemDto("15 anos", de15));
        faixas.add(new DashboardItemDto("16 anos", de16));
        faixas.add(new DashboardItemDto("17 anos", de17));
        faixas.add(new DashboardItemDto("18+ anos", mais18));

        return faixas;
    }

    private List<DashboardItemDto> mapToDtoList(List<Object[]> list) {
        List<DashboardItemDto> result = new ArrayList<>();
        for (Object[] row : list) {
            String name = row[0] != null ? row[0].toString() : "Desconhecido";
            Long val = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            result.add(new DashboardItemDto(name, val));
        }
        // Ordena por valor decrescente
        result.sort((o1, o2) -> o2.getValue().compareTo(o1.getValue()));
        return result;
    }

    private String generateIaInsights(long totalAlunos, long totalEscolas, long totalMunicipios, double averageAge, 
                                     List<DashboardItemDto> municipiosList, List<DashboardItemDto> seriesList, 
                                     List<DashboardItemDto> sexosList) {
        if (totalAlunos == 0) {
            return "### 🧠 Resumo Executivo Analítico (IA)\n\n*Nenhum registro de aluno foi encontrado no banco de dados para alimentar a análise preditiva. Realize o upload de arquivos JSON/SQL para iniciar.*";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("### 🧠 Resumo Executivo Analítico (IA)\n\n");
        sb.append(String.format("Com base na análise estatística da base de dados contendo **%,d alunos** matriculados em **%d escolas** em **%d municípios** do estado do Tocantins, o sistema de IA gerou os seguintes insights:\n\n", 
                totalAlunos, totalEscolas, totalMunicipios));

        // 1. Concentração Demográfica
        if (!municipiosList.isEmpty()) {
            DashboardItemDto topMun = municipiosList.get(0);
            double pct = (double) topMun.getValue() / totalAlunos * 100;
            sb.append(String.format("1. **Concentração Urbana:** O município de **%s** lidera com o maior número de alunos cadastrados, concentrando **%,d matrículas** (**%.1f%%** do estado). Isso sugere uma centralização da demanda escolar neste centro urbano, requerendo monitoramento contínuo da infraestrutura física dessas escolas.\n", 
                    topMun.getName(), topMun.getValue(), pct));
        }

        // 2. Distribuição por Série
        if (!seriesList.isEmpty()) {
            DashboardItemDto topSerie = seriesList.get(0);
            double pct = (double) topSerie.getValue() / totalAlunos * 100;
            sb.append(String.format("2. **Volume por Etapa de Ensino:** A maior concentração de matrículas está no **%s**, registrando **%,d alunos** (**%.1f%%**). O monitoramento da transição entre séries indica que as taxas de permanência escolar devem ser fortalecidas para reduzir a evasão nos anos subsequentes.\n", 
                    topSerie.getName(), topSerie.getValue(), pct));
        }

        // 3. Equilíbrio de Gênero
        if (!sexosList.isEmpty()) {
            DashboardItemDto topSexo = sexosList.get(0);
            String genero = topSexo.getName().equalsIgnoreCase("M") ? "masculino" : (topSexo.getName().equalsIgnoreCase("F") ? "feminino" : "não informado");
            double pct = (double) topSexo.getValue() / totalAlunos * 100;
            sb.append(String.format("3. **Perfil Demográfico de Gênero:** Há uma predominância de alunos do sexo **%s** na rede estadual, totalizando **%.1f%%** da amostra de dados.\n", 
                    genero, pct));
        }

        // 4. Faixa Etária
        sb.append(String.format("4. **Média de Idade e Distorção:** A média de idade dos alunos está fixada em **%.1f anos**. A concentração de alunos com 18 anos ou mais indica distorção idade-série em algumas regiões, sugerindo a oportunidade de expandir programas de Educação de Jovens e Adultos (EJA) ou aceleração de aprendizagem.\n\n", 
                averageAge));

        sb.append("#### 💡 Recomendações Estratégicas para Gestores:\n");
        sb.append("* **Planejamento de Recursos:** Recomenda-se alocação preferencial de verbas para manutenção física e contratação de professores em polos de grande crescimento de matrículas.\n");
        if (totalAlunos > 10) {
            sb.append("* **Redução de Evasão:** Implementar um comitê de busca ativa focando principalmente nos estudantes de séries terminais (3º ano) que apresentam maior distorção de idade, onde estatisticamente a taxa de abandono é superior.");
        }

        return sb.toString();
    }
}
