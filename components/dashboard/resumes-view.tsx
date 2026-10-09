"use client";

import CachedCreateResumeButton from "@/components/dashboard/cached-create-resume-button";
import { useDashboardSession } from "@/components/dashboard/dashboard-session";
import ResumeList from "@/components/dashboard/resume-list";

export default function ResumesView() {
  const { userId } = useDashboardSession();
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">My Resumes</h1>
          <p className="mt-2 text-sm text-charcoal/60">Edit, rename, download or delete your saved resumes.</p>
        </div>
        <CachedCreateResumeButton userId={userId} />
      </div>

      <section className="mt-8">
        <ResumeList userId={userId} />
      </section>
    </>
  );
}
