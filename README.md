# Electronics Enclosure Designer

Browser-based MVP for creating simple custom electronics enclosures and exporting them as printable STL files.

Repository: <https://github.com/Mizzen-Studios/electronics-enclosure-designer>

## Product Summary

This project targets makers and hardware teams that need a fast enclosure prototype without opening full CAD tooling.

Current focus is **speed to first printable model**:
- configure dimensions and enclosure type
- add/edit circular face holes
- preview in real time in 3D
- export STL in one click

## MVP Capabilities (Current)

- React + Three.js live parametric preview
- Adjustable enclosure dimensions:
  - width / height / depth / wall thickness
  - enclosure type: `plain`, `lid`, `flanged`
- Circular hole tool with face selection and x/y offsets
- STL export via `Download STL`
- Optional Firebase Auth + Firestore cloud model save/load
- Placeholder data model fields for premium options and paid manufacturing services

## Guest vs Account Behavior

- **Guest mode (default):** fully usable for designing and exporting STL locally. No sign-in required.
- **Signed-in mode (Google):** enables cloud save/load/delete at `users/{uid}/models/{modelId}` in Firestore.
- If Firebase env vars are missing, app remains usable in guest mode and cloud/auth UI is disabled gracefully.

## Premium + Manufacturing Roadmap Context

The current UI includes placeholders for future monetized capabilities:
- Premium enclosure options (e.g., fastening kits, waterproofing packages)
- Manufacturing/print services and delivery fulfillment flow

These are intentionally not wired to checkout in MVP, but the data structures are present to avoid migration churn later.

## Related Workstream: Marketing Intelligence Inbox

Roadmap includes a separate **Marketing Intelligence Inbox** initiative (Issue #1):
- ingest vendor/chip newsletters through a dedicated inbox
- parse/tag releases into structured digests
- support product and go-to-market planning with better component intel

This is adjacent to the enclosure app and tracked as a strategic follow-on work item.

## Local Development

```bash
npm install
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`).

## Environment Variables

Copy `.env.example` to `.env` and fill values to enable Firebase features:

```bash
cp .env.example .env
```

Required for Firebase mode:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`

Optional Firebase vars:
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`

## Firebase Setup

1. Create a Firebase project.
2. Add a Web app in Firebase console.
3. Enable **Authentication** → Google provider.
4. Enable **Firestore Database**.
5. Add `localhost` to Auth authorized domains if needed.
6. Paste config values into `.env`.

## Scripts

- `npm run dev` — start development server
- `npm run build` — type-check and production build
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

## Architecture Snapshot

- `src/types/enclosure.ts` — domain model (`EnclosureConfig`, holes, premium/services placeholders)
- `src/utils/enclosureGeometry.ts` — core shell and hole CSG generation
- `src/components/DesignerCanvas.tsx` + `src/components/EnclosureMesh.tsx` — 3D rendering
- `src/components/ControlPanel.tsx` — model editing controls
- `src/components/CloudPanel.tsx` — auth and cloud model UI
- `src/services/firebase.ts` + `src/services/modelStore.ts` — Firebase bootstrapping and persistence
- `src/utils/exportStl.ts` — STL export
