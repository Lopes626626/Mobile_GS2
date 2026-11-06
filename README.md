# 🛡️ UrbiSafe - Plataforma de Inteligência de Riscos Urbanos

O **UrbiSafe** é uma plataforma *Full-Stack* (Mobile/Web + API) desenvolvida para o monitoramento, registro e priorização inteligente de riscos e desastres urbanos (como alagamentos, incêndios, vendavais, etc.). O sistema permite que cidadãos, sensores IoT e órgãos públicos reportem ocorrências, enquanto o backend calcula automaticamente a urgência de cada caso com base num algoritmo de inteligência de priorização.

---

## 🛠️ Tecnologias Utilizadas

### Backend (API RESTful)
* **Linguagem:** Java 17+
* **Framework:** Spring Boot
* **Banco de Dados:** H2 Database (Persistência em disco/memória)
* **Arquitetura:** MVC (Model, View/Controller, Service, Repository)
* **Segurança:** Configuração de CORS liberada para requisições externas

### Frontend (Mobile/Web)
* **Linguagem:** TypeScript
* **Framework:** React Native
* **Ferramenta de Build:** Expo (com suporte a Expo Web)
* **Requisições HTTP:** Axios
* **Design/UX:** Componentes nativos (Modal Bottom Sheet, Floating Action Button, Emojis nativos para ícones leves)

---

## 🧠 Inteligência de Priorização (Regra de Negócio)

O cálculo de prioridade **não é feito no aplicativo**, garantindo a segurança e centralização das regras no Backend (`RiskEventService.java`). Quando um risco é reportado com `priorityScore = 0`, o sistema executa o seguinte algoritmo (Máximo de 100 pontos):

1. **Peso Base do Risco:**
   - INCÊNDIO / DESLIZAMENTO: 85 pontos
   - VENDAVAL: 75 pontos
   - ALAGAMENTO: 60 pontos
   - FALTA DE ENERGIA: 50 pontos
   - ILHA DE CALOR: 40 pontos
   - POLUIÇÃO: 30 pontos

2. **Multiplicador de Confiança:**
   - A pontuação base é multiplicada pela porcentagem de confiança enviada pelo frontend (ex: 80% = 0.8).

3. **Bônus de Autoridade (Origem da Informação):**
   - DEFESA CIVIL: + 25 pontos
   - SENSOR IoT: + 15 pontos
   - BASE PÚBLICA: + 10 pontos
   - COMUNIDADE: + 5 pontos

*A lista devolvida para o frontend já vem ordenada automaticamente do caso mais crítico para o menos crítico (`listarAlertasPriorizados`).*

---

## 🚀 Como Executar o Projeto

### 1. Rodando o Backend (Spring Boot)

1. Abra a pasta do backend (ex: `backend_consultas`) na sua IDE (IntelliJ IDEA, Eclipse, etc.).
2. Aguarde o Maven carregar todas as dependências do `pom.xml`.
3. Localize a classe principal `BackendConsultasApplication.java`.
4. Clique no botão de **Run (Play verde)**.
5. O servidor iniciará na porta **8080**.

### 2. Acessando o Banco de Dados (H2 Console)

O projeto utiliza o banco de dados H2, que possui uma interface visual acessível pelo próprio navegador.

1. Com o backend rodando, abra o navegador e acesse:
   👉 **`http://localhost:8080/h2-console`**
2. Na tela de login que aparecer, preencha os dados exatamente conforme configurado no seu `application.properties`:
   - **Driver Class:** `org.h2.Driver`
   - **JDBC URL:** *(Depende da sua configuração, verifique o application.properties)*
     - Se estiver em memória: `jdbc:h2:mem:urbisafedb`
     - Se estiver gravando em arquivo na pasta data: `jdbc:h2:file:./data/urbisafedb`
   - **User Name:** `sa`
   - **Password:** *(deixe em branco)*
3. Clique no botão **Connect**.
4. No painel esquerdo, você verá a tabela `RISK_EVENT`. Clique nela e digite `SELECT * FROM RISK_EVENT;` no quadro de texto, depois clique em **Run** para ver os alertas registrados pelo aplicativo.

### 3. Rodando o Frontend (Expo Web / Mobile)

1. Abra um terminal e navegue até a pasta do frontend.
2. Instale as dependências (caso seja a primeira vez):
   ```bash
   npm install
   ```
3. Inicie o servidor do Expo:
   ```bash
   npx expo start
   ```
4. Pressione a tecla **`w`** no terminal para abrir o aplicativo no formato Web diretamente no seu navegador (rodará na porta **8081**).

*(Nota: Graças ao `@CrossOrigin(origins = "*")` no Controller do Java, a porta 8081 do frontend consegue se comunicar sem erros de bloqueio com a porta 8080 do backend).*

---

## 📂 Estrutura de Rotas da API (Endpoints)

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/events` | Cria um novo alerta de risco e calcula sua prioridade. |
| `GET` | `/api/events/alerts` | Retorna a lista de todos os alertas, ordenados do maior risco para o menor. |
| `DELETE`| `/api/events/{id}` | Deleta um alerta específico pelo seu ID. |
