
'use strict';

/*
 * Форма зворотного зв'язку.
 * У цій лабораторній роботі надсилання лише імітується:
 * дані не відправляються на сервер і не зберігаються.
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('feedbackForm');
    const pageContent = document.getElementById('pageContent');
    const successModal = document.getElementById('successModal');
    const closeModalButton = document.getElementById('closeModal');

    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const message = document.getElementById('message');
    const agreement = document.getElementById('agreement');

    // Перевірка наявності обов'язкових елементів DOM.
    const requiredElements = [
        form, pageContent, successModal, closeModalButton,
        username, email, phone, message, agreement
    ];

    if (requiredElements.some((element) => !element)) {
        console.error(
            'Не вдалося ініціалізувати форму: перевірте HTML-ідентифікатори.'
        );
        return;
    }

    const fields = [username, email, message];
    const touchedFields = new Set();

    let formSubmitted = false;
    let previousFocusedElement = null;
    let previousBodyOverflow = '';

    // Функції валідації звичайних полів.
    const validators = {
        username: validateName,
        email: validateEmail,
        message: validateMessage
    };

    // Отримання контейнера помилки для відповідного поля.
    function getErrorElement(input) {
        return document.getElementById(`${input.id}-error`);
    }

    // Відображення помилки.
    function showError(input, errorMessage) {
        const errorElement = getErrorElement(input);

        input.classList.remove('border-slate-300', 'border-green-500');
        input.classList.add('border-red-500');

        input.setAttribute('aria-invalid', 'true');

        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
    }

    // Зелений стан — успішна перевірка.
    function showSuccess(input) {
        const errorElement = getErrorElement(input);

        input.classList.remove('border-slate-300', 'border-red-500');
        input.classList.add('border-green-500');

        input.setAttribute('aria-invalid', 'false');

        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    // Початковий стан — без перевірки.
    function clearError(input) {
        const errorElement = getErrorElement(input);

        input.classList.remove('border-red-500', 'border-green-500');
        input.classList.add('border-slate-300');

        input.removeAttribute('aria-invalid');

        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    // 1. Ім'я: обов'язкове, мінімум 2 символи після trim().
    function validateName() {
        const value = username.value.trim();

        if (value.length < 2) {
            showError(
                username,
                'Введіть ім’я, яке містить щонайменше 2 символи.'
            );
            return false;
        }

        showSuccess(username);
        return true;
    }

    // 2. Email: обов'язковий, перевірка формату.
    function validateEmail() {
    const value = email.value.trim();

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;

    if (!emailRegex.test(value)) {
        showError(email, 'Введіть коректну електронну адресу латинськими символами.');
        return false;
    }

    showSuccess(email);
    return true;
    }

    /*
     * 3. Телефон необов'язковий.
     * Якщо поле заповнене, дозволено тільки +380 і рівно 9 цифр.
     * Значення не форматується автоматично та не обрізається.
     */
    function getPhoneError(value) {
        if (value === '') {
            return '';
        }

        if (value.startsWith('0')) {
            return 'Використовуйте міжнародний формат: +380XXXXXXXXX.';
        }

        if (!value.startsWith('+380')) {
            return 'Номер повинен починатися з +380.';
        }

        // Перевірка на пробіли, дужки, дефіси, літери та інші символи.
        if (!/^\+380\d*$/.test(value)) {
            return 'Введіть номер без пробілів, дужок та інших символів.';
        }

        const digits = value.slice(4);

        if (digits.length < 9) {
            return `Додайте ще ${9 - digits.length} цифр після +380.`;
        }

        if (digits.length > 9) {
            return 'Номер повинен містити рівно 9 цифр після +380.';
        }

        return '';
    }

    function validatePhone() {
        const value = phone.value;
        const errorMessage = getPhoneError(value);

        if (errorMessage) {
            showError(phone, errorMessage);
            return false;
        }

        // Порожній телефон допустимий.
        if (value === '') {
            clearError(phone);
            return true;
        }

        showSuccess(phone);
        return true;
    }

    // 4. Повідомлення: обов'язкове, мінімум 10 символів.
    function validateMessage() {
        const value = message.value.trim();

        if (value.length < 10) {
            showError(
                message,
                'Повідомлення повинно містити щонайменше 10 символів.'
            );
            return false;
        }

        showSuccess(message);
        return true;
    }

    // 5. Згода з політикою конфіденційності.
    function validateAgreement() {
        const errorElement = getErrorElement(agreement);

        if (!agreement.checked) {
            agreement.setAttribute('aria-invalid', 'true');

            if (errorElement) {
                errorElement.textContent =
                    'Для надсилання форми необхідно погодитися з політикою конфіденційності.';
            }

            return false;
        }

        agreement.setAttribute('aria-invalid', 'false');

        if (errorElement) {
            errorElement.textContent = '';
        }

        return true;
    }

    // Захист від виклику неіснуючої функції валідації.
    function validateField(input) {
        const validator = validators[input.id];

        if (typeof validator !== 'function') {
            console.error(
                `Для поля "${input.id}" не знайдено функцію валідації.`
            );
            return false;
        }

        return validator();
    }

    // Загальна перевірка всіх полів форми.
    function validateForm() {
        const fieldsValid = fields.map(validateField).every(Boolean);
        const phoneValid = validatePhone();
        const agreementValid = validateAgreement();

        return fieldsValid && phoneValid && agreementValid;
    }

    // Обробники звичайних текстових полів.
    fields.forEach((field) => {
        field.addEventListener('blur', () => {
            touchedFields.add(field);
            validateField(field);
        });

        field.addEventListener('input', () => {
            if (touchedFields.has(field) || formSubmitted) {
                validateField(field);
            }
        });
    });

    // Окрема логіка перевірки телефону.
    let phoneTouched = false;
    let phoneBlurred = false;

    phone.addEventListener('focus', () => {
        phoneTouched = true;
    });

    phone.addEventListener('blur', () => {
        phoneBlurred = true;
        validatePhone();
    });

    phone.addEventListener('input', () => {
        if (phoneTouched && (phoneBlurred || formSubmitted)) {
            validatePhone();
        }
    });

    // Перевірка checkbox після зміни його стану.
    agreement.addEventListener('change', () => {
        touchedFields.add(agreement);
        validateAgreement();
    });

    // Отримання елементів, доступних для клавіатурної навігації.
    function getModalFocusableElements() {
        return Array.from(
            successModal.querySelectorAll(
                'a[href], button:not([disabled]), input:not([disabled]), ' +
                'select:not([disabled]), textarea:not([disabled]), ' +
                '[tabindex]:not([tabindex="-1"])'
            )
        ).filter((element) => {
            return !element.hasAttribute('hidden') &&
                element.getAttribute('aria-hidden') !== 'true';
        });
    }

    // Відкриття модального вікна.
    function openSuccessModal() {
        previousFocusedElement = document.activeElement;
        previousBodyOverflow = document.body.style.overflow;

        successModal.classList.remove('hidden');
        successModal.classList.add('flex');
        successModal.setAttribute('aria-hidden', 'false');

        // Блокуємо взаємодію з фоновим вмістом.
        pageContent.setAttribute('inert', '');
        document.body.style.overflow = 'hidden';

        closeModalButton.focus();
    }

    // Закриття модального вікна.
    function closeSuccessModal() {
        successModal.classList.add('hidden');
        successModal.classList.remove('flex');
        successModal.setAttribute('aria-hidden', 'true');

        pageContent.removeAttribute('inert');
        document.body.style.overflow = previousBodyOverflow;

        // Повернення фокуса до елемента, з якого відкрили модалку.
        if (
            previousFocusedElement &&
            typeof previousFocusedElement.focus === 'function'
        ) {
            previousFocusedElement.focus();
        }
    }

    closeModalButton.addEventListener('click', closeSuccessModal);

    // Escape закриває модальне вікно, Tab залишається в межах діалогу.
    document.addEventListener('keydown', (event) => {
        const modalIsOpen = !successModal.classList.contains('hidden');

        if (!modalIsOpen) {
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            closeSuccessModal();
            return;
        }

        if (event.key === 'Tab') {
            const focusableElements = getModalFocusableElements();

            if (focusableElements.length === 0) {
                event.preventDefault();
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement =
                focusableElements[focusableElements.length - 1];

            if (
                event.shiftKey &&
                document.activeElement === firstElement
            ) {
                event.preventDefault();
                lastElement.focus();
            } else if (
                !event.shiftKey &&
                document.activeElement === lastElement
            ) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    });

    // Надсилання форми: тільки клієнтська перевірка.
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        formSubmitted = true;

        const isValid = validateForm();

        if (!isValid) {
            const firstInvalidField =
                form.querySelector('[aria-invalid="true"]');

            if (firstInvalidField) {
                firstInvalidField.focus();
            }

            return;
        }

        openSuccessModal();

        // Очищення форми після успішної перевірки.
        form.reset();

        fields.forEach(clearError);
        clearError(phone);

        const agreementError = getErrorElement(agreement);

        agreement.removeAttribute('aria-invalid');

        if (agreementError) {
            agreementError.textContent = '';
        }

        // Скидання станів взаємодії.
        touchedFields.clear();
        formSubmitted = false;
        phoneTouched = false;
        phoneBlurred = false;
    });
});
