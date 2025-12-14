/**
 * Alert Block
 * Displays alert messages in banner or message format with various themes
 * @param {HTMLElement} block - The alert block element
 */
export default async function decorate(block) {
  const rows = [...block.children];
  
  // Extract content from rows (row-per-field pattern)
  const titleRow = rows[0];
  const textRow = rows[1];
  const alertTypeRow = rows[2];
  const alertThemeRow = rows[3];
  const showCloseButtonRow = rows[4];
  const ctaRow = rows[5];

  // Extract values
  const titleText = titleRow?.textContent?.trim();
  const alertType = alertTypeRow?.textContent?.trim() || 'banner';
  const alertTheme = alertThemeRow?.textContent?.trim() || 'neutral';
  const showCloseButton = showCloseButtonRow?.textContent?.trim() === 'true';
  
  // Add theme and type classes
  block.classList.add(alertType, alertTheme);
  if (showCloseButton) {
    block.classList.add('closeable');
  }

  // Clear the block
  block.innerHTML = '';

  // Create container for content
  const contentWrapper = document.createElement('div');
  contentWrapper.classList.add('alert-content');

  // Add icon
  const iconWrapper = document.createElement('div');
  iconWrapper.classList.add('alert-icon');
  iconWrapper.setAttribute('aria-hidden', 'true');
  
  // Create icon SVG (circle with person icon placeholder)
  const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  iconSvg.setAttribute('width', '48');
  iconSvg.setAttribute('height', '48');
  iconSvg.setAttribute('viewBox', '0 0 48 48');
  iconSvg.setAttribute('fill', 'none');
  
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '24');
  circle.setAttribute('cy', '24');
  circle.setAttribute('r', '23');
  circle.setAttribute('stroke', 'currentColor');
  circle.setAttribute('stroke-width', '2');
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M24 24c3.3 0 6-2.7 6-6s-2.7-6-6-6-6 2.7-6 6 2.7 6 6 6zm0 3c-4 0-12 2-12 6v3h24v-3c0-4-8-6-12-6z');
  path.setAttribute('fill', 'currentColor');
  
  iconSvg.appendChild(circle);
  iconSvg.appendChild(path);
  iconWrapper.appendChild(iconSvg);
  contentWrapper.appendChild(iconWrapper);

  // Create text container
  const textContainer = document.createElement('div');
  textContainer.classList.add('alert-text');

  // Add title if present
  if (titleText) {
    const title = document.createElement('h2');
    title.classList.add('alert-title');
    title.textContent = titleText;
    textContainer.appendChild(title);
  }

  // Add description
  const description = document.createElement('div');
  description.classList.add('alert-description');
  
  // Clone the richtext content
  const textContent = textRow?.querySelector('div > div');
  if (textContent) {
    description.innerHTML = textContent.innerHTML;
  }
  
  textContainer.appendChild(description);
  contentWrapper.appendChild(textContainer);

  // Add CTA button for banner type
  if (alertType === 'banner' && ctaRow) {
    const ctaLink = ctaRow.querySelector('a');
    if (ctaLink) {
      const ctaButton = document.createElement('a');
      ctaButton.href = ctaLink.href;
      ctaButton.textContent = ctaLink.textContent;
      ctaButton.classList.add('alert-cta', 'button', 'primary');
      
      if (ctaLink.title) {
        ctaButton.title = ctaLink.title;
      }
      
      // Add chevron icon
      const chevron = document.createElement('span');
      chevron.classList.add('icon-chevron');
      chevron.setAttribute('aria-hidden', 'true');
      chevron.innerHTML = '›';
      ctaButton.appendChild(chevron);
      
      contentWrapper.appendChild(ctaButton);
    }
  }

  block.appendChild(contentWrapper);

  // Add close button if enabled
  if (showCloseButton) {
    const closeButton = document.createElement('button');
    closeButton.classList.add('alert-close');
    closeButton.setAttribute('aria-label', 'Close alert');
    closeButton.type = 'button';
    
    // Create X icon
    closeButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    closeButton.addEventListener('click', () => {
      block.remove();
    });
    
    block.appendChild(closeButton);
  }

  // Set appropriate ARIA role
  block.setAttribute('role', 'alert');
  if (alertType === 'banner') {
    block.setAttribute('role', 'banner');
  }
}
