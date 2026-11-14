'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const swiperElement = document.querySelector('.carepoint-swiper');

  if (swiperElement) {
    if (typeof window.Swiper !== 'function') {
      console.error('Swiper не завантажився. Перевірте підключення CDN.');
    } else {
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
    }
  }

  const gallery = document.querySelector('[data-fancybox="carepoint-gallery"]');

  if (gallery) {
    if (!window.Fancybox) {
      console.error('Fancybox не завантажився. Перевірте підключення CDN.');
    } else {
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
    }
  }

  const typedElement = document.getElementById('hero-typed');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typedElement && !prefersReducedMotion) {
    if (typeof window.Typed !== 'function') {
      console.error('Typed.js не завантажився. Перевірте підключення CDN.');
    } else {
      new window.Typed(typedElement, {
        strings: [
          'Приватна клініка поруч',
          'Турбота вдома та онлайн',
          'Лікарі, яким довіряють'
        ],
        typeSpeed: 45,
        backSpeed: 25,
        backDelay: 1800,
        loop: true,
        smartBackspace: true
      });
    }
  }
});