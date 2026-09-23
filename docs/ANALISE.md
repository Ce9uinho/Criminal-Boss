# Criminal Boss — Análise de design e revisão técnica

Idle/incremental game para mobile (Expo / React Native) ao estilo Melvor Idle, com tema de crime organizado.
Cinco skills de produção (Smuggling, Thieving, Drug Factory, Distillery, Investigation Lab), banco com
slots, loja, ferramentas por skill, mastery, conquistas e um modo de combate por dungeons.

## 1. Estado encontrado

### Bloqueadores (o jogo não arrancava)

| Problema | Impacto | Correção |
|---|---|---|
| `package.json` fixava React 18.2 com Expo SDK 53 / RN 0.79 (que exigem React 19) | Crash imediato: `React.use is not a function` | Dependências alinhadas com o SDK 53 |
| `XpToasts.tsx` declarava `Animated` duas vezes | Bundle falhava a compilar | Componente reescrito |
| `ResourceImage.tsx` era uma cópia do `MasteryPerksModal` | Banco e cartões de skill rebentavam (`ResourceImage` inexistente) | Componente real criado (imagem ou emoji) |
| `lib/trpc.ts` importava um caminho inexistente e lançava erro sem `EXPO_PUBLIC_RORK_API_BASE_URL` | Crash no arranque | Caminho corrigido, provider não usado removido do layout |
| `assets/images/*` referenciados no `app.json` não existiam | Builds nativos falhavam | Ícone, adaptive icon, splash e favicon gerados |

### Bugs de lógica

1. **Inventário com duas fontes de verdade.** `bank` (mapa) e `bankItems` (slots) eram atualizados à mão
   em dezenas de sítios e desalinhavam-se. Num jogo novo `bank` estava vazio: a loja mostrava "In Bank: 0"
   e não era possível produzir com os materiais iniciais. **Agora `bank` é sempre derivado de `bankItems`**
   num único ponto da store.
2. **Comprar ferramentas apagava itens**: o código cortava o banco para 30 slots, destruindo tudo o que
   estivesse em slots comprados. Unificado num `acquireTool` sem corte.
3. **Atividades não retomavam após reabrir a app**: o save guardava `isActive: true` mas os timers morriam;
   a skill ficava "ativa" sem produzir. Agora a atividade é retomada com a definição real.
4. **Progresso offline explorável**: produzia itens sem consumir inputs, ignorava falhas e ferramentas.
   Reescrito: limitado por materiais, taxa de falha, ferramentas, mastery e agentes, limite de 12h.
5. **Falhas davam 110% de XP** em produção (10% da falha + 100% a seguir).
6. **Thieving auto-resume**: trocar de alvo apagava o alvo atual (nunca recomeçava após ser apanhado), e
   iniciar outra skill durante o cooldown fazia o thieving "roubar" o lugar dela quando o cooldown acabava.
7. **Bónus de raridade das ferramentas de smuggling anulado** por `Math.floor` nos pesos.
8. **Barras de progresso dessincronizadas** do timer real (ignoravam o bónus de velocidade das ferramentas).
9. **Combate em background** tinha dungeons duplicados, não dava dinheiro ao limpar e parava após uma volta
   (o combate em primeiro plano dava dinheiro e repetia). Dados partilhados em `constants/combat.ts`.
10. **Load com `gold || 1000`**: um jogador com $0 recebia $1000 ao reabrir.
11. **Banco cheio** incrementava o mapa mas não os slots (itens fantasma).
12. **Conquistas por skill nunca progrediam** (`perSkill: {}` fixo). Adicionados contadores persistentes
    (produção, roubos, raros) e cálculo real de ferramentas/mastery.
13. **Perfil com números inventados** ("Play Time" derivado do XP, conquistas "/20" falsas).
14. **Settings placebo**: toggles sem efeito, Export/Import/Reset só faziam `console.log`, e um cheat
    "Max All Skills" visível em produção.
15. **Menu com entradas mortas** (Wiki, Statistics, Help).

## 2. Direção visual

**Conceito: "noir" de gangster** — fundos quase pretos com subtom quente, dourado/latão para dinheiro e
prestígio, carmim para perigo, esmeralda para XP e lucro. Substitui o azul/verde genérico de template.

- Tokens centralizados em `constants/theme.ts` (cores, raios, espaçamentos) e **cor por skill**
  ("distritos" do império): Smuggling azul-céu, Thieving rosa-carmim, Drug Factory violeta,
  Distillery âmbar, Lab turquesa.
- **Navegação em baixo** (estava no topo com estilo de barra inferior) com rótulos temáticos:
  Empire, Stash, Turf War, Market; indicador de atividade a decorrer.
- **Header** com wordmark "CRIMINAL **BOSS**", nível do jogador e chip de dinheiro que "pulsa" ao ganhar.
- **Cabeçalho de skill** com a cor do distrito, estado vivo ("● Docks" a pulsar / "Idle"), barra de XP e
  medidor de Heat com estados COOL / WARM / HOT / WANTED.
- Cartões bloqueados discretos (tracejado + "Unlocks at Lv X") em vez de bordas vermelhas agressivas.
- Overlay de "Busted" sóbrio em vez de um bloco vermelho chapado.
- Equipamento em grelha 3×5 ("paper doll") que já não transborda o ecrã.
- Ícone da app: chapéu fedora dourado + monograma "CB".

## 3. Game feel / retenção

- **Notificações** de level-up, agente recrutado, banco cheio, falta de materiais e compras.
  Antes, falhas eram silenciosas (`console.log`).
- **"While you were away"**: resumo ao voltar (tempo, jobs, XP, níveis, dinheiro, itens ganhos e gastos).
  É o momento de maior satisfação num idle game e não existia.
- **Kit inicial equipado** num jogo novo: a primeira luta em Turf War é vencível sem passar pelo banco.
- **Save ao sair** (background / fechar separador), além do autosave de 30s.
- **How to play** no menu com o loop principal explicado.

## 4. Recomendações seguintes (não implementadas)

- **Economia**: ferramentas de nível 1 pedem 150 cigarros artesanais — com 20% de falha e 30 papéis
  iniciais, o primeiro upgrade demora demasiado. Sugiro rever custos do tier 1 ou dar mais materiais iniciais.
- **Combate**: só 2 dungeons e loot bags só com equipamento inicial; falta um nível de combate e progressão
  de gear. É a área com menos conteúdo.
- **Monetização**: "Premium" simula compras com dinheiro real e anúncios sem SDK. Antes de publicar é preciso
  integrar IAP/ads reais ou remover a secção.
- **Tabs do banco** guardam índices de slots; como o banco é compactado ao vender/consumir, os itens podem
  mudar de tab. Guardar `resourceId` nas tabs resolveria.
- **Performance**: vários componentes usam `useGameStore()` sem seletor e re-renderizam a cada tick.
  Passar a seletores reduziria trabalho em dispositivos fracos.
- **Testes**: não há testes; a store (economia, offline, inventário) é a primeira candidata.
