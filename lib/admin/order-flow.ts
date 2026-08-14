export const adminOrderStages = [
  "intake_received",
  "online_request",
  "booked_appointment",
  "meeting_scheduled",
  "approval_requested",
  "approved",
  "media_plan",
  "internal_brief",
  "ad_operation",
  "campaign_running",
  "report_feeding",
  "report_ready",
  "client_review",
  "lost",
] as const;

export function stageLabel(value: string) {
  return value.split("_").map(word => word[0]?.toUpperCase() + word.slice(1)).join(" ");
}
