import { Plus } from "lucide-react";
import ButtonLink from "@/components/ui/button-link";

export default function CreateResumeButton() {
  return (
    <ButtonLink href="/builder?new=1" size="md">
      <Plus data-icon="inline-start" className="h-4 w-4" aria-hidden="true" />
      Create New Resume
    </ButtonLink>
  );
}
