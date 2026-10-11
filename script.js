/* =========================================================
   QYVANT SOLUTIONS
   MAIN JAVASCRIPT
   NORMAL FORMSUBMIT SUBMISSION
========================================================= */

"use strict";


/* =========================================================
   INITIALIZE WEBSITE
========================================================= */

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
});


/* =========================================================
   FORM SELECTOR
   NO inquiryForm ID REQUIRED
========================================================= */

function getInquiryForm() {
    return document.querySelector(
        'form[action*="formsubmit.co"]'
    );
}


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
    const form = getInquiryForm();

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
   NORMAL FORMSUBMIT SUBMISSION
========================================================= */

function initInquiryForm() {
    const form = getInquiryForm();

    if (!form) return;

    const serviceCheckboxes = form.querySelectorAll(
        'input[name="Services"]'
    );

    const privacyConsent = form.querySelector("#privacyConsent");

    /*
     * Update service checkbox styling and validation.
     * No form submission is intercepted.
     */

    function updateServiceValidation() {
        const hasSelectedService = Array.from(
            serviceCheckboxes
        ).some(function (checkbox) {
            return checkbox.checked;
        });

        const firstService = serviceCheckboxes[0];

        if (firstService) {
            firstService.setCustomValidity(
                hasSelectedService
                    ? ""
                    : "Please select at least one service."
            );
        }
    }

    serviceCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener("change", function () {
            const option = checkbox.closest(".service-option");

            if (option) {
                option.classList.toggle(
                    "selected",
                    checkbox.checked
                );
            }

            updateServiceValidation();
        });
    });

    updateServiceValidation();

    /*
     * Native browser validation for required fields.
     * The browser handles the actual form submission.
     */

    form.querySelectorAll("input, textarea, select").forEach(
        function (field) {
            field.addEventListener("input", function () {
                clearFieldError(field);
            });

            field.addEventListener("change", function () {
                clearFieldError(field);
            });
        }
    );

    /*
     * Display a notice if privacy consent is not checked.
     * The required attribute should also be present in the HTML.
     */

    if (privacyConsent && !privacyConsent.required) {
        privacyConsent.required = true;
    }
}


/* =========================================================
   7. FORM FIELD ERROR HELPERS
========================================================= */

function showFieldError(field, message) {
    if (!field) return;

    const wrapper = field.closest(".form-field, .form-field-full");

    if (!wrapper) return;

    wrapper.classList.add("has-error");

    let error = wrapper.querySelector(".form-error");

    if (!error) {
        error = document.createElement("small");
        error.className = "form-error";
        error.setAttribute("role", "alert");

        wrapper.appendChild(error);
    }

    error.textContent = message;
}


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
   8. FORM STATUS HELPERS
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
   9. REDUCED MOTION HELPER
========================================================= */

function prefersReducedMotion() {
    return window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
}


/* =========================================================
   10. SUBTLE HERO MOVEMENT
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
   11. NAVBAR SCROLL EFFECT
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
   12. FORM ENHANCEMENTS
========================================================= */

function initFormEnhancements() {
    const form = getInquiryForm();

    if (!form) return;

    form.querySelectorAll(
        'input[type="text"], input[type="email"], textarea'
    ).forEach(function (field) {
        field.addEventListener("blur", function () {
            field.value = field.value.trim();
        });
    });
}


/* =========================================================
   13. CHIRP CHAT RECEPTIONIST
   Scoped to pages containing the Chirp widget.
========================================================= */

(function () {
    "use strict";

    function initChirpChat() {
        const toggle = document.getElementById("qyvantChatToggle");
        const panel = document.getElementById("qyvantChatPanel");
        const closeButton = document.getElementById("qyvantChatClose");
        const messages = document.getElementById("qyvantChatMessages");
        const form = document.getElementById("qyvantChatForm");
        const input = document.getElementById("qyvantChatInput");
        const suggestions = document.getElementById("qyvantChatSuggestions");
        const profileChatButton = document.querySelector(".chirp-cta");

        // Do not affect pages without the complete Chirp widget.
        if (!toggle || !panel || !messages || !form || !input) {
            return;
        }

        // Prevent duplicate event listeners.
        if (toggle.dataset.chirpInitialized === "true") return;
        toggle.dataset.chirpInitialized = "true";

        let isOpen = false;
        let replyTimer = null;

        function openChat() {
            panel.hidden = false;
            panel.classList.add("is-open");
            toggle.setAttribute("aria-expanded", "true");
            isOpen = true;

            window.setTimeout(function () {
                input.focus();
            }, 100);
        }

        function closeChat() {
            panel.classList.remove("is-open");
            panel.hidden = true;
            toggle.setAttribute("aria-expanded", "false");
            isOpen = false;
        }

        toggle.addEventListener("click", function () {
            if (isOpen) {
                closeChat();
            } else {
                openChat();
            }
        });

        if (closeButton) {
            closeButton.addEventListener("click", closeChat);
        }

        if (profileChatButton) {
            profileChatButton.addEventListener("click", openChat);
        }

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && isOpen) {
                closeChat();
            }
        });

        function addMessage(text, sender) {
            const message = document.createElement("div");
            message.className = "qyvant-chat-message " + sender;

            const bubble = document.createElement("div");
            bubble.className = "qyvant-chat-bubble";
            bubble.textContent = text;

            message.appendChild(bubble);
            messages.appendChild(message);
            messages.scrollTop = messages.scrollHeight;

            return message;
        }

        /* =============================================
           CHIRP ANSWERS — SHORT SERVICE EXPLANATIONS
        ============================================= */

        function getChirpReply(question) {
            const text = question.toLowerCase().trim();

            // Digital Marketing
            if (
                text.includes("digital marketing") ||
                text.includes("online marketing")
            ) {
                return {
                    text: "Digital Marketing helps businesses reach the right audience online through digital campaigns, promotions, and marketing strategies.",
                    link: null
                };
            }

            // Social Media and Content
            if (
                text.includes("social media") ||
                text.includes("content creation") ||
                text.includes("content")
            ) {
                return {
                    text: "Social Media & Content helps businesses build an online presence through planned posts, creative content, consistent messaging, and audience engagement.",
                    link: null
                };
            }

            // Branding and Creative
            if (
                text.includes("branding") ||
                text.includes("brand identity") ||
                text.includes("graphic design") ||
                text.includes("creative")
            ) {
                return {
                    text: "Branding & Creative focuses on a business's visual identity, including design elements and creative materials that help make the brand recognizable.",
                    link: null
                };
            }

            // Website-related questions
            if (
                text.includes("website") ||
                text.includes("web development") ||
                text.includes("web design")
            ) {
                return {
                    text: "Website services focus on creating a professional online presence where customers can learn about your business, services, and contact details.",
                    link: null
                };
            }

            // Ask for all services
            if (
                text.includes("services") ||
                text.includes("what do you offer") ||
                text.includes("what can you do") ||
                text.includes("what do you do")
            ) {
                return {
                    text: "We offer Digital Marketing for online promotion, Social Media & Content for audience engagement, and Branding & Creative for your business identity. Which service would you like to know more about?",
                    link: null
                };
            }

            // Appointment
            if (
                text.includes("appointment") ||
                text.includes("schedule") ||
                text.includes("book")
            ) {
                return {
                    text: "You can start your request through our inquiry page. Share your requirements so the team can review your needs.",
                    link: "inquiry.html",
                    linkLabel: "Open inquiry page ↗"
                };
            }

            // Inquiry or project
            if (
                text.includes("inquiry") ||
                text.includes("contact") ||
                text.includes("project") ||
                text.includes("get started") ||
                text.includes("let's talk")
            ) {
                return {
                    text: "Have a project in mind? Send us an inquiry with your goals and requirements so our team can review your request.",
                    link: "inquiry.html",
                    linkLabel: "Send an inquiry ↗"
                };
            }

            // Pricing
            if (
                text.includes("price") ||
                text.includes("pricing") ||
                text.includes("cost") ||
                text.includes("rate") ||
                text.includes("budget")
            ) {
                return {
                    text: "Pricing depends on your project requirements and selected services. Send us an inquiry so we can learn more about what you need.",
                    link: "inquiry.html",
                    linkLabel: "Ask about a project ↗"
                };
            }

            // Identity
            if (
                text.includes("who are you") ||
                text.includes("your name") ||
                text.includes("who is chirp")
            ) {
                return {
                    text: "I'm Chirp, QYVANT Solutions' virtual receptionist! I can help you explore our services and find the right next step.",
                    link: null
                };
            }

            // Thanks
            if (text.includes("thank")) {
                return {
                    text: "You're welcome! Would you like to learn about a service or send us an inquiry?",
                    link: null
                };
            }

            // Greetings
            if (
                /^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(text)
            ) {
                return {
                    text: "Hi there! Welcome to QYVANT Solutions. You can ask me about our services, project inquiries, or appointments. How can I help?",
                    link: null
                };
            }

            // Default response
            return {
                text: "I can help explain our services or guide you to our inquiry page. You can ask, for example, 'What is Digital Marketing?' or 'What does Branding & Creative do?'",
                link: null
            };
        }

        function showReply(reply) {
            const message = document.createElement("div");
            message.className = "qyvant-chat-message bot";

            const bubble = document.createElement("div");
            bubble.className = "qyvant-chat-bubble";
            bubble.textContent = reply.text;
            message.appendChild(bubble);

            if (reply.link) {
                const link = document.createElement("a");
                link.className = "qyvant-chat-reply-link";
                link.href = reply.link;
                link.textContent = reply.linkLabel || "Learn more ↗";
                message.appendChild(link);
            }

            messages.appendChild(message);
            messages.scrollTop = messages.scrollHeight;
        }

        /* =============================================
           TYPING ANIMATION
        ============================================= */

        function showTypingIndicator() {
            const typing = document.createElement("div");
            typing.className = "qyvant-chat-typing";
            typing.setAttribute("role", "status");
            typing.setAttribute("aria-label", "Chirp is typing");

            const bubble = document.createElement("div");
            bubble.className = "qyvant-chat-typing-bubble";

            for (let i = 0; i < 3; i++) {
                const dot = document.createElement("span");
                dot.setAttribute("aria-hidden", "true");
                bubble.appendChild(dot);
            }

            typing.appendChild(bubble);
            messages.appendChild(typing);
            messages.scrollTop = messages.scrollHeight;

            return typing;
        }

        function sendMessage(value) {
            const question = value.trim();
            if (!question) return;

            // Cancel an older pending response if necessary.
            if (replyTimer !== null) {
                window.clearTimeout(replyTimer);
                replyTimer = null;
            }

            const oldTyping = messages.querySelectorAll(
                ".qyvant-chat-typing"
            );
            oldTyping.forEach(function (element) {
                element.remove();
            });

            addMessage(question, "user");
            input.value = "";

            if (suggestions) {
                suggestions.hidden = true;
            }

            const typing = showTypingIndicator();

            // Prepare the reply now, then display it after the animation.
            const reply = getChirpReply(question);

            replyTimer = window.setTimeout(function () {
                typing.remove();
                showReply(reply);
                replyTimer = null;
            }, 1200);
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            sendMessage(input.value);
        });

        if (suggestions) {
            suggestions
                .querySelectorAll("[data-chat-question]")
                .forEach(function (button) {
                    button.addEventListener("click", function () {
                        const question = button.getAttribute(
                            "data-chat-question"
                        );

                        if (question) {
                            sendMessage(question);
                        }
                    });
                });
        }

        console.info("Chirp chat initialized.");
    }

    // Works whether this script loads before or after DOMContentLoaded.
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initChirpChat, {
            once: true
        });
    } else {
        initChirpChat();
    }
})();
