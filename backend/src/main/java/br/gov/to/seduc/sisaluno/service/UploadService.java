package br.gov.to.seduc.sisaluno.service;

import br.gov.to.seduc.sisaluno.entity.*;
import br.gov.to.seduc.sisaluno.repository.*;
import br.gov.to.seduc.sisaluno.util.EtlUtils;
import br.gov.to.seduc.sisaluno.dto.UploadResponseDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class UploadService {

    private static final Logger logger = LoggerFactory.getLogger(UploadService.class);

    @Autowired
    private AlunoRepository alunoRepository;

    @Autowired
    private EscolaRepository escolaRepository;

    @Autowired
    private MunicipioRepository municipioRepository;

    @Autowired
    private SerieRepository serieRepository;

    @Autowired
    private UploadLogRepository uploadLogRepository;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Processa arquivos JSON.
     */
    @Transactional
    public UploadResponseDto processJson(InputStream inputStream, String username) {
        StringBuilder errorsLog = new StringBuilder();
        int processedCount = 0;
        int rowNum = 0;

        try {
            List<Map<String, Object>> records = objectMapper.readValue(inputStream, new TypeReference<List<Map<String, Object>>>() {});

            String status = errorsLog.length() == 0 ? "SUCESSO" : (processedCount > 0 ? "PARCIAL" : "ERRO");
            UploadLog uploadLog = saveUploadLog(username, "JSON", processedCount, status, errorsLog.toString());

            for (Map<String, Object> record : records) {
                rowNum++;
                try {
                    processStudentMap(record, uploadLog.getId());
                    processedCount++;
                } catch (Exception e) {
                    errorsLog.append(String.format("Linha/Registro %d: %s\n", rowNum, e.getMessage()));
                }
            }

            // Update the log with final counts
            uploadLog.setRegistrosProcessados(processedCount);
            uploadLog.setStatus(errorsLog.length() == 0 ? "SUCESSO" : (processedCount > 0 ? "PARCIAL" : "ERRO"));
            uploadLog.setLogErros(errorsLog.length() > 0 ? errorsLog.toString() : null);
            uploadLogRepository.save(uploadLog);

            return UploadResponseDto.builder()
                    .status(uploadLog.getStatus())
                    .registrosProcessados(processedCount)
                    .mensagem(uploadLog.getStatus().equals("SUCESSO") ? "Carga concluída com sucesso." : "Carga concluída com inconsistências.")
                    .logErros(errorsLog.length() > 0 ? errorsLog.toString() : null)
                    .build();

        } catch (Exception e) {
            logger.error("Erro geral processando JSON de upload: ", e);
            saveUploadLog(username, "JSON", 0, "ERRO", "Erro de estrutura do arquivo: " + e.getMessage());
            return UploadResponseDto.builder()
                    .status("ERRO")
                    .registrosProcessados(0)
                    .mensagem("Erro ao ler arquivo JSON: " + e.getMessage())
                    .logErros("Erro crítico: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Processa scripts SQL.
     */
    @Transactional
    public UploadResponseDto processSql(InputStream inputStream, String username) {
        StringBuilder errorsLog = new StringBuilder();
        int processedCount = 0;
        int statementNum = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            StringBuilder sqlBuilder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sqlBuilder.append(line).append("\n");
            }

            // Divide as instruções por ponto e vírgula
            String[] statements = sqlBuilder.toString().split(";");

            // Expressões regulares para mapear o insert e valores
            Pattern insertPattern = Pattern.compile(
                    "INSERT\\s+INTO\\s+\\w+\\s*\\(([^)]+)\\)\\s*VALUES\\s*(.*)",
                    Pattern.CASE_INSENSITIVE | Pattern.DOTALL
            );

            String status = errorsLog.length() == 0 ? "SUCESSO" : (processedCount > 0 ? "PARCIAL" : "ERRO");
            UploadLog uploadLog = saveUploadLog(username, "SQL", processedCount, status, errorsLog.toString());

            for (String statementStr : statements) {
                String cleanStatement = statementStr.trim();
                if (cleanStatement.isEmpty()) continue;

                statementNum++;
                Matcher matcher = insertPattern.matcher(cleanStatement);

                if (matcher.find()) {
                    String columnsPart = matcher.group(1);
                    String valuesPart = matcher.group(2);

                    List<String> columns = parseSqlColumns(columnsPart);
                    List<List<String>> recordsValues = parseSqlValuesList(valuesPart);

                    for (List<String> recordValues : recordsValues) {
                        try {
                            if (columns.size() != recordValues.size()) {
                                throw new IllegalArgumentException("Divergência entre número de colunas (" + columns.size() + ") e valores (" + recordValues.size() + ")");
                            }

                            Map<String, Object> recordMap = new HashMap<>();
                            for (int i = 0; i < columns.size(); i++) {
                                recordMap.put(columns.get(i), recordValues.get(i));
                            }

                            processStudentMap(recordMap, uploadLog.getId());
                            processedCount++;
                        } catch (Exception e) {
                            errorsLog.append(String.format("Instrução SQL %d, Registro: %s\n", statementNum, e.getMessage()));
                        }
                    }
                } else {
                    if (cleanStatement.toUpperCase().startsWith("INSERT")) {
                        errorsLog.append(String.format("Instrução SQL %d: Não foi possível fazer o parse do comando INSERT (sintaxe não suportada).\n", statementNum));
                    }
                }
            }

            // Update the log with final counts
            uploadLog.setRegistrosProcessados(processedCount);
            uploadLog.setStatus(errorsLog.length() == 0 ? "SUCESSO" : (processedCount > 0 ? "PARCIAL" : "ERRO"));
            uploadLog.setLogErros(errorsLog.length() > 0 ? errorsLog.toString() : null);
            uploadLogRepository.save(uploadLog);

            return UploadResponseDto.builder()
                    .status(uploadLog.getStatus())
                    .registrosProcessados(processedCount)
                    .mensagem(uploadLog.getStatus().equals("SUCESSO") ? "Carga concluída com sucesso." : "Carga concluída com inconsistências.")
                    .logErros(errorsLog.length() > 0 ? errorsLog.toString() : null)
                    .build();

        } catch (Exception e) {
            logger.error("Erro geral processando SQL de upload: ", e);
            saveUploadLog(username, "SQL", 0, "ERRO", "Erro crítico processando SQL: " + e.getMessage());
            return UploadResponseDto.builder()
                    .status("ERRO")
                    .registrosProcessados(0)
                    .mensagem("Erro ao ler arquivo SQL: " + e.getMessage())
                    .logErros("Erro crítico: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Processa arquivos XML.
     */
    @Transactional
    public UploadResponseDto processXml(InputStream inputStream, String username) {
        StringBuilder errorsLog = new StringBuilder();
        int processedCount = 0;
        int rowNum = 0;

        try {
            javax.xml.parsers.DocumentBuilderFactory factory = javax.xml.parsers.DocumentBuilderFactory.newInstance();
            // XXE Protection
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
            factory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
            factory.setXIncludeAware(false);
            factory.setExpandEntityReferences(false);

            javax.xml.parsers.DocumentBuilder builder = factory.newDocumentBuilder();
            org.w3c.dom.Document doc = builder.parse(inputStream);
            doc.getDocumentElement().normalize();

            String status = errorsLog.length() == 0 ? "SUCESSO" : (processedCount > 0 ? "PARCIAL" : "ERRO");
            UploadLog uploadLog = saveUploadLog(username, "XML", processedCount, status, errorsLog.toString());

            org.w3c.dom.NodeList nList = doc.getDocumentElement().getChildNodes();
            for (int temp = 0; temp < nList.getLength(); temp++) {
                org.w3c.dom.Node nNode = nList.item(temp);
                if (nNode.getNodeType() == org.w3c.dom.Node.ELEMENT_NODE) {
                    rowNum++;
                    try {
                        org.w3c.dom.Element eElement = (org.w3c.dom.Element) nNode;
                        Map<String, Object> recordMap = new HashMap<>();

                        org.w3c.dom.NodeList childNodes = eElement.getChildNodes();
                        for (int i = 0; i < childNodes.getLength(); i++) {
                            org.w3c.dom.Node child = childNodes.item(i);
                            if (child.getNodeType() == org.w3c.dom.Node.ELEMENT_NODE) {
                                String key = child.getNodeName();
                                String value = child.getTextContent();
                                recordMap.put(key, value);
                            }
                        }

                        processStudentMap(recordMap, uploadLog.getId());
                        processedCount++;
                    } catch (Exception e) {
                        errorsLog.append(String.format("Registro XML %d: %s\n", rowNum, e.getMessage()));
                    }
                }
            }

            // Update the log with final counts
            uploadLog.setRegistrosProcessados(processedCount);
            uploadLog.setStatus(errorsLog.length() == 0 ? "SUCESSO" : (processedCount > 0 ? "PARCIAL" : "ERRO"));
            uploadLog.setLogErros(errorsLog.length() > 0 ? errorsLog.toString() : null);
            uploadLogRepository.save(uploadLog);

            return UploadResponseDto.builder()
                    .status(uploadLog.getStatus())
                    .registrosProcessados(processedCount)
                    .mensagem(uploadLog.getStatus().equals("SUCESSO") ? "Carga concluída com sucesso." : "Carga concluída com inconsistências.")
                    .logErros(errorsLog.length() > 0 ? errorsLog.toString() : null)
                    .build();

        } catch (Exception e) {
            logger.error("Erro geral processando XML de upload: ", e);
            saveUploadLog(username, "XML", 0, "ERRO", "Erro de estrutura do arquivo XML: " + e.getMessage());
            return UploadResponseDto.builder()
                    .status("ERRO")
                    .registrosProcessados(0)
                    .mensagem("Erro ao ler arquivo XML: " + e.getMessage())
                    .logErros("Erro crítico: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Processa planilhas Excel (XLSX).
     */
    @Transactional
    public UploadResponseDto processXlsx(InputStream inputStream, String username) {
        StringBuilder errorsLog = new StringBuilder();
        int processedCount = 0;
        int rowNum = 0;

        try (org.apache.poi.ss.usermodel.Workbook workbook = org.apache.poi.ss.usermodel.WorkbookFactory.create(inputStream)) {
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.getSheetAt(0);
            int lastRowNum = sheet.getLastRowNum();
            if (lastRowNum < 0) {
                throw new IllegalArgumentException("A planilha está vazia.");
            }

            org.apache.poi.ss.usermodel.Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new IllegalArgumentException("A planilha não possui uma linha de cabeçalho.");
            }

            org.apache.poi.ss.usermodel.DataFormatter formatter = new org.apache.poi.ss.usermodel.DataFormatter();
            List<String> headers = new ArrayList<>();
            for (int cn = 0; cn < headerRow.getLastCellNum(); cn++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.getCell(cn);
                String headerVal = formatter.formatCellValue(cell);
                headers.add(normalizeHeader(headerVal));
            }

            String status = errorsLog.length() == 0 ? "SUCESSO" : (processedCount > 0 ? "PARCIAL" : "ERRO");
            UploadLog uploadLog = saveUploadLog(username, "XLSX", processedCount, status, errorsLog.toString());

            // Começa da linha 1 (ignora cabeçalho)
            for (int r = 1; r <= lastRowNum; r++) {
                org.apache.poi.ss.usermodel.Row row = sheet.getRow(r);
                if (row == null) continue;
                rowNum = r + 1; // 1-based para o log de erros

                try {
                    Map<String, Object> recordMap = new HashMap<>();
                    boolean hasData = false;

                    for (int cn = 0; cn < headers.size(); cn++) {
                        org.apache.poi.ss.usermodel.Cell cell = row.getCell(cn);
                        String cellValue = formatter.formatCellValue(cell);
                        if (cellValue != null && !cellValue.trim().isEmpty()) {
                            hasData = true;
                            recordMap.put(headers.get(cn), cellValue);
                        }
                    }

                    if (hasData) {
                        processStudentMap(recordMap, uploadLog.getId());
                        processedCount++;
                    }
                } catch (Exception e) {
                    errorsLog.append(String.format("Linha da Planilha %d: %s\n", rowNum, e.getMessage()));
                }
            }

            // Update the log with final counts
            uploadLog.setRegistrosProcessados(processedCount);
            uploadLog.setStatus(errorsLog.length() == 0 ? "SUCESSO" : (processedCount > 0 ? "PARCIAL" : "ERRO"));
            uploadLog.setLogErros(errorsLog.length() > 0 ? errorsLog.toString() : null);
            uploadLogRepository.save(uploadLog);

            return UploadResponseDto.builder()
                    .status(uploadLog.getStatus())
                    .registrosProcessados(processedCount)
                    .mensagem(uploadLog.getStatus().equals("SUCESSO") ? "Carga concluída com sucesso." : "Carga concluída com inconsistências.")
                    .logErros(errorsLog.length() > 0 ? errorsLog.toString() : null)
                    .build();

        } catch (Exception e) {
            logger.error("Erro geral processando XLSX de upload: ", e);
            saveUploadLog(username, "XLSX", 0, "ERRO", "Erro de leitura da planilha Excel: " + e.getMessage());
            return UploadResponseDto.builder()
                    .status("ERRO")
                    .registrosProcessados(0)
                    .mensagem("Erro ao ler planilha XLSX: " + e.getMessage())
                    .logErros("Erro crítico: " + e.getMessage())
                    .build();
        }
    }

    private String normalizeHeader(String header) {
        if (header == null) return "";
        String normalized = header.trim().toLowerCase();
        
        // Remove accents and special characters
        normalized = java.text.Normalizer.normalize(normalized, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        normalized = normalized.replaceAll("[\\s_-]+", "");

        // Synonym mappings
        if (normalized.equals("nomecompleto")) return "nome";
        if (normalized.equals("escolaestadual") || normalized.equals("colegio")) return "escola";
        if (normalized.equals("cidade")) return "municipio";
        if (normalized.equals("ano")) return "serie";
        if (normalized.equals("datadenascimento") || normalized.equals("datanasc")) return "data_nascimento";
        if (normalized.equals("genero")) return "sexo";
        if (normalized.equals("email")) return "email";
        if (normalized.equals("celular")) return "telefone";

        return normalized;
    }

    /**
     * Processa um registro mapeado em chaves/valores no ETL.
     */
    private void processStudentMap(Map<String, Object> record, Long uploadLogId) {
        // 1. Extração bruta
        String nomeBruto = getStringVal(record, "nome");
        String cpfBruto = getStringVal(record, "cpf");
        String escolaBruta = getStringVal(record, "escola");
        String municipioBruto = getStringVal(record, "municipio");
        String serieBruta = getStringVal(record, "serie");
        String sexoBruto = getStringVal(record, "sexo");
        String emailBruto = getStringVal(record, "email");
        String telefoneBruto = getStringVal(record, "telefone");

        // 2. Transformações e Validações
        String nome = null;
        if (nomeBruto != null && !nomeBruto.trim().isEmpty()) {
            nome = EtlUtils.formatName(nomeBruto);
        }

        String cleanCpf = null;
        if (cpfBruto != null && !cpfBruto.trim().isEmpty()) {
            cleanCpf = cpfBruto.replaceAll("\\D", "");
        }
        if (!EtlUtils.isValidCpf(cleanCpf)) {
            throw new IllegalArgumentException("CPF inválido: " + cpfBruto);
        }

        // Resolução de Datas (Nascimento / Idade)
        LocalDate dataNascimento = null;
        String dataNascBruta = getStringVal(record, "data_nascimento");
        if (dataNascBruta == null) {
            dataNascBruta = getStringVal(record, "dataNascimento");
        }

        if (dataNascBruta != null && !dataNascBruta.trim().isEmpty()) {
            dataNascimento = EtlUtils.parseLocalDate(dataNascBruta);
        }

        if (dataNascimento == null) {
            // Tenta obter pela idade
            Object idadeObj = record.get("idade");
            if (idadeObj != null) {
                try {
                    int idade = Integer.parseInt(idadeObj.toString().trim());
                    if (idade > 0 && idade <= 120) {
                        dataNascimento = EtlUtils.deriveBirthdateFromAge(idade);
                    }
                } catch (NumberFormatException e) {
                    // Ignora idade inválida
                }
            }
        }

        // Sexo
        String sexo = "Não Informado";
        if (sexoBruto != null && !sexoBruto.trim().isEmpty()) {
            String cleanSexo = sexoBruto.trim().toUpperCase();
            if (cleanSexo.startsWith("M")) {
                sexo = "M";
            } else if (cleanSexo.startsWith("F")) {
                sexo = "F";
            }
        }

        // Email e Telefone
        String email = null;
        if (emailBruto != null && !emailBruto.trim().isEmpty()) {
            email = emailBruto.trim().toLowerCase();
            // Email não é mais validado, apenas armazenado
        }

        String telefone = null;
        if (telefoneBruto != null && !telefoneBruto.trim().isEmpty()) {
            telefone = telefoneBruto.trim().replaceAll("[^\\d()+\\- ]", "");
        }

        // Resolução do Município
        Municipio municipio;
        if (municipioBruto != null && !municipioBruto.trim().isEmpty()) {
            String nomeMunicipio = EtlUtils.formatName(municipioBruto);
            municipio = municipioRepository.findByNomeIgnoreCase(nomeMunicipio)
                    .orElseGet(() -> municipioRepository.save(
                            Municipio.builder()
                                    .nome(nomeMunicipio)
                                    .regiao("Central") // Padrão se desconhecido
                                    .build()
                    ));
        } else {
            municipio = null;
        }

        // Resolução da Escola
        Escola escola = null;
        if (escolaBruta != null && !escolaBruta.trim().isEmpty()) {
            String nomeEscola = EtlUtils.formatName(escolaBruta);
            if (municipio != null) {
                final Municipio municipioFinal = municipio;
                escola = escolaRepository.findByNomeIgnoreCaseAndMunicipioId(nomeEscola, municipioFinal.getId())
                        .orElseGet(() -> {
                            // Tenta gerar código INEP sequencial/mockado se não fornecido
                            String mockInep = String.format("17%06d", new Random().nextInt(900000) + 100000);
                            return escolaRepository.save(
                                    Escola.builder()
                                            .nome(nomeEscola)
                                            .codigoInep(mockInep)
                                            .municipio(municipioFinal)
                                            .tipo("ESTADUAL")
                                            .build()
                            );
                        });
            } else {
                // Se não tiver município, tenta buscar escola sem filtro de município
                escola = escolaRepository.findByNomeIgnoreCase(nomeEscola)
                        .orElseGet(() -> {
                            String mockInep = String.format("17%06d", new Random().nextInt(900000) + 100000);
                            return escolaRepository.save(
                                    Escola.builder()
                                            .nome(nomeEscola)
                                            .codigoInep(mockInep)
                                            .tipo("ESTADUAL")
                                            .build()
                            );
                        });
            }
        }

        // Resolução da Série
        Serie serie = null;
        if (serieBruta != null && !serieBruta.trim().isEmpty()) {
            String nomeSerie = serieBruta.trim().replaceAll("\\s+", " ");
            // Normaliza grafias comuns como "3 Ano", "3o ano", "3º Ano" para "3º Ano"
            if (nomeSerie.toLowerCase().contains("1")) {
                nomeSerie = "1º Ano";
            } else if (nomeSerie.toLowerCase().contains("2")) {
                nomeSerie = "2º Ano";
            } else if (nomeSerie.toLowerCase().contains("3")) {
                nomeSerie = "3º Ano";
            }

            String finalNomeSerie = nomeSerie;
            serie = serieRepository.findByNomeIgnoreCase(nomeSerie)
                    .orElseGet(() -> serieRepository.save(
                            Serie.builder().nome(finalNomeSerie).build()
                    ));
        }

        // 3. Carga no PostgreSQL (Detecção de Duplicados e Salvamento)
        Aluno aluno;
        if (cleanCpf != null && !cleanCpf.isEmpty()) {
            Optional<Aluno> alunoOpt = alunoRepository.findByCpf(cleanCpf);
            if (alunoOpt.isPresent()) {
                aluno = alunoOpt.get();
                if (nome != null) aluno.setNome(nome);
                aluno.setDataNascimento(dataNascimento);
                aluno.setSexo(sexo);
                aluno.setEmail(email);
                aluno.setTelefone(telefone);
                if (escola != null) aluno.setEscola(escola);
                if (serie != null) aluno.setSerie(serie);
                aluno.setUploadLogId(uploadLogId);
            } else {
                aluno = Aluno.builder()
                        .nome(nome)
                        .cpf(cleanCpf)
                        .dataNascimento(dataNascimento)
                        .sexo(sexo)
                        .email(email)
                        .telefone(telefone)
                        .escola(escola)
                        .serie(serie)
                        .uploadLogId(uploadLogId)
                        .build();
            }
        } else {
            // Se não tiver CPF, cria novo aluno sem verificação de duplicidade
            aluno = Aluno.builder()
                    .nome(nome)
                    .cpf(cleanCpf)
                    .dataNascimento(dataNascimento)
                    .sexo(sexo)
                    .email(email)
                    .telefone(telefone)
                    .escola(escola)
                    .serie(serie)
                    .uploadLogId(uploadLogId)
                    .build();
        }

        alunoRepository.save(aluno);
    }

    private String getStringVal(Map<String, Object> map, String key) {
        Object val = map.get(key);
        // Tenta também com camelCase
        if (val == null) {
            String camelKey = toCamelCase(key);
            val = map.get(camelKey);
        }
        return val != null ? val.toString() : null;
    }

    private String toCamelCase(String s) {
        String[] parts = s.split("_");
        StringBuilder camel = new StringBuilder(parts[0]);
        for (int i = 1; i < parts.length; i++) {
            camel.append(Character.toUpperCase(parts[i].charAt(0))).append(parts[i].substring(1));
        }
        return camel.toString();
    }

    private List<String> parseSqlColumns(String columnsPart) {
        String[] split = columnsPart.split(",");
        List<String> columns = new ArrayList<>();
        for (String col : split) {
            columns.add(col.trim().replaceAll("`|'|\"|\\s", "").toLowerCase());
        }
        return columns;
    }

    private List<List<String>> parseSqlValuesList(String valuesPart) {
        List<List<String>> records = new ArrayList<>();
        
        // Expressão para capturar grupos entre parênteses: ( ... )
        Pattern recordPattern = Pattern.compile("\\(([^)]+)\\)");
        Matcher matcher = recordPattern.matcher(valuesPart);

        // Regex para extrair strings entre aspas simples, números ou valores NULL
        Pattern valuePattern = Pattern.compile("'([^']*)'|(\\d+)|(NULL)", Pattern.CASE_INSENSITIVE);

        while (matcher.find()) {
            String recordStr = matcher.group(1);
            List<String> values = new ArrayList<>();
            Matcher valMatcher = valuePattern.matcher(recordStr);

            while (valMatcher.find()) {
                if (valMatcher.group(1) != null) {
                    values.add(valMatcher.group(1)); // Texto entre aspas
                } else if (valMatcher.group(2) != null) {
                    values.add(valMatcher.group(2)); // Número
                } else {
                    values.add(null); // NULL
                }
            }
            records.add(values);
        }
        return records;
    }

    private UploadLog saveUploadLog(String username, String fileType, int processedCount, String status, String errors) {
        try {
            UploadLog log = UploadLog.builder()
                    .usuario(username)
                    .tipoArquivo(fileType)
                    .registrosProcessados(processedCount)
                    .status(status)
                    .logErros(errors.isEmpty() ? null : errors)
                    .build();
            return uploadLogRepository.save(log);
        } catch (Exception e) {
            logger.error("Erro salvando log de upload no banco: ", e);
            return null;
        }
    }
}
