/**
 * Alert Block
 * Displays alert messages with different types (banner/message) and themes
 * @param {Element} block The alert block element
 */
export default async function decorate(block) {
  const rows = [...block.children];

  // Extract content from rows (Universal Editor row-per-field structure)
  // Row 0: title
  // Row 1: description
  // Row 2: type
  // Row 3: theme
  // Row 4: closeable
  // Row 5: cta_text
  // Row 6: cta_link

  const titleText = rows[0]?.textContent?.trim() || '';
  const descriptionRow = rows[1];
  const type = rows[2]?.textContent?.trim()?.toLowerCase() || 'banner';
  const theme = rows[3]?.textContent?.trim()?.toLowerCase() || 'neutral';
  const closeable = rows[4]?.textContent?.trim()?.toLowerCase() === 'true';
  const ctaText = rows[5]?.textContent?.trim() || '';
  const ctaLink = rows[6]?.textContent?.trim() || '';

  // Clear the block
  block.innerHTML = '';

  // Add theme and type classes
  block.classList.add(theme, type);

  // Create alert container
  const alertContainer = document.createElement('div');
  alertContainer.className = 'alert-container';

  // Create content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'alert-content';

  // Add icon based on theme
  const icon = document.createElement('span');
  icon.className = 'alert-icon';
  icon.setAttribute('aria-hidden', 'true');

  // Icon symbols based on theme
  const iconMap = {
    neutral: '&#9432;', // info symbol
    warning: '&#9888;', // warning symbol
    information: '&#9432;', // info symbol
    success: '&#10004;', // checkmark
    error: '&#10006;', // cross
  };
  icon.innerHTML = iconMap[theme] || iconMap.neutral;
  contentWrapper.appendChild(icon);

  // Create text wrapper
  const textWrapper = document.createElement('div');
  textWrapper.className = 'alert-text';

  // Add title if provided
  if (titleText) {
    const title = document.createElement('strong');
    title.className = 'alert-title';
    title.textContent = titleText;
    textWrapper.appendChild(title);
  }

  // Add description if provided
  if (descriptionRow) {
    const description = document.createElement('div');
    description.className = 'alert-description';

    // Copy rich text content from the row
    const descContent = descriptionRow.querySelector('div > div');
    if (descContent) {
      description.innerHTML = descContent.innerHTML;
    }

    textWrapper.appendChild(description);
  }

  contentWrapper.appendChild(textWrapper);

  // Add CTA button for banner type
  if (type === 'banner' && ctaText && ctaLink) {
    const ctaButton = document.createElement('a');
    ctaButton.href = ctaLink;
    ctaButton.className = 'alert-cta button primary';
    ctaButton.textContent = ctaText;
    contentWrapper.appendChild(ctaButton);
  }

  alertContainer.appendChild(contentWrapper);

  // Add close button if closeable
  if (closeable) {
    const closeButton = document.createElement('button');
    closeButton.className = 'alert-close';
    closeButton.setAttribute('type', 'button');
    closeButton.setAttribute('aria-label', 'Close alert');
    closeButton.innerHTML = '&times;';

    closeButton.addEventListener('click', () => {
      block.style.display = 'none';
      // Optionally store dismissal in sessionStorage so it stays hidden until page reload
      // sessionStorage.setItem(`alert-dismissed-${block.dataset.alertId}`, 'true');
    });

    alertContainer.appendChild(closeButton);
  }

  block.appendChild(alertContainer);

  // Set ARIA role and attributes for accessibility
  block.setAttribute('role', 'alert');
  if (theme === 'error' || theme === 'warning') {
    block.setAttribute('aria-live', 'assertive');
  } else {
    block.setAttribute('aria-live', 'polite');
  }
}
