/**
 * Decorates the alert block based on the business rules defined in the Confluence page
 * Supports two types: banner and message
 * Supports five themes: neutral, warning, information, success, error
 * @param {Element} block The alert block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Extract content from rows based on Universal Editor row-per-field structure with grouping
  // Row 0: config group (type, theme, showClose)
  // Row 1: content group (title, description)
  // Row 2: cta group (link, text, title - for banner type only)

  // Parse config row - contains type, theme, and close button setting
  const configRow = rows[0];
  let alertType = 'banner';
  let alertTheme = 'neutral';
  let showCloseButton = false;

  if (configRow) {
    const configText = configRow.textContent;
    // Extract values from config row
    if (configText.includes('message')) alertType = 'message';
    if (configText.includes('warning')) alertTheme = 'warning';
    else if (configText.includes('information')) alertTheme = 'information';
    else if (configText.includes('success')) alertTheme = 'success';
    else if (configText.includes('error')) alertTheme = 'error';
    if (configText.toLowerCase().includes('true')) showCloseButton = true;
  }

  // Parse content row - contains title and description
  const contentRow = rows[1];
  let titleText = '';
  let descriptionContent = null;

  if (contentRow) {
    // Title is typically in first div, description in second
    const contentDivs = contentRow.querySelectorAll(':scope > div > div');
    const [titleDiv, descDiv] = contentDivs;
    if (titleDiv) {
      titleText = titleDiv.textContent?.trim() || '';
    }
    if (descDiv) {
      descriptionContent = descDiv;
    }
  }

  const ctaRow = rows[2];

  // Clear the block to rebuild with semantic structure
  block.innerHTML = '';

  // Add theme and type classes
  block.classList.add(`alert-${alertTheme}`);
  block.classList.add(`alert-${alertType}`);

  // Create alert container
  const alertContainer = document.createElement('div');
  alertContainer.className = 'alert-container';

  // Create alert icon based on theme
  const icon = document.createElement('span');
  icon.className = 'alert-icon';
  icon.setAttribute('aria-hidden', 'true');

  // Set icon based on theme
  const iconMap = {
    neutral: '&#9432;', // ℹ info icon
    warning: '&#9888;', // ⚠ warning icon
    information: '&#9432;', // ℹ info icon
    success: '&#10004;', // ✓ check icon
    error: '&#10006;', // ✖ cross icon
  };
  icon.innerHTML = iconMap[alertTheme] || iconMap.neutral;
  alertContainer.appendChild(icon);

  // Create content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'alert-content';

  // Add title if present
  if (titleText) {
    const title = document.createElement('div');
    title.className = 'alert-title';
    title.textContent = titleText;
    contentWrapper.appendChild(title);
  }

  // Add description if present
  if (descriptionContent) {
    const description = document.createElement('div');
    description.className = 'alert-description';
    description.innerHTML = descriptionContent.innerHTML;
    contentWrapper.appendChild(description);
  }

  // Add CTA button for banner type only (BR04)
  if (alertType === 'banner' && ctaRow) {
    const ctaLink = ctaRow.querySelector('a');
    if (ctaLink) {
      ctaLink.className = 'button primary';
      const ctaContainer = document.createElement('div');
      ctaContainer.className = 'alert-cta';
      ctaContainer.appendChild(ctaLink);
      contentWrapper.appendChild(ctaContainer);
    }
  }

  alertContainer.appendChild(contentWrapper);

  // Add close button if enabled (BR05)
  if (showCloseButton) {
    const closeButton = document.createElement('button');
    closeButton.className = 'alert-close';
    closeButton.setAttribute('type', 'button');
    closeButton.setAttribute('aria-label', 'Close alert');
    closeButton.innerHTML = '&times;';

    // Close functionality - removes alert from DOM (reappears on page reload per BR05)
    closeButton.addEventListener('click', () => {
      block.remove();
    });

    alertContainer.appendChild(closeButton);
  }

  block.appendChild(alertContainer);
}
