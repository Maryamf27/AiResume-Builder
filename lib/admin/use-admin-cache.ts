"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/lib/admin/queries";
import type { TemplateFormState } from "@/app/admin/templates/actions";

type FormAction = (prev: TemplateFormState, formData: FormData) => Promise<TemplateFormState>;

export function useMarkAdminCacheStale(action: FormAction): FormAction {
  const queryClient = useQueryClient();
  return useCallback<FormAction>(
    (prev, formData) => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.all, refetchType: "none" });
      return action(prev, formData);
    },
    [action, queryClient]
  );
}
