export async function register() {
  // Só o runtime Node.js tem timers de longa duração.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { startReminderScheduler } = await import("./lib/scheduler");
  startReminderScheduler();

  const { startRoutineReminderScheduler } = await import("./lib/routines/scheduler");
  startRoutineReminderScheduler();
}
