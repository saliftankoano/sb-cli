import figlet from "figlet";
import chalk from "chalk";
import gradient from "gradient-string";

/**
 * Create a vibrant, animated intro banner
 */
export async function showIntro(): Promise<void> {
  return new Promise((resolve) => {
    console.log("\n");
    // ASCII art with figlet
    figlet("StartBlock CLI", { font: "ANSI Shadow" }, (err, data) => {
      if (err) {
        // Fallback if figlet fails
        console.log(chalk.bold.cyan("\n╔════════════════════════════════╗"));
        console.log(chalk.bold.cyan("║        StartBlock CLI         ║"));
        console.log(chalk.bold.cyan("╚════════════════════════════════╝\n"));
        resolve();
        return;
      }

      // Create gradient effect (purple to blue, pink)
      const purpleBluePink = gradient([
        "#a855f7",
        "#3b82f6",
        "#8b5cf6",
        "#f72585",
      ]);

      console.log(purpleBluePink.multiline(data || "StartBlock CLI"));
      console.log("\n");

      // Tagline with figlet for bigger text
      figlet("Dev insights", { font: "Small" }, (err, taglineData) => {
        if (!err && taglineData) {
          const taglineGradient = purpleBluePink.multiline(taglineData);
          console.log(taglineGradient);
        }

        // Rest of tagline text
        const taglineText = purpleBluePink(" captured before 💩 hits the fan!");
        console.log(chalk.bold(taglineText));
        console.log(chalk.dim("  ──────────────────────────────────────\n"));

        // Small delay for dramatic effect
        setTimeout(() => resolve(), 500);
      });
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
