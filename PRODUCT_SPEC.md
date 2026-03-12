# Product Spec (MVP) — Electronics Enclosure Designer

## Vision

A browser-based tool where users quickly configure and download a printable electronics enclosure without CAD expertise.

## Target Users

- Makers and hobbyists
- Hardware engineers doing quick prototype housings
- Small labs or startups that need rapid enclosure iteration

## Core User Flow

1. Open app (no account needed).
2. Set enclosure dimensions and style.
3. Add/remove circular holes on selected faces.
4. Preview model live in 3D.
5. Export STL for slicing/printing.
6. (Optional) Sign in to save/load designs in cloud.

## MVP Functional Requirements

- Live parametric 3D enclosure viewport.
- Inputs for width, height, depth, wall thickness.
- Enclosure type selector (plain, lid, flanged).
- Hole tool: circular holes with face + radius + x/y offsets.
- STL download button.
- Firebase Auth + Firestore integration for signed-in cloud saves.
- Guest mode fully usable without sign-in.

## Data Model (Current)

`EnclosureConfig` includes:

- core geometry fields (`width`, `height`, `depth`, `wallThickness`, `type`)
- `holes: CircularHole[]`
- `premium` placeholders
- `services` placeholders

Cloud persistence path:

- `users/{uid}/models/{modelId}`

## Placeholder Commercial Features

- Premium options
  - advanced fastening packs
  - waterproof seal package
- Paid services
  - print/manufacturing service
  - delivery/fulfilment

## Roadmap Additions (Post-MVP)

### Marketing Intelligence Inbox (Issue #1)

Build a dedicated project email-based intelligence pipeline to monitor chip/vendor newsletters and convert them into structured release digests.

Planned scope:

- dedicated inbox for vendor subscriptions
- ingestion flow: email -> parser/tagging -> release digest
- candidate sources: TI, ST, NXP, Microchip, ADI, Infineon, Espressif, Nordic (plus others)
- compliance safeguards (opt-in sources, unsubscribe handling, spam controls, retention policy)

## Non-Goals for MVP

- Detailed part libraries and board-specific mounting templates
- Full-featured CAD constraints
- Multi-format assembly exports
- Checkout/payment implementation

## Success Criteria (MVP)

- User can produce a valid STL in under 2 minutes.
- Visual updates occur instantly when parameters change.
- Cloud save/load works reliably for authenticated users.
