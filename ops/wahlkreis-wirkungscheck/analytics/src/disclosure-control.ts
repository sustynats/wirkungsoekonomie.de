/**
 * Versioned disclosure control for research tables. It operates only on
 * aggregates and must be called by dashboards and exports alike.
 */
export const DISCLOSURE_CONTROL_VERSION = "1.0";

export type DisclosureReason = "primary" | "secondary";

export type CohortCell = { id: string; count: number };

export type CohortGroup = {
  id: string;
  totalCount: number;
  cells: readonly CohortCell[];
};

export type ReleasedCell = {
  id: string;
  count: number | null;
  suppressed: boolean;
  suppressionReason?: DisclosureReason;
};

export type ReleasedGroup = {
  id: string;
  totalCount: number | null;
  totalSuppressed: boolean;
  cells: ReleasedCell[];
};

function assertValidGroup(group: CohortGroup) {
  if (!Number.isSafeInteger(group.totalCount) || group.totalCount < 0) {
    throw new Error(`Invalid total count for cohort group ${group.id}`);
  }
  if (!group.cells.length) throw new Error(`Cohort group ${group.id} has no cells`);
  if (group.cells.some(({ count }) => !Number.isSafeInteger(count) || count < 0)) {
    throw new Error(`Invalid cell count for cohort group ${group.id}`);
  }
  const totalOfCells = group.cells.reduce((sum, cell) => sum + cell.count, 0);
  if (totalOfCells !== group.totalCount) {
    throw new Error(`Cells do not add up to the total for cohort group ${group.id}`);
  }
}

/**
 * Applies primary suppression and, when a visible total plus one hidden
 * component would reveal that component by subtraction, hides the smallest
 * remaining visible cell as secondary suppression.
 */
export function applyDisclosureControl(
  groups: readonly CohortGroup[],
  minimumCohortSize: number
): ReleasedGroup[] {
  if (!Number.isSafeInteger(minimumCohortSize) || minimumCohortSize < 1) {
    throw new Error("minimumCohortSize must be a positive integer");
  }

  return groups.map((group) => {
    assertValidGroup(group);
    const totalSuppressed = group.totalCount < minimumCohortSize;
    const cells: ReleasedCell[] = group.cells.map((cell) =>
      cell.count < minimumCohortSize
        ? { id: cell.id, count: null, suppressed: true, suppressionReason: "primary" }
        : { id: cell.id, count: cell.count, suppressed: false }
    );

    if (!totalSuppressed && cells.filter((cell) => cell.suppressed).length === 1) {
      const secondary = cells
        .filter((cell) => !cell.suppressed)
        .sort((a, b) => (a.count ?? Number.POSITIVE_INFINITY) - (b.count ?? Number.POSITIVE_INFINITY))[0];
      if (secondary) {
        secondary.count = null;
        secondary.suppressed = true;
        secondary.suppressionReason = "secondary";
      }
    }

    return {
      id: group.id,
      totalCount: totalSuppressed ? null : group.totalCount,
      totalSuppressed,
      cells
    };
  });
}
