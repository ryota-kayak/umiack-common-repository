# Design & Technical Decisions

This document records the key architectural and design decisions made during the "Cherry Blossom Kayak" project to ensure future maintainability and consistent project evolution.

## 1. Semantic HTML Structure
- **Decision**: Refactored various `div`-based sections (FAQs, Tour Details) into `<dl>`, `<dt>`, and `<dd>` elements.
- **Rationale**: 
    - **SEO**: Search engines better understand the relationship between questions and answers or labels and values when structured semantically.
    - **Accessibility**: Screen readers can navigate definition lists more efficiently for users with visual impairments.
    - **Maintenance**: Provides a standardized pattern for adding new tour details or FAQs in the future.

## 2. Image Aspect Ratio (4:3)
- **Decision**: Standardized all gallery images to a `4:3` aspect ratio.
- **Rationale**: 
    - **Visual Balance**: 4:3 provides enough height for immersive "Cherry Blossom" visuals while remaining compact enough to maintain high information density on the page.
    - **Consistency**: Prevents layout shifting and ensures a clean, professional grid even when original photos have varying dimensions.
    - **Mobile UX**: Ensures images are large enough to be clear on small screens without pushing too much content "below the fold."

## 3. Unified Conversion Button System
- **Decision**: Implemented a triad of buttons (LINE, Web, Phone) with consistent sizing and distinct yet harmonious branding.
- **Rationale**: 
    - **Customer Trust**: Professional, well-designed buttons reduce friction and increase the user's confidence in the service provider.
    - **Phone Integration**: Merged the phone label and clickable number into a single `btn-phone` element to elevate "Phone Consultation" to the same priority level as digital inquiries.
    - **Visual Cues**: Used brand-aligned color gradients and internal icons to guide the user's eye to the primary conversion points.

## 4. Version Control with Git & GitHub
- **Decision**: Initialized a local Git repository and synchronized it with GitHub.
- **Rationale**: 
    - **Safety & Backup**: Protects the project from local hardware failure.
    - **Version History**: Allows the user to revert to previous "tried and true" versions of the page if future experiments fail.
    - **Context Handoff**: Provides future AI assistants with the full technical and historical context of the project through the codebase and these decision logs.
