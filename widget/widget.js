
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // =====================================
    // 1. DOM ELEMENTS
    // =====================================

    const directionSelect = document.getElementById("medical-direction");
    const serviceSelect = document.getElementById("medical-service");
    const doctorSelect = document.getElementById("medical-doctor");

    const visitGroup = document.getElementById("visit-type-group");
    const additionalContainer = document.getElementById("additional-services");

    const errorsBlock = document.getElementById("calculator-errors");
    const errorMessage = document.getElementById("calculator-error-message");

    const totalPrice = document.getElementById("total-price");
    const priceDetails = document.getElementById("price-details");

    const submitButton = document.getElementById("medical-submit");
    const form = document.getElementById("medical-form");

    const visitRadios = document.querySelectorAll('input[name="visitType"]');
    let submissionPrepared = false;

    // Перевірка наявності необхідних HTML-елементів.
    const requiredElements = [
        directionSelect,
        serviceSelect,
        doctorSelect,
        visitGroup,
        additionalContainer,
        errorsBlock,
        errorMessage,
        totalPrice,
        priceDetails,
        submitButton,
        form
    ];

    if (requiredElements.some(element => !element)) {
        const message =
            "Не вдалося запустити калькулятор: відсутній обов'язковий елемент сторінки.";

        console.error(`CarePoint Calculator: ${message}`);

        if (errorsBlock && errorMessage) {
            errorsBlock.classList.remove("hidden");
            errorMessage.textContent = message;
        }

        if (form) {
            form.querySelectorAll("select, input, button").forEach(control => {
                control.disabled = true;
            });
        }

        return;
    }

    const expectedVisitTypes = ["first", "repeat"];
    const hasExpectedVisitRadios =
        visitRadios.length === expectedVisitTypes.length &&
        Array.from(visitRadios).every(radio => radio.type === "radio") &&
        expectedVisitTypes.every(type =>
            Array.from(visitRadios).some(radio => radio.value === type)
        );

    if (!hasExpectedVisitRadios) {
        const message =
            "Помилка конфігурації калькулятора: не знайдено потрібні типи консультації.";

        console.error(message);
        errorsBlock.classList.remove("hidden");
        errorMessage.textContent = message;
        form.querySelectorAll("select, input, button").forEach(control => {
            control.disabled = true;
        });

        return;
    }

    // =====================================
    // 2. DATA: ДЕМОНСТРАЦІЙНІ ЦІНИ
    // =====================================

    const medicalData = {
        cardiology: {
            services: {
                consultation: {
                    name: "Консультація кардіолога",
                    consultation: true,
                    prices: {
                        first: 800,
                        repeat: 600
                    },
                    doctors: [
                        {
                            id: "doctor1",
                            name: "Олена Мельник",
                            experienceYears: 12,
                            extra: 0
                        },
                        {
                            id: "doctor2",
                            name: "Андрій Коваленко",
                            experienceYears: 9,
                            extra: 100
                        }
                    ]
                },
                ecg: {
                    name: "Електрокардіографія (ЕКГ)",
                    consultation: false,
                    price: 350,
                    doctors: [
                        {
                            id: "doctor3",
                            name: "Ірина Шевченко",
                            experienceYears: 8,
                            extra: 0
                        }
                    ]
                },
                echo: {
                    name: "Ехокардіографія",
                    consultation: false,
                    price: 900,
                    doctors: [
                        {
                            id: "doctor4",
                            name: "Максим Бондар",
                            experienceYears: 11,
                            extra: 0
                        }
                    ]
                }
            },
            additional: [
                { id: "blood", name: "Загальний аналіз крові", price: 250 },
                {
                    id: "biochemistry",
                    name: "Біохімічний аналіз крові",
                    price: 450
                }
            ]
        },

        therapy: {
            services: {
                consultation: {
                    name: "Консультація терапевта",
                    consultation: true,
                    prices: {
                        first: 700,
                        repeat: 500
                    },
                    doctors: [
                        {
                            id: "doctor5",
                            name: "Наталія Ткаченко",
                            experienceYears: 14,
                            extra: 0
                        },
                        {
                            id: "doctor6",
                            name: "Дмитро Савчук",
                            experienceYears: 7,
                            extra: 100
                        }
                    ]
                }
            },
            additional: [
                { id: "blood", name: "Загальний аналіз крові", price: 250 },
                { id: "urine", name: "Загальний аналіз сечі", price: 200 }
            ]
        },

        dermatology: {
            services: {
                consultation: {
                    name: "Консультація дерматолога",
                    consultation: true,
                    prices: {
                        first: 750,
                        repeat: 550
                    },
                    doctors: [
                        {
                            id: "doctor7",
                            name: "Марія Кравець",
                            experienceYears: 10,
                            extra: 0
                        }
                    ]
                }
            },
            additional: [
                { id: "dermoscopy", name: "Дерматоскопія", price: 400 }
            ]
        },

        neurology: {
            services: {
                consultation: {
                    name: "Консультація невролога",
                    consultation: true,
                    prices: {
                        first: 800,
                        repeat: 600
                    },
                    doctors: [
                        {
                            id: "doctor8",
                            name: "Олександр Романюк",
                            experienceYears: 13,
                            extra: 0
                        }
                    ]
                }
            },
            additional: [
                { id: "blood", name: "Загальний аналіз крові", price: 250 }
            ]
        },

        gynecology: {
            services: {
                consultation: {
                    name: "Консультація гінеколога",
                    consultation: true,
                    prices: {
                        first: 850,
                        repeat: 650
                    },
                    doctors: [
                        {
                            id: "doctor9",
                            name: "Катерина Поліщук",
                            experienceYears: 9,
                            extra: 0
                        }
                    ]
                }
            },
            additional: [
                {
                    id: "ultrasound",
                    name: "УЗД органів малого таза",
                    price: 700
                }
            ]
        }
    };

    // =====================================
    // 3. HELPERS
    // =====================================

    const MAX_PRICE = 10_000;

    const formatPrice = price =>
        `${new Intl.NumberFormat("uk-UA").format(price)} ₴`;

    function formatExperience(years) {
        const lastTwoDigits = years % 100;
        const lastDigit = years % 10;
        const unit = lastTwoDigits >= 11 && lastTwoDigits <= 14
            ? "років"
            : lastDigit === 1
                ? "рік"
                : lastDigit >= 2 && lastDigit <= 4
                    ? "роки"
                    : "років";

        return `${years} ${unit} стажу`;
    }

    function isValidPrice(value, allowZero = true) {
        return (
            Number.isSafeInteger(value) &&
            value >= (allowZero ? 0 : 1) &&
            value <= MAX_PRICE
        );
    }

    function hasOwn(object, key) {
        return Object.prototype.hasOwnProperty.call(object, key);
    }

    function getDirectionData() {
        const direction = directionSelect.value;

        return hasOwn(medicalData, direction)
            ? medicalData[direction]
            : null;
    }

    function validateMedicalData() {
        return Object.values(medicalData).every(direction => {
            if (
                !direction ||
                !direction.services ||
                !Array.isArray(direction.additional)
            ) {
                return false;
            }

            const services = Object.entries(direction.services);

            if (services.length === 0) {
                return false;
            }

            const hasValidServices = services.every(([id, service]) => {
                if (
                    !id ||
                    !service ||
                    typeof service.name !== "string" ||
                    !service.name.trim() ||
                    typeof service.consultation !== "boolean" ||
                    !Array.isArray(service.doctors) ||
                    service.doctors.length === 0
                ) {
                    return false;
                }

                const hasValidBasePrice = service.consultation
                    ? service.prices &&
                        isValidPrice(service.prices.first, false) &&
                        isValidPrice(service.prices.repeat, false)
                    : isValidPrice(service.price, false);

                return hasValidBasePrice &&
                    Array.from(service.doctors).every(doctor =>
                        doctor &&
                        typeof doctor.id === "string" &&
                        doctor.id.trim() !== "" &&
                        typeof doctor.name === "string" &&
                        doctor.name.trim() !== "" &&
                        Number.isSafeInteger(doctor.experienceYears) &&
                        doctor.experienceYears > 0 &&
                        isValidPrice(doctor.extra)
                    );
            });

            return hasValidServices &&
                Array.from(direction.additional).every(item =>
                    item &&
                    typeof item.id === "string" &&
                    item.id.trim() !== "" &&
                    typeof item.name === "string" &&
                    item.name.trim() !== "" &&
                    isValidPrice(item.price)
                );
        });
    }

    function disableForm() {
        form.querySelectorAll("select, input, button").forEach(control => {
            control.disabled = true;
        });
    }

    function showError(message) {
        errorsBlock.classList.remove("hidden");
        errorMessage.textContent = message;
    }

    function hideError() {
        errorsBlock.classList.add("hidden");
        errorMessage.textContent = "";
    }

    function clearResult() {
        submissionPrepared = false;
        totalPrice.textContent = "0 ₴";
        priceDetails.replaceChildren();
        submitButton.disabled = true;
    }

    function resetSelect(select, message) {
        select.replaceChildren();

        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = message;

        select.appendChild(placeholder);
        select.value = "";
        select.disabled = true;
    }

    function getSelectedService() {
        const direction = getDirectionData();
        const serviceId = serviceSelect.value;

        if (!direction || !hasOwn(direction.services, serviceId)) {
            return null;
        }

        return direction.services[serviceId];
    }

    function getSelectedVisitType() {
        return document.querySelector('input[name="visitType"]:checked');
    }

    if (!validateMedicalData()) {
        const message =
            `Помилка конфігурації калькулятора: перевірте дані та ціни (від 0 до ${formatPrice(MAX_PRICE)}; базова ціна має бути більшою за 0).`;

        console.error(message);
        showError(message);
        disableForm();
        return;
    }

    // =====================================
    // 4. DIRECTION CHANGE
    // =====================================

    function updateDirection() {
        hideError();

        const direction = getDirectionData();

        resetSelect(serviceSelect, "Оберіть медичну послугу");
        resetSelect(doctorSelect, "Спочатку оберіть послугу");

        visitGroup.classList.add("hidden");

        visitRadios.forEach(radio => {
            radio.checked = false;
        });

        additionalContainer.replaceChildren();

        if (!direction) {
            clearResult();
            showError(
                directionSelect.value
                    ? "Обрано невідомий медичний напрям."
                    : "Оберіть медичний напрям."
            );
            return;
        }

        // Заповнення списку медичних послуг.
        const services = direction.services;

        Object.entries(services).forEach(([id, service]) => {
            const option = document.createElement("option");
            option.value = id;
            option.textContent = service.name;

            serviceSelect.appendChild(option);
        });

        serviceSelect.disabled = false;

        // Створення списку додаткових обстежень.
        direction.additional.forEach(item => {
            const wrapper = document.createElement("label");

            wrapper.className =
                "flex items-center gap-3 text-sm text-white";

            const checkbox = document.createElement("input");

            checkbox.type = "checkbox";
            checkbox.id = `additional-${directionSelect.value}-${item.id}`;
            checkbox.name = "additional";
            checkbox.value = item.id;
            checkbox.dataset.price = String(item.price);

            const text = document.createElement("span");

            text.textContent =
                `${item.name} — ${formatPrice(item.price)}`;

            wrapper.append(checkbox, text);
            additionalContainer.appendChild(wrapper);
        });

        clearResult();
    }

    // =====================================
    // 5. SERVICE CHANGE
    // =====================================

    function updateService() {
        hideError();

        const service = getSelectedService();

        resetSelect(doctorSelect, "Оберіть спеціаліста");

        visitGroup.classList.add("hidden");

        visitRadios.forEach(radio => {
            radio.checked = false;
        });

        if (!service) {
            clearResult();
            showError(
                serviceSelect.value
                    ? "Обрано невідому медичну послугу."
                    : "Оберіть медичну послугу."
            );
            return;
        }

        // Заповнення списку спеціалістів.
        service.doctors.forEach(doctor => {
            const option = document.createElement("option");

            option.value = doctor.id;
            option.textContent =
                `${doctor.name} — ${formatExperience(doctor.experienceYears)}`;

            doctorSelect.appendChild(option);
        });

        doctorSelect.disabled = false;

        if (service.consultation) {
            visitGroup.classList.remove("hidden");
        }

        clearResult();
    }

    // =====================================
    // 6. PRICE CALCULATION
    // =====================================

    function updateCalculator() {
        hideError();
        clearResult();

        const directionData = getDirectionData();
        const service = getSelectedService();

        let total = 0;
        const details = [];

        // Перевірка напряму та послуги.
        if (!directionData) {
            showError("Оберіть коректний медичний напрям.");
            return false;
        }

        if (!service) {
            showError("Оберіть коректну медичну послугу.");
            return false;
        }

        // Перевірка спеціаліста.
        const doctor = service.doctors.find(
            item => item.id === doctorSelect.value
        );

        if (!doctor) {
            showError(
                doctorSelect.value
                    ? "Обрано невідомого спеціаліста."
                    : "Оберіть спеціаліста."
            );
            return false;
        }

        // Визначення вартості основної послуги.
        let basePrice;

        if (service.consultation) {
            const visitType = getSelectedVisitType();

            if (!visitType) {
                showError("Оберіть тип консультації.");
                return false;
            }

            if (!["first", "repeat"].includes(visitType.value)) {
                showError("Оберіть коректний тип консультації.");
                return false;
            }

            basePrice = hasOwn(service.prices, visitType.value)
                ? service.prices[visitType.value]
                : undefined;
        } else {
            basePrice = service.price;
        }

        // Перевірка основної вартості.
        if (!isValidPrice(basePrice, false)) {
            showError(
                "Некоректна вартість медичної послуги. Перевірте дані тарифу."
            );
            return false;
        }

        total += basePrice;

        details.push({
            name: service.name,
            price: basePrice
        });

        // Перевірка доплати за спеціаліста.
        if (!isValidPrice(doctor.extra)) {
            showError(
                "Некоректна вартість консультації. Перевірте дані спеціаліста."
            );
            return false;
        }

        if (doctor.extra > 0) {
            total += doctor.extra;

            details.push({
                name: "Доплата за спеціаліста",
                price: doctor.extra
            });
        }

        if (!isValidPrice(total)) {
            showError("Загальна вартість перевищує допустиме значення.");
            return false;
        }

        // Перевірка додаткових обстежень.
        const checkedServices = additionalContainer.querySelectorAll(
            'input[name="additional"]:checked'
        );

        for (const checkbox of checkedServices) {
            const rawPrice = checkbox.dataset.price;

            if (rawPrice === undefined || rawPrice.trim() === "") {
                showError(
                    "Не вказана вартість додаткової медичної послуги."
                );
                return false;
            }

            const price = Number(rawPrice);

            if (!isValidPrice(price)) {
                showError(
                    "Некоректна вартість додаткової послуги. Перевірте дані тарифу."
                );
                return false;
            }

            const serviceName =
                checkbox.nextElementSibling?.textContent
                    ?.split(" — ")[0];

            if (!serviceName) {
                showError(
                    "Не вдалося визначити назву додаткової послуги."
                );
                return false;
            }

            total += price;

            if (!isValidPrice(total)) {
                showError(
                    "Загальна вартість перевищує допустиме значення."
                );
                return false;
            }

            details.push({
                name: serviceName,
                price: price
            });
        }

        // Фінальна перевірка загальної суми.
        if (!isValidPrice(total)) {
            showError("Не вдалося коректно розрахувати вартість.");
            return false;
        }

        // Відображення результату.
        totalPrice.textContent = formatPrice(total);

        details.forEach(item => {
            const row = document.createElement("div");
            row.className = "flex justify-between gap-4";

            const name = document.createElement("span");
            name.className = "min-w-0 break-words";
            name.textContent = item.name;

            const price = document.createElement("span");
            price.className = "shrink-0 text-right";
            price.textContent = formatPrice(item.price);

            row.append(name, price);
            priceDetails.appendChild(row);
        });

        submitButton.disabled = false;

        return true;
    }

    // =====================================
    // 7. EVENT LISTENERS
    // =====================================

    directionSelect.addEventListener("change", updateDirection);

    serviceSelect.addEventListener("change", updateService);

    doctorSelect.addEventListener("change", updateCalculator);

    visitRadios.forEach(radio => {
        radio.addEventListener("change", updateCalculator);
    });

    // Обробник динамічно створених checkbox.
    additionalContainer.addEventListener("change", event => {
        if (event.target.matches('input[name="additional"]')) {
            updateCalculator();
        }
    });

    // =====================================
    // 8. FORM SUBMIT
    // =====================================

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (submissionPrepared) {
            return;
        }

        const isCalculationValid = updateCalculator();

        if (!isCalculationValid || submitButton.disabled) {
            if (errorsBlock.classList.contains("hidden")) {
                const direction = getDirectionData();
                const service = getSelectedService();
                let message = "Оберіть медичний напрям.";

                if (direction) {
                    message = "Оберіть медичну послугу.";

                    if (service) {
                        message = "Оберіть спеціаліста.";

                        if (
                            service.consultation &&
                            !getSelectedVisitType()
                        ) {
                            message = "Оберіть тип консультації.";
                        }
                    }
                }

                showError(message);
            }

            return;
        }

        submissionPrepared = true;
        submitButton.disabled = true;

        // Імітація успішної підготовки запису.
        // Реального надсилання даних на сервер немає.
        alert(
            "Розрахунок успішно завершено! Вартість послуг підготовлено."
        );
    });

    // =====================================
    // 9. INITIAL STATE
    // =====================================

    clearResult();
});