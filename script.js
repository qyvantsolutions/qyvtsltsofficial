
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
    initQyvantChatReceptionist();
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


/* =========================================
   QYVANT CHAT RECEPTIONIST
   Rule-Based Chat Assistant
========================================= */

function initQyvantChatReceptionist() {
    const toggle = document.getElementById("qyvantChatToggle");
    const panel = document.getElementById("qyvantChatPanel");
    const closeButton = document.getElementById("qyvantChatClose");
    const form = document.getElementById("qyvantChatForm");
    const input = document.getElementById("qyvantChatInput");
    const messages = document.getElementById("qyvantChatMessages");
    const suggestions = document.getElementById("qyvantChatSuggestions");

    // Run only on pages containing the chat widget.
    if (
        !toggle ||
        !panel ||
        !closeButton ||
        !form ||
        !input ||
        !messages
    ) {
        return;
    }

    /* OPEN CHAT */
    function openChat() {
        panel.hidden = false;
        toggle.setAttribute("aria-expanded", "true");
        input.focus();
    }

    /* CLOSE CHAT */
    function closeChat() {
        panel.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
    }

    toggle.addEventListener("click", function () {
        if (panel.hidden) {
            openChat();
        } else {
            closeChat();
        }
    });

    closeButton.addEventListener("click", closeChat);

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !panel.hidden) {
            closeChat();
        }
    });

    /* ADD CHAT MESSAGE */
    function addMessage(text, sender, linkText, linkURL) {
        const message = document.createElement("div");
        message.className = "qyvant-chat-message " + sender;

        const bubble = document.createElement("div");
        bubble.className = "qyvant-chat-bubble";
        bubble.textContent = text;

        if (linkText && linkURL) {
            const link = document.createElement("a");
            link.href = linkURL;
            link.textContent = linkText;

            bubble.appendChild(document.createElement("br"));
            bubble.appendChild(link);
        }

        message.appendChild(bubble);
        messages.appendChild(message);

        messages.scrollTop = messages.scrollHeight;
    }

    /* SERVICE INFORMATION */
    const services = [
        {
            name: "Digital Marketing",
            keywords: [
                "digital marketing",
                "marketing campaign",
                "online marketing",
                "seo",
                "search engine optimization"
            ],
            description:
                "Digital Marketing helps businesses strengthen their online presence, reach their target audience, and improve their digital marketing efforts."
        },
        {
            name: "Social Media & Content",
            keywords: [
                "social media",
                "content creation",
                "content marketing",
                "facebook",
                "instagram",
                "tiktok"
            ],
            description:
                "Social Media & Content focuses on social media presence, content planning, creative content, and audience engagement."
        },
        {
            name: "Branding & Creative",
            keywords: [
                "branding",
                "brand identity",
                "logo",
                "graphic design",
                "creative design"
            ],
            description:
                "Branding & Creative helps businesses build a consistent brand identity through visual direction and creative materials."
        },
        {
            name: "Website & Digital Solutions",
            keywords: [
                "website",
                "web development",
                "web design",
                "website development",
                "digital solutions",
                "web application"
            ],
            description:
                "Website & Digital Solutions covers website design and development, along with digital solutions tailored to business needs."
        },
        {
            name: "Business & Digital Strategy",
            keywords: [
                "business strategy",
                "digital strategy",
                "business analysis",
                "business consulting",
                "business planning",
                "digital transformation"
            ],
            description:
                "Business & Digital Strategy helps businesses explore opportunities, improve processes, and align digital initiatives with their goals."
        }
    ];

    /* FIND A SERVICE */
    function findService(message) {
        return services.find(function (service) {
            return service.keywords.some(function (keyword) {
                return message.includes(keyword);
            });
        });
    }

    /* CREATE INQUIRY LINK */
    function getInquiryLink(serviceName) {
        if (serviceName) {
            return "inquiry.html?service=" +
                encodeURIComponent(serviceName);
        }

        return "inquiry.html";
    }

    /* GENERATE REPLY */
    function getReply(message) {
        const text = message.toLowerCase().trim();

        // Greetings
        if (
            /^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(text)
        ) {
            return {
                text:
                    "Hello! Welcome to QYVANT Solutions. 👋 How can I help you today? You can ask about our services, appointments, or inquiries."
            };
        }

        // Appointment requests
        if (
            /\b(appointment|schedule|book|booking|meeting|consultation)\b/.test(text)
        ) {
            return {
                text:
                    "You can submit an inquiry through our inquiry form. Tell us about your project and preferred schedule so the team can review your request.",
                linkText: "Submit an inquiry ↗",
                linkURL: getInquiryLink()
            };
        }

        // Pricing questions
        if (
            /\b(price|pricing|cost|rate|rates|budget|how much|quotation|quote)\b/.test(text)
        ) {
            return {
                text:
                    "Project pricing may depend on your requirements, scope, and goals. Please submit an inquiry with your project details so the team can review your needs.",
                linkText: "Request a quotation ↗",
                linkURL: getInquiryLink()
            };
        }

        // Inquiry questions
        if (
            /\b(inquiry|enquiry|contact|message|reach you|reach out|talk to|human|real person|team member|representative)\b/.test(text)
        ) {
            return {
                text:
                    "You can reach the QYVANT Solutions team through our inquiry form. Share your questions, project details, and preferred service.",
                linkText: "Go to inquiry form ↗",
                linkURL: getInquiryLink()
            };
        }

        // Service-specific questions
        const service = findService(text);

        if (service) {
            return {
                text:
                    service.description +
                    "\n\nWould you like to discuss this service with our team?",
                linkText: "Inquire about " + service.name + " ↗",
                linkURL: getInquiryLink(service.name)
            };
        }

        // General service questions
        if (
            /\b(services|service|offer|offerings|what do you do|what can you do|solutions)\b/.test(text)
        ) {
            return {
                text:
                    "QYVANT Solutions offers services in these areas:\n\n" +
                    "• Digital Marketing\n" +
                    "• Social Media & Content\n" +
                    "• Branding & Creative\n" +
                    "• Website & Digital Solutions\n" +
                    "• Business & Digital Strategy\n\n" +
                    "Which service would you like to know more about?",
                linkText: "Explore our inquiry form ↗",
                linkURL: getInquiryLink()
            };
        }

        // About the company
        if (
            /\b(about|company|who are you|qyv ant|qyvant|your business|your team)\b/.test(text)
        ) {
            return {
                text:
                    "QYVANT Solutions helps businesses explore digital, creative, and strategic solutions. Tell us about your goals so the team can guide you toward the appropriate service.",
                linkText: "Contact QYVANT Solutions ↗",
                linkURL: getInquiryLink()
            };
        }

        // Greetings and thanks
        if (
            /\b(thank you|thanks|thank u|salamat)\b/.test(text)
        ) {
            return {
                text:
                    "You're welcome! 😊 If you have another question or want to discuss a project, you can send an inquiry anytime."
            };
        }

        // Goodbye
        if (
            /\b(bye|goodbye|see you)\b/.test(text)
        ) {
            return {
                text:
                    "Thank you for visiting QYVANT Solutions! Have a great day. Feel free to send us an inquiry whenever you're ready."
            };
        }

        // Default response
        return {
            text:
                "Thanks for your message! I may not have the exact answer to that question yet. You can ask me about our services, pricing, or appointment requests, or send your question directly to our team.",
            linkText: "Send your question ↗",
            linkURL: getInquiryLink()
        };
    }

    /* SEND MESSAGE */

    /* =========================================
    CHIRP RESPONSE WITH AVATAR ANIMATION
    ========================================= */

    async function sendMessage(message) {
        const cleanMessage = message.trim();

        if (!cleanMessage) {
            return;
        }

        // Display the visitor's message.
        addMessage(cleanMessage, "user");

        // Create Chirp's animated response indicator.
        const typingIndicator = document.createElement("div");
        typingIndicator.className = "qyvant-chat-typing";
        typingIndicator.setAttribute("aria-label", "Chirp is preparing a response");

        // Chirp's picture.
        const avatar = document.createElement("div");
        avatar.className = "qyvant-chat-typing-avatar";

        const image = document.createElement("img");
        image.src = "images/chirp.png";
        image.alt = "";
        image.setAttribute("aria-hidden", "true");

        avatar.appendChild(image);

        // Animated dots, without a typing label.
        const bubble = document.createElement("div");
        bubble.className = "qyvant-chat-typing-bubble";

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement("span");
            dot.setAttribute("aria-hidden", "true");
            bubble.appendChild(dot);
        }

        typingIndicator.appendChild(avatar);
        typingIndicator.appendChild(bubble);

        messages.appendChild(typingIndicator);
        messages.scrollTop = messages.scrollHeight;

        // Give the visitor a moment before showing the response.
        const delay = 900 + Math.floor(Math.random() * 500);

        await new Promise(function (resolve) {
            setTimeout(resolve, delay);
        });

        // Remove the animated indicator.
        typingIndicator.remove();

        // Display Chirp's actual response.
        const reply = getReply(cleanMessage);

        addMessage(
            reply.text,
            "bot",
            reply.linkText,
            reply.linkURL
        );
    }

    /* SUBMIT FORM */
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const message = input.value;

        if (!message.trim()) {
            return;
        }

        sendMessage(message);
        input.value = "";
        input.focus();
    });

    /* SUGGESTED QUESTIONS */
    if (suggestions) {
        suggestions.addEventListener("click", function (event) {
            const button = event.target.closest("[data-chat-question]");

            if (!button) {
                return;
            }

            openChat();
            sendMessage(button.dataset.chatQuestion);
        });
    }
}


/* =========================================
   QYVANT SOLUTIONS
   WEBSITE IMAGE PROTECTION
========================================= */

(function initWebsiteImageProtection() {
    // Create the notification once.
    let toast = document.querySelector(".image-protection-toast");
    let toastTimer;

    if (!toast) {
        toast = document.createElement("div");
        toast.className = "image-protection-toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");

        toast.innerHTML = `
            <strong>Image saving is disabled.</strong>
            <span>This image is protected by QYVANT Solutions.</span>
        `;

        document.body.appendChild(toast);
    }

    function showImageProtectionNotice() {
        toast.classList.add("is-visible");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(function () {
            toast.classList.remove("is-visible");
        }, 2600);
    }
    // Disable the usual right-click menu on images.
    document.addEventListener("contextmenu", function (event) {
        const image = event.target.closest("img");

        if (image) {
            event.preventDefault();
            showImageProtectionNotice();
        }
    }, true);

    // Prevent dragging images directly from the page.
    document.addEventListener("dragstart", function (event) {
        const image = event.target.closest("img");

        if (image) {
            event.preventDefault();
            showImageProtectionNotice();
        }
    }, true);

})();
