import figlet from "figlet";
import chalk from "chalk";
import gradient from "gradient-string";

/**
 * Create a vibrant, animated intro banner
 */
export async function showIntro(): Promise<void> {
  return new Promise((resolve) => {
    // ASCII art with figlet
    figlet("StartBlock", { font: "ANSI Shadow" }, (err, data) => {
      if (err) {
        // Fallback if figlet fails
        console.log(chalk.bold.cyan("\n╔════════════════════════════════╗"));
        console.log(chalk.bold.cyan("║        StartBlock CLI         ║"));
        console.log(chalk.bold.cyan("╚════════════════════════════════╝\n"));
        resolve();
        return;
      }

      // Create gradient effect (purple to blue)
      const purpleBlue = gradient(["#a855f7", "#3b82f6", "#8b5cf6"]);

      console.log("\n");
      console.log(purpleBlue.multiline(data || "StartBlock"));
      console.log("\n");

      // Tagline with gradient
      const tagline = purpleBlue("  🚀 Dev Onboarding in hours, not months!");
      console.log(tagline);
      console.log(chalk.dim("  ──────────────────────────────────────\n"));

      // Animated description
      const description = chalk.white(
        "  Join a new codebase and become productive in "
      );
      const highlight = purpleBlue("hours, not months");
      const rest = chalk.white(
        ".\n  Our AI understands your code like a senior developer\n  and guides you through every file, function, and framework.\n"
      );

      console.log(description + highlight + rest);
      console.log(
        chalk.dim("  ════════════════════════════════════════════\n")
      );

      // Small delay for dramatic effect
      setTimeout(() => resolve(), 500);
    });
  });
}

/**
 * Create a pulsing/breathing effect for status messages
 */
export function breathingText(text: string): string {
  // Use gradient that pulses between purple and blue
  const purpleBlue = gradient(["#a855f7", "#3b82f6", "#8b5cf6"]);
  return purpleBlue(text);
}

/**
 * Create a vibrant success message
 */
export function successMessage(text: string): string {
  return chalk.green.bold(`✓ ${text}`);
}

/**
 * Create a vibrant info message
 */
export function infoMessage(text: string): string {
  return gradient(["#a855f7", "#3b82f6"])(`→ ${text}`);
}

/**
 * Create a vibrant prompt
 */
export function promptMessage(text: string): string {
  return gradient(["#a855f7", "#3b82f6"])(`\n${text}`);
}
