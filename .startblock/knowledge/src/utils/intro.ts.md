---
filePath: src/utils/intro.ts
fileVersion: 73caec7ca66a98f267aa4ae1de89f334c7f2c911
lastUpdated: '2025-11-16T03:56:30.603Z'
updatedBy: sb-cli
tags:
  - src
  - utils
  - typescript
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
---
# Documentation for `src/utils/intro.ts`

## Purpose
This file provides utility functions to create visually appealing console output, primarily for introducing the StartBlock CLI application. It enhances user experience by displaying ASCII art and colorful messages.

## Key Functionality
- **`showIntro()`**: Asynchronously displays an introductory banner with ASCII art and a tagline, utilizing gradient colors for visual appeal. It includes a fallback mechanism if ASCII art generation fails.
- **`breathingText(text: string): string`**: Returns a pulsing gradient effect for status messages.
- **`successMessage(text: string): string`**: Formats a success message in bold green text.
- **`infoMessage(text: string): string`**: Formats an informational message with a gradient effect.
- **`promptMessage(text: string): string`**: Formats a prompt message with a gradient effect.

## Gotchas
- **Error Handling in `showIntro()`**: If the `figlet` library fails to generate ASCII art, the function falls back to a simple text output. Ensure that the fallback is visually acceptable and does not disrupt the user experience.
- **Asynchronous Behavior**: The `showIntro()` function returns a promise. If you forget to await this function when calling it, subsequent code may execute before the intro is fully displayed, leading to a jarring user experience.
- **Gradient Colors**: The choice of colors for gradients is crucial for visibility. Ensure that the colors used are legible against the terminal background, especially for users with color vision deficiencies.

## Dependencies
- **`figlet`**: Used for generating ASCII art text. This library enhances the visual aspect of the CLI intro, making it more engaging.
- **`chalk`**: Provides a way to style terminal output with colors and styles, improving readability and user engagement.
- **`gradient-string`**: Allows for the creation of colorful gradient text, which adds a modern touch to the CLI interface.

## Architecture Context
This utility file is part of the StartBlock CLI application, which aims to streamline developer onboarding. The visually appealing console output serves to capture user attention and convey important information effectively. It fits into the larger system by enhancing user interaction and providing a welcoming interface.

## Implementation Notes
- **Visual Consistency**: The introduction uses a consistent color scheme (purple, blue, and pink) across different messages to create a cohesive visual experience.
- **Performance Considerations**: The use of asynchronous functions allows for non-blocking execution, which is important for maintaining responsiveness in CLI applications. However, excessive use of `setTimeout` for delays can lead to a perception of sluggishness if not managed properly.
- **Tagline Customization**: The tagline is generated using `figlet` for larger text, which may impact performance if the font is complex. Consider optimizing or caching results if this function is called frequently.
- **Common Mistakes**: Ensure that any changes to the gradient colors or text styles are tested across different terminal emulators, as rendering may vary.

## Developer Insights

Decided to improve the text displayed during the intro, I added a command as well to simulate the intro, you can now trigger it using sb sim-intro. Figlet works well for the nice fonts. Nothing tricky to report.

*Captured during commit: chore: remove deprecated Husky v9 lines from pre-commit hook*
