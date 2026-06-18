package br.gov.to.seduc.sisaluno.service;

import br.gov.to.seduc.sisaluno.dto.AlunoDto;
import br.gov.to.seduc.sisaluno.entity.Aluno;
import br.gov.to.seduc.sisaluno.entity.Escola;
import br.gov.to.seduc.sisaluno.entity.Serie;
import br.gov.to.seduc.sisaluno.mapper.AlunoMapper;
import br.gov.to.seduc.sisaluno.repository.AlunoRepository;
import br.gov.to.seduc.sisaluno.repository.EscolaRepository;
import br.gov.to.seduc.sisaluno.repository.SerieRepository;
import br.gov.to.seduc.sisaluno.util.EtlUtils;
import com.lowagie.text.Document;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class AlunoService {

    @Autowired
    private AlunoRepository alunoRepository;

    @Autowired
    private EscolaRepository escolaRepository;

    @Autowired
    private SerieRepository serieRepository;

    @Autowired
    private AlunoMapper alunoMapper;

    public Page<AlunoDto> listAlunos(String municipio, String escola, String serie, String search, Pageable pageable) {
        Page<Aluno> page = alunoRepository.findFiltered(municipio, escola, serie, search, pageable);
        return page.map(alunoMapper::toDto);
    }

    public AlunoDto getAlunoById(Long id) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Aluno não encontrado com ID: " + id));
        return alunoMapper.toDto(aluno);
    }

    @Transactional
    public AlunoDto createAluno(AlunoDto dto) {
        String cleanCpf = dto.getCpf().replaceAll("\\D", "");
        if (!EtlUtils.isValidCpf(cleanCpf)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF inválido.");
        }
        if (alunoRepository.findByCpf(cleanCpf).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado no sistema.");
        }

        Escola escola = escolaRepository.findById(dto.getEscolaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Escola não encontrada."));
        Serie serie = serieRepository.findById(dto.getSerieId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Série não encontrada."));

        Aluno aluno = Aluno.builder()
                .nome(EtlUtils.formatName(dto.getNome()))
                .cpf(cleanCpf)
                .dataNascimento(dto.getDataNascimento())
                .sexo(dto.getSexo())
                .email(dto.getEmail() != null ? dto.getEmail().trim().toLowerCase() : null)
                .telefone(dto.getTelefone())
                .escola(escola)
                .serie(serie)
                .build();

        return alunoMapper.toDto(alunoRepository.save(aluno));
    }

    @Transactional
    public AlunoDto updateAluno(Long id, AlunoDto dto) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Aluno não encontrado com ID: " + id));

        String cleanCpf = dto.getCpf().replaceAll("\\D", "");
        if (!EtlUtils.isValidCpf(cleanCpf)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF inválido.");
        }

        alunoRepository.findByCpf(cleanCpf).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado para outro aluno.");
            }
        });

        Escola escola = escolaRepository.findById(dto.getEscolaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Escola não encontrada."));
        Serie serie = serieRepository.findById(dto.getSerieId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Série não encontrada."));

        aluno.setNome(EtlUtils.formatName(dto.getNome()));
        aluno.setCpf(cleanCpf);
        aluno.setDataNascimento(dto.getDataNascimento());
        aluno.setSexo(dto.getSexo());
        aluno.setEmail(dto.getEmail() != null ? dto.getEmail().trim().toLowerCase() : null);
        aluno.setTelefone(dto.getTelefone());
        aluno.setEscola(escola);
        aluno.setSerie(serie);

        return alunoMapper.toDto(alunoRepository.save(aluno));
    }

    @Transactional
    public void deleteAluno(Long id) {
        if (!alunoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Aluno não encontrado com ID: " + id);
        }
        alunoRepository.deleteById(id);
    }

    /**
     * Exporta a lista filtrada de alunos para Excel.
     */
    public byte[] exportExcel(String municipio, String escola, String serie, String search) {
        List<Aluno> alunos = alunoRepository.findFilteredList(municipio, escola, serie, search);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Alunos SEDUC-TO");

            // Font & Style
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Row Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Nome", "CPF", "Data Nasc.", "Sexo", "E-mail", "Telefone", "Série", "Escola", "Município"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

            for (Aluno aluno : alunos) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(aluno.getNome());
                
                // Formata CPF para visualização
                String formattedCpf = aluno.getCpf();
                if (formattedCpf.length() == 11) {
                    formattedCpf = formattedCpf.substring(0, 3) + "." + formattedCpf.substring(3, 6) + "." + 
                                   formattedCpf.substring(6, 9) + "-" + formattedCpf.substring(9);
                }
                row.createCell(1).setCellValue(formattedCpf);

                String dataStr = aluno.getDataNascimento() != null ? aluno.getDataNascimento().format(formatter) : "";
                row.createCell(2).setCellValue(dataStr);
                
                row.createCell(3).setCellValue(aluno.getSexo());
                row.createCell(4).setCellValue(aluno.getEmail() != null ? aluno.getEmail() : "N/A");
                row.createCell(5).setCellValue(aluno.getTelefone() != null ? aluno.getTelefone() : "N/A");
                row.createCell(6).setCellValue(aluno.getSerie() != null ? aluno.getSerie().getNome() : "");
                row.createCell(7).setCellValue(aluno.getEscola() != null ? aluno.getEscola().getNome() : "");
                row.createCell(8).setCellValue(aluno.getEscola() != null && aluno.getEscola().getMunicipio() != null ? 
                        aluno.getEscola().getMunicipio().getNome() : "");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao gerar arquivo Excel: " + e.getMessage());
        }
    }

    /**
     * Exporta a lista filtrada de alunos para PDF.
     */
    public byte[] exportPdf(String municipio, String escola, String serie, String search) {
        List<Aluno> alunos = alunoRepository.findFilteredList(municipio, escola, serie, search);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate(), 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);

            document.open();

            // Fontes
            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.DARK_GRAY);
            com.lowagie.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            com.lowagie.text.Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);

            // Cabeçalho Documento
            Paragraph title = new Paragraph("SECRETARIA DA EDUCAÇÃO DO TOCANTINS - SEDUC-TO", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            
            Paragraph subtitle = new Paragraph("Relatório de Alunos Matriculados no Ensino Médio", FontFactory.getFont(FontFactory.HELVETICA, 12, Color.GRAY));
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20f);
            document.add(subtitle);

            // Tabela PDF
            PdfPTable table = new PdfPTable(7); // Nome, CPF, E-mail, Telefone, Série, Escola, Município
            table.setWidthPercentage(100f);
            table.setWidths(new float[]{3.0f, 1.8f, 2.5f, 1.8f, 1.5f, 2.5f, 2.0f});

            String[] headers = {"Nome", "CPF", "E-mail", "Telefone", "Série", "Escola", "Município"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                cell.setBackgroundColor(new Color(0, 51, 102)); // Azul Escuro
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(6f);
                table.addCell(cell);
            }

            for (Aluno aluno : alunos) {
                table.addCell(new PdfPCell(new Phrase(aluno.getNome(), bodyFont)));
                
                String formattedCpf = aluno.getCpf();
                if (formattedCpf.length() == 11) {
                    formattedCpf = formattedCpf.substring(0, 3) + "." + formattedCpf.substring(3, 6) + "." + 
                                   formattedCpf.substring(6, 9) + "-" + formattedCpf.substring(9);
                }
                table.addCell(new PdfPCell(new Phrase(formattedCpf, bodyFont)));
                
                table.addCell(new PdfPCell(new Phrase(aluno.getEmail() != null ? aluno.getEmail() : "N/A", bodyFont)));
                table.addCell(new PdfPCell(new Phrase(aluno.getTelefone() != null ? aluno.getTelefone() : "N/A", bodyFont)));
                table.addCell(new PdfPCell(new Phrase(aluno.getSerie() != null ? aluno.getSerie().getNome() : "", bodyFont)));
                table.addCell(new PdfPCell(new Phrase(aluno.getEscola() != null ? aluno.getEscola().getNome() : "", bodyFont)));
                table.addCell(new PdfPCell(new Phrase(aluno.getEscola() != null && aluno.getEscola().getMunicipio() != null ? 
                        aluno.getEscola().getMunicipio().getNome() : "", bodyFont)));
            }

            document.add(table);
            document.close();
            
            return out.toByteArray();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao gerar arquivo PDF: " + e.getMessage());
        }
    }
}
