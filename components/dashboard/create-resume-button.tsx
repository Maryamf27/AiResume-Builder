import { Plus } from "lucide-react";
import ButtonLink from "@/components/ui/button-link";

/**
 * Opens the builder with a blank draft. Nothing is saved to the account until
 * the user actually adds content, so backing out never leaves an empty resume.
 */
export default function CreateResumeButton() {
  return (
    <ButtonLink href="/builder?new=1" size="md">
      <Plus data-icon="inline-start" className="h-4 w-4" aria-hidden="true" />
      Create New Resume
    </ButtonLink>
  );
}
