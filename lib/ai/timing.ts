export function createAITiming(operation: string) {
  const startedAt = performance.now();

  const log = (stage: string, durationMs?: number) => {
    if (process.env.NODE_ENV !== "development") return;
    const elapsed = durationMs === undefined ? "" : `: ${durationMs.toFixed(0)}ms`;
    console.info(`[AI TIMING] ${operation} ${stage}${elapsed}`);
  };

  log("request start");

  return {
    mark(stage: string, stageStartedAt: number) {
      log(stage, performance.now() - stageStartedAt);
    },
    finish() {
      log("total", performance.now() - startedAt);
    },
  };
}
