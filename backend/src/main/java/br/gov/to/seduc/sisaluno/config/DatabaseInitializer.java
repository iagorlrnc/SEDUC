package br.gov.to.seduc.sisaluno.config;

import br.gov.to.seduc.sisaluno.entity.*;
import br.gov.to.seduc.sisaluno.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MunicipioRepository municipioRepository;

    @Autowired
    private SerieRepository serieRepository;

    @Autowired
    private EscolaRepository colaRepository; // 'colaRepository' is autowired from EscolaRepository

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${default.admin.password:admin}")
    private String defaultAdminPassword;

    @Value("${default.operator.password:operator}")
    private String defaultOperatorPassword;

    @Value("${default.viewer.password:viewer}")
    private String defaultViewerPassword;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Verificando necessidade de inicialização do banco de dados...");

        // 1. Inicializar Usuários Padrão
        if (usuarioRepository.count() == 0) {
            logger.info("Criando usuários de demonstração padrão...");

            Usuario admin = Usuario.builder()
                    .username("admin")
                    .email("admin@seduc.to.gov.br")
                    .password(passwordEncoder.encode(defaultAdminPassword))
                    .nome("Administrador SEDUC")
                    .role(Role.ADMIN)
                    .approved(true)
                    .build();

            Usuario operator = Usuario.builder()
                    .username("operator")
                    .email("operator@seduc.to.gov.br")
                    .password(passwordEncoder.encode(defaultOperatorPassword))
                    .nome("Operador ETL")
                    .role(Role.OPERATOR)
                    .approved(true)
                    .build();

            Usuario viewer = Usuario.builder()
                    .username("viewer")
                    .email("viewer@seduc.to.gov.br")
                    .password(passwordEncoder.encode(defaultViewerPassword))
                    .nome("Visualizador Consulta")
                    .role(Role.VIEWER)
                    .approved(true)
                    .build();

            usuarioRepository.saveAll(Arrays.asList(admin, operator, viewer));
            logger.info("Usuários padrão criados (admin/admin, operator/operator, viewer/viewer).");
        }

        // 2. Inicializar Séries (Ensino Médio)
        if (serieRepository.count() == 0) {
            logger.info("Criando séries do Ensino Médio...");
            List<Serie> series = Arrays.asList(
                    new Serie(null, "1º Ano"),
                    new Serie(null, "2º Ano"),
                    new Serie(null, "3º Ano")
            );
            serieRepository.saveAll(series);
            logger.info("Séries inicializadas.");
        }

        // 3. Inicializar Municípios do Tocantins
        if (municipioRepository.count() == 0) {
            logger.info("Criando municípios de referência do Tocantins...");
            List<Municipio> municipios = Arrays.asList(
                    new Municipio(null, "Palmas", "Central"),
                    new Municipio(null, "Araguaína", "Norte"),
                    new Municipio(null, "Gurupi", "Sul"),
                    new Municipio(null, "Porto Nacional", "Central"),
                    new Municipio(null, "Paraíso do Tocantins", "Central"),
                    new Municipio(null, "Araguatins", "Norte"),
                    new Municipio(null, "Guaraí", "Norte"),
                    new Municipio(null, "Dianópolis", "Sudeste"),
                    new Municipio(null, "Tocantinópolis", "Norte"),
                    new Municipio(null, "Colinas do Tocantins", "Norte")
            );
            municipioRepository.saveAll(municipios);
            logger.info("Municípios inicializados.");
        }

        // 4. Inicializar Escolas de Referência
        if (colaRepository.count() == 0) {
            logger.info("Criando escolas públicas estaduais de referência...");

            Municipio palmas = municipioRepository.findByNomeIgnoreCase("Palmas").orElse(null);
            Municipio araguaina = municipioRepository.findByNomeIgnoreCase("Araguaína").orElse(null);
            Municipio gurupi = municipioRepository.findByNomeIgnoreCase("Gurupi").orElse(null);
            Municipio porto = municipioRepository.findByNomeIgnoreCase("Porto Nacional").orElse(null);

            if (palmas != null) {
                colaRepository.save(new Escola(null, "CEM Palmas", "17001001", palmas, "ESTADUAL"));
                colaRepository.save(new Escola(null, "Colégio Estadual de Palmas", "17001002", palmas, "ESTADUAL"));
            }
            if (araguaina != null) {
                colaRepository.save(new Escola(null, "Colégio Estadual de Araguaína", "17002001", araguaina, "ESTADUAL"));
            }
            if (gurupi != null) {
                colaRepository.save(new Escola(null, "Centro de Ensino Médio de Gurupi", "17003001", gurupi, "ESTADUAL"));
            }
            if (porto != null) {
                colaRepository.save(new Escola(null, "Colégio Estadual Professor Florencio Aires", "17004001", porto, "ESTADUAL"));
            }

            logger.info("Escolas padrão inicializadas.");
        }

        logger.info("Inicialização do banco de dados concluída.");
    }
}
