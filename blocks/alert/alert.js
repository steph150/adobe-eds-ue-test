/**
 * Alert block
 * Displays alert messages in banner or message format with various themes
 * @param {Element} block The alert block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Extract content from rows based on Universal Editor model
  // Field order in model:
  // 1. classes (Alert Type) - applied to block, not a visible row
  // 2. alert_theme (grouped with "alert") - Row 0 contains config data
  // 3. title - Row 1
  // 4. description - Row 2
  // 5. cta_link + cta_text (grouped with "cta") - Row 3
  // 6. alert_closeable (grouped with "alert") - Row 0 with theme

  // Row 0 contains alert configuration (theme + closeable)
  const configRow = rows[0];
  const titleRow = rows[1];
  const descriptionRow = rows[2];
  const ctaRow = rows[3];

  // Get alert type (banner/message) from classes field (already applied to block)
  const isBanner = block.classList.contains('banner');

  // Extract theme from config row - it's the first value in the grouped row
  const configText = configRow?.textContent?.trim() || '';
  const configParts = configText.split('\n').map((s) => s.trim()).filter((s) => s);
  const theme = configParts[0] || 'neutral';
  const isCloseable = configParts[1]?.toLowerCase() === 'true';

  // Add theme as class
  if (theme && !block.classList.contains(theme)) {
    block.classList.add(theme);
  }

  // Create container structure
  const container = document.createElement('div');
  container.className = 'alert-container';

  // Create icon element based on theme
  const icon = document.createElement('div');
  icon.className = 'alert-icon';
  icon.setAttribute('aria-hidden', 'true');

  // SVG icons for each theme
  const icons = {
    neutral: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
    warning: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
    information: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
    success: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
    error: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>',
  };

  icon.innerHTML = icons[theme] || icons.neutral;
  container.appendChild(icon);

  // Create content wrapper
  const content = document.createElement('div');
  content.className = 'alert-content';

  // Add title if present
  const titleText = titleRow?.textContent?.trim();
  if (titleText) {
    const title = document.createElement('div');
    title.className = 'alert-title';
    title.textContent = titleText;
    content.appendChild(title);
  }

  // Add description
  const descriptionContent = descriptionRow?.querySelector('p, div > *');
  if (descriptionContent) {
    const description = document.createElement('div');
    description.className = 'alert-description';
    // Clone the content to preserve rich text formatting
    const clone = descriptionContent.cloneNode(true);
    description.appendChild(clone);
    content.appendChild(description);
  }

  container.appendChild(content);

  // Add CTA button for banner type only
  if (isBanner && ctaRow) {
    const ctaLink = ctaRow.querySelector('a');
    if (ctaLink) {
      const ctaContainer = document.createElement('div');
      ctaContainer.className = 'alert-cta';

      // Add primary button class per BR04
      ctaLink.classList.add('button', 'primary');
      ctaContainer.appendChild(ctaLink);
      container.appendChild(ctaContainer);
    }
  }

  // Add close button if enabled
  if (isCloseable) {
    const closeButton = document.createElement('button');
    closeButton.className = 'alert-close';
    closeButton.setAttribute('aria-label', 'Close alert');
    closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';

    // Add click handler to close the alert
    closeButton.addEventListener('click', () => {
      block.style.display = 'none';
      // Remove from DOM after animation if needed
      setTimeout(() => {
        block.remove();
      }, 300);
    });

    container.appendChild(closeButton);
  }

  // Clear the block and add the new structure
  block.innerHTML = '';
  block.appendChild(container);

  // Set ARIA role and attributes for accessibility
  block.setAttribute('role', theme === 'error' || theme === 'warning' ? 'alert' : 'status');
  block.setAttribute('aria-live', theme === 'error' || theme === 'warning' ? 'assertive' : 'polite');
}
