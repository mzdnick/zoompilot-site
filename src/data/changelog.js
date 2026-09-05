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
  /* the wiki's only host. A wiki.zoompilot.ai custom domain was
   * declined in 2026-09, so this link is permanent. */
  wiki: "https://zoompilot-wiki.pages.dev",
};

/* last known build on main. Refresh with: npm run stamp
 * (scripts/stamp.mjs); the page also refreshes it at runtime from the
 * GitHub API and keeps this value when offline. */
export const build = { sha: "24d8296904", date: "2026-09-05" };

export const releases = [
  {
    ver: "2026.09.05-9",
    date: "2026-09-05",
    title: "New steering tune, Smart Cruise reimplemented, Alpha Longitudinal stop-and-go fixed",
    summary:
      "I feel like this is the most smooth and clean release yet. I&rsquo;m very proud of the improvements and recommend anyone be on the latest release.",
    items: [
      {
        html: `<b>Speed-dependent torque tune v2 is the default.</b> Rewritten
          on the v0 base. It turns in earlier for curves and reduces
          oscillations and micro-adjustments on the highway. v0 and v1 are
          unchanged if you prefer them.`,
      },
      {
        html: `<b>Mazda torque limits in openpilot.</b> The controller follows
          the EPS&rsquo;s measured torque ceiling at each speed and winds down
          at the rate the EPS accepts. More torque at low speed, steadier
          steering on the highway.`,
      },
      {
        html: `<b>Lane Change Smoothing.</b> New toggle under Steering
          settings. Lane changes are slower and smoother, with a configurable
          pace. Off by default.`,
      },
      {
        html: `<b>Smart Cruise Vision reimplemented.</b> A new solver plans
          the slowdown for the whole curve from the model path and the map.
          It slows earlier, reaches the target speed at the apex more
          accurately, and returns to your set speed sooner. It also corrects
          the model&rsquo;s under-read of curves far ahead and no longer
          commits to false slowdowns on highway bends.`,
      },
      {
        html: `<b>Deceleration Overshoot front-loaded.</b> The extra
          deceleration is requested at curve entry, where the stock cruise is
          slowest to respond.`,
      },
      {
        html: `<b>ICBM restores your set speed sooner.</b> After a curve or a
          speed zone the dash is walked back within about a second. A press
          of yours hands control back at once, and a speed limit prompt can
          no longer bank an overshoot.`,
      },
      {
        html: `<b>TJA button as the MADS switch.</b> New toggle under
          Steering, MADS. When on, the wheel&rsquo;s TJA button is the only
          steering switch and MRCC main only controls cruise. Off by
          default.`,
      },
      {
        html: `<b>Fixed the camera&rsquo;s LKAS error.</b> Pushing against the
          wheel at low speed could get the torque command rejected by the
          panda until the EPS gave up and the camera faulted. The controller
          and panda now agree on the limits.`,
      },
      {
        html: `<b>Fixed steering engaging on its own at startup.</b> MADS
          armed lateral before the panda did, which also dropped steering for
          two seconds with an LKAS error. Both arm on the same frame now,
          steering disengages when MRCC main is turned off, and you get a
          warning if the panda has not armed.`,
      },
      {
        html: `<b>Fixed the false &ldquo;Steering Assist Temporarily
          Unavailable&rdquo; on launch.</b> A brisk pull-away from a stop no
          longer trips the alert.`,
      },
      {
        html: `<b>Alpha longitudinal only.</b>`,
        sub: [
          {
            html: `<b>Stop-and-go resumes on its own.</b> Two root causes
              fixed. The car reported a stock cruise standstill under
              openpilot longitudinal, which pinned the controller in stopping
              forever, and the resume pulse carried a bad checksum that
              faulted the camera every time. The car now pulls away when the
              lead departs, without the SCBS warnings afterwards.`,
          },
          {
            html: `<b>Smoother acceleration.</b> Throttle builds at close to
              the stock rate, lifts off gently, and uses the same ceiling as
              stock at each speed. The harsh push-off is gone, and the
              pull-away from a hold is gentler.`,
          },
          {
            html: `<b>Cruise arms on a driver button only.</b> openpilot no
              longer arms cruise by itself after the radar hand-back.`,
          },
          {
            html: `<b>The toggle applies at a standstill.</b> Flipping alpha
              longitudinal or force offroad while rolling used to take the
              device offroad under a moving car.`,
          },
          {
            html: `<b>Stock camera frames pass through when disengaged.</b>
              The dash behaves like stock while openpilot is off.`,
          },
          {
            /* the site says "2022+ CX-5 EPS"; the year-claim wording here
             * follows the wiki convention (see 109107b / 57e3fae) */
            html: `<b>Offered on any Mazda with the 2022-25 CX-5 EPS.</b> Not
              just the CX-9 swap. The pre-2021 CX-9 is excluded.`,
          },
          {
            html: `A full review of the longitudinal stack: radar hand-back,
              hold release and fault handling are all more robust.`,
          },
        ],
      },
      {
        html: `<b>Device.</b>`,
        sub: [
          {
            html: `Fingerprinting is VIN-first. Export VINs fall back to the
              engine and EPS firmware.`,
          },
          {
            html: `Steering Arc and Display Turn Signals are hidden on the
              comma 4, where they do nothing.`,
          },
          {
            html: `Force offroad follows upstream again, and a noisy ignition
              signal no longer flickers the device on and off road.`,
          },
          {
            html: `The torque pickers show the value that is actually set.`,
          },
          { html: `No more offline update nags.` },
        ],
      },
      {
        html: `<b>Synced sunnypilot as of 2026-09-03.</b> See the
          <a href="https://docs.sunnypilot.ai">sunnypilot docs</a>.`,
        sub: [
          {
            html: `<b>Initial support for Chestnut and big models.</b> The
              eGPU&rsquo;s big model downloads and runs next to the on-device
              model, with a fallback to the small model when the big one is
              not ready, an alert when it is, and an eGPU icon in the sidebar
              and on the home screen.`,
          },
          {
            html: `<b>Model Selector upgrades.</b> Your selection is kept per
              catalog when Chestnut is plugged or unplugged.`,
          },
          {
            html: `Downloaded maps can be deleted from sunnylink.`,
          },
          {
            html: `The sunnylink pill moved and was restyled in comma 4
              settings.`,
          },
          {
            html: `Scrolling labels run at the right speed on non-60 Hz
              screens.`,
          },
          {
            html: `Two openpilot syncs: UI cleanups and Chestnut power fault
              logging.`,
          },
        ],
      },
    ],
  },
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
          seeds using the latest learned values from a tuned CX-5. Self-tune
          may converge a little faster now.`,
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
          gas and brakes on the CX-5 2022-25. Read section 05 first: it shuts
          the stock radar down, which takes automatic emergency braking and
          forward collision alerts with it.`,
      },
      {
        html: `<b>Torque control out of the box.</b> Fresh installs on Mazdas
          with a 2022-25 CX-5 EPS arrive with torque control, self-tune, and
          speed-dependent self-tune already on.`,
      },
      {
        html: `<b>Fresher steering seeds.</b> The CX-5 2022 starting values
          come straight off a real car&rsquo;s learned data, so a new install
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
