/**
 * Alert Block
 * Displays informational messages in banner or message format with theming
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

  // Extract content from rows based on Universal Editor structure
  // Row 0: title
  // Row 1: text (richtext)
  // Row 2: cta (contains link, text collapsed into single cell)
  // Row 3: type
  // Row 4: theme
  // Row 5: closeable

  const titleRow = rows[0];
  const textRow = rows[1];
  const ctaRow = rows[2];
  const typeRow = rows[3];
  const themeRow = rows[4];
  const closeableRow = rows[5];

  // Extract values
  const title = titleRow?.textContent?.trim() || '';
  const textContent = textRow?.querySelector('div')?.innerHTML || '';

  // CTA is collapsed into one cell with link
  const ctaLink = ctaRow?.querySelector('a');
  const ctaText = ctaLink?.textContent?.trim() || '';
  const ctaHref = ctaLink?.getAttribute('href') || '';

  const alertType = typeRow?.textContent?.trim() || 'message';
  const alertTheme = themeRow?.textContent?.trim() || 'neutral';
  const isCloseable = closeableRow?.textContent?.trim().toLowerCase() === 'true';

  // Clear the block
  block.innerHTML = '';

  // Add theme class
  block.classList.add(`alert-${alertTheme}`);
  block.classList.add(`alert-${alertType}`);

  // Set ARIA role
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

  if (title) {
    const titleElement = document.createElement('div');
    titleElement.className = 'alert-title';
    titleElement.textContent = title;
    textContainer.appendChild(titleElement);
  }

  if (textContent) {
    const descElement = document.createElement('div');
    descElement.className = 'alert-description';
    descElement.innerHTML = textContent;
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

    // Add chevron icon
    const chevron = document.createElement('span');
    chevron.className = 'alert-cta-chevron';
    chevron.innerHTML = '›';
    ctaButton.appendChild(chevron);

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
