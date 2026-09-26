import Badge from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, MapPin } from "lucide-react";

export default function ResumePreviewCard() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-x-3 -top-3 bottom-4 rounded-xl bg-olive/10"
      />
      <Card className="relative w-full overflow-hidden border-cream-dark shadow-none">
        <CardHeader className="border-b border-olive/10 bg-cream">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-3xl">Amelia Carter</CardTitle>
              <CardDescription className="mt-2 text-sm">
                Senior Product Designer · Remote
              </CardDescription>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-charcoal/65">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin
                    className="h-3.5 w-3.5 text-olive"
                    strokeWidth={2}
                    aria-hidden
                  />
                  Lisbon, Portugal
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail
                    className="h-3.5 w-3.5 text-olive"
                    strokeWidth={2}
                    aria-hidden
                  />
                  amelia@studioac.studio
                </span>
              </div>
            </div>
            <Badge variant="olive" className="whitespace-nowrap text-[10px]">
              Preview
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 py-6">
          <div>
            <h3 className="font-serif text-sm uppercase tracking-[0.18em] text-olive">
              Experience
            </h3>
            <div className="mt-3 space-y-3 border-t border-olive/10 pt-3">
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium text-charcoal">
                    Lead Product Designer · Halcyon
                  </p>
                  <p className="text-xs text-charcoal/55">2023 — Present</p>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-charcoal/70">
                  Led the end-to-end redesign of the reporting suite, adopted
                  by teams across the product in its first quarter.
                </p>
              </div>
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium text-charcoal">
                    Product Designer · Meridian Labs
                  </p>
                  <p className="text-xs text-charcoal/55">2020 — 2023</p>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-charcoal/70">
                  Shipped the onboarding redesign, lifting activation across
                  three plans.
                </p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-serif text-sm uppercase tracking-[0.18em] text-olive">
              Education
            </h3>
            <div className="mt-3 space-y-3 border-t border-olive/10 pt-3">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-charcoal">
                    BA Interaction Design
                  </p>
                  <p className="text-xs text-charcoal/60">
                    London College of Communication
                  </p>
                </div>
                <p className="text-xs text-charcoal/55">2016 — 2019</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-serif text-sm uppercase tracking-[0.18em] text-olive">
              Skills
            </h3>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-olive/10 pt-3">
              <Badge variant="outline">Design systems</Badge>
              <Badge variant="outline">Research</Badge>
              <Badge variant="outline">Prototyping</Badge>
              <Badge variant="outline">Figma</Badge>
              <Badge variant="outline">Facilitation</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
