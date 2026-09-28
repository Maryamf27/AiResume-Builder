import type { ResumePersistenceAdapter } from "@/lib/resume/persistence/types";
import { loadGuestResume, saveGuestResume } from "@/lib/resume/storage";

export function createGuestPersistenceAdapter(): ResumePersistenceAdapter {
  return {
    mode: "guest",
    async load() {
      return loadGuestResume();
    },
    async save(record) {
      const ok = saveGuestResume(record);
      if (!ok) {
        return { ok: false, error: "This device's local storage is full or unavailable." };
      }
      return { ok: true };
    },
  };
}
