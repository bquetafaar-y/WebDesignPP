'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Не вдалося завантажити скрипт: ${src}`));
    document.head.append(script);
  });

  const loadStylesheet = (href) => new Promise((resolve, reject) => {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = href;
    stylesheet.onload = resolve;
    stylesheet.onerror = () => reject(new Error(`Не вдалося завантажити стилі: ${href}`));
    document.head.append(stylesheet);
  });

  const loadWhenNear = (element, callback) => {
    if (!element) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      callback();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        callback();
      }
    }, { rootMargin: '600px 0px' });

    observer.observe(element);
  };

  const swiperElement = document.querySelector('.carepoint-swiper');

  loadWhenNear(swiperElement, () => {
    Promise.all([
      loadStylesheet('https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css'),
      loadScript('https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js')
    ]).then(() => {
      if (typeof window.Swiper !== 'function') {
        throw new Error('Swiper не завантажився. Перевірте підключення CDN.');
      }

      new window.Swiper(swiperElement, {
        slidesPerView: 1,
        spaceBetween: 16,
        loop: true,
        autoplay: {
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        },
        pagination: {
          el: '.carepoint-swiper__pagination',
          clickable: true
        },
        navigation: {
          nextEl: '.carepoint-swiper__next',
          prevEl: '.carepoint-swiper__prev'
        },
        breakpoints: {
          640: {
            slidesPerView: 2,
            spaceBetween: 20
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 24
          }
        },
        a11y: {
          enabled: true,
          containerMessage: 'Напрями медичної допомоги',
          prevSlideMessage: 'Попередній слайд',
          nextSlideMessage: 'Наступний слайд',
          firstSlideMessage: 'Це перший слайд',
          lastSlideMessage: 'Це останній слайд',
          paginationBulletMessage: 'Перейти до слайду {{index}}'
        }
      });
    }).catch((error) => console.error(error));
  });

  const gallery = document.querySelector('.carepoint-gallery');

  loadWhenNear(gallery, () => {
    Promise.all([
      loadStylesheet('https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.css'),
      loadScript('https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.umd.js')
    ]).then(() => {
      if (!window.Fancybox) {
        throw new Error('Fancybox не завантажився. Перевірте підключення CDN.');
      }

      window.Fancybox.bind('[data-fancybox="carepoint-gallery"]', {
        Carousel: {
          transition: 'slide'
        },
        Images: {
          zoom: true
        },
        Toolbar: {
          display: {
            left: ['infobar'],
            middle: [],
            right: ['iterateZoom', 'close']
          }
        }
      });
    }).catch((error) => console.error(error));
  });

  const typedElement = document.getElementById('hero-typed');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typedElement && !prefersReducedMotion) {
    const strings = [
      'Приватна клініка поруч',
      'Турбота вдома та онлайн',
      'Лікарі, яким довіряють'
    ];
    let stringIndex = 0;
    let characterIndex = strings[0].length;
    let deleting = false;

    const updateText = () => {
      const currentString = strings[stringIndex];
      characterIndex += deleting ? -1 : 1;
      typedElement.textContent = currentString.slice(0, characterIndex);

      let delay = deleting ? 25 : 45;

      if (!deleting && characterIndex === currentString.length) {
        deleting = true;
        delay = 1800;
      } else if (deleting && characterIndex === 0) {
        deleting = false;
        stringIndex = (stringIndex + 1) % strings.length;
        delay = 250;
      }

      window.setTimeout(updateText, delay);
    };

    window.setTimeout(updateText, 1800);
  }
});
