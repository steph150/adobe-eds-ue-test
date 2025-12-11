/**
 * Alert block decoration
 * Displays alert messages with different types and themes
 * @param {Element} block The alert block element
 */
export default async function decorate(block) {
  const rows = [...block.children];

  // Extract data from rows with element grouping structure
  // Row 0: classes group (banner/message + theme + closeable)
  // Row 1: content group (title + description)
  // Row 2: cta group (link + linkText + linkTitle) - only for banner type

  // Get classes from block (applied by Universal Editor)
  const alertType = block.classList.contains('banner') ? 'banner' : 'message';
  const alertTheme = Array.from(block.classList)
    .find((cls) => ['neutral', 'warning', 'information', 'success', 'error'].includes(cls)) || 'neutral';
  const showCloseButton = block.classList.contains('closeable');

  // Content is in row 0 (content group)
  const contentRow = rows[0];
  let titleText = '';
  let descriptionElement = null;

  if (contentRow) {
    const contentDiv = contentRow.querySelector('div > div');
    if (contentDiv) {
      // Look for title and description within content group
      const firstChild = contentDiv.firstElementChild;
      if (firstChild && firstChild.tagName !== 'P') {
        titleText = firstChild.textContent?.trim();
        descriptionElement = firstChild.nextElementSibling;
      } else {
        descriptionElement = contentDiv;
      }
    }
  }

  // CTA is in row 1 (cta group)
  const ctaRow = rows[1];

  // Add theme class to block
  block.classList.add(`alert-${alertTheme}`);
  block.classList.add(`alert-${alertType}`);

  // Clear the block
  block.innerHTML = '';

  // Create alert container
  const alertContainer = document.createElement('div');
  alertContainer.className = 'alert-container';

  // Create left border accent (colored bar)
  const borderAccent = document.createElement('div');
  borderAccent.className = 'alert-border';
  alertContainer.appendChild(borderAccent);

  // Create icon container
  const iconContainer = document.createElement('div');
  iconContainer.className = 'alert-icon';

  // Create icon (circle with person/info symbol)
  const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  iconSvg.setAttribute('width', '40');
  iconSvg.setAttribute('height', '40');
  iconSvg.setAttribute('viewBox', '0 0 40 40');
  iconSvg.setAttribute('fill', 'none');
  iconSvg.setAttribute('aria-hidden', 'true');

  // Circle background
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '20');
  circle.setAttribute('cy', '20');
  circle.setAttribute('r', '18');
  circle.setAttribute('stroke', 'currentColor');
  circle.setAttribute('stroke-width', '2');
  circle.setAttribute('fill', 'none');

  // Person icon path
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M20 12c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14c-3.31 0-10 1.66-10 5v2h20v-2c0-3.34-6.69-5-10-5z');
  path.setAttribute('fill', 'currentColor');

  iconSvg.appendChild(circle);
  iconSvg.appendChild(path);
  iconContainer.appendChild(iconSvg);
  alertContainer.appendChild(iconContainer);

  // Create content container
  const contentContainer = document.createElement('div');
  contentContainer.className = 'alert-content';

  // Add title if present
  if (titleText) {
    const titleElement = document.createElement('div');
    titleElement.className = 'alert-title';
    titleElement.textContent = titleText;
    contentContainer.appendChild(titleElement);
  }

  // Add description if present
  if (descriptionElement) {
    const descriptionDiv = document.createElement('div');
    descriptionDiv.className = 'alert-description';
    descriptionDiv.innerHTML = descriptionElement.innerHTML;
    contentContainer.appendChild(descriptionDiv);
  }

  // Add CTA button for banner type
  if (alertType === 'banner' && ctaRow) {
    const ctaLink = ctaRow.querySelector('a');
    if (ctaLink) {
      const ctaButton = document.createElement('a');
      ctaButton.href = ctaLink.href;
      ctaButton.className = 'alert-cta button primary';
      ctaButton.textContent = ctaLink.textContent;

      if (ctaLink.title) {
        ctaButton.title = ctaLink.title;
      }

      // Add chevron icon
      const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      chevron.setAttribute('width', '20');
      chevron.setAttribute('height', '20');
      chevron.setAttribute('viewBox', '0 0 20 20');
      chevron.setAttribute('fill', 'currentColor');
      chevron.setAttribute('aria-hidden', 'true');
      chevron.classList.add('button-icon');

      const chevronPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      chevronPath.setAttribute('d', 'M7 4l6 6-6 6');
      chevronPath.setAttribute('stroke', 'currentColor');
      chevronPath.setAttribute('stroke-width', '2');
      chevronPath.setAttribute('fill', 'none');
      chevron.appendChild(chevronPath);

      ctaButton.appendChild(chevron);

      const ctaContainer = document.createElement('div');
      ctaContainer.className = 'alert-cta-container';
      ctaContainer.appendChild(ctaButton);
      contentContainer.appendChild(ctaContainer);
    }
  }

  alertContainer.appendChild(contentContainer);

  // Add close button if enabled
  if (showCloseButton) {
    const closeButton = document.createElement('button');
    closeButton.className = 'alert-close';
    closeButton.setAttribute('aria-label', 'Close alert');
    closeButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18"/>
      </svg>
    `;

    closeButton.addEventListener('click', () => {
      block.style.display = 'none';
    });

    alertContainer.appendChild(closeButton);
  }

  block.appendChild(alertContainer);
}
