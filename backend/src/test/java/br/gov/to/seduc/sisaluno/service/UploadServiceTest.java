package br.gov.to.seduc.sisaluno.service;

import br.gov.to.seduc.sisaluno.dto.UploadResponseDto;
import br.gov.to.seduc.sisaluno.entity.Aluno;
import br.gov.to.seduc.sisaluno.entity.UploadLog;
import br.gov.to.seduc.sisaluno.repository.AlunoRepository;
import br.gov.to.seduc.sisaluno.repository.UploadLogRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev-h2")
@Transactional
public class UploadServiceTest {

    @Autowired
    private UploadService uploadService;

    @Autowired
    private AlunoRepository alunoRepository;

    @Autowired
    private UploadLogRepository uploadLogRepository;

    @Test
    public void testProcessXmlSuccess() {
        String xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                "<alunos>\n" +
                "  <aluno>\n" +
                "    <nome>Juliana da Costa Souza</nome>\n" +
                "    <cpf>12345678909</cpf>\n" +
                "    <escola>CEM Palmas</escola>\n" +
                "    <municipio>Palmas</municipio>\n" +
                "    <serie>2º Ano</serie>\n" +
                "    <idade>16</idade>\n" +
                "    <sexo>F</sexo>\n" +
                "    <email>juliana.costa@gmail.com</email>\n" +
                "  </aluno>\n" +
                "  <aluno>\n" +
                "    <nome>MARCELO RODRIGUES ALMEIDA</nome>\n" +
                "    <cpf>52998224725</cpf>\n" +
                "    <escola>Colégio Estadual de Araguaína</escola>\n" +
                "    <municipio>Araguaína</municipio>\n" +
                "    <serie>3º Ano</serie>\n" +
                "    <idade>18</idade>\n" +
                "    <sexo>M</sexo>\n" +
                "    <email>marcelo.rodrigues@escola.to.gov.br</email>\n" +
                "    <telefone>(63) 99111-3333</telefone>\n" +
                "  </aluno>\n" +
                "</alunos>";

        ByteArrayInputStream inputStream = new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8));
        UploadResponseDto response = uploadService.processXml(inputStream, "test-user");

        assertNotNull(response);
        assertEquals("SUCESSO", response.getStatus());
        assertEquals(2, response.getRegistrosProcessados());
        assertNull(response.getLogErros());

        // Verifica persistência dos alunos
        Optional<Aluno> aluno1 = alunoRepository.findByCpf("12345678909");
        assertTrue(aluno1.isPresent());
        assertEquals("Juliana da Costa Souza", aluno1.get().getNome());
        assertEquals("CEM Palmas", aluno1.get().getEscola().getNome());
        assertEquals("Palmas", aluno1.get().getEscola().getMunicipio().getNome());
        assertEquals("2º Ano", aluno1.get().getSerie().getNome());

        Optional<Aluno> aluno2 = alunoRepository.findByCpf("52998224725");
        assertTrue(aluno2.isPresent());
        assertEquals("Marcelo Rodrigues Almeida", aluno2.get().getNome()); // Title Case

        // Verifica registro de auditoria
        List<UploadLog> logs = uploadLogRepository.findAllByOrderByDataHoraDesc();
        assertFalse(logs.isEmpty());
        UploadLog log = logs.stream().filter(l -> "XML".equals(l.getTipoArquivo())).findFirst().orElse(null);
        assertNotNull(log);
        assertEquals("test-user", log.getUsuario());
        assertEquals(2, log.getRegistrosProcessados());
        assertEquals("SUCESSO", log.getStatus());
    }

    @Test
    public void testProcessXmlPartialErrors() {
        // Primeiro registro tem CPF inválido, segundo é válido
        String xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                "<alunos>\n" +
                "  <aluno>\n" +
                "    <nome>Invalid Cpf Aluno</nome>\n" +
                "    <cpf>99999999999</cpf>\n" +
                "    <escola>CEM Palmas</escola>\n" +
                "    <municipio>Palmas</municipio>\n" +
                "    <serie>2º Ano</serie>\n" +
                "    <idade>16</idade>\n" +
                "  </aluno>\n" +
                "  <aluno>\n" +
                "    <nome>Valid Aluno</nome>\n" +
                "    <cpf>52998224725</cpf>\n" +
                "    <escola>Colégio Estadual de Palmas</escola>\n" +
                "    <municipio>Palmas</municipio>\n" +
                "    <serie>1º Ano</serie>\n" +
                "    <idade>15</idade>\n" +
                "  </aluno>\n" +
                "</alunos>";

        ByteArrayInputStream inputStream = new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8));
        UploadResponseDto response = uploadService.processXml(inputStream, "test-user");

        assertNotNull(response);
        assertEquals("PARCIAL", response.getStatus());
        assertEquals(1, response.getRegistrosProcessados());
        assertNotNull(response.getLogErros());
        assertTrue(response.getLogErros().contains("CPF inválido"));

        // Verifica que o aluno válido foi inserido
        Optional<Aluno> validAluno = alunoRepository.findByCpf("52998224725");
        assertTrue(validAluno.isPresent());

        // Verifica que o aluno inválido NÃO foi inserido
        Optional<Aluno> invalidAluno = alunoRepository.findByCpf("99999999999");
        assertTrue(invalidAluno.isEmpty());
    }

    @Test
    public void testProcessXlsxSuccess() throws Exception {
        org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook();
        org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("Alunos");
        
        // Header
        org.apache.poi.ss.usermodel.Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Nome Completo");
        header.createCell(1).setCellValue("CPF");
        header.createCell(2).setCellValue("Escola Estadual");
        header.createCell(3).setCellValue("Cidade");
        header.createCell(4).setCellValue("Série");
        header.createCell(5).setCellValue("Idade");
        header.createCell(6).setCellValue("Sexo");
        header.createCell(7).setCellValue("Email");
        
        // Row 1
        org.apache.poi.ss.usermodel.Row row1 = sheet.createRow(1);
        row1.createCell(0).setCellValue("Juliana da Costa Souza");
        row1.createCell(1).setCellValue("12345678909");
        row1.createCell(2).setCellValue("CEM Palmas");
        row1.createCell(3).setCellValue("Palmas");
        row1.createCell(4).setCellValue("2º Ano");
        row1.createCell(5).setCellValue(16);
        row1.createCell(6).setCellValue("F");
        row1.createCell(7).setCellValue("juliana.costa@gmail.com");

        // Row 2
        org.apache.poi.ss.usermodel.Row row2 = sheet.createRow(2);
        row2.createCell(0).setCellValue("MARCELO RODRIGUES ALMEIDA");
        row2.createCell(1).setCellValue("52998224725");
        row2.createCell(2).setCellValue("Colégio Estadual de Araguaína");
        row2.createCell(3).setCellValue("Araguaína");
        row2.createCell(4).setCellValue("3º Ano");
        row2.createCell(5).setCellValue(18);
        row2.createCell(6).setCellValue("M");
        row2.createCell(7).setCellValue("marcelo.rodrigues@escola.to.gov.br");

        java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();

        ByteArrayInputStream inputStream = new ByteArrayInputStream(out.toByteArray());
        UploadResponseDto response = uploadService.processXlsx(inputStream, "test-user");

        assertNotNull(response);
        assertEquals("SUCESSO", response.getStatus(), "Log: " + response.getLogErros() + " Msg: " + response.getMensagem());
        assertEquals(2, response.getRegistrosProcessados());
        assertNull(response.getLogErros());

        // Verify database persistence
        Optional<Aluno> aluno1 = alunoRepository.findByCpf("12345678909");
        assertTrue(aluno1.isPresent());
        assertEquals("Juliana da Costa Souza", aluno1.get().getNome());

        Optional<Aluno> aluno2 = alunoRepository.findByCpf("52998224725");
        assertTrue(aluno2.isPresent());
        assertEquals("Marcelo Rodrigues Almeida", aluno2.get().getNome());
    }
}
