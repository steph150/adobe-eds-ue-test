/**
 * Alert Block
 * Displays informational messages in banner or message format with theming
 * Supports Universal Editor with row-per-field structure
 */

/**
 * Theme icon mapping
 * Returns the appropriate icon name for each theme
 */
function getThemeIcon(theme) {
  const icons = {
    neutral: 'info-outline',
    warning: 'warning-outline',
    information: 'info-outline',
    success: 'checkmark-circle-outline',
    error: 'alert-circle-outline',
  };
  return icons[theme] || icons.neutral;
}

/**
 * Create close button element
 */
function createCloseButton() {
  const closeBtn = document.createElement('button');
  closeBtn.className = 'alert-close';
  closeBtn.setAttribute('aria-label', 'Close alert');
  closeBtn.innerHTML = '<span class="alert-close-icon">×</span>';

  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const alert = closeBtn.closest('.alert');
    if (alert) {
      alert.style.display = 'none';
    }
  });

  return closeBtn;
}

/**
 * Loads and decorates the alert block
 * @param {Element} block The alert block element
 */
export default async function decorate(block) {
  const rows = [...block.children];

  // Universal Editor row-per-field structure:
  // Row 0: title (text field)
  // Row 1: description (richtext field)
  // Row 2: cta (link field with ctaText collapsed into it)
  // Row 3: classes group (type + theme + closeable combined as block options)

  // Extract alert title from row 0
  const titleText = rows[0]?.textContent?.trim() || '';

  // Extract description from row 1 (richtext already has HTML)
  const descriptionHtml = rows[1]?.querySelector('div')?.innerHTML || '';

  // Extract CTA from row 2 (ctaText collapses into the link)
  const ctaLink = rows[2]?.querySelector('a');
  const ctaText = ctaLink?.textContent?.trim() || '';
  const ctaHref = ctaLink?.getAttribute('href') || '';

  // Classes are combined from block.classList (type, theme, closeable)
  const alertType = block.classList.contains('banner') ? 'banner' : 'message';
  const isCloseable = block.classList.contains('closeable');

  // Determine theme from classes
  let alertTheme = 'neutral';
  const themeClasses = ['neutral', 'warning', 'information', 'success', 'error'];
  themeClasses.forEach((theme) => {
    if (block.classList.contains(theme)) {
      alertTheme = theme;
    }
  });

  // Clear the block
  block.innerHTML = '';

  // Set ARIA attributes
  block.setAttribute('role', 'alert');
  block.setAttribute('aria-live', 'polite');

  // Create alert structure
  const alertContent = document.createElement('div');
  alertContent.className = 'alert-content';

  // Create icon container
  const iconContainer = document.createElement('div');
  iconContainer.className = 'alert-icon';
  const iconName = getThemeIcon(alertTheme);
  iconContainer.innerHTML = `<span class="icon icon-${iconName}"></span>`;

  // Create text container
  const textContainer = document.createElement('div');
  textContainer.className = 'alert-text';

  if (titleText) {
    const titleElement = document.createElement('div');
    titleElement.className = 'alert-title';
    titleElement.textContent = titleText;
    textContainer.appendChild(titleElement);
  }

  if (descriptionHtml) {
    const descElement = document.createElement('div');
    descElement.className = 'alert-description';
    descElement.innerHTML = descriptionHtml;
    textContainer.appendChild(descElement);
  }

  // Add icon and text to content
  alertContent.appendChild(iconContainer);
  alertContent.appendChild(textContainer);

  // Add CTA button for banner type
  if (alertType === 'banner' && ctaText && ctaHref) {
    const ctaContainer = document.createElement('div');
    ctaContainer.className = 'alert-cta';

    const ctaButton = document.createElement('a');
    ctaButton.href = ctaHref;
    ctaButton.className = 'alert-cta-button button primary';
    ctaButton.textContent = ctaText;

    ctaContainer.appendChild(ctaButton);
    alertContent.appendChild(ctaContainer);
  }

  block.appendChild(alertContent);

  // Add close button if enabled
  if (isCloseable) {
    const closeButton = createCloseButton();
    block.appendChild(closeButton);
  }

  // Load icons
  const iconElements = block.querySelectorAll('.icon');
  if (iconElements.length > 0) {
    const { default: decorateIcons } = await import('../../scripts/aem.js');
    decorateIcons(block);
  }
}
