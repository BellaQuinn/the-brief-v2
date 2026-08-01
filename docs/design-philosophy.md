# The Brief — Design Philosophy

Every design decision in this product gets checked against the principles below. This document is the durable reference — update it deliberately when the philosophy itself changes, not casually when a single screen does.

## Brand Principles

The Brief should feel like software built for people with important missions. Every interface decision should reduce cognitive load while increasing confidence. The visual language should communicate intelligence, precision, trust, momentum, and preparation. Avoid aesthetics that feel theatrical, retro, or performative. Avoid unnecessary visual clutter. Every element should feel intentional.

## Intelligence Console

The Brief should not imitate a Linux terminal, and it should not imitate traditional enterprise software either. It draws from cybersecurity operations, intelligence analysis, executive dashboards, case management, and premium productivity software — but the goal is for the result to be immediately recognizable as *The Brief*, not as an homage to any one of those.

## Hacker DNA

The terminal remains part of the product's personality, but it no longer dominates the interface. Command-line-inspired interactions become memorable moments rather than a permanent aesthetic — application startup, generating a Mission Brief, long-running operations, successful completion of major workflows. The primary interface stays calm, premium, and highly readable the rest of the time.

## Mission First

Every workspace should answer four questions immediately: Where am I? What requires my attention? Am I making progress? What should I do next? If an interface element doesn't help answer one of those, reconsider whether it belongs.

## Its own identity, not an homage

Mockups, specs, and the current app are inspiration, not a ceiling. The goal is for someone to open The Brief and recognize it as *The Brief*, not as a copy of Linear, Warp, Notion, or whatever reference inspired a given pass. Where a sharper option strengthens that identity without breaking the philosophy or any existing functionality, take it and note the change at review rather than defaulting to the literal spec.

## Silence Is a Feature

A genuinely clear day should read as calm and earned, not as an empty or broken state. Don't manufacture urgency, invented stats, or filler UI to make a quiet screen feel busier than it is. The absence of anything demanding attention is itself a piece of information worth stating plainly — see The Brief's Voice, rule 6.

## The Brief's Voice

The product speaks like a trusted chief of staff, not a dashboard. This governs every workspace, not just the Brief itself:

1. **Lead with status, not data.** "On track." before "two items due."
2. **Always name one next action.** The user should never have to infer what to do from a pile of numbers.
3. **No dead numbers.** Every figure ships with a plain-language read of what it means.
4. **Confidence over urgency.** Color still marks true urgency (amber/red); language never spikes into alarm. "Get ahead on X," never "X is due soon!"
5. **The system talks about itself sparingly, but specifically.** Named subsystems, not generic "loading."
6. **Silence is a feature.** On a clear day, say so plainly and let it land.

Corollary: every claim in the product's voice must be checkable against real data. "Nothing urgent" is only said when nothing due is actually flagged urgent; a status word is only as confident as the number backing it. Never let copy assert more certainty than the underlying data supports.

## Locked phrases

**"ready when you are, Operator."** — the console sign-off. This phrase does not get rewritten once shipped. Consistency here is the point: it's the one line that should become recognizably The Brief's, the way a specific sign-off becomes a brand's voice.

## Momentum — deferred

A "Momentum" read (e.g. Building / Steady / Excellent / Losing ground) was designed as part of the Mission Brief concept but is intentionally **not implemented** until it can be backed by a real multi-week trend computation (on-time submission rate, application pipeline movement, etc.). Do not add a Momentum line with a hardcoded or vibes-based value — that violates rule 3 above and the project's explicit stance: the app does not invent confidence. If it says the user is doing well, real data has to prove it first.
