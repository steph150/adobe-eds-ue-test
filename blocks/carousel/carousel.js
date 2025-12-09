/**
 * Updates the active slide and manages ARIA attributes for accessibility
 * @param {Element} slide - The slide element to make active
 */
function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');
  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    if (idx !== slideIndex) {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    } else {
      button.setAttribute('disabled', true);
      button.setAttribute('aria-current', true);
    }
  });
}

/**
 * Shows a specific slide with smooth scrolling
 * @param {Element} block - The carousel block element
 * @param {number} slideIndex - Index of the slide to show
 */
function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

/**
 * Binds event listeners for carousel navigation
 * @param {Element} block - The carousel block element
 */
function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });

  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });

  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

/**
 * Creates a carousel slide from a carousel-item block
 * For Universal Editor: Each carousel-item is a nested block with row-per-field structure
 * Expected rows:
 * - Row 0: image (with imageAlt embedded in img alt attribute)
 * - Row 1: title (plain text)
 * - Row 2: description (richtext)
 * - Row 3: cta group (primaryLink, primaryText, secondaryLink, secondaryText all grouped)
 *
 * @param {Element} item - The carousel-item block element
 * @param {number} slideIndex - Index of the slide
 * @param {string} carouselId - Unique ID for the carousel
 * @returns {Element} The created slide element
 */
function createSlide(item, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  const rows = [...item.children];

  // Create image container
  const picture = rows[0]?.querySelector('picture');
  if (picture) {
    const imageDiv = document.createElement('div');
    imageDiv.classList.add('carousel-slide-image');
    imageDiv.append(picture);
    slide.append(imageDiv);
  }

  // Create content container
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('carousel-slide-content');

  // Add title (row 1 - plain text, convert to h2)
  const titleText = rows[1]?.textContent?.trim();
  if (titleText) {
    const h2 = document.createElement('h2');
    h2.textContent = titleText;
    h2.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}-heading`);
    contentDiv.append(h2);
    slide.setAttribute('aria-labelledby', h2.getAttribute('id'));
  }

  // Add description (row 2 - richtext)
  const descriptionContent = rows[2]?.querySelector('div');
  if (descriptionContent) {
    contentDiv.append(descriptionContent);
  }

  // Add CTAs container (row 3 - all CTAs grouped together)
  const ctasDiv = document.createElement('div');
  ctasDiv.classList.add('carousel-slide-ctas');

  const ctaRow = rows[3];
  if (ctaRow) {
    const links = ctaRow.querySelectorAll('a');
    links.forEach((link, index) => {
      link.classList.add('button', index === 0 ? 'primary' : 'secondary');
      ctasDiv.append(link);
    });
  }

  if (ctasDiv.children.length > 0) {
    contentDiv.append(ctasDiv);
  }

  slide.append(contentDiv);
  return slide;
}

let carouselId = 0;

/**
 * Decorates the carousel block
 * For Universal Editor: The carousel is a container block with carousel-item children
 * Each child div represents a carousel-item block
 * @param {Element} block - The carousel block element
 */
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  // Get carousel items (each child div is a carousel-item block)
  const items = [...block.children];
  const isSingleSlide = items.length < 2;

  // Create carousel structure
  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="Previous Slide"></button>
      <button type="button" class="slide-next" aria-label="Next Slide"></button>
    `;
    container.append(slideNavButtons);
  }

  // Create slides from carousel items
  items.forEach((item, idx) => {
    const slide = createSlide(item, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="Show Slide ${idx + 1} of ${items.length}"></button>`;
      slideIndicators.append(indicator);
    }

    item.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
