/**
 * Decorates the alert block
 * @param {Element} block The alert block element
 */
export default async function decorate(block) {
  const rows = [...block.children];

  // Extract content from rows (row-per-field structure for Universal Editor)
  const titleRow = rows[0];
  const descriptionRow = rows[1];
  const ctaRow = rows[2];

  // Determine block variant (banner vs message)
  const isBanner = block.classList.contains('banner');
  const hasCloseButton = block.classList.contains('close');

  // Get theme from classes
  const themeClasses = ['neutral', 'warning', 'information', 'success', 'error'];
  const theme = themeClasses.find((t) => block.classList.contains(t)) || 'neutral';

  // Build the alert structure
  const alertWrapper = document.createElement('div');
  alertWrapper.className = 'alert-wrapper';

  // Create icon element
  const icon = document.createElement('div');
  icon.className = 'alert-icon';
  icon.setAttribute('aria-hidden', 'true');

  // Create content container
  const content = document.createElement('div');
  content.className = 'alert-content';

  // Extract and create title
  if (titleRow) {
    const titleText = titleRow.textContent?.trim();
    if (titleText) {
      const title = document.createElement('div');
      title.className = 'alert-title';
      title.textContent = titleText;
      content.appendChild(title);
    }
  }

  // Extract and add description (already contains HTML from richtext field)
  if (descriptionRow) {
    const descriptionContent = descriptionRow.querySelector('div');
    if (descriptionContent) {
      const description = document.createElement('div');
      description.className = 'alert-description';
      description.innerHTML = descriptionContent.innerHTML;
      content.appendChild(description);
    }
  }

  // Extract and create CTA button (Banner type only)
  if (isBanner && ctaRow) {
    const ctaLink = ctaRow.querySelector('a');
    if (ctaLink) {
      const ctaButton = document.createElement('div');
      ctaButton.className = 'alert-cta';

      // Convert link to primary button
      ctaLink.classList.add('button', 'primary');

      // Add arrow icon
      const arrow = document.createElement('span');
      arrow.className = 'button-icon';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '›';
      ctaLink.appendChild(arrow);

      ctaButton.appendChild(ctaLink);
      content.appendChild(ctaButton);
    }
  }

  // Create close button if needed
  let closeBtn;
  if (hasCloseButton) {
    closeBtn = document.createElement('button');
    closeBtn.className = 'alert-close';
    closeBtn.setAttribute('type', 'button');
    closeBtn.setAttribute('aria-label', 'Close alert');
    closeBtn.innerHTML = '<span aria-hidden="true">×</span>';

    // Add click handler to remove alert
    closeBtn.addEventListener('click', () => {
      block.style.display = 'none';
      block.setAttribute('aria-hidden', 'true');
    });
  }

  // Assemble the alert
  alertWrapper.appendChild(icon);
  alertWrapper.appendChild(content);
  if (closeBtn) {
    alertWrapper.appendChild(closeBtn);
  }

  // Clear the block and add the new structure
  block.textContent = '';
  block.appendChild(alertWrapper);

  // Set ARIA role and live region for accessibility
  block.setAttribute('role', 'alert');
  block.setAttribute('aria-live', 'polite');

  // Add data attributes for theme
  block.dataset.theme = theme;
  block.dataset.variant = isBanner ? 'banner' : 'message';
}
