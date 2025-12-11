/**
 * Decorates the alert block
 * @param {Element} block The alert block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Extract content from rows (row-per-field pattern for Universal Editor)
  const alertType = rows[0]?.textContent?.trim().toLowerCase() || 'message';
  const alertTheme = rows[1]?.textContent?.trim().toLowerCase() || 'neutral';
  const titleText = rows[2]?.textContent?.trim();
  const descriptionRow = rows[3];
  const ctaLinkRow = rows[4];
  const showClose = rows[5]?.textContent?.trim().toLowerCase() === 'true';

  // Clear the block
  block.innerHTML = '';

  // Add theme and type classes
  block.classList.add(`alert-${alertTheme}`);
  block.classList.add(`alert-${alertType}`);

  // Create main container
  const container = document.createElement('div');
  container.className = 'alert-container';

  // Create icon container
  const iconContainer = document.createElement('div');
  iconContainer.className = 'alert-icon';

  // Add icon SVG (user/info icon)
  const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  iconSvg.setAttribute('width', '24');
  iconSvg.setAttribute('height', '24');
  iconSvg.setAttribute('viewBox', '0 0 24 24');
  iconSvg.setAttribute('fill', 'none');
  iconSvg.setAttribute('stroke', 'currentColor');
  iconSvg.setAttribute('stroke-width', '2');
  iconSvg.setAttribute('aria-hidden', 'true');

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '12');
  circle.setAttribute('r', '10');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M12 16v-4M12 8h.01');

  iconSvg.appendChild(circle);
  iconSvg.appendChild(path);
  iconContainer.appendChild(iconSvg);

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
  if (descriptionRow) {
    const description = document.createElement('div');
    description.className = 'alert-description';
    // Move existing content (may contain rich text)
    while (descriptionRow.firstChild) {
      description.appendChild(descriptionRow.firstChild);
    }
    contentContainer.appendChild(description);
  }

  // Add CTA button for banner type if link exists
  if (alertType === 'banner' && ctaLinkRow) {
    const link = ctaLinkRow.querySelector('a');
    if (link) {
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'alert-cta';

      // Create button with primary styling
      const button = document.createElement('a');
      button.href = link.href;
      button.className = 'alert-button';
      button.textContent = link.textContent || 'Learn More';

      // Add chevron icon
      const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      chevron.setAttribute('width', '16');
      chevron.setAttribute('height', '16');
      chevron.setAttribute('viewBox', '0 0 16 16');
      chevron.setAttribute('fill', 'none');
      chevron.setAttribute('stroke', 'currentColor');
      chevron.setAttribute('stroke-width', '2');
      chevron.setAttribute('aria-hidden', 'true');

      const chevronPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      chevronPath.setAttribute('d', 'M6 4l4 4-4 4');

      chevron.appendChild(chevronPath);
      button.appendChild(chevron);

      buttonContainer.appendChild(button);
      contentContainer.appendChild(buttonContainer);
    }
  }

  // Create close button if enabled
  if (showClose) {
    const closeButton = document.createElement('button');
    closeButton.className = 'alert-close';
    closeButton.setAttribute('aria-label', 'Close alert');
    closeButton.type = 'button';

    // Add close icon (X)
    const closeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    closeSvg.setAttribute('width', '20');
    closeSvg.setAttribute('height', '20');
    closeSvg.setAttribute('viewBox', '0 0 20 20');
    closeSvg.setAttribute('fill', 'none');
    closeSvg.setAttribute('stroke', 'currentColor');
    closeSvg.setAttribute('stroke-width', '2');
    closeSvg.setAttribute('aria-hidden', 'true');

    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line1.setAttribute('d', 'M5 5l10 10M15 5l-10 10');

    closeSvg.appendChild(line1);
    closeButton.appendChild(closeSvg);

    // Add close functionality
    closeButton.addEventListener('click', () => {
      block.style.display = 'none';
    });

    container.appendChild(closeButton);
  }

  // Assemble the structure
  container.appendChild(iconContainer);
  container.appendChild(contentContainer);
  block.appendChild(container);
}
