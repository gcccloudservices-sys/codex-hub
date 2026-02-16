
# Auto-Agent Workflow v2 Pro (MoE Architecture) 🚀

Uma aplicação web de ponta que implementa uma arquitetura de **Mixture of Experts (MoE)** e um motor de execução paralela. O sistema orquestra enxames de agentes de IA através da **API de Inferência do GitHub**, decompondo objetivos complexos e roteando-os dinamicamente para especialistas otimizados (Code, Architect, Vision, Creative).

## 🧠 Arquitetura MoE (Mixture of Experts)

Diferente de sistemas lineares tradicionais, o Auto-Agent v2 implementa um **Gating Network (Router)** no frontend:

1.  **Analyst Expert**: Roteado para tarefas de validação e QA (Temperatura baixa).
2.  **Coder Expert**: Roteado para implementação de software (Quase determinístico).
3.  **Creative Expert**: Roteado para marketing e copywriting (Alta entropia).
4.  **Architect Expert**: Roteado para planejamento estrutural (Alto raciocínio).
5.  **Vision Expert**: Ativado automaticamente para análise multimodal de imagens/PDFs (limitado a extração de texto).

## ⚡ Motor de Paralelismo

O **Reactive Scheduler** substitui a execução sequencial por uma fila de eventos não-bloqueante:

- **Execução Concorrente**: Processa múltiplos nodos simultaneamente, respeitando dependências.
- **Dynamic Context Window**: Trunca e resume contextos longos automaticamente para manter a eficiência.
- **Pre-fetching de Dependências**: Prepara o contexto de tarefas filhas assim que as pais são resolvidas.

## 🌟 Principais Funcionalidades

- **Orquestração Autônoma**: Um agente "Planner" desenha a topologia do grafo.
- **Multimodalidade (Texto)**: Arraste imagens ou PDFs e o sistema tentará extrair dados textuais.
- **Visualização de Grafo Neural**: Mapa mental interativo renderizado em tempo real.
- **Monitoramento de Sistema**: Terminal de logs estilo CRT e dashboard de performance.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19 + TypeScript + Tailwind CSS.
- **IA Core**: GitHub Inference API (via `fetch`).
- **Architecture**: MoE Routing + Event-Driven Scheduler.
- **Visualização**: SVG Dinâmico.

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js (v20 ou superior)
- NPM ou Yarn

### Passo a Passo

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/auto-agent-v2-pro.git
   cd auto-agent-v2-pro
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**:
   Crie um arquivo `.env` na raiz do projeto e adicione sua chave da API (GitHub PAT):
   ```env
   VITE_API_KEY=SUA_CHAVE_AQUI
   ```

4. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   A aplicação estará disponível em `http://localhost:5173`.

## 🤖 Agentes Especialistas (MoE Profiles)

| Perfil Expert | Foco |
| :--- | :--- |
| **ARCHITECT** | Estrutura, Design Patterns, Segurança. |
| **CODER** | Sintaxe estrita, Clean Code, Lógica. |
| **CREATIVE** | Storytelling, Ideação, UX Writing. |
| **ANALYST** | Dados, Validação, Edge Cases. |
| **VISION** | OCR, Análise Espacial, Extração Visual. |

## 🛡️ Segurança e Privacidade

- **BYOK (Bring Your Own Key)**: Suas chaves de API são armazenadas apenas localmente.
- **Processamento Stateless**: O conteúdo é processado em tempo de execução e não persiste em servidores externos.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
