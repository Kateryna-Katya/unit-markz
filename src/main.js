document.addEventListener('DOMContentLoaded', () => {
  // 1. Инициализация иконок
  lucide.createIcons();

  // 2. Регистрация плагинов GSAP
  gsap.registerPlugin(ScrollTrigger);

  // 3. Плавный скролл (Lenis)
  const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      touchMultiplier: 2,
  });

  function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // 4. Логика мобильного меню (Исправленная)
  const burger = document.querySelector('.header__burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuContent = document.querySelector('.mobile-menu__content');
  const header = document.querySelector('.header');
  const headerLinks = document.querySelectorAll('.header__link');
  const body = document.body;

  // Клонируем ссылки в мобильное меню
  // Очищаем контент перед клонированием, чтобы не дублировалось при перезагрузках
  mobileMenuContent.innerHTML = '';

  headerLinks.forEach(link => {
      const clone = link.cloneNode(true);
      clone.classList.remove('header__link');
      clone.classList.add('mobile-menu__link');
      clone.addEventListener('click', toggleMenu);
      mobileMenuContent.appendChild(clone);
  });

  function toggleMenu() {
      const isActive = mobileMenu.classList.toggle('is-active');
      burger.classList.toggle('is-active');
      header.classList.toggle('menu-open');

      if (isActive) {
          lenis.stop();
          body.style.overflow = 'hidden';
      } else {
          lenis.start();
          body.style.overflow = '';
      }
  }

  burger.addEventListener('click', toggleMenu);

  // Скрытие хедера при скролле
  let lastScroll = 0;
  lenis.on('scroll', ({ scroll }) => {
      if (header.classList.contains('menu-open')) return;

      if (scroll > lastScroll && scroll > 100) {
          header.classList.add('is-hidden');
      } else {
          header.classList.remove('is-hidden');
      }
      lastScroll = scroll;
  });

  // ==========================================
  // 5. АНИМАЦИИ (ИСПРАВЛЕННАЯ ВЕРСИЯ)
  // ==========================================

  // 5.1 HERO СЕКЦИЯ (Timeline)
  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

  // Проверяем, есть ли элементы, чтобы не было ошибок на других страницах
  if(document.querySelector('.block-reveal')) {
      heroTl.from(".block-reveal", {
          y: "110%",
          duration: 1,
          stagger: 0.15,
          opacity: 0
      })
      .from(".hero__desc", { opacity: 0, y: 30, duration: 0.8 }, "-=0.6")
      .from(".hero__actions", { opacity: 0, y: 30, duration: 0.8 }, "-=0.6")
      .from(".hero__visual", { opacity: 0, scale: 0.8, duration: 1 }, "-=0.8");
  }

  // 5.2 ОБЩАЯ АНИМАЦИЯ ПОЯВЛЕНИЯ (fade-up)
  // Используем querySelectorAll, чтобы найти ВСЕ элементы
  const fadeElements = document.querySelectorAll('.gsap-up');

  fadeElements.forEach((element) => {
      // Читаем задержку из data-атрибута или ставим 0
      const delay = element.dataset.delay || 0;

      gsap.fromTo(element,
          {
              y: 50,
              opacity: 0
          },
          {
              y: 0,
              opacity: 1,
              duration: 0.8,
              delay: delay,
              ease: "power2.out",
              scrollTrigger: {
                  trigger: element,
                  start: "top 90%", // Начинать, когда верх элемента на 90% высоты экрана
                  toggleActions: "play none none reverse" // Проигрывать при появлении
              }
          }
      );
  });

  // 5.3 АНИМАЦИЯ КАРТОЧЕК (gsap-card)
  const cardElements = document.querySelectorAll('.gsap-card');

  cardElements.forEach((card, index) => {
      gsap.fromTo(card,
          {
              y: 60,
              opacity: 0
          },
          {
              y: 0,
              opacity: 1,
              duration: 0.6,
              // Добавляем небольшую задержку для эффекта "лесенки" (stagger) внутри ряда
              // index % 3 обеспечивает сброс задержки для каждого нового ряда (примерно)
              delay: (index % 3) * 0.15,
              ease: "power2.out",
              scrollTrigger: {
                  trigger: card,
                  start: "top 85%",
                  toggleActions: "play none none reverse"
              }
          }
      );
  });

  // 5.4 ЭФФЕКТ МАСШТАБА ИЗОБРАЖЕНИЙ (gsap-scale)
  const scaleElements = document.querySelectorAll('.gsap-scale');

  scaleElements.forEach((el) => {
      gsap.fromTo(el,
          { scale: 0.9, opacity: 0.8 },
          {
              scale: 1,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                  trigger: el,
                  start: "top bottom", // Когда верх элемента касается низа экрана
                  end: "center center",
                  scrub: 1 // Плавная привязка к скроллу
              }
          }
      );
  });

  // 5.5 РИСУНОК В СЕКЦИИ INNOVATIONS
  const drawingCircle = document.querySelector('.drawing-circle');
  if (drawingCircle) {
      gsap.to(drawingCircle, {
          y: -50,
          rotation: 90,
          scrollTrigger: {
              trigger: ".innovations",
              start: "top bottom",
              end: "bottom top",
              scrub: 1.5
          }
      });
  }

  // ==========================================
  // 6. FAQ LOGIC (АККОРДЕОН)
  // ==========================================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');

      question.addEventListener('click', () => {
          const isOpen = item.classList.contains('active');

          // Сначала закрываем все
          faqItems.forEach(otherItem => {
              otherItem.classList.remove('active');
          });

          // Если он не был открыт, открываем его
          if (!isOpen) {
              item.classList.add('active');
          }
      });
  });

 // ==========================================
    // 7. ФОРМА КОНТАКТОВ (СТРОГАЯ ВАЛИДАЦИЯ)
    // ==========================================
    const form = document.getElementById('contactForm');

    if (form) {
        const phoneInput = document.getElementById('phone');
        const captchaLabel = document.getElementById('captchaLabel');
        const captchaInput = document.getElementById('captchaInput');
        const consentCheckbox = document.getElementById('consent'); // Получаем чекбокс
        const formSuccess = document.getElementById('formSuccess');

        // Только цифры для телефона
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9+\s]/g, '');
        });

        // Капча
        let num1 = Math.floor(Math.random() * 10) + 1;
        let num2 = Math.floor(Math.random() * 10) + 1;
        captchaLabel.textContent = `Сколько будет ${num1} + ${num2}?`;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;

            // 1. Очистка всех старых ошибок
            form.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));
            consentCheckbox.closest('.form-checkbox').classList.remove('error'); // Сброс ошибки чекбокса

            // 2. Валидация текстовых полей
            form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"]').forEach(input => {
                if (!input.value.trim()) {
                    input.closest('.form-group').classList.add('error');
                    isValid = false;
                }
            });

            // 3. ВАЖНО: Строгая проверка чекбокса
            if (!consentCheckbox.checked) {
                consentCheckbox.closest('.form-checkbox').classList.add('error');
                isValid = false;
            }

            // 4. Проверка капчи
            if (parseInt(captchaInput.value) !== (num1 + num2)) {
                captchaInput.closest('.form-group').classList.add('error');
                isValid = false;
            }

            // Если всё верно — отправляем
            if (isValid) {
                const btn = form.querySelector('button[type="submit"]');
                const originalText = btn.textContent;

                btn.textContent = 'Отправка...';
                btn.disabled = true;

                setTimeout(() => {
                    formSuccess.classList.add('active');
                    form.reset();
                    btn.textContent = originalText;
                    btn.disabled = false;

                    // Новый пример для капчи
                    num1 = Math.floor(Math.random() * 10) + 1;
                    num2 = Math.floor(Math.random() * 10) + 1;
                    captchaLabel.textContent = `Сколько будет ${num1} + ${num2}?`;

                    // Убираем класс активного окна успеха через 5 сек (опционально)
                    setTimeout(() => formSuccess.classList.remove('active'), 5000);
                }, 1500);
            }
        });
    
  }
});