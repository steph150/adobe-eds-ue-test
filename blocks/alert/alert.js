/**
 * Loads and decorates the alert block
 * @param {Element} block The alert block element
 */
export default async function decorate(block) {
  // Extract rows from the block
  const rows = [...block.children];

  // Extract content from rows (row-per-field structure)
  // With classes pattern, only 3 fields create visible rows:
  // Row 0: title
  // Row 1: description
  // Row 2: cta_link + cta_text (grouped)
  // The classes, classes_theme, and classes_closeable are automatically added as CSS classes
  const titleRow = rows[0];
  const descriptionRow = rows[1];
  const ctaRow = rows[2]; // Grouped: cta_link + cta_text

  // Extract values
  const titleText = titleRow?.textContent?.trim();
  const descriptionContent = descriptionRow?.querySelector('div > div');
  const ctaContent = ctaRow?.querySelector('div > div');

  // Check block classes (added automatically by Universal Editor)
  const isBanner = block.classList.contains('banner');
  const hasCloseButton = block.classList.contains('closeable');

  // Clear block content
  block.innerHTML = '';

  // Create alert structure
  const alertContainer = document.createElement('div');
  alertContainer.className = 'alert-container';

  // Create icon container
  const iconContainer = document.createElement('div');
  iconContainer.className = 'alert-icon';
  iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>`;

  // Create content container
  const contentContainer = document.createElement('div');
  contentContainer.className = 'alert-content';

  // Add title if present
  if (titleText) {
    const title = document.createElement('div');
    title.className = 'alert-title';
    title.textContent = titleText;
    contentContainer.appendChild(title);
  }

  // Add description if present
  if (descriptionContent) {
    const description = document.createElement('div');
    description.className = 'alert-description';
    // Clone description content to preserve HTML structure
    description.innerHTML = descriptionContent.innerHTML;
    contentContainer.appendChild(description);
  }

  // Add CTA button for banner type
  if (isBanner && ctaContent) {
    const ctaContainer = document.createElement('div');
    ctaContainer.className = 'alert-cta';

    // Extract link and text from grouped cta content
    const ctaLink = ctaContent.querySelector('a');
    if (ctaLink) {
      const button = document.createElement('a');
      button.href = ctaLink.href;
      button.className = 'button primary';
      button.textContent = ctaLink.textContent;

      // Add chevron icon
      button.innerHTML += ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';

      ctaContainer.appendChild(button);
      contentContainer.appendChild(ctaContainer);
    }
  }

  // Create close button if closeable class is present
  if (hasCloseButton) {
    const closeButton = document.createElement('button');
    closeButton.className = 'alert-close';
    closeButton.setAttribute('aria-label', 'Close alert');
    closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>`;

    // Add click handler to remove alert
    closeButton.addEventListener('click', () => {
      block.style.display = 'none';
    });

    alertContainer.appendChild(closeButton);
  }

  // Assemble alert structure
  alertContainer.appendChild(iconContainer);
  alertContainer.appendChild(contentContainer);
  block.appendChild(alertContainer);
}
