# The Submarine Cockpit: right-column panel

Design and implementation plan. Decided 2026-09-16 with Aslan. Supersedes the
"Journey Panel" described in `CLAUDE.md` (the winding dotted path with one stop
per event, which was too close to the reference site's Map of Atlantis).

Read `CLAUDE.md` first. This document assumes it.

## The one-sentence version

The right column becomes the **front of a glass submarine**: a porthole onto the
water with the day's course etched on the glass, over a cluster of instrument
readouts. Everything it shows is a pure function of the active event, which the
page already computes.

## Why this and not the reference site's map

The reference (`hackillinoisschedule.vercel.app`) puts an illustrated Map of
Atlantis in the right column with 14 numbered pins and lights the matching pin
on card hover. `CLAUDE.md` already names its seams, verified with Playwright:

| Reference seam | What the cockpit does |
|---|---|
| 14 pins hardcoded in static SVG; Friday's last 5 events get none | Stops generated from the day's events. Friday plots 20, Saturday 17, Sunday 4 |
| Saturday shows the identical island and pin positions as Friday | Route geometry comes from each event's depth, so every day draws a different course |
| Pin spacing carries no information | Vertical position is `depthForTime`, the same function that drives the backdrop |
| Hover lights a pin, and that is all | Two-way: hover a stop to light its card, click a stop to scroll the list to it |
| No conflict indication anywhere | `SONAR` readout counts events running concurrently with the active one |

The difference in kind: theirs is an illustration that reacts, this is an
instrument that reads. That is the answer to "isn't this the same as the site
you were shown" in the interview.

## Decisions made, with the reasoning

Each of these was chosen over stated alternatives. Do not silently revisit them,
but they are all defensible out loud, which is the bar `CLAUDE.md` sets.

1. **Research-sub HUD, not brass Nautilus.** Thin dark frame, hairline rules,
   IBM Plex Mono readouts. A riveted brass cockpit would introduce a warm metal
   hue that competes with coral, and coral is the single accent. Chosen so the
   panel reads as the same design system as the glass cards. Amended the same
   day: brass is allowed on exactly three objects, the day valves in the hero,
   and never beside coral. See `2026-09-16-ballast-valve-day-selector.md`,
   decision 4. The cockpit itself stays a research-sub HUD.
2. **Big porthole, plain readouts.** Considered turning the depth gauge into a
   full vertical dive-profile chart. Rejected: it wanted the whole column and
   the window is the idea. Depth is a number plus a small fill bar.
3. **The course plot is etched on the porthole glass**, not given its own
   bezel below the window and not run as a rail down the chassis edge. Costs no
   extra vertical space, and lines drawn over a live scene read unmistakably as
   an instrument overlay rather than a picture of a map.
4. **The porthole gets its own denser scene.** `CLAUDE.md` planned creatures on
   a fixed full-viewport stage drifting behind the cards. That is a legibility
   risk against 780px of text. The marine life moves into the window; the page
   backdrop stays quiet water. **This changes `CLAUDE.md` and that file should
   be updated when this lands.**
5. **No clock, no live time, no demo scrubber.** The dataset ran Feb 27 to
   Mar 1 2026 and is in the past, so anything saying "happening now" renders
   empty on demo day. Considered a scrubbable dive clock and a pinned fake
   "now". Both rejected. The cockpit reflects the hovered event, exactly like
   the reference site does. **This closes open decision 1 in `CLAUDE.md`.**
6. **The cockpit does not repeat the card.** `EventCard.tsx` already renders
   title, time, duration, location, points and the full description. The
   cockpit shows only what the card cannot: depth, zone, position in the day,
   concurrency, and heading.

### Rejected outright

- **Sonar scope** (circular sweep, blips by angle). Angle has no honest meaning
  in this data, so the sector assignment would be arbitrary.
- **Destination diorama** (porthole shows a sunken silhouette of the event's
  building). Only three distinct coordinate pairs exist, so 37 of 40 events
  would show the identical scene.

## Anatomy

The existing 476px `aside` in `SchedulePage.tsx`, full height of `.body`.

```
╭─────────────────────────────────╮
│  ╭───────────────────────────╮  │   porthole, ~2/3 height
│  │  ○──╗      ≈      ≈       │  │   its own creature scene
│  │      ║○─┐    ≅            │  │   course etched on the glass
│  │   ◉   └─●◄ active         │  │   active stop in coral
│  │         ┌─○     ≈         │  │
│  │    ≈  ○─┘    ◉            │  │
│  ╰───────────────────────────╯  │
│                                 │
│  STOP        ix / xx            │   readout cluster, ~1/3
│  DEPTH       200 m  ▓▓▓░░░      │
│  ZONE        TWILIGHT           │
│  HEADING     ON STATION         │
│  SONAR       2 events           │
╰─────────────────────────────────╯
```

### Chassis

`--glass-panel` (`rgba(6,28,42,0.55)`), `--radius-panel`, a 1px
`rgba(232,237,239,0.14)` border, and an inner hairline inset that reads as the
frame of the window. Recolors with `data-zone` like the rest of the chrome:
text is `--color-ink` in the sunlit zone and `--color-bone` below.

### Porthole

Rounded rect, `overflow: hidden`, inner shadow at the rim so the glass has
thickness. Inside, in z-order:

1. Water. Same four stacked gradient layers as `Backdrop`, driven by the same
   `layerOpacities(depth)`, so the window always matches the page exactly.
2. Creature scene for the current zone, per the table in `CLAUDE.md`: fish
   school / turtle / caustics / bubbles at the surface, jellyfish / squid /
   marine snow in twilight, anglerfish with a lit lure in midnight, gulper eel
   and sparse specks in the abyssal. Creatures animate with `motion`, transform
   and opacity only, and respect `prefers-reduced-motion`.
3. The course plot, etched.

Creatures are kept dim (roughly 0.45 opacity) so the etched lines stay legible
over them. That is the whole reason the page backdrop gets quieter.

### The course plot

An SVG overlay in the porthole's coordinate space. A dotted course line
connecting one stop per event in the day.

- **Vertical position is real.** `y` comes from `depthForTime(event.startTime)`
  mapped across the porthole's usable height. Friday's course descends. Sunday
  opens in twilight for the 6 AM deadline and **climbs** into the showcase,
  because `depthForTime` says so. Nothing special-cases Sunday.
- **Horizontal position is for legibility only,** and the code should say so in
  a comment. `x` is a serpentine sweep across the window driven by the stop's
  ordinal index, which spreads out stops that sit at similar depths and makes
  the route read as a journey rather than a column of dots.
- **Collision pass.** Friday bunches 9 events into the twilight zone, so raw
  depth positions collide. After computing `y`, run one pass that pushes any
  stop closer than 22px to its predecessor down by the shortfall, then rescale
  to fit. Deterministic, ten lines, easy to explain.
- **States.** Passed stops are `--color-bone` at low opacity, the active stop
  is `--color-coral` and larger with a soft ring, ahead stops are
  `--color-biolum` hairlines. The course line between passed stops is solid;
  ahead of the active stop it is dotted.
- The active stop carries the event name and start time in a small label at the
  bottom of the porthole, not floating next to the dot, so it never collides.

### Readout cluster

Label left in `--color-silt`, value right in IBM Plex Mono. One row each.

| Readout | Value | Source |
|---|---|---|
| `STOP` | `ix / xx` | `toRoman(index+1)` and the day's length, both already available |
| `DEPTH` | `200 m` plus a thin fill bar | Discrete label from `ZONES[zone].depthLabel`; bar width is `depthForTime` |
| `ZONE` | `TWILIGHT` | `ZONES[zone].label`, uppercased |
| `HEADING` | `ON STATION` or `212° · 180 m` | New. See below |
| `SONAR` | `2 events` or `alone` | New. See below |

## The two new calculations

Both belong in new pure modules under `src/lib/` with Vitest coverage, matching
the one-responsibility-per-file rule in `CLAUDE.md`.

### `src/lib/bearing.ts`

`CLAUDE.md` writes off the lat/long as useless because it resolves buildings,
not rooms. A compass is exactly a building-resolution instrument, so this is the
honest use of the field.

- `homeCoordinate(events)`: the modal lat/long pair across all events. Computed
  from the data, not hardcoded. In the live data this is Siebel CS with 37 of 40
  located events.
- `bearingFrom(home, target)`: standard initial great-circle bearing in degrees.
- `distanceMeters(home, target)`: haversine.
- `headingFor(event, home)`: returns `{ kind: 'on-station' }` when the event has
  no location or is within 25m of home, otherwise
  `{ kind: 'bearing', degrees, meters }`.

The needle sits at `ON STATION` nearly all day and swings only for the two
Siebel Center for Design events and the one at Sidney Lu. **That is the feature,
not a bug:** the needle moving means you have to leave the building. Say that in
the code comment, because it is the first thing an interviewer will ask.

The compass face itself is a small dial next to the readout row. When on
station it shows a filled centre dot and no needle.

### `src/lib/concurrency.ts`

- `concurrentWith(event, events)`: count of other events in the same day whose
  `[startTime, endTime)` overlaps the active event's. Zero-duration events (the
  submission deadline) overlap anything containing that instant.

Reads `alone` at 0, `1 event` at 1, and spikes to `3 events` at the 7:30 PM
track introductions, which `CLAUDE.md` records as the only 4-way concurrency in
the schedule. That is the one moment of the hackathon where an attendee has to
choose, and nothing else on the page surfaces it.

## Interaction

The page keeps exactly one piece of state. `SchedulePage.tsx:23` already derives
`activeId` as hovered, else reading line, else first. The cockpit is downstream
of it and adds no state of its own.

- **Card hover lights the stop.** Free. `activeId` already flows down.
- **Stop hover lights the card.** The stop calls the same `setHoveredId` the
  cards call. `SchedulePage` passes `onHoverChange` to the panel unchanged.
- **Stop click scrolls the list to that event.** `EventList` gains a
  `useImperativeHandle` exposing `scrollToEvent(id)`, which does
  `node.scrollIntoView` adjusted by `READING_LINE_PX` so the target lands on the
  reading line rather than the top edge. Chosen over threading a
  `scrollToEventId` prop because the same id clicked twice has to re-scroll, and
  a prop would need a nonce alongside it.

Accessibility: the porthole scene is `aria-hidden`. The course plot is a `<ul>`
of buttons visually positioned by the SVG, so stops are keyboard reachable and
announce their event name. Readouts are a `<dl>`.

## Files

| File | Status | Owns |
|---|---|---|
| `src/lib/bearing.ts` | new | Home coordinate, bearing, distance, heading state |
| `src/lib/bearing.test.ts` | new | Known bearings, the on-station threshold, missing locations |
| `src/lib/concurrency.ts` | new | Overlap count, including zero-duration events |
| `src/lib/concurrency.test.ts` | new | The 7:30 PM 4-way case, adjacent-not-overlapping, zero-duration |
| `src/lib/course.ts` | new | Stop geometry: depth to y, serpentine x, collision pass |
| `src/lib/course.test.ts` | new | Sunday ascends, minimum separation holds, bounds respected |
| `src/components/Cockpit.tsx` | new | The panel. Chassis, composition, nothing else |
| `src/components/Porthole.tsx` | new | Window, water layers, creature scene |
| `src/components/CoursePlot.tsx` | new | The etched SVG and its stop buttons |
| `src/components/Readouts.tsx` | new | The five rows and the compass dial |
| `src/components/Creatures.tsx` | new | Per-zone creature sets, `motion` animation |
| `src/components/SchedulePage.tsx` | edit | Replace the empty `aside` with `<Cockpit>`; hold the list ref |
| `src/components/EventList.tsx` | edit | `useImperativeHandle` with `scrollToEvent` |
| `src/components/Backdrop.tsx` | edit | Nothing structural; confirm it stays creature-free |
| `CLAUDE.md` | edit | Replace the Journey Panel section; close open decision 1 |

## Build order

Each phase should end green on `npm test`, `npm run typecheck`, `npm run build`.

1. **Pure functions first.** `bearing.ts`, `concurrency.ts`, `course.ts` with
   their tests, written against the real event shapes. No UI. This is where the
   interview-defensible logic lives, so it gets tests before pixels.
2. **Chassis and readouts.** `Cockpit.tsx` plus `Readouts.tsx` wired to
   `activeId`. Empty rounded rect where the porthole goes. At this point the
   panel is already useful and every number on it is real.
3. **Course plot.** `CoursePlot.tsx` over the empty rect. Stop states, the
   active label, hover and click wiring, `EventList.scrollToEvent`.
   Verify: switch to Sunday and confirm the course climbs.
4. **Porthole water.** Gradient layers sharing `layerOpacities`, rim shadow,
   glass. Verify the window matches the page at every depth.
5. **Creatures.** `Creatures.tsx` per zone, dimmed under the etched lines.
   Last because it is the only part that is pure decoration and the only part
   safe to cut if time runs short.

## Acceptance checks

Run against the live API, not fixtures.

- Friday plots 20 stops, Saturday 17, Sunday 4.
- Sunday's course rises from its first stop to its last. Friday's and
  Saturday's descend.
- No two stops on any day sit closer than 22px vertically.
- Hovering any card lights exactly one stop; hovering any stop lights exactly
  one card.
- Clicking the last stop on Friday scrolls that card to the reading line and it
  becomes active.
- `HEADING` reads `ON STATION` for the Siebel CS events and shows a bearing and
  distance for the three events elsewhere.
- `SONAR` reads `3 events` on each of the four 7:30 PM track introductions.
- `DEPTH` and `ZONE` in the cockpit always agree with the page backdrop.
- `prefers-reduced-motion` stops creature animation; the course plot and
  readouts still update.

## Left open for Aslan

- The compass sits still for most of the day. It is defensible as written, but
  if it feels dead, the fallback is to drop `HEADING` and let `SONAR` and
  `STOP` carry the cluster.
- Whether the porthole gets a subtle parallax on pointer move. Cheap, and it
  sells the glass, but it is motion with no meaning.
- Type filtering and search remain undesigned and are out of scope here.
