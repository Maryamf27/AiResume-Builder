"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";

type FeedbackType = "Bug Report" | "Feature Request" | "General Feedback";

const feedbackTypes: Array<{ value: FeedbackType; description: string }> = [
  { value: "Bug Report", description: "Something isn't working as expected." },
  { value: "Feature Request", description: "Suggest an improvement or new capability." },
  { value: "General Feedback", description: "Tell us what you think about the experience." },
];

export default function FeedbackForm() {
  const [type, setType] = useState<FeedbackType>("Bug Report");
  const [message, setMessage] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 10) {
      setStatus("error");
      setErrorMessage("Please share a little more detail so we can help.");
      return;
    }
    if (trimmedMessage.length > 5000) {
      setStatus("error");
      setErrorMessage("Please keep your message under 5,000 characters.");
      return;
    }

    void submitFeedback(trimmedMessage);
  }

  async function submitFeedback(trimmedMessage: string) {
    setStatus("submitting");
    setErrorMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("feedback").insert({
        type,
        message: trimmedMessage,
        page_url: pageUrl.trim() || window.location.href,
      } as never);
      if (error) throw error;
      setMessage("");
      setPageUrl("");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("We couldn't send that just now. Please check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-lg border border-olive/25 bg-olive/5 p-6 sm:p-8" role="status">
        <CheckCircle2 className="text-olive" aria-hidden="true" />
        <div>
          <h3 className="font-serif text-2xl text-charcoal">Thanks for your feedback.</h3>
          <p className="mt-2 text-sm leading-6 text-charcoal/70">We&apos;ve received it and will use it to improve Resonance.</p>
        </div>
        <button type="button" onClick={() => setStatus("idle")} className="text-sm font-medium text-olive underline underline-offset-4">Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-charcoal">What would you like to share?</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {feedbackTypes.map((item) => (
            <label key={item.value} className={`cursor-pointer rounded-md border p-4 transition-colors ${type === item.value ? "border-olive bg-olive/5" : "border-cream-dark bg-cream-light hover:border-olive/50"}`}>
              <input type="radio" name="feedback-type" value={item.value} checked={type === item.value} onChange={() => setType(item.value)} className="sr-only" />
              <span className="block text-sm font-medium text-charcoal">{item.value}</span>
              <span className="mt-1 block text-xs leading-5 text-charcoal/60">{item.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="feedback-message" className="text-sm font-medium text-charcoal">Your message</label>
        <Textarea id="feedback-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us what happened, or what you would love to see next." maxLength={5000} required aria-describedby="message-help" />
        <p id="message-help" className="text-xs text-charcoal/55">At least 10 characters. Please don&apos;t include passwords or sensitive information.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="feedback-page-url" className="text-sm font-medium text-charcoal">Where did this happen? <span className="font-normal text-charcoal/50">(optional)</span></label>
        <Input id="feedback-page-url" type="url" value={pageUrl} onChange={(event) => setPageUrl(event.target.value)} placeholder="We&apos;ll capture the current page automatically" />
      </div>

      {status === "error" && <p role="alert" className="text-sm text-red-800">{errorMessage}</p>}
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-charcoal/55">No account is required to send feedback.</p>
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : <Send data-icon="inline-start" aria-hidden="true" />}
          {status === "submitting" ? "Sending…" : "Send feedback"}
        </Button>
      </div>
    </form>
  );
}

export { feedbackTypes };
