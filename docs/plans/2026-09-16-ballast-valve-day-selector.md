# Ballast valves: the day selector

Design for replacing the three day pills in the hero with three brass handwheels,
one per day, one open at a time. Decided and built 2026-09-16 with Aslan.

Read `CLAUDE.md` first, then `2026-09-16-submarine-cockpit-panel.md`. This
document assumes both.

## The one-sentence version

The day pills become a **ballast manifold**: three brass valve wheels in the hero,
and the open one is the day you are diving. Picking a day turns that valve open
and the previous one shut, and that quarter turn is the whole state change.

## Where the idea comes from

The HackIllinois 2026 schedule page (space theme) hangs three floating alien ID
cards down the left edge as its day selector. What makes it work is not the
floating: it is that the control is a physical object from the theme's world,
so choosing a day feels like picking something up. The ocean equivalent of a
tilted ID card is a valve on a submarine.

Considered and rejected before landing here:

- **Dive slates** (laminated day cards with a depth sparkline). Closest match to
  the ID cards and the most data-carrying, but Aslan preferred the valves as
  the more creative read of the brief.
- **Sonar contacts** on a scope in the cockpit. Already rejected outright in the
  cockpit plan: angle has no honest meaning in this data.
- **Surface buoys** with an anchor line down the list. The line would fight the
  sticky zone headers inside the scroll container.
- **A left-edge column**, mirroring the reference site's layout. Needs a new
  layout column and pushes the 780px list right for no gain: the hero already
  owns the day control.

## Decisions made, with the reasoning

1. **The valves live in the hero, replacing the pills.** `Chrome` keeps owning
   the day control. `SchedulePage`, `EventList`, and the cockpit do not change.
   Considered mounting them on the cockpit chassis as a manifold above the
   readouts. Rejected: the cockpit plan says the panel shows only what the card
   cannot and holds no state; the day is neither.

2. **One valve open at a time, and the turn is the state change.** The open
   valve sits a quarter turn from the closed ones. Selecting a day turns the new
   valve open and the old one shut, simultaneously. Considered a turn that scales
   with the day's depth (Friday spins furthest, Sunday barely moves): harder to
   read at a glance and harder to explain. Considered a flourish spin with no
   state in the rotation: that is the "motion with no meaning" that `CLAUDE.md`
   open decision 5 warns against. The manifold reading makes the rotation
   honest: only one tank floods at a time.

3. **Open turns counterclockwise.** Real valves open counterclockwise. The open
   wheel is at `rotate(-90deg)`, the closed wheels at `rotate(0)`. Worth saying
   out loud in the interview.

4. **Brass, confined to the handwheels, with no coral on them.** This amends
   decision 1 of the cockpit plan, which rejected a brass Nautilus cockpit
   because a warm metal hue competes with coral, the single accent. The
   amendment: brass is allowed on exactly three objects, the handwheels, and
   nothing else on the page. The open valve is marked by full brass against the
   dimmed brass of the closed valves, so coral and brass never sit on the same
   object. The story stays consistent: **brass is the sub's hardware, coral is
   the sub's instruments.** The cockpit itself stays a research-sub HUD.

   This adds one token, `--color-brass`, to `tokens.css`. The tokens are named
   after things in the water column; brass is the one thing on the page that
   is not water, because it is what the submarine is made of.

5. **CSS transition, not `motion`.** On this site state changes use CSS
   transitions (pill 300ms, depth bar 600ms, compass needle 600ms) and `motion`
   is reserved for the creatures' infinite loops. The valve turn is a state
   change, so it is `transition: transform 600ms ease`, matching the depth bar
   and compass. The global reduced-motion rule in `global.css` already snaps
   CSS transitions to zero, so under `prefers-reduced-motion` the wheels jump
   instead of turning with no extra code.

6. **The counts stay visible.** The pills showed the day label and its event
   count (20 / 17 / 4). Each valve keeps both on a small stamped plate under
   the wheel: label in Nunito 700, count in IBM Plex Mono, the same split the
   rest of the page uses between words and instrument readings.

7. **Hover only brightens.** A closed wheel brightens on hover at 300ms, the
   same as the pills did. No spin, no wobble on hover. The turn means something
   and hover is not a commitment.

8. **Arrow keys within the tablist.** The pills claimed `role="tablist"` and
   `role="tab"` but never wired Left and Right. Since the block is being
   rewritten, the valves get the keyboard behavior those roles promise. Small,
   and plainly missing.

## Anatomy

```
FRIDAY                                        ( open )  (closed) (closed)
                                              FRI  20   SAT  17  SUN   4
```

Each valve is one `<button>`:

- An inline SVG handwheel, 66px across: outer rim, five spokes, a hub with
  a hex nut. Drawn in `--color-brass` strokes, no fills except the hub. Same
  hand-drawn inline-SVG approach as the creatures; nothing in `public/`.
  (Amended later on 2026-09-16, at Aslan's call: the SVG was replaced by a
  generated raster, `public/wheel.png`, the same rim, five spokes, hub and
  hex nut in shaded brass, cut out on transparency and cropped square on its
  center so the CSS rotation still pivots on the hub. Rotation and the shut
  state's opacity work on the image unchanged. The cost is that the brass
  color no longer comes from the token; it is in the pixels.)
- Under it, the plate: day label (Nunito 700, 15px) and count
  (`--font-mono`, `--text-label`, 0.7 opacity), on one line.
  (Amended later on 2026-09-16: the wheel is 76px, and the hero aligns the
  headline and the manifold on their last baselines instead of their bottom
  edges, so the plate text sits on the same baseline as the zone name. The
  count was already gone by then; the plate reads `FRI 2/27`.)
- The wheel rotates about its own center (`transform-origin: center` on the
  `<svg>`). The plate does not rotate.

Layout in the hero is unchanged: the `h1` sits left, the manifold sits right,
`align-items: flex-end`. The manifold is as wide as the cockpit
(`--panel-width`) and the wheels, 66px at a 48px gap, cluster at its center,
so the manifold's midline is the panel's midline. (An edge-to-edge spread
across the panel's full width was tried and read as three separate
instruments.) The body row uses `space-between` so the panel stays on the
right gutter at any viewport width. The manifold is roughly 20px taller than the pills
were, so the hero grows by that and the list, which fills the remaining
viewport height, gets that much shorter. Friday still has about four screens of
scroll inside the container.

## States

The whole thing is one attribute, `data-active`, like every other state on the
site.

| State | Rotation | Brass | Plate |
|---|---|---|---|
| Closed | `0` | 0.55 opacity | 0.7 opacity |
| Closed, hovered | `0` | 0.85 opacity | 1 |
| Open | `-90deg` | 1 | 1, label weight 800 |

Transitions: `transform 600ms ease`, `opacity 300ms ease`. The 600 and 300 are
the site's existing durations, not new ones.

Focus: the button gets the same visible focus ring the cockpit's stop buttons
use. The SVG is `aria-hidden`; the visible plate text is the accessible name,
so no `aria-label` is needed.

## Files

| File | Change |
|---|---|
| `src/components/DayValves.tsx` | New. Three valves, `role="tablist"`, arrow-key handling. Props: `day`, `counts`, `onSelectDay`, the same three the pills took. |
| `src/components/DayValves.module.css` | New. Manifold row, wheel rotation and brass opacity by `data-active`, plate type. |
| `src/components/Chrome.tsx` | Lines 42-56 (the pills) become `<DayValves day counts onSelectDay />`. |
| `src/components/Chrome.module.css` | Lines 55-88 (`.pills`, `.pill`, `.count`) removed. |
| `src/styles/tokens.css` | Add `--color-brass` under Accents with a comment naming the amendment. |
| `src/lib/days.ts` | `DayInfo` gains `short` (`Fri`, `Sat`, `Sun`) for the plate; the full label still drives the hero `h1`. |
| `src/components/SchedulePage.module.css` | Remove `--chrome-fg-inverse`; only the pills consumed it. |
| `CLAUDE.md` | File map gets `DayValves.tsx`; Page anatomy's "day pills" become "ballast valves"; open decision 5 gains a note that the valves are the worked example of motion with meaning. |
| `docs/plans/2026-09-16-submarine-cockpit-panel.md` | Decision 1 gets a one-line pointer to this document's decision 4. |

No new dependency. No new test file: there is no pure logic here, and the
project tests pure functions only.

## Data flow

Unchanged. `SchedulePage` owns `day`; `selectDay` sets it and clears hover and
reading state; `EventList` remounts on `key={day}`. `DayValves` calls
`onSelectDay(key)` on click and on arrow key, and reads `day` to set
`data-active`. It holds no state.

## Verification

Dev server at 1440x900, checked in the browser:

1. Three wheels in the hero, right of the day name. Friday open at a quarter
   turn counterclockwise, Saturday and Sunday closed and dimmed.
2. Plates read FRI 20, SAT 17, SUN 4.
3. Click Saturday: Saturday turns open and Friday turns shut over the same
   600ms; the list remounts on Saturday; the porthole course redraws.
4. Left and Right arrows move the open valve; focus follows.
5. With `prefers-reduced-motion` on, wheels jump between states with no turn.
6. No coral anywhere on the manifold. Coral still marks the active card and
   active stop only.
7. `npm run typecheck` and `npm test` pass; the existing tests are untouched.
