
/* =========================================================
   QYVANT SOLUTIONS
   MAIN JAVASCRIPT
   Pages: index.html, inquiry.html
   FormSubmit uses standard POST - NO AJAX
========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initRevealAnimations();
    initSmoothScrolling();
    initCurrentYear();
    initServicePreselection();
    initInquiryForm();
    initHeroMovement();
    initNavbarScrollEffect();
    initFormEnhancements();
    initSubmissionReturnMessage();
});


/* =========================================================
   1. MOBILE NAVIGATION
========================================================= */

function initMobileMenu() {
    const menuButton = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (!menuButton || !navLinks) return;

    const mobileBreakpoint = 850;

    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");

    function closeMenu() {
        navLinks.classList.remove("open");
        navLinks.classList.remove("is-open");
        menuButton.classList.remove("active");

        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation menu");
    }

    function openMenu() {
        navLinks.classList.add("open");
        menuButton.classList.add("active");

        menuButton.setAttribute("aria-expanded", "true");
        menuButton.setAttribute("aria-label", "Close navigation menu");
    }

    menuButton.addEventListener("click", function (event) {
        event.stopPropagation();

        if (navLinks.classList.contains("open")) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", function (event) {
        if (
            !navLinks.contains(event.target) &&
            !menuButton.contains(event.target)
        ) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (
            event.key === "Escape" &&
            navLinks.classList.contains("open")
        ) {
            closeMenu();
            menuButton.focus();
        }
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > mobileBreakpoint) {
            closeMenu();
        }
    });
}


/* =========================================================
   2. SCROLL REVEAL ANIMATIONS
========================================================= */

function initRevealAnimations() {
    const elements = document.querySelectorAll(".reveal");

    if (!elements.length) return;

    if (
        prefersReducedMotion() ||
        !("IntersectionObserver" in window)
    ) {
        elements.forEach(function (element) {
            element.classList.add("visible", "is-visible");
        });

        return;
    }

    const observer = new IntersectionObserver(
        function (entries, currentObserver) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("visible", "is-visible");
                currentObserver.unobserve(entry.target);
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -35px 0px"
        }
    );

    elements.forEach(function (element) {
        observer.observe(element);
    });
}


/* =========================================================
   3. SMOOTH SCROLLING
========================================================= */

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (event) {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            let target;

            try {
                target = document.querySelector(targetId);
            } catch (error) {
                return;
            }

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: prefersReducedMotion() ? "auto" : "smooth",
                block: "start"
            });

            if (history.replaceState) {
                history.replaceState(null, "", targetId);
            }
        });
    });
}


/* =========================================================
   4. AUTOMATIC FOOTER YEAR
========================================================= */

function initCurrentYear() {
    const year = new Date().getFullYear();

    document.querySelectorAll("[data-current-year]").forEach(
        function (element) {
            element.textContent = year;
        }
    );
}


/* =========================================================
   5. PRESELECT SERVICE FROM URL
========================================================= */

function initServicePreselection() {
    const form = document.querySelector("#inquiryForm");

    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const requestedService = params.get("service");

    if (!requestedService) return;

    form.querySelectorAll('input[name="Services"]').forEach(
        function (checkbox) {
            if (
                checkbox.value.trim().toLowerCase() ===
                requestedService.trim().toLowerCase()
            ) {
                checkbox.checked = true;

                const option = checkbox.closest(".service-option");

                if (option) {
                    option.classList.add("selected");
                }
            }
        }
    );
}


/* =========================================================
   6. INQUIRY FORM
   STANDARD FORMSUBMIT - NO AJAX
========================================================= */

function initInquiryForm() {
    const form = document.querySelector("#inquiryForm");

    if (!form) return;

    const statusMessage = document.querySelector("#formStatus");
    const serviceCheckboxes = form.querySelectorAll(
        'input[name="Services"]'
    );

    function updateServiceSelection() {
        const checkedServices = form.querySelectorAll(
            'input[name="Services"]:checked'
        );

        serviceCheckboxes.forEach(function (checkbox) {
            const option = checkbox.closest(".service-option");

            if (option) {
                option.classList.toggle("selected", checkbox.checked);
            }
        });

        const firstService = serviceCheckboxes[0];

        if (firstService) {
            firstService.setCustomValidity(
                checkedServices.length === 0
                    ? "Please select at least one service."
                    : ""
            );
        }
    }

    serviceCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener("change", function () {
            updateServiceSelection();
            clearFormStatus(statusMessage);
        });
    });

    updateServiceSelection();

    form.querySelectorAll("input, textarea, select").forEach(
        function (field) {
            field.addEventListener("input", function () {
                clearFieldError(field);
                clearFormStatus(statusMessage);
            });

            field.addEventListener("change", function () {
                clearFieldError(field);
            });
        }
    );
    
    // Highlight all invalid fields when the user tries to submit.
    form.addEventListener("invalid", function (event) {
        const field = event.target;

        if (!(field instanceof HTMLElement)) return;

        if (field.id === "privacyConsent") {
            const consent = field.closest(".privacy-consent");

            if (consent) {
                consent.classList.add("has-error");
            }

            return;
        }

        const wrapper = field.closest(".form-field, .form-field-full");

        if (wrapper) {
            wrapper.classList.add("has-error");

            let error = wrapper.querySelector(".form-error");

            if (!error) {
                error = document.createElement("small");
                error.className = "form-error";
                error.setAttribute("role", "alert");
                wrapper.appendChild(error);
            }

            error.textContent =
                field.validationMessage || "This field is required.";
        }
    }, true);

    // Remove the red highlight after a field becomes valid.
    form.querySelectorAll("input, textarea, select").forEach(function (field) {
        function updateFieldError() {
            if (field.id === "privacyConsent") {
                if (field.checked) {
                    field.closest(".privacy-consent")?.classList.remove("has-error");
                }
                return;
            }

            if (field.checkValidity()) {
                clearFieldError(field);
            }
        }

        field.addEventListener("input", updateFieldError);
        field.addEventListener("change", updateFieldError);
    });

}


/* =========================================================
   7. SUCCESS MESSAGE AFTER RETURNING FROM FORMSUBMIT
========================================================= */

function initSubmissionReturnMessage() {
    const params = new URLSearchParams(window.location.search);

    if (params.get("submitted") !== "true") return;

    const form = document.querySelector("#inquiryForm");
    const statusMessage = document.querySelector("#formStatus");

    if (form) {
        form.reset();

        form.querySelectorAll(".service-option").forEach(function (option) {
            option.classList.remove("selected");
        });

        form.querySelectorAll('input[name="Services"]').forEach(
            function (checkbox) {
                checkbox.checked = false;
            }
        );
    }

    if (statusMessage) {
        showFormStatus(
            statusMessage,
            "success",
            "Your inquiry has been submitted successfully. Thank you for contacting QYVANT Solutions!"
        );

        statusMessage.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "center"
        });
    }

    if (window.history && window.history.replaceState) {
        window.history.replaceState(
            null,
            document.title,
            window.location.pathname + window.location.hash
        );
    }
}


/* =========================================================
   8. FIELD ERROR HELPERS
========================================================= */

function clearFieldError(field) {
    if (!field) return;

    const wrapper = field.closest(".form-field, .form-field-full");

    if (!wrapper) return;

    wrapper.classList.remove("has-error");

    const error = wrapper.querySelector(".form-error");

    if (error) {
        error.remove();
    }
}


function clearFormErrors(form) {
    if (!form) return;

    form.querySelectorAll(".has-error").forEach(function (element) {
        element.classList.remove("has-error");
    });

    form.querySelectorAll(".form-error").forEach(function (element) {
        element.remove();
    });
}


function focusFirstInvalidField(form) {
    if (!form) return;

    const invalidField = form.querySelector(":invalid");

    if (!invalidField) return;

    invalidField.focus();

    invalidField.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "center"
    });
}


/* =========================================================
   9. FORM STATUS HELPERS
========================================================= */

function showFormStatus(element, type, message) {
    if (!element) return;

    element.className = "form-status";

    if (type === "success") {
        element.classList.add("success");
    } else if (type === "error") {
        element.classList.add("error");
    } else if (type === "loading") {
        element.classList.add("loading");
    }

    element.textContent = message;
    element.setAttribute("role", "status");
    element.setAttribute("aria-live", "polite");
}


function clearFormStatus(element) {
    if (!element) return;

    element.className = "form-status";
    element.textContent = "";
}


/* =========================================================
   10. REDUCED MOTION
========================================================= */

function prefersReducedMotion() {
    return window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
}


/* =========================================================
   11. HERO MOVEMENT
========================================================= */

function initHeroMovement() {
    const heroArt = document.querySelector(".hero-art");

    if (!heroArt || prefersReducedMotion()) return;

    const finePointer = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    ).matches;

    if (!finePointer) return;

    heroArt.addEventListener("pointermove", function (event) {
        const rect = heroArt.getBoundingClientRect();

        if (!rect.width || !rect.height) return;

        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        const rotateY = (x - 0.5) * 4;
        const rotateX = (0.5 - y) * 4;

        heroArt.style.transform =
            `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    heroArt.addEventListener("pointerleave", function () {
        heroArt.style.transform = "";
    });
}


/* =========================================================
   12. NAVBAR SCROLL EFFECT
========================================================= */

function initNavbarScrollEffect() {
    const header = document.querySelector(".site-header");

    if (!header) return;

    function updateHeader() {
        header.classList.toggle(
            "scrolled",
            window.scrollY > 20
        );
    }

    updateHeader();

    window.addEventListener("scroll", updateHeader, {
        passive: true
    });
}


/* =========================================================
   13. FORM ENHANCEMENTS
========================================================= */

function initFormEnhancements() {
    const form = document.querySelector("#inquiryForm");

    if (!form) return;

    form.querySelectorAll(
        'input[type="text"], input[type="email"], textarea'
    ).forEach(function (field) {
        field.addEventListener("blur", function () {
            field.value = field.value.trim();
        });
    });
}
