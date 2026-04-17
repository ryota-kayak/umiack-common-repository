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
- `data/ohanami.yaml`: The **Human-Friendly Source**. Edit this file to change your tour text/images.
- `data/ohanami.json`: The **System Data**. AI generates this for WordPress to read.
- `tour.css`: The dedicated design system to be added to the WordPress custom CSS field.
- `scripts/wp_shortcode_snippet.php`: The PHP code to be pasted into WordPress `functions.php`.

## Future Workflow: How to Edit Content

To ensure both human readability and system performance, we use a hybrid approach:

1.  **Edit YAML**: Modify the human-friendly content in `data/ohanami.yaml`.
2.  **Request Conversion**: Ask me (Antigravity) - *"I've updated the YAML, please sync it to the website."*
3.  **Automatic Sync**: I will convert the YAML to a machine-optimized JSON and `git push` it to GitHub.
4.  **Live Update**: WordPress will automatically fetch the new content and update the live page (via the Shortcode engine).

---

Congratulations! You have just implemented a system used by top-tier Web agencies. 🚣‍♂️✨
