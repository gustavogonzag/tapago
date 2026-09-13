# TaPago — desenho da primeira versão

## Objetivo

TaPago é uma SPA instalável, pensada primeiro para celular, para acompanhar um desafio pessoal de 15 dias de dieta e treino. O produto deve reduzir a dúvida sobre o que fazer hoje e tornar visível o avanço diário, sem métricas corporais, login ou funcionalidades sociais.

## Escopo

### Fluxos principais

- **Hoje:** tela inicial com o dia atual do desafio, progresso dos 15 dias e quatro check-ins grandes: dieta, musculação, caminhada e boxe.
- **Dieta:** refeições e itens configurados manualmente para o dia; cada item pode ser concluído individualmente e a dieta pode ser marcada como concluída.
- **Musculação:** exercícios do dia em ordem, cada um com imagem ilustrativa, instruções, séries, repetições e check-in individual. A conclusão de todos os exercícios conclui a musculação.
- **Caminhada:** um único check-in diário de cumprimento; não haverá meta numérica, sensores ou aplicativos de saúde nesta versão.
- **Boxe:** um único check-in diário de cumprimento, sem séries, exercícios ou imagens nesta versão.
- **Progresso:** grade de 15 dias que mostra o estado de dieta, musculação, caminhada e boxe em cada dia.
- **Configurar desafio:** criação, edição e reinício do único desafio ativo; cadastro manual de dias, refeições e exercícios. Ao criar um desafio, o app já preenche a rotina ABC e a repete continuamente pelos 15 dias, sem dias de descanso automáticos; tudo continua editável.
- **Referências:** PDFs anexados localmente ao desafio, somente para consulta. O app não extrairá nem gerará planos a partir deles.

### Fora do escopo

- Registro de peso, medidas, fotos de evolução ou calorias.
- Contas, autenticação, múltiplos usuários, sincronização entre aparelhos ou backend.
- Leitura automática de PDFs, recomendação de dieta/treino, vídeos ou integração com sensores e aplicativos de saúde.

## Experiência e interface

A experiência é mobile-first e deve funcionar confortavelmente com uma mão. A navegação inferior fixa terá acesso a Hoje, Dieta, Treino, Progresso e Configurar. A tela Hoje prioriza o que falta concluir, não estatísticas secundárias.

O estilo visual é fitness contemporâneo e direto: alto contraste, fundos grafite/escuros, tipografia forte, uma cor de energia para ações concluídas e controles grandes de toque. A versão desktop reaproveita a mesma interface responsiva sem introduzir um fluxo diferente.

O produto será uma PWA para instalação na tela inicial e abertura em modo de aplicativo.

## Arquitetura

- **Cliente:** React, TypeScript e Vite como SPA estática.
- **Estilos e componentes:** CSS responsivo e uma biblioteca pequena de componentes, escolhida na implementação, para acessibilidade e consistência.
- **Estado de domínio:** módulos separados para desafio, check-ins, anexos e backup. Componentes consomem interfaces de domínio, não detalhes de armazenamento.
- **Persistência:** IndexedDB, pois suporta os dados estruturados, imagens e PDFs locais. O app deve recuperar o estado ao recarregar e não requer rede no fluxo normal.
- **Deploy:** artefato estático adequado a Vercel ou Netlify; deploy automático via repositório quando houver acesso Git configurado.

## Modelo de dados

Existe somente um desafio ativo com data de início e exatamente 15 dias. Cada dia contém:

- lista de refeições, cada uma com itens marcáveis;
- musculação composta por exercícios ordenados;
- estados de conclusão para dieta, musculação, caminhada e boxe.

Cada exercício contém nome, instruções, séries e repetições opcionais, uma chave para uma ilustração do catálogo local e seu estado de conclusão. O catálogo traz ilustrações originais e genéricas de pessoa e aparelho, distribuídas junto com a PWA, para que funcionem offline e não dependam de URLs externas. PDFs são anexos locais associados ao desafio. O envio de fotos próprias não fará parte desta versão.

A rotina pré-preenchida usa três treinos: A (peitoral, deltoide e tríceps), B (dorsal, deltoide e bíceps) e C (inferiores, deltoide e trapézio), com exercícios, séries, repetições e observações fornecidos pelo usuário. Cada variação terá sua própria ilustração padronizada.

O progresso diário será derivado dos check-ins persistidos: não haverá uma segunda fonte de verdade para percentuais. Desmarcar uma etapa recalcula imediatamente o estado apresentado na tela Hoje e na grade de progresso.

## Comportamentos e erros

- O desafio só pode ser iniciado quando os 15 dias estiverem definidos; a interface aponta campos obrigatórios ausentes.
- Marcar ou desmarcar uma etapa salva a mudança imediatamente.
- Arquivo inválido, falha de leitura ou espaço de armazenamento insuficiente exibe uma mensagem clara, preservando os dados já salvos.
- O reinício exige confirmação explícita e cria um estado limpo para o desafio; não há exclusão silenciosa.
- O app disponibiliza exportação de backup JSON e importação validada desse backup. A interface avisa que os dados são locais e podem ser perdidos se o armazenamento do navegador for apagado.

## Verificação

Testes automatizados devem cobrir regras de domínio: cálculo de progresso, conclusão e reversão de check-ins, estrutura obrigatória de 15 dias e validação de backup. Testes de interface devem validar persistência após recarga, importação/exportação e os fluxos de Hoje, Dieta e Treino.

Antes da entrega, a aplicação será verificada em viewport de celular: navegação inferior, controles de toque, estados vazios, mensagens de erro e instalação/carregamento da PWA. O build de produção também deve concluir sem erros.

## Decisões assumidas

- O uso é individual e, por enquanto, em um dispositivo; não haverá sincronização em nuvem.
- Dieta e treino são configurados manualmente; PDFs são referências, não entradas estruturadas.
- As imagens são ilustrações locais de execução ou aparelho, escolhidas de um catálogo; vídeos e envio de fotos próprias não fazem parte da primeira versão.
