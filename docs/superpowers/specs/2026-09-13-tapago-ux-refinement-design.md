# TaPago — refinamento de UX e interface

## Objetivo

Refinar a experiência do TaPago para que seja minimalista, clara e confiável no celular, com uma gamificação discreta baseada em avanço visível e conclusão do dia. A interface deve orientar a próxima ação sem esconder a visão geral do desafio de 15 dias.

## Princípios

- Uma tela, uma prioridade: a aba Hoje destaca somente a próxima pendência útil.
- O check-in é rápido: todos os controles primários têm área mínima de toque de 44px.
- Progresso é compreensível sem explicação: dia atual, avanço diário e avanço dos 15 dias estão sempre legíveis.
- Gamificação sem ruído: não haverá pontos, ranking, moedas ou medalhas; a recompensa é o fechamento visual do dia.
- O conteúdo prevalece: imagens de exercícios são grandes, visíveis diretamente no card e não exigem ampliação.

## Estrutura das telas

### Hoje

- Cabeçalho: `Dia N de 15`, contexto do desafio e progresso diário em formato `N de 5` com barra.
- Próxima ação: card único com a primeira tarefa pendente, texto objetivo e botão de ação. A ordem é Café, Almoço, Janta, Musculação, Caminhada, Boxe e Água, agrupando as três refeições como a área Dieta.
- Hábitos: lista de cinco áreas — Dieta, Musculação ABC, Caminhada, Boxe e Meta de água. A área Dieta mostra seu avanço interno (por exemplo, `2 de 3 refeições`) sem ocupar três cards iguais.
- Dia concluído: quando as cinco áreas forem concluídas, substitui a próxima ação por uma confirmação discreta, mantém os itens acessíveis e mostra o próximo dia do desafio.

### Treino

- Cabeçalho: identificador A/B/C, grupo muscular, quantidade de exercícios concluídos e barra de progresso curta.
- Exercício: card vertical com título, imagem 4:5, prescrição e check no rodapé. Observações aparecem abaixo da prescrição.
- O card concluído permanece legível, com uma mudança de tom e ícone de conclusão; não some nem reduz a área de toque.

### Progresso

- Cabeçalho com progresso do desafio em dias concluídos.
- Grade de 15 dias; o dia atual recebe destaque e cada dia exibe um indicador compacto de 0–5 áreas concluídas.
- Uma legenda curta explica as cinco áreas sem depender apenas de cor.

### Ajustes e estados

- Ajustes contém reinício protegido por confirmação e explicação clara da rotina ABC.
- Desafio inexistente oferece uma única ação para iniciar a rotina pré-preenchida.
- Estados de carregamento, erro de persistência, dia fora do desafio, exercício sem imagem e treino sem exercícios exibem conteúdo orientativo, nunca tela vazia.

## Arquitetura de interface

`App.tsx` passa a ser apenas o shell de estado e rotas locais. As telas e componentes são separados por responsabilidade:

- `pages/TodayPage.tsx`: próxima ação, resumo e hábitos.
- `pages/WorkoutPage.tsx`: cabeçalho e lista de exercícios do dia.
- `pages/ProgressPage.tsx`: resumo do desafio e grade de 15 dias.
- `pages/SettingsPage.tsx`: início e reinício do desafio.
- `components/DailyHabitCard.tsx`: área diária e seu estado.
- `components/NextActionCard.tsx`: única ação prioritária.
- `components/WorkoutExerciseCard.tsx`: cartão vertical de exercício.
- `components/ProgressBar.tsx`, `components/ProgressGrid.tsx`, `components/BottomNavigation.tsx`: elementos visuais reutilizáveis.

O estado de domínio continua em `domain/challenge.ts`; as páginas recebem `Challenge`, dia atual e callbacks de atualização. Persistência IndexedDB continua isolada no repositório.

## Interações e erros

- Check-ins atualizam a interface imediatamente, persistem em seguida e exibem confirmação breve não intrusiva.
- Falhas de persistência mantêm o estado visível e apresentam alerta com ação para tentar novamente.
- Imagem não encontrada usa uma ilustração local de fallback com texto alternativo correto.
- Ações de reinício permanecem bloqueadas atrás de confirmação explícita.
- Navegação inferior usa `aria-current="page"` na aba ativa; botões têm rótulos descritivos.

## Responsividade e estilo

- Mobile é a referência: espaçamento de 16–20px, cartões de largura integral e barra inferior fixa respeitando área segura.
- Em 900px ou mais, o conteúdo usa duas colunas onde houver benefício, navegação muda para o topo e cards preservam leitura vertical.
- Paleta grafite e verde/teal existente permanece; tons e contraste são definidos como tokens CSS em vez de valores espalhados.
- Animações de conclusão são sutis, duram no máximo 200ms e respeitam `prefers-reduced-motion`.

## Verificação

- Testes de domínio para avanço de dieta e cinco áreas diárias permanecem verdes.
- Testes de interface para próxima ação, conclusão diária, estado ativo da navegação, conclusão de exercício e erro de salvamento.
- Build de produção e PWA devem concluir sem erro.
- Revisão visual obrigatória em 390px, 768px e 1440px, incluindo tela Hoje, Treino, Progresso e estado concluído.
