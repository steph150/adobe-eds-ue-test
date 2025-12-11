/**
 * Generates a unique storage key for the alert based on its content
 * @param {Element} block The alert block element
 * @returns {string} A unique key for localStorage
 */
function generateAlertKey(block) {
  const title = block.querySelector('.alert-title')?.textContent?.trim() || '';
  const description = block.querySelector('.alert-description')?.textContent?.trim() || '';
  const combined = title + description;
  // Create a simple hash from the content without bitwise operations
  let hash = 0;
  for (let i = 0; i < combined.length; i += 1) {
    const char = combined.charCodeAt(i);
    hash = ((hash * 31) + char) % 2147483647;
  }
  return `alert-dismissed-${Math.abs(hash)}`;
}

/**
 * Checks if the alert has been dismissed previously
 * @param {string} alertKey The unique alert key
 * @returns {boolean} True if alert was dismissed
 */
function isAlertDismissed(alertKey) {
  try {
    return localStorage.getItem(alertKey) === 'true';
  } catch (e) {
    return false;
  }
}

/**
 * Marks the alert as dismissed in localStorage
 * @param {string} alertKey The unique alert key
 */
function dismissAlert(alertKey) {
  try {
    localStorage.setItem(alertKey, 'true');
  } catch (e) {
    // localStorage not available, continue without persistence
  }
}

/**
 * Creates a close button for the alert
 * @param {Element} block The alert block element
 * @param {string} alertKey The unique alert key
 * @returns {Element} The close button element
 */
function createCloseButton(block, alertKey) {
  const closeButton = document.createElement('button');
  closeButton.className = 'alert-close';
  closeButton.setAttribute('aria-label', 'Close alert');
  closeButton.innerHTML = '<span aria-hidden="true">×</span>';

  closeButton.addEventListener('click', () => {
    block.style.display = 'none';
    dismissAlert(alertKey);
  });

  return closeButton;
}

/**
 * Decorates the alert block
 * @param {Element} block The alert block element
 */
export default function decorate(block) {
  // Extract classes to determine type, theme, and close button
  const hasCloseButton = block.classList.contains('close');
  const alertType = block.classList.contains('message') ? 'message' : 'banner';

  // Determine theme from classes
  let alertTheme = 'neutral'; // default
  const themes = ['neutral', 'warning', 'information', 'success', 'error'];
  themes.forEach((theme) => {
    if (block.classList.contains(theme)) {
      alertTheme = theme;
    }
  });

  const rows = [...block.children];

  // Create alert container structure
  const alertContent = document.createElement('div');
  alertContent.className = 'alert-content';

  // Row 0: Title (optional)
  const titleRow = rows[0];
  if (titleRow) {
    const titleText = titleRow.textContent.trim();
    if (titleText) {
      const titleElement = document.createElement('div');
      titleElement.className = 'alert-title';

      // Use h2 for alert titles
      const heading = document.createElement('h2');
      heading.textContent = titleText;
      titleElement.appendChild(heading);
      alertContent.appendChild(titleElement);
    }
  }

  // Row 1: Description (richtext)
  const descriptionRow = rows[1];
  if (descriptionRow) {
    const descriptionContent = descriptionRow.querySelector('div');
    if (descriptionContent) {
      const descriptionElement = document.createElement('div');
      descriptionElement.className = 'alert-description';
      descriptionElement.innerHTML = descriptionContent.innerHTML;
      alertContent.appendChild(descriptionElement);
    }
  }

  // Row 2: CTA Link (only for banner type)
  if (alertType === 'banner' && rows[2]) {
    const ctaRow = rows[2];
    const ctaLink = ctaRow.querySelector('a');
    if (ctaLink) {
      const ctaElement = document.createElement('div');
      ctaElement.className = 'alert-cta';

      // Apply button styling to CTA link
      ctaLink.classList.add('button', 'primary');
      ctaElement.appendChild(ctaLink);
      alertContent.appendChild(ctaElement);
    }
  }

  // Clear original content and add decorated structure
  block.innerHTML = '';
  block.appendChild(alertContent);

  // Add close button if enabled
  if (hasCloseButton) {
    const alertKey = generateAlertKey(block);

    // Check if alert was previously dismissed
    if (isAlertDismissed(alertKey)) {
      block.style.display = 'none';
      return;
    }

    const closeButton = createCloseButton(block, alertKey);
    block.appendChild(closeButton);
  }

  // Set aria-live for accessibility based on theme
  const ariaLive = (alertTheme === 'error' || alertTheme === 'warning') ? 'assertive' : 'polite';
  block.setAttribute('role', 'alert');
  block.setAttribute('aria-live', ariaLive);
}
