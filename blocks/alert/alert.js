/**
 * Creates an icon element for the alert
 * @returns {HTMLElement} The icon wrapper element
 */
function createIcon() {
  const iconWrapper = document.createElement('div');
  iconWrapper.className = 'alert-icon';

  // Create SVG icon (person/alert icon)
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');

  // Person icon path (simplified user avatar icon)
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z');
  path.setAttribute('fill', 'currentColor');

  svg.appendChild(path);
  iconWrapper.appendChild(svg);

  return iconWrapper;
}

/**
 * Creates a close button for the alert
 * @param {HTMLElement} block - The alert block element
 * @returns {HTMLElement} The close button element
 */
function createCloseButton(block) {
  const closeBtn = document.createElement('button');
  closeBtn.className = 'alert-close';
  closeBtn.setAttribute('type', 'button');
  closeBtn.setAttribute('aria-label', 'Close alert');

  // Create X icon
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z');
  path.setAttribute('fill', 'currentColor');

  svg.appendChild(path);
  closeBtn.appendChild(svg);

  // Close button click handler
  closeBtn.addEventListener('click', () => {
    block.style.display = 'none';
    // Optionally set a session/local storage flag to prevent reappearing
    // on the same page during the same session
  });

  return closeBtn;
}

/**
 * Creates a CTA button for banner alerts
 * @param {string} href - The link URL
 * @param {string} text - The button text
 * @param {string} title - The button title attribute
 * @returns {HTMLElement} The CTA button element
 */
function createCTAButton(href, text, title) {
  const ctaWrapper = document.createElement('div');
  ctaWrapper.className = 'alert-cta';

  const button = document.createElement('a');
  button.className = 'button primary';
  button.href = href || '#';
  button.textContent = text || 'Learn more';

  if (title) {
    button.setAttribute('title', title);
  }

  // Add chevron icon
  const chevron = document.createElement('span');
  chevron.className = 'button-icon';
  chevron.setAttribute('aria-hidden', 'true');
  chevron.textContent = '›';

  button.appendChild(chevron);
  ctaWrapper.appendChild(button);

  return ctaWrapper;
}

/**
 * Loads and decorates the alert block
 * @param {Element} block The alert block element
 */
export default async function decorate(block) {
  const rows = [...block.children];

  // Extract content from rows (row-per-field pattern)
  const type = rows[0]?.textContent?.trim().toLowerCase() || 'message';
  const theme = rows[1]?.textContent?.trim().toLowerCase() || 'neutral';
  const title = rows[2]?.textContent?.trim() || '';
  const descriptionRow = rows[3];
  const showClose = rows[4]?.textContent?.trim().toLowerCase() === 'true';
  const ctaCell = rows[5]?.querySelector('a');
  const ctaLink = ctaCell?.href || '';
  const ctaText = ctaCell?.textContent?.trim() || '';
  const ctaTitle = ctaCell?.getAttribute('title') || '';

  // Clear the block
  block.innerHTML = '';

  // Add theme and type classes
  block.classList.add(`alert-${theme}`);
  block.classList.add(`alert-${type}`);

  // Set ARIA role
  block.setAttribute('role', 'alert');

  // Create content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'alert-content';

  // Add icon
  const icon = createIcon();
  contentWrapper.appendChild(icon);

  // Create text content area
  const textContent = document.createElement('div');
  textContent.className = 'alert-text';

  // Add title if present
  if (title) {
    const titleElement = document.createElement('div');
    titleElement.className = 'alert-title';
    titleElement.textContent = title;
    textContent.appendChild(titleElement);
  }

  // Add description if present
  if (descriptionRow) {
    const description = document.createElement('div');
    description.className = 'alert-description';
    // Move the rich text content
    const richTextDiv = descriptionRow.querySelector('div');
    if (richTextDiv) {
      description.innerHTML = richTextDiv.innerHTML;
    }
    textContent.appendChild(description);
  }

  contentWrapper.appendChild(textContent);

  // Add CTA button for banner type
  if (type === 'banner' && ctaLink && ctaText) {
    const cta = createCTAButton(ctaLink, ctaText, ctaTitle);
    contentWrapper.appendChild(cta);
  }

  block.appendChild(contentWrapper);

  // Add close button if requested
  if (showClose) {
    const closeBtn = createCloseButton(block);
    block.appendChild(closeBtn);
  }

  // Mark as loaded
  block.classList.add('alert-loaded');
}
