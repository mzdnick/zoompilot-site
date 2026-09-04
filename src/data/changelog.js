/*
 * zoompilot release notes. The site is the canonical source; the wiki's
 * releases page is generated from this data (see scripts/sync-wiki.mjs
 * and the TODO at the top of the wiki's releases/changelog.md).
 *
 * Shape: one entry per release, newest first.
 *   ver     — what the device home screen shows (version.h on main).
 *             null for pre-channel releases that never had a version.
 *   date    — ISO date, also the <time> label.
 *   title   — optional release headline.
 *   summary — optional one-liner under the title.
 *   items   — change lines. Each item is { html, sub? } where html is a
 *             trusted inline-HTML string (own content, not user input)
 *             and sub is an optional array of nested items.
 */

export const installUrl = "zoompilot/main";

export const repo = {
  github: "https://github.com/zoompilot/zoompilot",
  commits: "https://github.com/zoompilot/zoompilot/commits/main",
  discord: "https://discord.gg/jFWkHC2uhh",
  /* the wiki's live host today. wiki.zoompilot.ai is the intended
   * final home but does not resolve yet; flip this one line back when
   * the domain goes live. */
  wiki: "https://zoompilot-wiki.pages.dev",
};

/* last known build on main. Refresh with: npm run stamp
 * (scripts/stamp.mjs); the page also refreshes it at runtime from the
 * GitHub API and keeps this value when offline. */
export const build = { sha: "393a506e61", date: "2026-08-25" };

export const releases = [
  {
    ver: "2026.08.25-8",
    date: "2026-08-25",
    items: [
      {
        html: `<b>Fingerprint Mazdas on VIN and EPS.</b> Supports more Mazda
          models more reliably by using the VIN for fingerprinting. EPS
          fingerprinting determines whether an EPS-swapped car can steer to
          zero. By <a href="https://github.com/mzdnick">@mzdnick</a>.`,
      },
      {
        html: `<b>zoompilot branding in the UI.</b> By
          <a href="https://github.com/mzdnick">@mzdnick</a>.`,
      },
      {
        html: `<b>Speed-limit assist on metric cars.</b> Fixed reading speed
          limits on cars set to km/h.`,
      },
      {
        html: `<b>Updated speed-dependent torque seeds.</b> Refreshed the
          seeds using my latest learned values. Self-tune may converge a
          little faster now.`,
      },
      {
        html: `<b>Comma 4 toggles for new sunnypilot features.</b>
          Screensaver and road edge lane change.`,
      },
      {
        html: `<b>Synced sunnypilot as of 2026-08-24.</b> See the
          <a href="https://docs.sunnypilot.ai">sunnypilot docs</a>.`,
        sub: [
          { html: `<b>Block lane changes at road edge.</b> Prevents a lane
            change from activating when the road&rsquo;s edge is detected.` },
          { html: `<b>Jerk-aware steering.</b> A torque controller that tries
            to solve for jerky steering. This doesn&rsquo;t seem to improve
            anything for Mazdas; it hurts performance because
            speed-dependent torque already solves for this.` },
          { html: `<b>Support for comma&rsquo;s chestnut eGPU.</b>` },
          { html: `The driving path changes color with what the car is doing
            and keeps its width when you override with gas or steering.` },
          { html: `The &ldquo;openpilot unavailable&rdquo; flash at startup is
            fixed.` },
          { html: `New screensaver function.` },
          { html: `Switching models no longer asks to reset calibration.` },
          { html: `AGNOS 19.6.` },
        ],
      },
      {
        html: `<b>Alpha longitudinal only.</b>`,
        sub: [
          { html: `Improved stop and go, but not totally fixed. Cruise may
            disengage after stopping for a lead car.` },
          { html: `The bogus &ldquo;Cruise Fault: Restart the Car&rdquo; on a
            cold start is gone. The fault alert now only fires when the radar
            genuinely drops out mid-drive.` },
          { html: `Fixed canceling cruise whilst braking. Thank you
            <a href="https://github.com/mzdnick">@mzdnick</a>.` },
          { html: `Alpha longitudinal enabled on EPS-swapped models (CX-9).` },
        ],
      },
    ],
  },
  {
    ver: "2026.08.02-5",
    date: "2026-08-02",
    title: "Alpha longitudinal handoff",
    summary:
      "More reliable handoff when you override acceleration with the pedal, and more reliable stop and hold.",
  },
  {
    ver: "2026.08.01-4",
    date: "2026-08-01",
    title: "First release on the zoompilot channel",
    summary:
      "zoompilot has its own home, its own build, and the biggest batch of changes yet.",
    items: [
      {
        html: `<b>New home, new install URL.</b> The fork lives at
          zoompilot/zoompilot and installs from
          <code>zoompilot/main</code>. If you are already running zoompilot
          you don&rsquo;t need to do anything: your device repoints itself
          on its next start.`,
      },
      {
        html: `<b>Prebuilt releases.</b> Every release is built ahead of time
          on a real comma device, so installing no longer means sitting
          through the better part of an hour of compiling.`,
      },
      {
        html: `<b>Alpha longitudinal on the CX-5.</b> openpilot can drive the
          gas and brakes on the 2022+ CX-5. Read section 05 first: it shuts
          the stock radar down, which takes automatic emergency braking and
          forward collision alerts with it.`,
      },
      {
        html: `<b>Torque control out of the box.</b> Fresh installs on 22+
          EPS Mazdas arrive with torque control, self-tune, and
          speed-dependent self-tune already on.`,
      },
      {
        html: `<b>Fresher steering seeds.</b> The CX-5 2022 starting values
          come straight off my car&rsquo;s learned data, so a new install
          steers like a tuned car much sooner.`,
      },
      {
        html: `<b>Cruise buttons, rebuilt.</b> The speed you set is the speed
          you get back after every curve and speed zone, down to the exact
          number. Confirming a speed limit is one tap and the answer sticks.
          Press a button mid-adjustment and zoompilot hands control straight
          back. Big changes hold the button down the way you would.`,
      },
      {
        html: `<b>Cruise features under one roof.</b> Speed-limit assist and
          smart cruise now work the same way whether the stock radar or
          openpilot has the gas and brakes, and a speed limit prompt no
          longer nudges your set speed while you are still deciding.`,
      },
      {
        html: `<b>Latest sunnypilot and openpilot.</b> New alert sounds and
          softer driver monitoring nags. Lane changes arm right away if your
          blinker is already on. Map-based curve slowdowns are more accurate,
          map hiccups no longer trip false warnings, the false NO PANDA flash
          on screen wake is gone, and you can switch software branches from
          the device screen.`,
      },
      {
        html: `<b>Leaner install.</b> Setup no longer downloads a 1.8GB
          driving model the device never uses.`,
      },
    ],
  },
  {
    ver: null,
    date: "2026-07-04",
    title: "Smart cruise and EPS swaps",
    summary:
      "Curve slowdowns get usable, and older Mazdas join in with a swapped-in CX-5 motor.",
    items: [
      {
        html: `<b>Smart cruise decel overshoot.</b> New alpha toggle. The
          Mazda ECU is slow to obey a lower set speed, so this asks for more
          than the model wants and gets the deceleration the curve needs.`,
      },
      {
        html: `<b>ICBM fixes.</b> Fixed set-speed desync with the stock ECU
          and the target-chasing oscillation. Button presses are suppressed
          while you press yours, and pacing adapts to how far the target is.`,
      },
      {
        html: `<b>EPS swap support.</b> A 2022-25 CX-5 steering motor in an
          older Mazda fingerprints by its firmware and steers to a stop.`,
      },
      {
        html: `<b>Upstream sync.</b> Merged sunnypilot master and the opendbc
          upstream into zoompilot.`,
      },
    ],
  },
];
