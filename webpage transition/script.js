document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".container");
    const overlay = document.querySelector(".menu-overlay");

    // Initialize the page entrance
    function animateIn() {
        const tlIn = gsap.timeline({
            defaults: { duration: 1.0, ease: "power4.inOut" }
        });

        // Ensure container is in "pushed" state before starting if this is the first load
        gsap.set(container, {
            rotation: 10,
            x: 300,
            y: 450,
            scale: 1.5,
        });

        tlIn.to(overlay, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            delay: 0.1
        })
            .to(container, {
                rotation: 0,
                x: 0,
                y: 0,
                scale: 1,
            }, "<");
    }

    async function loadPage(url) {
        try {
            const response = await fetch(url);
            const html = await response.text();

            // Create a temporary element to parse the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const newContent = doc.querySelector(".container").innerHTML;
            const newTitle = doc.title;

            // --- EXIT ANIMATION ---
            const tlOut = gsap.timeline({
                onComplete: () => {
                    // Update content and title
                    container.innerHTML = newContent;
                    document.title = newTitle;

                    // Update URL
                    history.pushState({}, "", url);

                    // Re-attach listeners to new links
                    attachLinkListeners();

                    // --- ENTRANCE ANIMATION (Already in the middle of overlay swap) ---
                    // Reset container to "pushed" state for the next entrance
                    gsap.set(container, {
                        rotation: 10,
                        x: 300,
                        y: 450,
                        scale: 1.5,
                    });

                    // Animate it back in
                    gsap.to(container, {
                        rotation: 0,
                        x: 0,
                        y: 0,
                        scale: 1,
                        duration: 1.0,
                        ease: "power4.inOut"
                    });

                    // Reveal the page
                    gsap.to(overlay, {
                        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
                        duration: 1.0,
                        ease: "power4.inOut"
                    });
                }
            });

            // Cover the screen
            tlOut.to(container, {
                rotation: -10,
                x: -300,
                y: -450,
                scale: 1.5,
                duration: 1.0,
                ease: "power4.inOut"
            })
                .to(overlay, {
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 175%, 0% 100%)",
                    duration: 1.0,
                    ease: "power4.inOut"
                }, "<");

        } catch (error) {
            console.error("Failed to load page:", error);
            // Fallback for local files if fetch fails (CORS)
            window.location.href = url;
        }
    }

    function attachLinkListeners() {
        const links = document.querySelectorAll(".transition-link");
        links.forEach(link => {
            // Remove old listeners to avoid duplicates
            link.onclick = (e) => {
                e.preventDefault();
                const url = link.getAttribute("href");
                loadPage(url);
            };
        });
    }

    // Handle browser back/forward
    window.addEventListener("popstate", () => {
        location.reload(); // Simple reload for popstate to keep it robust
    });

    // Start
    animateIn();
    attachLinkListeners();
});
