/**
 * Creates an icon element for a download item
 * @param {string} iconType - The type of icon (pdf, word, excel, etc.)
 * @returns {HTMLElement} - The icon element
 */
function createIcon(iconType) {
  const icon = document.createElement('span');
  icon.className = `downloads-icon downloads-icon-${iconType}`;
  icon.setAttribute('aria-hidden', 'true');

  // Map icon types to display symbols or text
  const iconMap = {
    pdf: 'PDF',
    word: 'DOC',
    excel: 'XLS',
    powerpoint: 'PPT',
    zip: 'ZIP',
    vsd: 'VSD',
    application: 'APP',
    audio: '♪',
    video: '▶',
  };

  icon.textContent = iconMap[iconType] || '';
  return icon;
}

/**
 * Processes a download item row
 * @param {HTMLElement} row - The download item row element
 * @returns {HTMLElement} - The processed download item
 */
function processDownloadItem(row) {
  const item = document.createElement('div');
  item.className = 'downloads-item';

  const rows = [...row.children];

  // Extract data from rows (row-per-field structure)
  const labelRow = rows[0];
  const descriptionRow = rows[1];
  const pathRow = rows[2];
  const iconRow = rows[3];
  const sameTabRow = rows[4];

  const label = labelRow?.textContent?.trim() || '';
  const description = descriptionRow?.textContent?.trim() || '';
  const link = pathRow?.querySelector('a');
  const iconType = iconRow?.textContent?.trim().toLowerCase() || '';
  const sameTab = sameTabRow?.textContent?.trim().toLowerCase() === 'true';

  if (!link || !label) {
    return null; // Skip items without required fields
  }

  // Create the download item structure
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'downloads-item-content';

  // Add icon if specified
  if (iconType) {
    const icon = createIcon(iconType);
    contentWrapper.appendChild(icon);
  }

  // Create text container
  const textContainer = document.createElement('div');
  textContainer.className = 'downloads-item-text';

  // Add label
  const labelElement = document.createElement('div');
  labelElement.className = 'downloads-item-label';

  const downloadLink = document.createElement('a');
  downloadLink.href = link.href;
  downloadLink.textContent = label;
  downloadLink.className = 'downloads-item-link';

  // Set target attribute based on sameTab option
  if (!sameTab) {
    downloadLink.target = '_blank';
    downloadLink.rel = 'noopener noreferrer';
  }

  labelElement.appendChild(downloadLink);
  textContainer.appendChild(labelElement);

  // Add description if present
  if (description) {
    const descElement = document.createElement('div');
    descElement.className = 'downloads-item-description';
    descElement.textContent = description;
    textContainer.appendChild(descElement);
  }

  contentWrapper.appendChild(textContainer);
  item.appendChild(contentWrapper);

  return item;
}

/**
 * Decorates the downloads block
 * @param {HTMLElement} block - The downloads block element
 */
export default async function decorate(block) {
  const rows = [...block.children];

  // Create new structure
  const container = document.createElement('div');
  container.className = 'downloads-container';

  // Check if first row is a heading (optional)
  let startIndex = 0;
  if (rows.length > 0) {
    const firstRowText = rows[0]?.textContent?.trim();
    const hasHeading = rows[0]?.querySelector('h2, h3, h4, h5, h6')
                       || (firstRowText && !rows[0].querySelector('a'));

    if (hasHeading && firstRowText) {
      const heading = document.createElement('h2');
      heading.className = 'downloads-heading';
      heading.textContent = firstRowText;
      container.appendChild(heading);
      startIndex = 1;
    }
  }

  // Create list container
  const list = document.createElement('div');
  list.className = 'downloads-list';

  // Process each download item
  for (let i = startIndex; i < rows.length; i += 1) {
    const item = processDownloadItem(rows[i]);
    if (item) {
      list.appendChild(item);
    }
  }

  container.appendChild(list);

  // Replace block content with new structure
  block.textContent = '';
  block.appendChild(container);
}
