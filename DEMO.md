# sb-cli Team Demo Script

A 5-minute demo showing how sb-cli captures developer knowledge on every commit.

## Setup (Do this before the demo)

```bash
# Create a demo project
mkdir sb-cli-demo && cd sb-cli-demo
git init
npm init -y

# Install and initialize sb-cli
npm install -g @startblock/cli
sb init
# Enter your OpenAI API key when prompted
```

## Demo Script

### 1. The Problem (30 seconds)

**Say:** "When developers leave or switch projects, their knowledge goes with them. Future devs waste time rediscovering gotchas and context. Let me show you how sb-cli solves this."

### 2. Create a File with Hidden Complexity (1 minute)

Create `src/payment-processor.js`:

```javascript
/**
 * Process payment with retry logic
 */
export async function processPayment(amount, userId) {
  // IMPORTANT: Must use Math.floor, NOT Math.round!
  // Stripe expects integers (cents), and rounding can cause
  // $10.99 to become $11.00, overcharging customers by 1 cent
  const amountInCents = Math.floor(amount * 100);

  // Retry 3 times with exponential backoff
  // Why 3? Because Stripe recommends it, and we learned the hard
  // way that 2 retries isn't enough during payment processor hiccups
  for (let i = 0; i < 3; i++) {
    try {
      const result = await stripe.charges.create({
        amount: amountInCents,
        currency: "usd",
        source: userId,
      });
      return result;
    } catch (error) {
      if (i === 2) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

**Say:** "This looks like a simple payment function, but there are critical gotchas here that AI wouldn't know."

### 3. Stage and Commit (2 minutes)

```bash
git add src/payment-processor.js
git commit -m "feat: add payment processing with retry logic"
```

**Show:**

1. ✅ AI analyzes the file automatically
2. 📦 Styled box shows "Preparing commit..." with file count
3. ❓ "Want to add your insights? [y/N]:" → Type `y`
4. ✨ Beautiful wizard prompt appears

**Type this insight when prompted:**

```
Critical gotcha: Math.floor is NOT a typo! We initially used Math.round and
overcharged customers by 1 cent on amounts like $10.99. Lost $2,400 before
we caught it. Also, 3 retries came from a painful incident where 2 wasn't
enough during a Stripe outage. Cost us 50 failed transactions.
```

Press Enter twice to submit.

**Show:** 5. ✅ AI enhances knowledge docs with your insights 6. 📚 "3 knowledge file(s) ready to commit!" 7. 🚀 Confirm with `y` - everything commits together

### 4. Show the Knowledge File (1 minute)

```bash
cat .startblock/knowledge/src/payment-processor.js.md
```

**Point out:**

- 📝 AI generated: purpose, dependencies, functions
- 💡 **Your insights**: The Math.floor gotcha and retry count reasoning
- 🏷️ Metadata: tags, importance, version

**Say:** "Notice how your insight is woven in naturally. Future developers will know WHY we made these choices, not just WHAT the code does."

### 5. The Payoff (30 seconds)

**Show the directory structure:**

```bash
tree .startblock/knowledge/
```

```
.startblock/knowledge/
└── src/
    └── payment-processor.js.md
```

**Say:**

- ✨ "Knowledge mirrors your code structure - easy to find"
- 🔄 "Updates automatically on every commit"
- 🚀 "No meetings, no Notion docs to maintain"
- 🧠 "Captures the WHY, not just the WHAT"

## Key Points to Emphasize

1. **Opt-in**: Lazy devs can skip if they're in a rush (just hit Enter)
2. **One question**: No lengthy interview, just one brain dump
3. **Natural input**: Type freely, submit with 2 empty lines
4. **Sacred words**: Your informal language is preserved exactly
5. **Zero maintenance**: Works through Git hooks, no extra steps

## Expected Questions

**Q: "Won't this slow down commits?"**
A: Only if you opt in. Skip with Enter if you're in a rush. Most devs find it faster than writing comments.

**Q: "What if I don't have insights?"**
A: Just hit Enter to skip. AI-only analysis is still valuable documentation.

**Q: "Do we need Notion/Confluence anymore?"**
A: This complements them. This is for code-level gotchas and context, not high-level architecture.

**Q: "What about the cost of OpenAI API?"**
A: We use `gpt-4o-mini` - typically $0.02-0.05 per commit. Way cheaper than the time wasted rediscovering knowledge.

## Bonus: Show Interactive Features

If you have time, demonstrate:

```bash
# Preview the intro animation
sb sim-intro

# Show help
sb --help
```

## One-Liner Value Prop

**"sb-cli is like having every developer leave detailed notes for their future teammates - automatically, on every commit, with zero extra meetings."**

---

**Demo Time**: ~5 minutes  
**Questions**: ~5 minutes  
**Total**: ~10 minutes
