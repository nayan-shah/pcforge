import type { BuilderSelections } from '../types/builder';

export interface CompatibilityWarning {
  slots: Array<keyof BuilderSelections>;
  severity: 'error' | 'warning';
  message: string;
}

/** PSU must supply at least this factor × estimated draw. */
export const PSU_HEADROOM_FACTOR = 1.20;

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Extract the DDR generation (e.g. "DDR4", "DDR5") from a raw string.
 * Handles values like "DDR5", "DDR5 (Up to 7200+ MHz OC, …)", etc.
 * Returns null if no DDR generation can be identified.
 */
function normalizeDdrType(raw: string | undefined): string | null {
  if (!raw) return null;
  const m = raw.match(/\b(DDR[45])\b/i);
  return m ? m[1].toUpperCase() : null;
}

/**
 * Parse a leading integer from a wattage string like "850W" or "120W".
 * Returns null if the string is missing or unparseable.
 */
function parseWattage(raw: string | undefined): number | null {
  if (!raw) return null;
  const m = raw.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

// ── Main checker ─────────────────────────────────────────────────────

/**
 * Given the current builder selections, return a list of compatibility
 * warnings.  Rules only fire when both relevant components are selected
 * AND the needed spec fields are present — never guesses or shows a
 * false positive.
 */
export function checkCompatibility(
  selections: BuilderSelections,
): CompatibilityWarning[] {
  const warnings: CompatibilityWarning[] = [];

  const { cpu, motherboard, ram, gpu, psu, case: pcCase } = selections;

  // ── Rule 1: CPU ↔ Motherboard socket ──────────────────────────────
  if (cpu && motherboard) {
    const cpuSocket = cpu.specifications?.socket;
    const moboSocket = motherboard.specifications?.socket;
    if (cpuSocket && moboSocket) {
      if (cpuSocket.trim().toLowerCase() !== moboSocket.trim().toLowerCase()) {
        warnings.push({
          slots: ['cpu', 'motherboard'],
          severity: 'error',
          message: `Socket mismatch: CPU requires ${cpuSocket} but motherboard provides ${moboSocket}.`,
        });
      }
    }
  }

  // ── Rule 2: RAM ↔ Motherboard DDR type ────────────────────────────
  if (ram && motherboard) {
    const ramDdr = normalizeDdrType(ram.specifications?.type);
    const moboDdr = normalizeDdrType(motherboard.specifications?.memorySupport);
    if (ramDdr && moboDdr && ramDdr !== moboDdr) {
      warnings.push({
        slots: ['ram', 'motherboard'],
        severity: 'error',
        message: `Memory type mismatch: RAM is ${ramDdr} but motherboard supports ${moboDdr}.`,
      });
    }
  }

  // ── Rule 3: PSU wattage headroom ──────────────────────────────────
  if (psu) {
    const psuWatts = parseWattage(psu.specifications?.wattage);
    if (psuWatts) {
      // Only CPU + GPU have meaningful TDP in the current dataset
      let estimatedDraw = 0;
      for (const comp of [cpu, gpu]) {
        if (comp && comp.powerWatts > 0) {
          estimatedDraw += comp.powerWatts;
        }
      }
      if (estimatedDraw > 0) {
        const required = Math.ceil(estimatedDraw * PSU_HEADROOM_FACTOR);
        if (psuWatts < required) {
          const headroomPct = Math.round((PSU_HEADROOM_FACTOR - 1) * 100);
          warnings.push({
            slots: ['psu'],
            severity: 'warning',
            message: `PSU may be underpowered: ${psuWatts}W for ~${estimatedDraw}W estimated draw (recommend ≥${required}W with ${headroomPct}% headroom).`,
          });
        }
      }
    }
  }

  // ── Rule 4: Case ↔ Motherboard form factor ────────────────────────
  if (pcCase && motherboard) {
    const moboFF = motherboard.specifications?.formFactor;
    const caseSupport = pcCase.specifications?.motherboardSupport;
    if (moboFF && caseSupport) {
      const supported = caseSupport
        .split(',')
        .map((s) => s.trim().toLowerCase());
      if (!supported.includes(moboFF.trim().toLowerCase())) {
        warnings.push({
          slots: ['case', 'motherboard'],
          severity: 'error',
          message: `Form factor mismatch: ${moboFF} motherboard does not fit in case (supports: ${caseSupport}).`,
        });
      }
    }
  }

  return warnings;
}
