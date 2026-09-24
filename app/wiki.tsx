import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react-native';
import {
  ACTIVITIES, AGENTS, EQUIPMENT_CATALOG, RESOURCES, SMUGGLING_ZONES, SKILL_DESCRIPTIONS, STORE_ITEMS,
  getSmugglingXp, getXpForLevel,
} from '@/constants/gameData';
import { COMBAT_DUNGEONS, BASE_PLAYER_STATS, LOOT_BAG_GOLD, LOOT_BAG_TABLE, getDungeonGoldReward } from '@/constants/combat';
import { BOSS_RANKS, DAILY_REWARDS } from '@/constants/progression';
import { ACHIEVEMENTS, TIER_POINTS } from '@/constants/achievements';
import {
  ALL_ITEM_IDS, ITEM_GROUPS, ItemGroup, SKILL_NAMES, TOOL_SETS, formatChance, getItemGroup, getItemSources, getItemUses,
} from '@/constants/wiki';
import { formatCash } from '@/constants/numberFormat';
import { theme, skillColor } from '@/constants/theme';
import { SkillIcon } from '@/components/SkillIcon';
import { useGameStore } from '@/store/gameStore';
import { ResourceImage } from '@/components/ResourceImage';

type Page =
  | { type: 'home' }
  | { type: 'guide' }
  | { type: 'skill'; id: string }
  | { type: 'items'; group?: ItemGroup }
  | { type: 'item'; id: string }
  | { type: 'upgrades' }
  | { type: 'turf' }
  | { type: 'progression' };

const SKILL_ORDER = ['smuggling', 'thieving', 'drug_factory', 'distillery', 'investigation_lab'];

// Hand-written mechanics notes per skill; every number here mirrors the store.
const SKILL_MECHANICS: Record<string, string[]> = {
  smuggling: [
    'Pick a route and your crew runs it on a loop. No materials needed — the perfect first skill.',
    'Every run rolls for goods: a junk chance first, then a weighted pick from the route\'s table.',
    'Rare goods only appear once you reach the level shown next to them.',
    'Mastery 25/50/75/100 on a route gives +1/+2/+3/+5 extra items per run.',
    'Each level cuts run time by 3% of the base time (down to 20% of base).',
  ],
  thieving: [
    'Every attempt pays cash and may drop one bonus item from the target\'s loot table.',
    'Catch chance = base × target difficulty × mastery × gear, plus a Heat penalty (0.1% per Heat up to 30, 0.2% to 70, 0.4% above). Always between 1% and 95%.',
    'Caught: the target goes on cooldown (15s + 0.5s per target level, max 45s) and you only get 10% XP.',
    'Arrested (a small share of catches): a long cooldown (60s + 1.5s per target level, max 3 min) and triple Heat.',
    'Heat cools by 1% per second whenever you are not stealing. At 100% Heat all loot is halved.',
    'Your target restarts by itself after a cooldown, as long as you don\'t start another job.',
  ],
  drug_factory: [
    'Turns raw materials into product. Each batch consumes its inputs even if it fails.',
    'A failed batch wastes the inputs and only gives 10% XP. Facilities and the agent reduce failure.',
    'Basic materials are cheap in the Market; better recipes need premium inputs from the Lab.',
    'Each level cuts batch time by 2% of the base time (down to 30% of base).',
  ],
  distillery: [
    'Brews drinks from water, grains, fruit and alcohol base. Same rules as the Drug Factory.',
    'Longer brews give more XP per batch; XP per second is balanced across recipes.',
    'Each level cuts brew time by 2% of the base time (down to 30% of base).',
  ],
  investigation_lab: [
    'Refines common materials into premium ones used by high-level recipes.',
    'Slow but valuable: premium materials sell well and unlock the best products.',
    'Each level cuts process time by 2% of the base time (down to 30% of base).',
  ],
};

const BONUS_LABELS: Record<string, (v: number) => string | null> = {
  timeReductionMultiplier: v => (v < 1 ? `−${Math.round((1 - v) * 100)}% time` : null),
  failureReductionMultiplier: v => (v < 1 ? `−${Math.round((1 - v) * 100)}% failure` : null),
  outputMultiplier: v => (v > 1 ? `×${v} output` : null),
  inputReductionMultiplier: v => (v < 1 ? `−${Math.round((1 - v) * 100)}% inputs` : null),
  inputSaveChance: v => (v > 0 ? `${Math.round(v * 100)}% chance to save 1 input` : null),
  junkReductionMultiplier: v => (v < 1 ? `−${Math.round((1 - v) * 100)}% junk` : null),
  itemsPerActionBonus: v => (v > 0 ? `+${v} item per run` : null),
  rareWeightMultiplier: v => (v > 1 ? `+${Math.round((v - 1) * 100)}% rare odds` : null),
  cooldownReductionMultiplier: v => (v < 1 ? `−${Math.round((1 - v) * 100)}% cooldown` : null),
  cooldownTimeReduction: v => (v > 0 ? `−${Math.round(v * 100)}% cooldown time` : null),
  extraLootChance: v => (v > 0 ? `${Math.round(v * 100)}% chance of +1 loot` : null),
  heatReductionMultiplier: v => (v < 1 ? `−${Math.round((1 - v) * 100)}% heat` : null),
  lootBonusMultiplier: v => (v > 1 ? `+${Math.round((v - 1) * 100)}% loot` : null),
};

function formatTime(ms: number): string {
  const s = ms / 1000;
  if (s < 60) return `${s % 1 === 0 ? s : s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const rest = Math.round(s % 60);
  return rest ? `${m}m ${rest}s` : `${m}m`;
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function H({ children }: { children: React.ReactNode }) {
  return <Text style={styles.h}>{children}</Text>;
}

function P({ children }: { children: React.ReactNode }) {
  return <Text style={styles.p}>{children}</Text>;
}

function Bullets({ items }: { items: string[] }) {
  return (
    <View style={styles.bullets}>
      {items.map((t, i) => (
        <View key={i} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return <View style={[styles.card, accent ? { borderColor: `${accent}55` } : null]}>{children}</View>;
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

function ItemChip({ id, qty, suffix, onOpen }: { id: string; qty?: number | string; suffix?: string; onOpen: (p: Page) => void }) {
  const res = RESOURCES[id];
  if (!res) return null;
  return (
    <TouchableOpacity style={styles.itemChip} onPress={() => onOpen({ type: 'item', id })}>
      <ResourceImage resource={res} size={16} />
      <Text style={styles.itemChipText} numberOfLines={1}>
        {qty !== undefined ? `${qty} ` : ''}{res.name}{suffix ? ` · ${suffix}` : ''}
      </Text>
    </TouchableOpacity>
  );
}

function NavRow({ icon, title, hint, onPress, testID }: { icon: React.ReactNode; title: string; hint: string; onPress: () => void; testID?: string }) {
  return (
    <TouchableOpacity style={styles.navRow} onPress={onPress} activeOpacity={0.85} testID={testID}>
      <View style={styles.navIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.navTitle}>{title}</Text>
        <Text style={styles.navHint}>{hint}</Text>
      </View>
      <ChevronRight size={18} color={theme.colors.textDim} />
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

function HomePage({ open }: { open: (p: Page) => void }) {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (query.length < 2) return null;
    const items = ALL_ITEM_IDS.filter(id => RESOURCES[id].name.toLowerCase().includes(query)).slice(0, 25);
    const skills = SKILL_ORDER.filter(id => SKILL_NAMES[id].toLowerCase().includes(query));
    const jobs: { skillId: string; name: string }[] = [];
    Object.entries(ACTIVITIES).forEach(([skillId, acts]) => acts.forEach(a => { if (a.name.toLowerCase().includes(query)) jobs.push({ skillId, name: a.name }); }));
    SMUGGLING_ZONES.forEach(z => { if (z.name.toLowerCase().includes(query)) jobs.push({ skillId: 'smuggling', name: z.name }); });
    return { items, skills, jobs: jobs.slice(0, 15) };
  }, [query]);

  return (
    <View style={styles.page}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>THE FAMILY ARCHIVES</Text>
        <Text style={styles.heroTitle}>Criminal Boss Wiki</Text>
        <Text style={styles.heroSub}>Every job, item, upgrade and formula in the game — pulled straight from the game data.</Text>
      </View>

      <View style={styles.searchBox}>
        <Search size={18} color={theme.colors.textDim} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items, jobs, skills…"
          placeholderTextColor={theme.colors.textDim}
          value={q}
          onChangeText={setQ}
          autoCorrect={false}
          testID="wiki-search"
        />
      </View>

      {results ? (
        <Card>
          {results.skills.map(id => (
            <NavRow key={id} icon={<SkillIcon skillId={id} size={34} />} title={SKILL_NAMES[id]} hint="Skill" onPress={() => open({ type: 'skill', id })} />
          ))}
          {results.jobs.map(j => (
            <NavRow key={`${j.skillId}_${j.name}`} icon={<SkillIcon skillId={j.skillId} size={34} />} title={j.name} hint={SKILL_NAMES[j.skillId]} onPress={() => open({ type: 'skill', id: j.skillId })} />
          ))}
          {results.items.map(id => (
            <NavRow key={id} icon={<ResourceImage resource={RESOURCES[id]} size={24} />} title={RESOURCES[id].name} hint={`Item · $${formatCash(RESOURCES[id].value)}`} onPress={() => open({ type: 'item', id })} />
          ))}
          {!results.skills.length && !results.jobs.length && !results.items.length && <P>Nothing matches “{q}”.</P>}
        </Card>
      ) : (
        <>
          <H>Start here</H>
          <NavRow icon={<Text style={styles.navEmoji}>📖</Text>} title="Getting Started" hint="Your first hour as a boss" onPress={() => open({ type: 'guide' })} testID="wiki-guide" />
          <H>Skills</H>
          {SKILL_ORDER.map(id => (
            <NavRow key={id} icon={<SkillIcon skillId={id} size={36} />} title={SKILL_NAMES[id]} hint={`${id === 'smuggling' ? SMUGGLING_ZONES.length : ACTIVITIES[id]?.length ?? 0} ${id === 'smuggling' ? 'routes' : id === 'thieving' ? 'targets' : 'recipes'}`} onPress={() => open({ type: 'skill', id })} testID={`wiki-skill-${id}`} />
          ))}
          <H>Reference</H>
          <NavRow icon={<Text style={styles.navEmoji}>📦</Text>} title="Items" hint={`${ALL_ITEM_IDS.length} items, where to get them and what they're for`} onPress={() => open({ type: 'items' })} testID="wiki-items" />
          <NavRow icon={<Text style={styles.navEmoji}>🛠️</Text>} title="Upgrades" hint="Tools for every skill, bonuses and costs" onPress={() => open({ type: 'upgrades' })} />
          <NavRow icon={<Text style={styles.navEmoji}>⚔️</Text>} title="Turf War" hint="Dungeons, enemies, gear and loot" onPress={() => open({ type: 'turf' })} />
          <NavRow icon={<Text style={styles.navEmoji}>📈</Text>} title="Progression" hint="XP, mastery, ranks, contracts, daily, achievements" onPress={() => open({ type: 'progression' })} />
        </>
      )}
    </View>
  );
}

function GuidePage({ open }: { open: (p: Page) => void }) {
  const steps: { title: string; text: string; page?: Page }[] = [
    { title: 'Put your crew to work', text: 'Start with Smuggling at the Docks: it needs no materials and runs forever. Idle crews earn nothing.', page: { type: 'skill', id: 'smuggling' } },
    { title: 'Claim your daily payoff', text: 'A reward waits every day. Seven days in a row pays the jackpot; missing a day resets the streak.' },
    { title: 'Work the contract board', text: 'HQ always shows three contracts. They are sized for a few minutes of play and pay cash plus respect.' },
    { title: 'Start producing', text: 'Buy cheap materials in the Market and cook in the Drug Factory or Distillery. Sell product from your Stash.', page: { type: 'skill', id: 'drug_factory' } },
    { title: 'Buy your first upgrade', text: 'Every skill has five upgrades. The first one takes about ten minutes to afford and speeds everything up.', page: { type: 'upgrades' } },
    { title: 'Rank up', text: 'Skill levels and respect raise your reputation. Every new rank pays more per contract.', page: { type: 'progression' } },
    { title: 'Go to war', text: 'Your street kit starts equipped. Clear Turf War dungeons for cash and loot bags full of gear.', page: { type: 'turf' } },
    { title: 'Log off with a job running', text: 'Your last job keeps going for up to 12 hours while you are away (crafting stops when materials run out).' },
  ];
  return (
    <View style={styles.page}>
      <H>Getting Started</H>
      {steps.map((s, i) => (
        <Card key={s.title}>
          <View style={styles.stepRow}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{s.title}</Text>
              <Text style={styles.p}>{s.text}</Text>
              {s.page && (
                <TouchableOpacity onPress={() => open(s.page!)}><Text style={styles.link}>Read more →</Text></TouchableOpacity>
              )}
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
}

function SkillPage({ id, open }: { id: string; open: (p: Page) => void }) {
  const accent = skillColor(id);
  const agent = AGENTS[id];
  return (
    <View style={styles.page}>
      <View style={[styles.skillHero, { borderColor: `${accent}55` }]}>
        <SkillIcon skillId={id} size={56} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.heroTitle, { color: accent }]}>{SKILL_NAMES[id]}</Text>
          <Text style={styles.heroSub}>{SKILL_DESCRIPTIONS[id]}</Text>
        </View>
      </View>

      <H>How it works</H>
      <Card><Bullets items={SKILL_MECHANICS[id] ?? []} /></Card>

      {id === 'smuggling' ? (
        <>
          <H>Routes</H>
          {SMUGGLING_ZONES.map(z => {
            const total = z.items.reduce((sum, it) => sum + it.weight, 0);
            return (
              <Card key={z.id} accent={accent}>
                <View style={styles.jobHead}>
                  <Text style={styles.cardTitle}>{z.name}</Text>
                  <Text style={[styles.lvl, { color: accent }]}>Lv {z.levelRequired}</Text>
                </View>
                <View style={styles.statRow}>
                  <Stat label="Base time" value={formatTime(z.baseTime)} />
                  <Stat label="XP / run" value={`${getSmugglingXp(z.levelRequired, z.baseTime)}`} />
                  <Stat label="Junk" value={`${z.junkChance}%`} />
                </View>
                <Text style={styles.sub}>Drops per item roll (odds once every item is unlocked)</Text>
                <View style={styles.chipWrap}>
                  {z.items.map(it => (
                    <ItemChip
                      key={it.resource.id}
                      id={it.resource.id}
                      suffix={`${formatChance((1 - z.junkChance / 100) * (it.weight / total))}${it.minLevel ? ` · Lv ${it.minLevel}+` : ''}`}
                      onOpen={open}
                    />
                  ))}
                </View>
              </Card>
            );
          })}
        </>
      ) : (
        <>
          <H>{id === 'thieving' ? 'Targets' : 'Recipes'}</H>
          {(ACTIVITIES[id] ?? []).map(a => {
            const xp = a.getDynamicXp ? a.getDynamicXp(a.levelRequired) : a.baseXp;
            const cash = a.lootTable?.find(l => l.resourceId === 'cash' || l.resourceId === 'loose_change');
            const drops = (a.lootTable ?? []).filter(l => l !== cash);
            const dropTotal = drops.reduce((sum, l) => sum + l.weight, 0);
            return (
              <Card key={a.id} accent={accent}>
                <View style={styles.jobHead}>
                  <View style={styles.jobName}>
                    <ResourceImage resource={a.resource} size={22} />
                    <Text style={styles.cardTitle} numberOfLines={1}>{a.name}</Text>
                  </View>
                  <Text style={[styles.lvl, { color: accent }]}>Lv {a.levelRequired}</Text>
                </View>
                <View style={styles.statRow}>
                  <Stat label="Base time" value={formatTime(a.baseTime)} />
                  <Stat label="XP" value={`${xp}`} />
                  {id === 'thieving' ? (
                    <>
                      <Stat label="Catch" value={`${a.failureChance ?? 0}%`} color={theme.colors.crimson} />
                      <Stat label="Heat" value={`+${a.heatGenerated ?? 0}`} color={theme.colors.heat} />
                    </>
                  ) : (
                    <>
                      <Stat label="Failure" value={`${a.failureChance ?? 0}%`} color={theme.colors.crimson} />
                      <Stat label="Sells" value={`$${formatCash(a.resource.value)}`} color={theme.colors.gold} />
                    </>
                  )}
                </View>
                {!!a.inputs?.length && (
                  <>
                    <Text style={styles.sub}>Needs per batch</Text>
                    <View style={styles.chipWrap}>
                      {a.inputs.map(inp => <ItemChip key={inp.resourceId} id={inp.resourceId} qty={inp.quantity} onOpen={open} />)}
                    </View>
                  </>
                )}
                {id !== 'thieving' && (
                  <>
                    <Text style={styles.sub}>Makes</Text>
                    <View style={styles.chipWrap}><ItemChip id={a.resource.id} qty={1} onOpen={open} /></View>
                  </>
                )}
                {id === 'thieving' && (
                  <>
                    <Text style={styles.sub}>
                      Pays ${cash?.minQuantity ?? 0}–{cash?.maxQuantity ?? 0} cash · arrest on {a.arrestChance ?? 0}% of catches
                    </Text>
                    <View style={styles.chipWrap}>
                      {drops.map(l => (
                        <ItemChip
                          key={l.resourceId}
                          id={l.resourceId}
                          qty={l.minQuantity === l.maxQuantity ? l.minQuantity : `${l.minQuantity}-${l.maxQuantity}`}
                          suffix={formatChance((l.weight / dropTotal) * Math.min(1, l.weight / 100))}
                          onOpen={open}
                        />
                      ))}
                    </View>
                  </>
                )}
              </Card>
            );
          })}
        </>
      )}

      {agent && (
        <>
          <H>Level 100 agent</H>
          <Card accent={theme.colors.premium}>
            <Text style={styles.cardTitle}>🕴️ {agent.name}</Text>
            <Text style={styles.p}>{agent.description}</Text>
            <Bullets items={agent.bonuses} />
          </Card>
        </>
      )}

      <TouchableOpacity onPress={() => open({ type: 'upgrades' })}><Text style={styles.link}>See {SKILL_NAMES[id]} upgrades →</Text></TouchableOpacity>
    </View>
  );
}

function ItemsPage({ group, open }: { group?: ItemGroup; open: (p: Page) => void }) {
  const [active, setActive] = useState<ItemGroup | 'all'>(group ?? 'all');
  const [q, setQ] = useState('');
  const ids = ALL_ITEM_IDS.filter(id => (active === 'all' || getItemGroup(id) === active) && RESOURCES[id].name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <View style={styles.page}>
      <H>Items</H>
      <View style={styles.searchBox}>
        <Search size={18} color={theme.colors.textDim} />
        <TextInput style={styles.searchInput} placeholder="Filter items…" placeholderTextColor={theme.colors.textDim} value={q} onChangeText={setQ} autoCorrect={false} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {[{ id: 'all' as const, name: 'All', icon: '⭐' }, ...ITEM_GROUPS].map(g => (
          <TouchableOpacity key={g.id} style={[styles.filterChip, active === g.id && styles.filterChipActive]} onPress={() => setActive(g.id)}>
            <Text style={[styles.filterText, active === g.id && { color: theme.colors.gold }]}>{g.icon} {g.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Card>
        {ids.map(id => (
          <TouchableOpacity key={id} style={styles.itemRow} onPress={() => open({ type: 'item', id })} testID={`wiki-item-${id}`}>
            <ResourceImage resource={RESOURCES[id]} size={26} />
            <Text style={styles.itemRowName} numberOfLines={1}>{RESOURCES[id].name}</Text>
            <Text style={styles.itemRowValue}>${formatCash(RESOURCES[id].value)}</Text>
          </TouchableOpacity>
        ))}
        {ids.length === 0 && <P>No items match.</P>}
      </Card>
    </View>
  );
}

function ItemPage({ id, open }: { id: string; open: (p: Page) => void }) {
  const res = RESOURCES[id];
  const discovered = useDiscovered(id);
  if (!res) return <P>Unknown item.</P>;
  const sources = getItemSources(id);
  const uses = getItemUses(id);
  const gear = EQUIPMENT_CATALOG[id];
  const group = ITEM_GROUPS.find(g => g.id === getItemGroup(id));
  return (
    <View style={styles.page}>
      <View style={styles.itemHero}>
        <View style={styles.itemHeroIcon}><ResourceImage resource={res} size={48} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>{res.name}</Text>
          <Text style={styles.heroSub}>{group?.icon} {group?.name} · Sells for <Text style={{ color: theme.colors.gold, fontWeight: '900' }}>${formatCash(res.value)}</Text></Text>
          <Text style={[styles.badge, discovered ? styles.badgeFound : null]}>{discovered ? '✓ In your Collection Log' : 'Not discovered yet'}</Text>
        </View>
      </View>
      {!!res.description && <Card><Text style={[styles.p, { fontStyle: 'italic' }]}>{res.description}</Text></Card>}

      {gear && (
        <>
          <H>Equipment</H>
          <Card>
            <View style={styles.statRow}>
              <Stat label="Slot" value={gear.slot} />
              {Object.entries(gear.stats).map(([k, v]) => <Stat key={k} label={k} value={`+${v}`} color={theme.colors.emerald} />)}
              {gear.attackSpeed ? <Stat label="Attack speed" value={`${gear.attackSpeed}s`} /> : null}
            </View>
          </Card>
        </>
      )}

      <H>How to get it</H>
      <Card>
        {sources.length === 0 && <P>No known source.</P>}
        {sources.map((s, i) => {
          if (s.kind === 'craft') return <NavRow key={i} icon={<SkillIcon skillId={s.skillId} size={32} />} title={s.name} hint={`${SKILL_NAMES[s.skillId]} · Lv ${s.level}`} onPress={() => open({ type: 'skill', id: s.skillId })} />;
          if (s.kind === 'smuggle') return <NavRow key={i} icon={<SkillIcon skillId="smuggling" size={32} />} title={s.name} hint={`Smuggling route Lv ${s.level} · ${formatChance(s.chance)} per roll${s.minLevel ? ` · needs Lv ${s.minLevel}` : ''}`} onPress={() => open({ type: 'skill', id: 'smuggling' })} />;
          if (s.kind === 'steal') return <NavRow key={i} icon={<SkillIcon skillId="thieving" size={32} />} title={s.name} hint={`Thieving Lv ${s.level} · ${formatChance(s.chance)} per success · ${s.min === s.max ? s.min : `${s.min}-${s.max}`} each`} onPress={() => open({ type: 'skill', id: 'thieving' })} />;
          if (s.kind === 'shop') return <NavRow key={i} icon={<Text style={styles.navEmoji}>🛒</Text>} title="Market" hint={`Buy for $${s.price} each`} onPress={() => {}} />;
          if (s.kind === 'lootbag') return <NavRow key={i} icon={<Text style={styles.navEmoji}>🧰</Text>} title="Treasure Bag" hint={`${formatChance(s.chance)} per bag`} onPress={() => open({ type: 'turf' })} />;
          return <NavRow key={i} icon={<Text style={styles.navEmoji}>🗑️</Text>} title="Smuggling junk" hint="Any failed item roll" onPress={() => open({ type: 'skill', id: 'smuggling' })} />;
        })}
      </Card>

      <H>What it's for</H>
      <Card>
        {uses.length === 0 && <P>Nothing uses this directly — sell it in your Stash.</P>}
        {uses.map((u, i) => {
          if (u.kind === 'input') return <NavRow key={i} icon={<SkillIcon skillId={u.skillId} size={32} />} title={u.name} hint={`${SKILL_NAMES[u.skillId]} Lv ${u.level} · needs ${u.qty} per batch`} onPress={() => open({ type: 'skill', id: u.skillId })} />;
          if (u.kind === 'tool') return <NavRow key={i} icon={<Text style={styles.navEmoji}>🛠️</Text>} title={u.toolName} hint={`${SKILL_NAMES[u.skillId]} upgrade · ${u.qty} needed`} onPress={() => open({ type: 'upgrades' })} />;
          return <NavRow key={i} icon={<Text style={styles.navEmoji}>🛡️</Text>} title="Equip in Turf War" hint={`${u.slot} slot`} onPress={() => open({ type: 'turf' })} />;
        })}
      </Card>
    </View>
  );
}

function UpgradesPage({ open }: { open: (p: Page) => void }) {
  return (
    <View style={styles.page}>
      <H>Upgrades</H>
      <P>Each skill has five upgrades, bought with cash and goods from that skill. A new upgrade is equipped automatically; you can switch back any time from the skill screen.</P>
      {TOOL_SETS.map(set => (
        <View key={set.skillId} style={{ gap: 8 }}>
          <View style={styles.setHead}>
            <SkillIcon skillId={set.skillId} size={30} />
            <Text style={[styles.setTitle, { color: skillColor(set.skillId) }]}>{SKILL_NAMES[set.skillId]} · {set.label}</Text>
          </View>
          {set.tools.map(t => {
            const bonuses = Object.entries(t.bonuses)
              .map(([k, v]) => (typeof v === 'number' && BONUS_LABELS[k] ? BONUS_LABELS[k](v) : null))
              .filter((x): x is string => !!x);
            return (
              <Card key={t.id} accent={skillColor(set.skillId)}>
                <View style={styles.jobHead}>
                  <Text style={styles.cardTitle}>{t.icon} {t.name}</Text>
                  <Text style={styles.tierTag}>TIER {t.tier}</Text>
                </View>
                <Text style={styles.bonusText}>{bonuses.join(' · ')}</Text>
                <View style={styles.chipWrap}>
                  {t.requirements.map(r =>
                    r.resourceId === 'cash' || r.resourceId === 'loose_change'
                      ? <View key={r.resourceId} style={styles.itemChip}><Text style={[styles.itemChipText, { color: theme.colors.gold }]}>${formatCash(r.quantity)}</Text></View>
                      : <ItemChip key={r.resourceId} id={r.resourceId} qty={r.quantity} onOpen={open} />,
                  )}
                </View>
              </Card>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function TurfPage({ open }: { open: (p: Page) => void }) {
  const lootTotal = LOOT_BAG_TABLE.reduce((s, l) => s + l.weight, 0);
  return (
    <View style={styles.page}>
      <H>How fights work</H>
      <Card>
        <Bullets items={[
          `You start with ${BASE_PLAYER_STATS.hp} HP, ${BASE_PLAYER_STATS.attack} attack, ${BASE_PLAYER_STATS.defense} defence, ${BASE_PLAYER_STATS.accuracy} accuracy, ${BASE_PLAYER_STATS.evasion} evasion and ${BASE_PLAYER_STATS.critChance}% crit. Gear adds on top.`,
          'Hit chance = your accuracy − enemy evasion (between 5% and 95%). Enemies use the same rule against you.',
          'Your damage = attack ± 15%, minus half the enemy\'s defence. A crit deals 150%.',
          'Enemy damage is reduced by a third of your defence.',
          'Attack speed comes from your weapon (1.6s unarmed). Faster weapons hit more often.',
          'Clear every enemy and the boss to finish the dungeon; it then restarts automatically.',
          'Leave the screen and the fight continues in the background. If you die, the fight stops and you keep what you already earned.',
        ]} />
      </Card>

      <H>Dungeons</H>
      {COMBAT_DUNGEONS.map(d => (
        <Card key={d.id} accent={theme.colors.crimson}>
          <View style={styles.jobHead}>
            <Text style={styles.cardTitle}>{d.name}</Text>
            <Text style={[styles.lvl, { color: theme.colors.crimson }]}>Rec. Lv {d.recommendedLevel}</Text>
          </View>
          <Text style={styles.p}>{d.description}</Text>
          {[{ e: d.enemy, label: `× ${d.enemyCount}` }, { e: d.boss, label: 'BOSS' }].map(({ e, label }) => (
            <View key={e.id} style={styles.enemyRow}>
              <Text style={styles.enemyIcon}>{e.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.enemyName}>{e.name} <Text style={styles.enemyTag}>{label}</Text></Text>
                <Text style={styles.enemyStats}>HP {e.hp} · ATK {e.attack} · DEF {e.defense} · ACC {e.accuracy} · EVA {e.evasion} · Crit {e.critChance}% · {e.attackSpeed}s</Text>
              </View>
            </View>
          ))}
          <Text style={styles.sub}>Reward: ${getDungeonGoldReward(d)} + 1 Treasure Bag per clear</Text>
        </Card>
      ))}

      <H>Treasure Bag</H>
      <Card>
        <P>Open from your Stash. Always contains ${LOOT_BAG_GOLD.min}–${LOOT_BAG_GOLD.max}, and rolls separately for each item below (so a bag can hold several).</P>
        <View style={styles.chipWrap}>
          {LOOT_BAG_TABLE.map(l => <ItemChip key={l.resourceId} id={l.resourceId} suffix={formatChance(l.weight / lootTotal)} onOpen={open} />)}
        </View>
      </Card>

      <H>Equipment</H>
      <Card>
        {Object.values(EQUIPMENT_CATALOG).map(e => (
          <TouchableOpacity key={e.id} style={styles.itemRow} onPress={() => open({ type: 'item', id: e.id })}>
            <Text style={{ fontSize: 22 }}>{e.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemRowName}>{e.name}</Text>
              <Text style={styles.enemyStats}>{e.slot} · {Object.entries(e.stats).map(([k, v]) => `${k} +${v}`).join(', ')}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Card>
    </View>
  );
}

function ProgressionPage() {
  const milestones = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 99, 100];
  return (
    <View style={styles.page}>
      <H>Skill levels</H>
      <Card>
        <P>Every skill goes from 1 to 100. Levels unlock new jobs and make every action faster. The curve is quick early and very long at the top.</P>
        <View style={styles.table}>
          {milestones.map(l => (
            <View key={l} style={styles.tableRow}>
              <Text style={styles.tableCell}>Level {l}</Text>
              <Text style={[styles.tableCell, styles.tableRight]}>{getXpForLevel(l).toLocaleString('en-US')} XP</Text>
            </View>
          ))}
        </View>
      </Card>

      <H>Mastery</H>
      <Card>
        <Bullets items={[
          'Each job has its own mastery (1-100). Every action on it gives 1 mastery XP; level = √(XP ÷ 2.5) + 1, so level 100 takes about 24,500 actions.',
          'Mastery 25 / 50 / 75 / 100: −5% / −10% / −15% / −25% action time.',
          'Smuggling routes also give +1 / +2 / +3 / +5 items per run at those levels.',
          'Thieving targets instead lower your catch chance by up to 95% at mastery 100.',
        ]} />
      </Card>

      <H>Agents</H>
      <Card>
        <P>Reaching level 100 in a skill recruits its agent permanently. Production skills: −30% action time, +1 item per action and −10 points of failure chance. Smuggling: −30% time, +1 item per run and −15 points of junk. Thieving: half the cooldowns, half the catch chance and a 50% chance to double loot.</P>
      </Card>

      <H>Boss ranks</H>
      <Card>
        <P>Reputation = total skill level × 10 + respect. Respect comes from contracts, daily payoffs and achievements.</P>
        <View style={styles.table}>
          {BOSS_RANKS.map(r => (
            <View key={r.id} style={styles.tableRow}>
              <Text style={styles.tableCell}>{r.icon} {r.title}</Text>
              <Text style={[styles.tableCell, styles.tableMid]}>{r.minReputation.toLocaleString('en-US')} rep</Text>
              <Text style={[styles.tableCell, styles.tableRight]}>{r.perk}</Text>
            </View>
          ))}
        </View>
      </Card>

      <H>Contracts</H>
      <Card>
        <Bullets items={[
          'Three contracts are always on the HQ board: supply orders, smuggling runs, thefts, laundering (selling goods) and turf wars.',
          'Targets are sized for about four minutes of play at your current level.',
          'Rewards are cash (boosted by your rank) and respect. Swapping a contract costs $50 + $10 per total level.',
        ]} />
      </Card>

      <H>Daily payoff</H>
      <Card>
        <View style={styles.table}>
          {DAILY_REWARDS.map(d => (
            <View key={d.day} style={styles.tableRow}>
              <Text style={styles.tableCell}>Day {d.day}</Text>
              <Text style={[styles.tableCell, styles.tableRight]}>{d.label} · +{d.respect} rep</Text>
            </View>
          ))}
        </View>
        <P>Claim once per calendar day. Missing a day restarts the streak from day 1.</P>
      </Card>

      <H>Achievements</H>
      <Card>
        <P>{ACHIEVEMENTS.length} achievements in bronze ({TIER_POINTS.bronze} pts), silver ({TIER_POINTS.silver}), gold ({TIER_POINTS.gold}) and diamond ({TIER_POINTS.diamond}). Each one unlocks permanently and pays its points as respect plus $100 per point. Some are secret until you stumble into them.</P>
      </Card>

      <H>Offline progress</H>
      <Card>
        <P>Close the game with a job running and it keeps going for up to 12 hours. Crafting stops when materials run out; thieving accounts for time lost to cooldowns. You get a full report when you come back.</P>
      </Card>

      <H>Market</H>
      <Card>
        <P>Basic materials are always for sale:</P>
        <View style={styles.chipWrap}>
          {STORE_ITEMS.map(s => (
            <View key={s.resourceId} style={styles.itemChip}>
              <ResourceImage resource={RESOURCES[s.resourceId]} size={16} />
              <Text style={styles.itemChipText}>{RESOURCES[s.resourceId]?.name} · ${s.price}</Text>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
}

// Collection Log status for the item page.
function useDiscovered(id: string): boolean {
  return useGameStore(s => s.lifetimeStats.discovered?.[id] !== undefined);
}

const PAGE_TITLES: Record<Page['type'], string> = {
  home: 'Wiki',
  guide: 'Getting Started',
  skill: 'Skill',
  items: 'Items',
  item: 'Item',
  upgrades: 'Upgrades',
  turf: 'Turf War',
  progression: 'Progression',
};

export default function WikiScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ item?: string; skill?: string }>();
  const initial: Page = params.item && RESOURCES[params.item]
    ? { type: 'item', id: params.item }
    : params.skill ? { type: 'skill', id: params.skill } : { type: 'home' };
  const [stack, setStack] = useState<Page[]>(initial.type === 'home' ? [initial] : [{ type: 'home' }, initial]);
  const page = stack[stack.length - 1];
  const scrollRef = React.useRef<ScrollView>(null);

  const open = (p: Page) => {
    setStack(s => [...s, p]);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };
  const back = () => setStack(s => (s.length > 1 ? s.slice(0, -1) : s));

  const title = page.type === 'skill' ? SKILL_NAMES[page.id] : page.type === 'item' ? RESOURCES[page.id]?.name ?? 'Item' : PAGE_TITLES[page.type];

  return (
    <View style={styles.container}>
      {stack.length > 1 && (
        <View style={styles.crumbs}>
          <TouchableOpacity style={styles.backBtn} onPress={back} testID="wiki-back">
            <ChevronLeft size={18} color={theme.colors.gold} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.crumbTitle} numberOfLines={1}>{title}</Text>
          <TouchableOpacity onPress={() => setStack([{ type: 'home' }])}><Text style={styles.backText}>Wiki home</Text></TouchableOpacity>
        </View>
      )}
      <ScrollView ref={scrollRef} key={stack.length} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        {page.type === 'home' && <HomePage open={open} />}
        {page.type === 'guide' && <GuidePage open={open} />}
        {page.type === 'skill' && <SkillPage id={page.id} open={open} />}
        {page.type === 'items' && <ItemsPage group={page.group} open={open} />}
        {page.type === 'item' && <ItemPage id={page.id} open={open} />}
        {page.type === 'upgrades' && <UpgradesPage open={open} />}
        {page.type === 'turf' && <TurfPage open={open} />}
        {page.type === 'progression' && <ProgressionPage />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 14 },
  page: { gap: 10 },
  crumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.bgElevated,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backText: { color: theme.colors.gold, fontWeight: '800', fontSize: 13 },
  crumbTitle: { flex: 1, color: theme.colors.text, fontWeight: '800', textAlign: 'center' },
  hero: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.goldBorder,
    padding: 16,
  },
  kicker: { color: theme.colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  heroTitle: { color: theme.colors.text, fontSize: 24, fontWeight: '900', marginTop: 2 },
  heroSub: { color: theme.colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, color: theme.colors.text, paddingVertical: 12, fontSize: 15 },
  h: { color: theme.colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 2, marginTop: 10, marginLeft: 4, textTransform: 'uppercase' },
  p: { color: theme.colors.textMuted, fontSize: 13.5, lineHeight: 20 },
  sub: { color: theme.colors.textDim, fontSize: 11.5, fontWeight: '800', marginTop: 10, marginBottom: 6, letterSpacing: 0.3 },
  link: { color: theme.colors.gold, fontWeight: '800', fontSize: 13, marginTop: 6 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
  },
  cardTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '800', flexShrink: 1 },
  bullets: { gap: 8 },
  bulletRow: { flexDirection: 'row', gap: 8 },
  bulletDot: { color: theme.colors.gold, fontWeight: '900', lineHeight: 20 },
  bulletText: { color: theme.colors.textMuted, fontSize: 13.5, lineHeight: 20, flex: 1 },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 10,
    marginBottom: 6,
  },
  navIcon: { width: 38, alignItems: 'center' },
  navEmoji: { fontSize: 24 },
  navTitle: { color: theme.colors.text, fontWeight: '800', fontSize: 14.5 },
  navHint: { color: theme.colors.textDim, fontSize: 12, marginTop: 1 },
  stepRow: { flexDirection: 'row', gap: 12 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.goldSoft, borderWidth: 1, borderColor: theme.colors.goldBorder, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: theme.colors.gold, fontWeight: '900' },
  skillHero: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: 14,
  },
  jobHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  jobName: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  lvl: { fontWeight: '900', fontSize: 13 },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  stat: {
    flexGrow: 1,
    minWidth: 70,
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  statLabel: { color: theme.colors.textDim, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { color: theme.colors.text, fontSize: 14, fontWeight: '900', marginTop: 1 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  itemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 4,
    paddingHorizontal: 9,
    maxWidth: '100%',
  },
  itemChipText: { color: theme.colors.textMuted, fontSize: 12, fontWeight: '700', flexShrink: 1 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: theme.radius.pill, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  filterChipActive: { borderColor: theme.colors.gold, backgroundColor: theme.colors.goldSoft },
  filterText: { color: theme.colors.textMuted, fontWeight: '700', fontSize: 12.5 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  itemRowName: { flex: 1, color: theme.colors.text, fontWeight: '700', fontSize: 14 },
  itemRowValue: { color: theme.colors.gold, fontWeight: '800', fontSize: 13 },
  itemHero: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  itemHeroIcon: {
    width: 72, height: 72, borderRadius: 18, backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.goldBorder, alignItems: 'center', justifyContent: 'center',
  },
  badge: { color: theme.colors.textDim, fontSize: 11.5, fontWeight: '800', marginTop: 6 },
  badgeFound: { color: theme.colors.emerald },
  setHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  setTitle: { fontWeight: '900', fontSize: 15 },
  tierTag: { color: theme.colors.textDim, fontWeight: '900', fontSize: 10.5, letterSpacing: 1 },
  bonusText: { color: theme.colors.emerald, fontSize: 12.5, fontWeight: '700', marginVertical: 8 },
  enemyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  enemyIcon: { fontSize: 26 },
  enemyName: { color: theme.colors.text, fontWeight: '800', fontSize: 14 },
  enemyTag: { color: theme.colors.crimson, fontWeight: '900', fontSize: 11 },
  enemyStats: { color: theme.colors.textDim, fontSize: 11.5, marginTop: 2 },
  table: { marginVertical: 8, borderRadius: theme.radius.sm, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border },
  tableRow: { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border, gap: 8 },
  tableCell: { color: theme.colors.textMuted, fontSize: 12.5, flex: 1 },
  tableMid: { textAlign: 'center' },
  tableRight: { textAlign: 'right', color: theme.colors.text, fontWeight: '700' },
});
