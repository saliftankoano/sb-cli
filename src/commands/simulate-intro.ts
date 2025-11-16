import { showIntro } from "../utils/intro.js";

/**
 * Simulate the intro animation for testing/iteration
 */
export async function simulateIntroCommand(): Promise<void> {
  await showIntro();
  console.log("Intro simulation complete!\n");
}
