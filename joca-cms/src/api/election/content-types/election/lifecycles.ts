import { randomUUID } from "crypto";

type CandidateInput = {
  stableId?: string | null;
  name?: string | null;
};

function ensureCandidateStableIds(
  candidates: CandidateInput[] | undefined,
): void {
  if (!Array.isArray(candidates)) return;
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;
    if (!candidate.stableId) {
      candidate.stableId = randomUUID();
    }
  }
}

export default {
  beforeCreate(event: { params: { data?: { candidates?: CandidateInput[] } } }) {
    ensureCandidateStableIds(event.params.data?.candidates);
  },

  beforeUpdate(event: { params: { data?: { candidates?: CandidateInput[] } } }) {
    ensureCandidateStableIds(event.params.data?.candidates);
  },
};
