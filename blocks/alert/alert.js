/**
 * Decorates the alert block
 * Supports two types: banner and message
 * Supports five themes: neutral, warning, information, success, error
 * @param {Element} block The alert block element
 */
export default async function decorate(block) {
  // Extract block classes to determine type, theme, and options
  const classes = [...block.classList];
  const alertType = classes.includes('message') ? 'message' : 'banner';
  const showClose = classes.includes('close');

  // Determine theme (default to neutral if not specified)
  let theme = 'neutral';
  const themeOptions = ['neutral', 'warning', 'information', 'success', 'error'];
  themeOptions.forEach((t) => {
    if (classes.includes(t)) {
      theme = t;
    }
  });

  // Extract content from rows (Universal Editor row-per-field structure)
  const rows = [...block.children];

  // Row 0: Title (plain text)
  const titleText = rows[0]?.textContent?.trim();

  // Row 1: Description (richtext)
  const descriptionRow = rows[1];
  const descriptionContent = descriptionRow?.querySelector('div > div');

  // Row 2: CTA Link (for banner type only)
  const ctaRow = rows[2];
  const ctaLink = ctaRow?.querySelector('a');

  // Clear the block to rebuild with semantic structure
  block.innerHTML = '';

  // Create alert container with appropriate classes
  const alertContainer = document.createElement('div');
  alertContainer.className = `alert-container alert-${alertType} alert-${theme}`;

  // Create content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'alert-content';

  // Create icon container
  const iconContainer = document.createElement('div');
  iconContainer.className = 'alert-icon';
  iconContainer.setAttribute('aria-hidden', 'true');

  // Add theme-specific icon
  const icon = document.createElement('span');
  icon.className = `icon-${theme}`;
  iconContainer.appendChild(icon);
  contentWrapper.appendChild(iconContainer);

  // Create text container
  const textContainer = document.createElement('div');
  textContainer.className = 'alert-text';

  // Add title if present
  if (titleText) {
    const title = document.createElement('div');
    title.className = 'alert-title';
    title.textContent = titleText;
    textContainer.appendChild(title);
  }

  // Add description if present
  if (descriptionContent) {
    const description = document.createElement('div');
    description.className = 'alert-description';
    description.innerHTML = descriptionContent.innerHTML;
    textContainer.appendChild(description);
  }

  contentWrapper.appendChild(textContainer);

  // Add CTA button for banner type (if link exists)
  if (alertType === 'banner' && ctaLink) {
    const ctaContainer = document.createElement('div');
    ctaContainer.className = 'alert-cta';

    const button = document.createElement('a');
    button.href = ctaLink.href;
    button.textContent = ctaLink.textContent;
    button.className = 'button primary';
    button.setAttribute('aria-label', ctaLink.textContent);

    // Copy any other attributes from original link
    if (ctaLink.title) button.title = ctaLink.title;
    if (ctaLink.target) button.target = ctaLink.target;

    ctaContainer.appendChild(button);
    contentWrapper.appendChild(ctaContainer);
  }

  alertContainer.appendChild(contentWrapper);

  // Add close button if specified
  if (showClose) {
    const closeButton = document.createElement('button');
    closeButton.className = 'alert-close';
    closeButton.setAttribute('aria-label', 'Close alert');
    closeButton.innerHTML = '<span aria-hidden="true">&times;</span>';

    // Add click handler to close alert
    closeButton.addEventListener('click', () => {
      alertContainer.classList.add('alert-closing');
      setTimeout(() => {
        block.remove();
      }, 300); // Match CSS transition duration
    });

    alertContainer.appendChild(closeButton);
  }

  // Add ARIA attributes for accessibility
  alertContainer.setAttribute('role', 'alert');
  if (theme === 'error') {
    alertContainer.setAttribute('aria-live', 'assertive');
  } else {
    alertContainer.setAttribute('aria-live', 'polite');
  }

  block.appendChild(alertContainer);
}
