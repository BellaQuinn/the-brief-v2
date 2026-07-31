import { format } from "date-fns";
import type { CalculationBasis } from "@/lib/academicStanding/types";

// The engine should explain itself, not just state a number — every
// calculation renders this alongside its headline figure.
export function CalculationBasisNote({ basis }: { basis: CalculationBasis }) {
  return (
    <p className="mt-2 text-xs leading-relaxed text-ink-tertiary">
      Based on {basis.completedCredits} completed credit{basis.completedCredits === 1 ? "" : "s"} across{" "}
      {basis.completedCourseCount} course{basis.completedCourseCount === 1 ? "" : "s"}
      {basis.inProgressCourseCount > 0 &&
        ` · ${basis.inProgressCourseCount} course${basis.inProgressCourseCount === 1 ? "" : "s"} in progress (not included)`}
      <br />
      Last recalculated {format(new Date(basis.calculatedAt), "MMM d, h:mm a")}
    </p>
  );
}
