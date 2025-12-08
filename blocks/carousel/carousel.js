import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Create a carousel slide from Universal Editor row-per-field structure
 * Each carousel item has 4 rows:
 * - Row 0: image (with imageAlt embedded as attribute)
 * - Row 1: content group (content_title + content_description grouped)
 * - Row 2: primaryCta (with primaryCtaText collapsed into link text)
 * - Row 3: secondaryCta (with secondaryCtaText collapsed into link text)
 * @param {Element} item - The carousel item container
 * @returns {Element} The slide element
 */
function createSlide(item) {
  const slide = document.createElement('li');
  slide.className = 'carousel-slide';
  moveInstrumentation(item, slide);

  const rows = [...item.children];

  // Row 0: Image
  const picture = rows[0]?.querySelector('picture');
  if (picture) {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'carousel-slide-image';
    const img = picture.querySelector('img');
    if (img) {
      const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
      moveInstrumentation(img, optimizedPic.querySelector('img'));
      imageDiv.append(optimizedPic);
    }
    slide.append(imageDiv);
  }

  // Content wrapper for text and CTAs
  const content = document.createElement('div');
  content.className = 'carousel-slide-content';

  // Row 1: Content group (title + description)
  const contentGroup = rows[1];
  if (contentGroup) {
    // Find title - look for plain text that should become h2
    const titleElem = Array.from(contentGroup.querySelectorAll('p, div')).find((el) => {
      const text = el.textContent?.trim();
      return text && !el.querySelector('a, strong, em, picture');
    });

    if (titleElem) {
      const title = document.createElement('h2');
      title.textContent = titleElem.textContent.trim();
      content.append(title);
    }

    // Find description - rich text content
    const descElems = Array.from(contentGroup.querySelectorAll('p')).filter((el) => el !== titleElem);
    if (descElems.length > 0) {
      const descDiv = document.createElement('div');
      descDiv.className = 'carousel-slide-description';
      descElems.forEach((p) => descDiv.append(p.cloneNode(true)));
      content.append(descDiv);
    }
  }

  // CTAs wrapper
  const ctasDiv = document.createElement('div');
  ctasDiv.className = 'carousel-slide-ctas';

  // Row 2: Primary CTA (primaryCta link with primaryCtaText collapsed)
  // primaryCtaNewTab boolean field is embedded (doesn't create visible row)
  const primaryCta = rows[2]?.querySelector('a');
  if (primaryCta) {
    primaryCta.classList.add('button', 'primary');
    // Check data attribute for new tab setting (boolean fields become data attributes)
    const newTab = rows[2]?.textContent?.includes('true');
    if (newTab) {
      primaryCta.target = '_blank';
      primaryCta.rel = 'noopener noreferrer';
    }
    ctasDiv.append(primaryCta);
  }

  // Row 3: Secondary CTA (secondaryCta link with secondaryCtaText collapsed)
  // secondaryCtaNewTab boolean field is embedded (doesn't create visible row)
  const secondaryCta = rows[3]?.querySelector('a');
  if (secondaryCta) {
    secondaryCta.classList.add('button', 'secondary');
    // Check data attribute for new tab setting (boolean fields become data attributes)
    const newTab = rows[3]?.textContent?.includes('true');
    if (newTab) {
      secondaryCta.target = '_blank';
      secondaryCta.rel = 'noopener noreferrer';
    }
    ctasDiv.append(secondaryCta);
  }

  if (ctasDiv.children.length > 0) {
    content.append(ctasDiv);
  }

  slide.append(content);

  return slide;
}

/**
 * Update slide indicators
 * @param {Element} block - The carousel block
 * @param {number} activeIndex - The active slide index
 */
function updateIndicators(block, activeIndex) {
  const indicators = block.querySelectorAll('.carousel-nav-indicator');
  indicators.forEach((indicator, index) => {
    if (index === activeIndex) {
      indicator.classList.add('active');
      indicator.setAttribute('aria-current', 'true');
    } else {
      indicator.classList.remove('active');
      indicator.setAttribute('aria-current', 'false');
    }
  });
}

/**
 * Navigate to a specific slide
 * @param {Element} block - The carousel block
 * @param {number} index - The slide index
 */
function goToSlide(block, index) {
  const slidesWrapper = block.querySelector('.carousel-slides');
  const slides = block.querySelectorAll('.carousel-slide:not(.carousel-slide-clone)');
  const totalSlides = slides.length;

  if (totalSlides === 0) return;

  // Wrap around
  let targetIndex = index;
  if (index < 0) targetIndex = totalSlides - 1;
  if (index >= totalSlides) targetIndex = 0;

  // Store the active index on the block
  block.dataset.activeSlide = targetIndex;

  // Calculate offset
  const slideWidth = slides[0].offsetWidth;
  const offset = -targetIndex * slideWidth;

  slidesWrapper.style.transform = `translateX(${offset}px)`;

  // Update indicators
  updateIndicators(block, targetIndex);

  // Update ARIA
  slides.forEach((slide, i) => {
    if (i === targetIndex) {
      slide.setAttribute('aria-hidden', 'false');
      slide.querySelectorAll('a, button').forEach((el) => {
        el.removeAttribute('tabindex');
      });
    } else {
      slide.setAttribute('aria-hidden', 'true');
      slide.querySelectorAll('a, button').forEach((el) => {
        el.setAttribute('tabindex', '-1');
      });
    }
  });
}

/**
 * Create navigation controls
 * @param {Element} block - The carousel block
 * @param {number} slideCount - Number of slides
 */
function createNavigation(block, slideCount) {
  // Previous/Next buttons
  const prevButton = document.createElement('button');
  prevButton.className = 'carousel-nav-button carousel-nav-prev';
  prevButton.setAttribute('aria-label', 'Previous slide');
  prevButton.innerHTML = '<span class="carousel-nav-icon">‹</span>';
  prevButton.addEventListener('click', () => {
    const currentIndex = parseInt(block.dataset.activeSlide || '0', 10);
    goToSlide(block, currentIndex - 1);
  });

  const nextButton = document.createElement('button');
  nextButton.className = 'carousel-nav-button carousel-nav-next';
  nextButton.setAttribute('aria-label', 'Next slide');
  nextButton.innerHTML = '<span class="carousel-nav-icon">›</span>';
  nextButton.addEventListener('click', () => {
    const currentIndex = parseInt(block.dataset.activeSlide || '0', 10);
    goToSlide(block, currentIndex + 1);
  });

  block.append(prevButton, nextButton);

  // Indicators
  const indicators = document.createElement('div');
  indicators.className = 'carousel-nav-indicators';
  indicators.setAttribute('role', 'tablist');

  for (let i = 0; i < slideCount; i += 1) {
    const indicator = document.createElement('button');
    indicator.className = 'carousel-nav-indicator';
    indicator.setAttribute('aria-label', `Go to slide ${i + 1}`);
    indicator.setAttribute('role', 'tab');
    indicator.setAttribute('aria-controls', `carousel-slide-${i}`);

    if (i === 0) {
      indicator.classList.add('active');
      indicator.setAttribute('aria-current', 'true');
    }

    indicator.addEventListener('click', () => {
      goToSlide(block, i);
    });

    indicators.append(indicator);
  }

  block.append(indicators);
}

/**
 * Decorate carousel block
 * @param {Element} block - The carousel block element
 */
export default function decorate(block) {
  // Get all carousel items (each item is a child div of the block)
  const items = [...block.children];

  if (items.length === 0) {
    block.innerHTML = '<p>No carousel items found</p>';
    return;
  }

  // Create slides from items
  const slides = items.map((item) => createSlide(item));

  // Create slides wrapper
  const slidesWrapper = document.createElement('ul');
  slidesWrapper.className = 'carousel-slides';
  slidesWrapper.setAttribute('role', 'region');
  slidesWrapper.setAttribute('aria-label', 'Carousel');

  // Add slides
  slides.forEach((slide, index) => {
    slide.id = `carousel-slide-${index}`;
    slide.setAttribute('role', 'tabpanel');
    slide.setAttribute('aria-label', `Slide ${index + 1} of ${slides.length}`);
    slidesWrapper.append(slide);
  });

  // Replace block content with carousel structure
  block.innerHTML = '';
  block.append(slidesWrapper);

  // Create navigation
  createNavigation(block, slides.length);

  // Initialize first slide
  block.dataset.activeSlide = '0';
  goToSlide(block, 0);

  // Auto-play (optional - can be controlled via block variant)
  if (block.classList.contains('autoplay')) {
    setInterval(() => {
      const currentIndex = parseInt(block.dataset.activeSlide || '0', 10);
      goToSlide(block, currentIndex + 1);
    }, 5000);
  }

  // Keyboard navigation
  block.addEventListener('keydown', (e) => {
    const currentIndex = parseInt(block.dataset.activeSlide || '0', 10);
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToSlide(block, currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToSlide(block, currentIndex + 1);
    }
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  slidesWrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  slidesWrapper.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const currentIndex = parseInt(block.dataset.activeSlide || '0', 10);

    if (touchStartX - touchEndX > 50) {
      // Swipe left
      goToSlide(block, currentIndex + 1);
    } else if (touchEndX - touchStartX > 50) {
      // Swipe right
      goToSlide(block, currentIndex - 1);
    }
  });
}
