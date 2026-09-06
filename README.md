# seungbeom-park

Personal research profile site for Seungbeom Park: a home page with an interactive fireworks hero, a filterable publication record, a project showcase, and a printable CV. All content lives in typed data files under `src/data`, so updating the site means editing a TypeScript object, not touching markup.

## Stack

- Next.js 16 (App Router, static rendering, no API routes)
- React 19 + TypeScript
- Tailwind CSS v4 (CSS-first config via `@theme` in `src/app/globals.css`)
- `lucide-react` for icons, Canvas API for the hero fireworks

## Quickstart

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm start       # serve the production build
npm run lint
```

## Editing content

Every editable thing maps to one file. Types are enforced by `src/lib/types.ts`, which is the shared contract: do not edit it, but do read it when you are unsure which fields a record accepts. Optional fields can simply be omitted.

| What you want to change | File |
| --- | --- |
| Name, title, department, institution, lab | `src/data/profile.ts` |
| Location, email, GitHub / Scholar / LinkedIn links | `src/data/profile.ts` |
| Photo path | `src/data/profile.ts` (`photo`) |
| Greeting headline and about paragraphs | `src/data/profile.ts` (`greeting`) |
| Research interests (the chips under the about text) | `src/data/profile.ts` (`interests`) |
| CV "last updated" date | `src/data/profile.ts` (`cvLastUpdated`) |
| Publications, authors, venues, review status | `src/data/publications.ts` |
| News items on the home page | `src/data/news.ts` |
| Projects | `src/data/projects.ts` |
| Degrees, periods, GPA | `src/data/education.ts` |
| Scholarships and awards | `src/data/awards.ts` |
| English test scores (TOEIC, TOEFL, IELTS) | `src/data/testScores.ts` |
| Research / industry / teaching experience | `src/data/experience.ts` |
| Skills, grouped by category | `src/data/skills.ts` |

Notes on the lists:

- `news`, `education`, `awards`, and `experience` are rendered in array order. Keep them newest first.
- Dates are plain strings. Use `YYYY-MM` for periods and news, `YYYY-MM-DD` for `cvLastUpdated`.
- Every item needs a unique `id` within its own file.
- A publication with `anonymized: true` shows its `note` (for example, a double-blind withholding notice) under the title. Once a paper is accepted, set the real title, drop `anonymized` and `note`, and change `status` to `accepted` or `published`.
- Optional publication fields: `bibtex` adds a copy-to-clipboard button to the card, `abstract` shows when a card is expanded. In the publications list, clicking a card expands it to show the review pipeline (Draft, In review, Accepted, Published) with the current stage highlighted. The Sky view toggle shows the same record as fireworks over the skyline by year: clicking the sky fires a rocket, and hitting a paper opens its card.
- Publication `status` drives the colored pill: `published`, `accepted`, `under-review`, `preprint`, `in-preparation`. Mark yourself in an author list with `isSelf: true` so your name is highlighted and first-author counts stay correct.

## Replacing the profile photo

`public/images/profile.svg` is a hand-drawn placeholder, not a missing image. To use a real photo, either:

- drop the photo into `public/images/` under a new name (for example `profile.jpg`) and point `photo` in `src/data/profile.ts` at `/images/profile.jpg`, or
- overwrite `public/images/profile.svg` in place, which keeps the path unchanged but requires the file to stay an SVG.

A 3:4 portrait (for example 900x1200) matches the layout; anything else is cropped to that aspect ratio. Keep the file under a few hundred kilobytes.

## PDF export

There is no PDF generator and no headless browser. `/cv` ships a print stylesheet (`src/app/cv/print.css`) that switches the page to a white background with near-black text and hides the header, footer, buttons, and hero effects. The "Export PDF" button calls `window.print()`; choose "Save as PDF" in the browser print dialog. Browser keyboard print (Ctrl+P / Cmd+P) produces the same output. If the CV changes, update `cvLastUpdated` in `src/data/profile.ts` so the printed date is right.

## Deploying

Vercel auto-detects Next.js: import the repository and deploy with the default settings. No environment variables, no `vercel.json`, no build configuration needed. Any host that runs `npm run build` and `npm start` works equally well.

## Conventions

- Components are pure and receive data through props. Only pages and the root layout import from `src/data`.
- Named exports throughout; `src/lib/types.ts` is the single source of truth for data shapes.
- One committed dark theme; design tokens are defined in `@theme` in `src/app/globals.css`.
- Animations respect `prefers-reduced-motion`.
