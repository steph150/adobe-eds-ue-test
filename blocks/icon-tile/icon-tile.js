/**
 * Decorates an individual icon tile item
 * @param {Element} item The icon tile item element
 */
function decorateTileItem(item) {
  const rows = [...item.children];

  // Extract content from rows
  // Row 0: icon (picture element) - optional
  // Row 1: title (plain text) - optional
  // Row 2: description (rich text) - optional

  const iconRow = rows[0];
  const titleRow = rows[1];
  const descriptionRow = rows[2];

  // Create the tile structure
  const tileContent = document.createElement('div');
  tileContent.className = 'icon-tile-content';

  // Handle icon (optional)
  if (iconRow) {
    const picture = iconRow.querySelector('picture');
    if (picture) {
      const iconWrapper = document.createElement('div');
      iconWrapper.className = 'icon-tile-icon';
      iconWrapper.append(picture);
      tileContent.append(iconWrapper);
    }
  }

  // Handle title (optional)
  if (titleRow) {
    const titleText = titleRow.textContent?.trim();
    if (titleText) {
      const titleElement = document.createElement('h3');
      titleElement.className = 'icon-tile-title';
      titleElement.textContent = titleText;
      tileContent.append(titleElement);
    }
  }

  // Handle description (optional, already has rich text HTML)
  if (descriptionRow) {
    const descriptionContent = descriptionRow.querySelector('div');
    if (descriptionContent && descriptionContent.textContent?.trim()) {
      const descriptionWrapper = document.createElement('div');
      descriptionWrapper.className = 'icon-tile-description';
      descriptionWrapper.innerHTML = descriptionContent.innerHTML;
      tileContent.append(descriptionWrapper);
    }
  }

  // Replace item content with decorated structure
  item.textContent = '';
  item.append(tileContent);
}

/**
 * Loads and decorates the icon tile block
 * @param {Element} block The icon-tile block element
 */
export default async function decorate(block) {
  // Get all tile items (direct children of block are the items)
  const items = [...block.children];

  // Process each tile item
  items.forEach((item) => {
    decorateTileItem(item);
  });

  // Add class based on number of tiles for styling
  const tileCount = items.length;
  if (tileCount === 1) {
    block.classList.add('one-tile');
  } else if (tileCount === 2) {
    block.classList.add('two-tiles');
  }
}
