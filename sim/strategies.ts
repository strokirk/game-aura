import {
  type Action,
  buildable,
  buildCost,
  canAfford,
  cap,
  count,
  endowCost,
  experimentPlan,
  faerieNeed,
  has,
  housing,
  idleHands,
  isMaxed,
  offerCost,
  rates,
  researchCost,
  riteStatus,
  type State,
  studyCost,
  visibleResearch,
  workerSlots,
  zoneUsed,
} from '../src/core/index.ts';
import { APPRENTICE, type BuildingId, DEFS, EELS, EXPERIMENT, NOTICE, type ZoneId } from '../src/data/index.ts';

/** A scripted player: called once per simulated second, returns the actions to try. */
export type Strategy = (s: State) => Action[];

export const STRATEGIES: Record<string, Strategy> = {
  /** Does nothing but dismiss cards. Must lose the trial. */
  idle: () => [],

  /** Staffs the Tide Pool, keeps the Marsh carried, runs experiments with all spare Vis. */
  sensible: (s) => {
    const out: Action[] = [];
    if (idleHands(s) > 0) {
      const r = rates(s);
      const tide = s.buildings.tide_pool;
      if (tide && tide.workers < workerSlots(s, 'tide_pool'))
        out.push({ type: 'workers', building: 'tide_pool', delta: 1 });
      else if (r.zones.marsh.factor < 1) out.push({ type: 'porters', zone: 'marsh', delta: 1 });
      else out.push({ type: 'workers', building: 'salt_pan', delta: 1 });
    }
    for (const m of s.magi) {
      if (!m.sanctum || m.exp) continue;
      const extra = Math.max(0, Math.min(EXPERIMENT.maxExtraVis, Math.floor(s.res.vis) - 5));
      if (s.res.vis >= experimentPlan(s, m.id, 'study_vis', 0).cost.vis!) {
        out.push({ type: 'experiment', magus: m.id, recipe: 'study_vis', extra });
      }
    }
    return out;
  },

  /** Full run: grows steadily, keeps Notice under the strike line, then raises the Gate and performs the Rites. */
  careful: (s) => {
    const out: Action[] = [];
    const r = rates(s);
    const free = (id: BuildingId) => !!s.buildings[id] && (s.buildings[id]?.workers ?? 0) < workerSlots(s, id);
    // Hands: food, then porters, then vis, assistants, stone, vellum, salt.
    const short = (['bocage', 'marsh'] as ZoneId[]).find((z) => r.zones[z].made > r.zones[z].capacity + 0.05);
    const hungry = r.net.bread < 0.3 && free('farm');
    // Hands go to the job furthest below its fair share; food and carrying come first.
    const SHARE: Partial<Record<BuildingId, number>> = {
      eel_weir: 2,
      salt_pan: 4,
      tide_pool: 2,
      knights_barrow: 2,
      regio_spring: 2,
      quarry: s.gate ? 20 : 2,
      parchmenter: 1,
      sanctum: 1,
    };
    const load = (id: BuildingId) => (s.buildings[id]?.workers ?? 0) / (SHARE[id] ?? 1);
    const jobs = (Object.keys(SHARE) as BuildingId[]).filter((id) => free(id));
    const gateShort = !!s.gate && s.gate.porters < 3 && (s.devices.quarry ?? 0) >= 8;
    const needStone = !!s.gate?.raised && free('quarry');
    if (idleHands(s) === 0 && (hungry || short || gateShort || needStone)) {
      const keep = s.gate ? ['tide_pool', 'knights_barrow', 'regio_spring', 'quarry'] : [];
      const donor = (Object.keys(SHARE) as BuildingId[])
        .filter((id) => (s.buildings[id]?.workers ?? 0) > 0 && !keep.includes(id))
        .sort((a, b) => load(b) - load(a))[0];
      if (donor) out.push({ type: 'workers', building: donor, delta: -1 });
    }
    if (hungry) out.push({ type: 'workers', building: 'farm', delta: 1 });
    else if (short) out.push({ type: 'porters', zone: short, delta: 1 });
    else if (gateShort) out.push({ type: 'gatePorters', delta: 1 });
    else if (needStone) out.push({ type: 'workers', building: 'quarry', delta: 1 });
    else if (jobs.length) {
      const job = jobs.sort((a, b) => load(a) - load(b))[0]!;
      out.push({ type: 'workers', building: job, delta: 1 });
    }
    // Build one thing: what's short first, and nothing that would push Notice past the strike line.
    const settles = r.noticeGen * 10;
    const room = (id: BuildingId) => zoneUsed(s, DEFS[id].zone) < 8 || DEFS[id].zone !== 'hearth';
    const want: BuildingId[] = [];
    if (r.net.bread < 0.5 && !free('farm')) want.push('farm');
    if (s.hands >= housing(s) - 1) want.push('cottage');
    if (count(s, 'quarry') < 1) want.push('quarry');
    if (s.magi.some((m) => !m.sanctum)) want.push('sanctum');
    if (count(s, 'parchmenter') < 1) want.push('parchmenter');
    const nextInsight = Math.max(
      ...visibleResearch(s)
        .filter((id) => !(s.research[id] ?? 0))
        .map((id) => researchCost(s, id).insight ?? 0),
    );
    const wantLibrary = nextInsight > cap(s, 'insight') && count(s, 'library') < 3;
    if (wantLibrary) want.push('library');
    if (count(s, 'eel_weir') < 2) want.push('eel_weir');
    want.push('knights_barrow', 'regio_spring');
    if (count(s, 'salt_pan') < 8) want.push('salt_pan');
    if (count(s, 'quarry') < 3) want.push('quarry');
    if (count(s, 'parchmenter') < 2) want.push('parchmenter');
    const pick = want.find(
      (id) =>
        buildable(s, id) &&
        !isMaxed(s, id) &&
        room(id) &&
        (settles < 60 || DEFS[id].site || id === 'sanctum' || id === 'library' || id === 'eel_weir') &&
        canAfford(s, buildCost(s, id)),
    );
    if (pick) out.push({ type: 'build', building: pick });
    // Research in order; the aura while Notice has room; Notice levers; the Gate.
    for (const id of visibleResearch(s))
      if (!(s.research[id] ?? 0) && id !== 'raise_aura' && canAfford(s, researchCost(s, id)))
        out.push({ type: 'research', id });
    const learned = visibleResearch(s).filter((id) => id !== 'raise_aura' && !(s.research[id] ?? 0)).length === 0;
    if (
      settles < 55 &&
      (learned || (s.research.raise_aura ?? 0) < 3) &&
      canAfford(s, researchCost(s, 'raise_aura')) &&
      visibleResearch(s).includes('raise_aura')
    )
      out.push({ type: 'research', id: 'raise_aura' });
    if (has(s, 'monks') && s.res.eels >= cap(s, 'eels') - 5 && s.hands >= housing(s)) out.push({ type: 'sellEels' });
    if (s.res.eels >= EELS.stick * 2 && has(s, 'monks') && s.notice > 60) out.push({ type: 'sellEels' });
    if (faerieNeed(s) && canAfford(s, offerCost(s)) && has(s, 'faerie')) out.push({ type: 'offer' });
    // Every magus takes an apprentice; the old work the Longevity Ritual.
    if (has(s, 'apprentices') && canAfford(s, APPRENTICE.cost))
      for (const m of s.magi)
        if (!s.apprentices.some((a) => a.chair === m.id)) out.push({ type: 'apprentice', magus: m.id });
    if (has(s, 'endow') && settles > 55 && canAfford(s, endowCost(s))) out.push({ type: 'endow' });
    if (has(s, 'endow') && s.notice > NOTICE.strike.at - 5) out.push({ type: 'bribe' });
    if (has(s, 'gate') && !s.gate) out.push({ type: 'gate', op: 'found' });
    const allLearned = visibleResearch(s).every((id) => (s.research[id] ?? 0) > 0);
    if (s.gate && !s.gate.pour && allLearned) out.push({ type: 'gate', op: 'pour' });
    // Fill the Gate with Insight first, then send Vis for the Rite's 60 s window.
    const rite = riteStatus(s);
    const full = rite.insight >= (rite.next?.insight ?? Number.POSITIVE_INFINITY);
    if (s.gate?.raised && s.gate.visToGate !== full) out.push({ type: 'gate', op: 'vis' });
    if (riteStatus(s).ready) out.push({ type: 'gate', op: 'rite' });
    // The lab: Lab Texts while Vellum lasts, Devices on the quarries once the Gate needs Stone, else Study the Vis.
    // Keep Vis back for research that needs it, the Aegis first of all.
    const reserve = Math.max(
      0,
      ...visibleResearch(s)
        .filter((id) => !(s.research[id] ?? 0) && id !== 'raise_aura')
        .map((id) => researchCost(s, id).vis ?? 0),
    );
    const readyForRite = s.gate?.raised && riteStatus(s).insight >= (riteStatus(s).next?.insight ?? Infinity);
    for (const m of s.magi) {
      if (!m.sanctum || m.exp || readyForRite) continue;
      if (!m.longevity && m.age >= 45 && has(s, 'recipe:longevity') && s.res.vis >= Math.ceil(m.age / 5))
        out.push({ type: 'experiment', magus: m.id, recipe: 'longevity', extra: 0 });
      else if (s.labTexts < 6 && s.res.vellum >= 20 + (wantLibrary ? 20 : 0) && has(s, 'recipe:lab_text'))
        out.push({ type: 'experiment', magus: m.id, recipe: 'lab_text', extra: 0 });
      else if (
        has(s, 'recipe:device') &&
        s.labTexts >= 3 &&
        (s.devices.quarry ?? 0) < 12 &&
        s.res.stone >= 60 &&
        s.res.vis >= 15 + reserve
      )
        out.push({ type: 'experiment', magus: m.id, recipe: 'device', extra: 0, target: 'quarry' });
      else {
        const extra = Math.max(0, Math.min(EXPERIMENT.maxExtraVis, Math.floor(s.res.vis) - 5 - reserve));
        if (s.res.vis >= experimentPlan(s, m.id, 'study_vis', 0).cost.vis! + reserve)
          out.push({ type: 'experiment', magus: m.id, recipe: 'study_vis', extra });
      }
      if ((studyCost(m).insight ?? 0) < s.res.insight * 0.1) out.push({ type: 'study', magus: m.id });
    }
    return out;
  },
};
