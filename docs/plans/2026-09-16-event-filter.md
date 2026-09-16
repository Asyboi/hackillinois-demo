# Event filter: zones and types

Design for the filter on the event list. Built 2026-09-16 from Aslan's brief:
"a filter for the events listing, the different zones and the event types,
that is all." It began as a bar of chips above the list; Aslan then asked for
it folded behind a `FILTERS` button (from a sketch: rounded button, the word
in capitals, a three-bar filter icon, a dot on the corner) and for that button
to sit next to the zone name. Decisions 1 and 9 are Aslan's; the rest were
made without a design session, so each lists what it was chosen over.

Read `CLAUDE.md` first. This document assumes it.

## The one-sentence version

A `FILTERS` button on the zone name's row opens a narrow column of toggle
chips under it, zones over types, over the list; the list, and therefore the
cockpit, shows only the events that pass.

## Decisions made, with the reasoning

1. **A disclosure in the hero, on the zone name's row** (Aslan, 2026-09-16).
   The button sits at the right end of the headline's box, which is as wide
   as the list, so its right edge is the list's right edge, the way the
   valves' box is as wide as the cockpit. Its bottom edge sits on the
   headline's baseline, level with the zone name's letters and the valve
   plates (Aslan asked for the three bottom-aligned). The hero aligns its
   children on text baselines, which would have put the button's text on
   the line and left its box hanging 9px below; the box rises by exactly its
   bottom padding and border, and the panel drops by the same amount so it
   opens where it did. It sat right after the word for a moment, like a
   tag, and moved with the name's width; Aslan moved it to the edge the same
   day. Before the fold the chips were an always-visible
   glass bar at the top of the list's column, which cost the list about 100px
   of height at 1440x900. Folded away, the list has its full height back and
   the hero gains the one control the day valves did not cover.

   The panel is a 200px column hanging from the button, right edges
   together, so it also ends on the list's right edge (Aslan asked for
   vertical rather than horizontal the same day). The two groups stack, each
   a term heading its chips listed one per line, text at the left, and
   "Clear" is the last line. It was briefly a full-width bar of two chip
   rows hanging from the headline box; the column reads as a menu and
   covers only the right third of the top cards. The hero's z-index was
   raised above the body's so the panel paints over the list.

   Whether the panel is open lives in `EventFilter`, not `SchedulePage`. It is
   the one piece of state the page does not hold; nothing else derives from
   it, so it stays presentational. Escape closes the panel and returns focus
   to the button; so does a pointer down anywhere outside. The filter itself
   is untouched by closing.

2. **Toggle chips, any number on, and an empty group means "any".** Within a
   group the selection is an OR (Meal or Workshop), across groups an AND (a
   meal in the twilight zone). Nothing on shows everything, so there is no
   "All" chip to keep in sync, and the resting state of the bar is quiet.
   Considered single-select per group with an "All" chip: simpler state, but
   "meals and workshops" is the most likely real question and it needs two
   chips on at once. A "Clear" link appears at the right of the first row only
   while something is on.

3. **The filter is applied in `SchedulePage`, before anything derives from
   the list.** The cockpit plots the filtered course, the stops renumber, and
   the `DEPTH` meter steps through the remaining stops. Considered leaving the
   cockpit on the full day and ghosting the filtered-out stops: richer, since
   you would see where the workshops sit in the whole day, but then the
   active index, the depth soundings and the zone runs would mean different
   things in the two columns, and clicking a ghosted stop would have no card
   to scroll to. One list that everything derives from is the architecture
   `CLAUDE.md` asks to be able to explain.

4. **Changing the filter forgets the active card and remounts the list at the
   top,** the same as switching days. The list is keyed by day plus the
   filter's contents. Considered keeping the scroll position: the cards under
   it have changed, so the position means nothing.

5. **The filter survives a day switch.** You set "Meal" and turn the valves
   to see each day's meals. Clearing it is one click.

6. **An empty result shows "Empty water" in the list** and the cockpit goes
   blank: `STOP` reads a dash, `DEPTH` 0/0 m, no course. Sunday has no
   abyssal events and no workshops, so this state is reachable in the demo.

7. **The look is borrowed, not new.** The button is card glass with bone
   text in the valve plate's voice (Nunito 900, spaced capitals) and fills
   with ultramarine while open, the same language as a chip that is on. The
   panel is the card's shape in denser glass with a backdrop blur, because it
   sits over card text rather than open water. The chips are the card chip's
   shape and voice (Nunito 800 at label size, 8px radius, 28px tall), hollow
   at rest with the glass border, and filled with ultramarine when on, the
   page's one color for "active". The row terms `ZONE` and `TYPE` are the
   cockpit's term voice, small spaced capitals in silt. "Clear" is the map
   link's treatment. No new tokens.

8. **Pure logic in `src/lib/filter.ts` with Vitest coverage.** `filterEvents`
   returns the same array when nothing is selected, so an unfiltered day keeps
   its identity and the list does not re-measure. `toggle` never mutates.

9. **A dot, not a count, says something is applied** (from Aslan's sketch).
   A 7px bone circle on the button's top right corner while the panel is
   shut. Bone rather than biolum, which the palette keeps for deep-zone
   light, and rather than ultramarine, which would vanish against the button
   when it is open. Considered a count ("Filters · 2"): more information,
   but the sketch showed a dot and the panel is one click away.

## Verified

Against the live API in Chrome at 1440x900, 2026-09-16: Friday shows 20 cards
and 20 stops with nothing on; Twilight plus Meal narrows it to Dinner alone and
the hero, course plot and readouts follow; Sunday under the same filter shows
"Empty water"; Clear restores Sunday's four; Workshop alone gives 5, Midnight
alone gives 6, and toggling back restores each. After the fold: the panel
opens as a column under the button, right edge on the list's right edge at
852px, the button fills while open, a click outside closes it with the filter
kept and the dot showing, Escape closes it and returns focus to the button.
No console errors.
