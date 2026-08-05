import type { Application } from "@/types/database.types";

export interface ApplicationPipeline {
  saved: number;
  applied: number;
  interviewing: number;
  offer: number;
}

// Compact 4-stage view of the real 7-status kanban (components/career/
// ApplicationKanban.tsx) for the Brief dashboard's instrument row.
// phone_screen + interviewing merge into one stage; rejected/withdrawn
// are terminal and excluded, matching how "open applications" is
// already defined on this page.
export function groupApplicationPipeline(applications: Application[]): ApplicationPipeline {
  const pipeline: ApplicationPipeline = { saved: 0, applied: 0, interviewing: 0, offer: 0 };

  for (const application of applications) {
    switch (application.status) {
      case "saved":
        pipeline.saved += 1;
        break;
      case "applied":
        pipeline.applied += 1;
        break;
      case "phone_screen":
      case "interviewing":
        pipeline.interviewing += 1;
        break;
      case "offer":
        pipeline.offer += 1;
        break;
      default:
        break;
    }
  }

  return pipeline;
}
