/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / (k ** i)) * 100) / 100} ${sizes[i]}`;
}

/**
 * Get file extension from URL or filename
 * @param {string} url - File URL or path
 * @returns {string} File extension in uppercase
 */
function getFileExtension(url) {
  const { pathname } = new URL(url, window.location.origin);
  const extension = pathname.split('.').pop();
  return extension ? extension.toUpperCase() : '';
}

/**
 * Get filename from URL
 * @param {string} url - File URL or path
 * @returns {string} Filename without path
 */
function getFilename(url) {
  const { pathname } = new URL(url, window.location.origin);
  return pathname.split('/').pop();
}

/**
 * Fetch file metadata (size)
 * @param {string} url - File URL
 * @returns {Promise<number>} File size in bytes
 */
async function getFileSize(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Loads and decorates the download block
 * @param {Element} block The download block element
 */
export default async function decorate(block) {
  // Extract rows from Universal Editor structure (row-per-field pattern)
  const rows = [...block.children];

  // Row 0: asset (link to download file)
  const assetRow = rows[0];
  const assetLink = assetRow?.querySelector('a');
  const assetUrl = assetLink?.href;

  // Row 1: title
  const titleRow = rows[1];
  const titleText = titleRow?.textContent?.trim();

  // Row 2: getTitleFromDAM (boolean)
  const getTitleFromDAMRow = rows[2];
  const getTitleFromDAM = getTitleFromDAMRow?.textContent?.trim().toLowerCase() === 'true';

  // Row 3: description (rich text)
  const descriptionRow = rows[3];
  const descriptionContent = descriptionRow?.querySelector('div');

  // Row 4: getDescriptionFromDAM (boolean)
  const getDescFromDAMRow = rows[4];
  const getDescFromDAM = getDescFromDAMRow?.textContent?.trim().toLowerCase() === 'true';

  // Row 5: buttonText
  const buttonTextRow = rows[5];
  const buttonText = buttonTextRow?.textContent?.trim() || 'Download';

  // Row 6: displayInline (boolean)
  const displayInlineRow = rows[6];
  const displayInline = displayInlineRow?.textContent?.trim().toLowerCase() === 'true';

  // Row 7: displayFilename (boolean)
  const displayFilenameRow = rows[7];
  const displayFilename = displayFilenameRow?.textContent?.trim().toLowerCase() !== 'false'; // Default true

  // Row 8: displayFileSize (boolean)
  const displayFileSizeRow = rows[8];
  const displayFileSize = displayFileSizeRow?.textContent?.trim().toLowerCase() !== 'false'; // Default true

  // Row 9: displayFileFormat (boolean)
  const displayFileFormatRow = rows[9];
  const displayFileFormat = displayFileFormatRow?.textContent?.trim().toLowerCase() !== 'false'; // Default true

  // Row 10: id (HTML ID attribute)
  const idRow = rows[10];
  const customId = idRow?.textContent?.trim();

  // Clear the block
  block.innerHTML = '';

  // If no asset, show error message
  if (!assetUrl) {
    block.innerHTML = '<p class="download-error">No download asset specified</p>';
    return;
  }

  // Create download container
  const container = document.createElement('div');
  container.className = 'download-container';

  // Set custom ID if provided
  if (customId) {
    container.id = customId;
  }

  // Create content wrapper
  const content = document.createElement('div');
  content.className = 'download-content';

  // Add title if provided (or if DAM title should be used)
  if (titleText && !getTitleFromDAM) {
    const title = document.createElement('h3');
    title.className = 'download-title';
    title.textContent = titleText;
    content.appendChild(title);
  }
  // Note: getTitleFromDAM would require DAM API integration

  // Add description if provided
  if (descriptionContent && !getDescFromDAM) {
    const description = document.createElement('div');
    description.className = 'download-description';
    description.appendChild(descriptionContent.cloneNode(true));
    content.appendChild(description);
  }
  // Note: getDescFromDAM would require DAM API integration

  // Create file metadata section
  const metadata = document.createElement('div');
  metadata.className = 'download-metadata';

  // Get file information
  const filename = getFilename(assetUrl);
  const extension = getFileExtension(assetUrl);

  // Display filename if enabled
  if (displayFilename && filename) {
    const filenameTag = document.createElement('span');
    filenameTag.className = 'download-filename';
    filenameTag.textContent = filename;
    metadata.appendChild(filenameTag);
  }

  // Display file format if enabled
  if (displayFileFormat && extension) {
    const formatTag = document.createElement('span');
    formatTag.className = 'download-format';
    formatTag.textContent = extension;
    metadata.appendChild(formatTag);
  }

  // Display file size if enabled
  if (displayFileSize) {
    const sizeTag = document.createElement('span');
    sizeTag.className = 'download-size';
    sizeTag.textContent = 'Loading...';
    metadata.appendChild(sizeTag);

    // Fetch file size asynchronously
    getFileSize(assetUrl).then((size) => {
      sizeTag.textContent = formatFileSize(size);
    });
  }

  // Add metadata to content if there are any tags
  if (metadata.children.length > 0) {
    content.appendChild(metadata);
  }

  // Create download button
  const button = document.createElement('a');
  button.className = 'download-button button';
  button.href = assetUrl;
  button.textContent = buttonText;

  // Set download behavior
  if (displayInline) {
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
  } else {
    button.download = filename || '';
  }

  content.appendChild(button);
  container.appendChild(content);
  block.appendChild(container);
}
