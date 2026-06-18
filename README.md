# Sisaluno - SEDUC Tocantins

Sistema completo para gerenciamento, tratamento (ETL) e visualização de dados de alunos do Ensino Médio das escolas públicas do Estado do Tocantins (SEDUC-TO).

O sistema processa arquivos brutos nos formatos **JSON** e scripts **SQL**, executando etapas de limpeza, padronização geográfica e validação matemática de documentos. Os dados são expostos em APIs protegidas por tokens JWT e apresentados em um painel interativo (BI Dashboard) com insights automáticos gerados localmente por um motor estatístico.

---

## 🛠️ Tecnologias Utilizadas

### Backend
* **Java 21/25** com **Spring Boot 3.4.0**
* **Spring Data JPA** & **Hibernate**
* **Spring Security** com autenticação **JWT**
* **PostgreSQL** (Banco principal) & **H2 Database** (Fallback em memória)
* **Apache POI** (Geração de Excel) & **OpenPDF** (Geração de PDFs)
* **Swagger/OpenAPI 3.0** (Documentação da API)
* **Maven** (Gerenciador de Dependências)

### Frontend
* **React 19** com **TypeScript** e **Vite**
* **Material UI 6** (Design corporativo responsivo)
* **React Query 5** (Gerenciamento de cache e requisições assíncronas)
* **Axios** (Cliente HTTP)
* **Recharts 2** (Visualização interativa de gráficos)
* **Lucide React** (Ícones modernos)
* **Canvas Confetti** (Efeitos visuais de sucesso)

### Infraestrutura
* **Docker** & **Docker Compose**
* **Nginx** (Servidor web reverso para o frontend)

---

## 📁 Estrutura do Projeto

```text
project/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/br/gov/to/seduc/sisaluno/
│   │   │   │   ├── config/          # Inicialização e Segurança
│   │   │   │   ├── controller/      # Endpoints REST
│   │   │   │   ├── dto/             # Objetos de Transferência (Payloads)
│   │   │   │   ├── entity/          # Entidades JPA (Modelos do Banco)
│   │   │   │   ├── exception/       # Tratador Global de Erros (ControllerAdvice)
│   │   │   │   ├── mapper/          # Mapeamento Entidade <-> DTO
│   │   │   │   ├── repository/      # Interfaces JPA Data Repositories
│   │   │   │   ├── security/        # Filtros JWT e UserDetails
│   │   │   │   ├── service/         # Regras de Negócio, Relatórios e ETL
│   │   │   │   └── util/            # Utilitários ETL (Validadores de CPF)
│   │   │   └── resources/
│   │   │       └── application.yml  # Configurações do Spring Boot
│   │   └── test/                    # Testes Unitários de ETL e Contexto
│   ├── Dockerfile
│   └── pom.xml                      # Descritor Maven
├── frontend/
│   ├── src/
│   │   ├── components/              # Elementos reutilizáveis (Layout, Sidebar, Header)
│   │   ├── context/                 # Provedores de Tema e Autenticação JWT
│   │   ├── hooks/                   # Custom Hooks
│   │   ├── pages/                   # Telas (Login, Dashboard BI, Lista de Alunos, ETL)
│   │   ├── services/                # Configuração do Axios
│   │   ├── App.tsx                  # Roteamento e Inicialização de Contextos
│   │   ├── index.css                # Estilos globais e scrollbar
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf                   # Configuração Nginx proxy reverso
│   └── package.json
├── test-data/                       # Arquivos mock para teste de importação ETL
│   ├── alunos_teste.json
│   └── alunos_teste.sql
└── docker-compose.yml               # Orquestrador de Containers
```

---

## 🚀 Como Executar o Projeto

Você pode rodar o sistema de duas formas: usando **Docker Compose** (recomendado para simular a produção) ou rodando as aplicações **localmente em modo de desenvolvimento**.

### Opção 1: Via Docker Compose (Completo)

Certifique-se de que o Docker está instalado e em execução no seu computador. No diretório raiz do projeto, execute:

```bash
docker-compose up --build -d
```

Este comando irá compilar e subir:
1. O banco PostgreSQL na porta `5432`.
2. O backend Spring Boot na porta `8080`.
3. O frontend React com Nginx na porta `80`.

Para acessar a interface, abra seu navegador em: **`http://localhost`**

---

### Opção 2: Execução Local (Modo Desenvolvimento)

#### 1. Preparar o Banco de Dados
Por padrão, o backend busca um banco PostgreSQL rodando em `localhost:5432` com a senha `admin_password`. 
Caso não queira rodar o PostgreSQL, o backend possui um **perfil de fallback com banco em memória H2** que roda sem nenhuma dependência! 

#### 2. Executar o Backend
No diretório `backend/`, inicie a aplicação com o Maven Wrapper:

* **Para rodar com Banco em Memória H2 (Recomendado para testes rápidos):**
  ```powershell
  .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev-h2
  ```
* **Para rodar com PostgreSQL local:**
  ```powershell
  .\mvnw.cmd spring-boot:run
  ```

O backend estará ativo em `http://localhost:8080`.
Você pode acessar a documentação OpenAPI/Swagger interativa em: **`http://localhost:8080/swagger-ui.html`**
O console do banco H2 estará acessível em `http://localhost:8080/h2-console` (login: `jdbc:h2:mem:seduc_db`, user: `sa`, pass: `password`).

#### 3. Executar o Frontend
No diretório `frontend/`, instale os pacotes e inicie o servidor Vite:

```powershell
npm install
npm run dev
```

O frontend estará ativo em: **`http://localhost:5173`**

---

## 🔑 Credenciais para Acesso Rápido

Durante a inicialização, o banco de dados é automaticamente populado com 3 usuários contendo perfis de permissão distintos. Na tela de login, há botões de atalho que preenchem as credenciais instantaneamente:

| Username | Password | Nome | Perfil / Permissões |
| :--- | :--- | :--- | :--- |
| **`admin`** | `admin` | Administrador SEDUC | **ADMIN:** Acesso total (CRUD completo, upload de dados, exclusão, relatórios e BI) |
| **`operator`** | `operator` | Operador ETL | **OPERATOR:** Acesso a edição, visualização e upload. *Não pode excluir alunos.* |
| **`viewer`** | `viewer` | Visualizador Consulta | **VIEWER:** Apenas visualização do painel e tabela. *Não pode editar, excluir ou fazer uploads.* |

---

## 📊 Processo de ETL (Etapas e Limpezas)

O motor ETL implementado no `UploadService` lê o arquivo enviado e executa:
1. **Nome do Aluno:** Remove espaços extras em branco nas extremidades e no meio, aplicando a formatação **Title Case** (ex: ` joão   DA  silva ` vira `João da Silva`, respeitando preposições minúsculas).
2. **Validação de CPF:** Limpa caracteres não numéricos e valida os dígitos verificadores pelo algoritmo oficial da Receita Federal. Registros com CPFs matematicamente inválidos são descartados e logged no painel de inconsistências.
3. **Validação de E-mail:** Valida o formato por expressão regular.
4. **Data de Nascimento/Idade:** Aceita múltiplos formatos de data (`dd/MM/yyyy`, `yyyy-MM-dd`). Se a data não for enviada, calcula o ano de nascimento aproximado baseado na idade informada.
5. **Município / Escola:** Normaliza a escrita. Se a escola ou município não existirem na base de lookups, o sistema os cria automaticamente em tempo de execução.
6. **Deduplicação / Upsert:** Se um CPF já existe no banco de dados, o sistema atualiza o cadastro com a versão mais recente enviada (upsert). Se houver duplicidade dentro do próprio arquivo de upload, os dados anteriores da fila são atualizados sem disparar falhas no banco.
