# Cherry Blossom Kayak Tour Page Optimization

Professional web optimization project for the "Ohanami (Cherry Blossom) Kayak" tour page by [umiack](https://jp.umiack.com/).

## Project Goals
- Transform the tour page into a high-conversion, professional, and mobile-responsive layout.
- Refactor legacy HTML into semantic structures for better SEO and accessibility.
- Establish a consistent design system for action buttons (conversion points).
- Implement version control using Git and GitHub for long-term project stability.

## Key Features
### 1. Semantic HTML Refactoring
- Migrated flat `div` layouts to structured `<dl>/<dt>/<dd>` (Definition List) elements for FAQs and Tour Details.
- Improved heading hierarchy and removed redundant DOM elements.

### 2. Design System & UI/UX
- **Unified Action Buttons**: Triad of consistent conversion buttons for LINE, Web, and Phone, each with unique brand-aligned gradients and integrated icons.
- **Optimized Gallery**: Standardized 4:3 aspect ratio with 12px rounded corners, subtle shadows, and interactive hover effects.
- **Typography**: Modern font stack (`Inter`, `Hiragino`) with fine-tuned letter spacing and line height for premium readability.

### 3. Responsive Web Design
- Mobile-first approach ensuring FAQ sections stack vertically.
- Dynamically resizing gallery and info boxes that maintain visual impact on small screens.

## Project Structure
- `本文.html`: The core content to be pasted into the WordPress "Custom HTML" block.
- `東京運河でお花見カヤックツアー.css`: The dedicated design system to be added to the WordPress custom CSS field.
- `note/`: Drafting assets and illustrations for the accompanying note.com articles.
- `CHANGELOG.md`: Detailed history of technical changes.

## Deployment Instructions
1. Copy the content of `本文.html`.
2. Paste it into the target WordPress post's Custom HTML block.
3. Copy the content of `東京運河でお花見カヤックツアー.css`.
4. Add it to the "Custom CSS" section of the page (or the theme's global custom CSS).
5. Verify the gallery and button displays on both desktop and mobile devices.
