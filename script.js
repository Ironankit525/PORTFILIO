document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Lenis first so it's available
    const lenis = new Lenis({
        duration: 2.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: true,
        touchMultiplier: 2,
    });

    // 2. Setup Elements
    const container = document.querySelector(".container");
    const homeContent = document.querySelector(".home-content");
    const originPage = document.querySelector(".origin-page");
    const officePage = document.querySelector(".office-page");
    const connectPage = document.querySelector(".connect-page");

    // Safety Reset: Ensure everything is visible on load and sub-pages are hidden
    gsap.set([container, homeContent], { opacity: 1, visibility: "visible", display: "block", clearProps: "all" });
    gsap.set([originPage, officePage, connectPage], { opacity: 0, visibility: "hidden", display: "none" });

    const menuOpen = document.getElementById("menu-open");
    const menuToggle = document.querySelector(".menu-toggle");
    const menuOverlay = document.querySelector(".menu-overlay");
    const menuContent = document.querySelector(".menu-content");
    const menuPreviewImg = document.querySelector(".menu-preview-img");
    const menulinks = document.querySelectorAll(".link a");
    const heroImg = document.querySelector(".hero-img");
    const logoLink = document.querySelector(".logo a");
    const heroContent = document.querySelector(".hero-content");

    let isOpen = false;
    let isAnimating = false;
    let currentPreviewImg = "./images/1.png"; // Track current preview

    // 3. Logo & Menu Color Logic
    const menuOpenText = document.querySelector("#menu-open");

    // Origin Page Logic Vars
    const originPanels = gsap.utils.toArray(".origin-panel");
    const originImageStack = document.getElementById('imageStack');
    let originCurrentIndex = 0;
    let originIsAnimating = false;
    let isOriginVisible = false;

    // Connect Page Logic
    const connectLink = document.getElementById("connect-link");
    let isConnectVisible = false;

    // Office Page Logic
    const officeLink = document.getElementById("office-link");
    let isOfficeVisible = false;

    // Helper to toggle scroll indicators visibility
    const toggleIndicators = (show) => {
        const indicators = document.querySelector('.scroll-indicators');
        if (indicators) {
            gsap.to(indicators, {
                opacity: show ? 1 : 0,
                visibility: show ? "visible" : "hidden",
                pointerEvents: show ? 'auto' : 'none',
                duration: 0.5
            });
        }
    };

    // 4. RAF Loop for Lenis
    function raf(time) {
        if (!isOriginVisible && !isConnectVisible && !isOfficeVisible) {
            lenis.raf(time);
        }
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    function splitTextToLines(element) {
        if (!element) return;
        const text = element.textContent;
        element.innerHTML = "";

        // 1. Create temporary spans for each word to measure their positions
        const words = text.split(/\s+/);
        const tempContainer = document.createElement("div");
        tempContainer.style.visibility = "hidden";
        tempContainer.style.position = "absolute";
        tempContainer.style.width = element.offsetWidth + "px";
        element.appendChild(tempContainer);

        const tempSpans = words.map(word => {
            const span = document.createElement("span");
            span.textContent = word + " ";
            span.style.display = "inline-block";
            tempContainer.appendChild(span);
            return span;
        });

        // 2. Group these spans by their vertical offset to find lines
        const lines = [];
        let currentLine = [];
        let currentY = -1;

        tempSpans.forEach(span => {
            const y = span.offsetTop;
            if (y !== currentY) {
                if (currentLine.length > 0) lines.push(currentLine);
                currentLine = [];
                currentY = y;
            }
            currentLine.push(span.textContent);
        });
        if (currentLine.length > 0) lines.push(currentLine);

        element.removeChild(tempContainer);

        // 3. Reconstruct HTML with line containers
        lines.forEach(lineWords => {
            const mask = document.createElement("div");
            mask.className = "origin-line-mask";

            const lineSpan = document.createElement("span");
            lineSpan.className = "origin-line";
            lineSpan.textContent = lineWords.join("");

            mask.appendChild(lineSpan);
            element.appendChild(mask);
        });
    }

    function resetOriginText(panel) {
        const title = panel.querySelector('.origin-project-title');
        const desc = panel.querySelector('.origin-project-desc');
        const lines = desc ? desc.querySelectorAll('.origin-line') : [];

        if (title) gsap.set(title, { y: 0, opacity: 1, clearProps: "transform" });
        if (desc) gsap.set(desc, { y: 0, opacity: 1, clearProps: "transform" });

        if (lines.length > 0) {
            gsap.set(lines, { y: 0, opacity: 1, clearProps: "transform" });
        }
    }

    // 5. Origin Slider Initialization
    function initOrigin() {
        if (!originImageStack) return;
        originImageStack.innerHTML = "";
        originPanels.forEach((panel, i) => {
            const img = document.createElement('img');
            img.src = panel.dataset.card;
            img.className = `origin-card-img ${i === 0 ? 'visible' : ''}`;
            img.id = `origin-card-img-${i}`;
            if (i === 0) gsap.set(img, { clipPath: "inset(0% 0% 0% 0%)", zIndex: 5 });
            originImageStack.appendChild(img);

            // Split desc text into lines for animation
            const desc = panel.querySelector('.origin-project-desc');
            if (desc) splitTextToLines(desc);
        });

        // Reset first panel text
        const p0 = originPanels[0];
        resetOriginText(p0);
        gsap.set(p0, { clipPath: "inset(0% 0% 0% 0%)", zIndex: 10, visibility: 'visible' });
    }
    initOrigin();

    function gotoOriginSection(index, direction) {
        if (originIsAnimating || index === originCurrentIndex) return;

        originIsAnimating = true;
        const prevPanel = originPanels[originCurrentIndex];
        const nextPanel = originPanels[index];

        const nextTitle = nextPanel.querySelector('.origin-project-title');
        const nextDesc = nextPanel.querySelector('.origin-project-desc');
        const nextBg = nextPanel.querySelector('.origin-bg-image');
        const prevBg = prevPanel.querySelector('.origin-bg-image');

        const nextCardImg = document.getElementById(`origin-card-img-${index}`);
        const prevCardImg = document.getElementById(`origin-card-img-${originCurrentIndex}`);

        const duration = 1.3;
        const ease = "expo.out";

        gsap.set(nextBg, { opacity: 1, scale: 1.1 });

        gsap.set(nextPanel, {
            visibility: 'visible',
            zIndex: 20,
            clipPath: direction === "down" ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)"
        });

        const fgStartClip = direction === "down" ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)";

        // Stabilize previous card to prevent any background leaks (Solid Foundation)
        gsap.set(prevCardImg, {
            zIndex: 10,
            clipPath: "none",
            opacity: 1,
            scale: 1.02 // Tiny bleed to ensure no sub-pixel gaps
        });

        gsap.set(nextCardImg, {
            zIndex: 20,
            clipPath: fgStartClip,
            scale: 1.15
        });

        nextPanel.classList.add('active');

        // Capture current elements for cleanup in onComplete
        const currentTitle = prevPanel.querySelector('.origin-project-title');
        const currentDesc = prevPanel.querySelector('.origin-project-desc');
        const currentLines = currentDesc ? currentDesc.querySelectorAll('.origin-line') : [];

        const tl = gsap.timeline({
            onComplete: () => {
                originPanels.forEach((p, idx) => {
                    if (idx !== index) {
                        const bg = p.querySelector('.origin-bg-image');
                        p.classList.remove('active');
                        gsap.set(p, { zIndex: 1, clipPath: "inset(100% 0% 0% 0%)", visibility: 'hidden' });
                        gsap.set(document.getElementById(`origin-card-img-${idx}`), { zIndex: 1, clipPath: "inset(100% 0% 0% 0%)" });
                        gsap.set(bg, { opacity: 1, scale: 1.1 });
                    }
                });

                gsap.set(nextPanel, { zIndex: 10 });
                gsap.set(nextCardImg, { zIndex: 10, clipPath: "none" }); // Ensure it's a solid foundation for next time

                originCurrentIndex = index;
                originIsAnimating = false;

                // Final safety reveal for the new panel text
                if (nextTitle) gsap.set(nextTitle, { y: 0, opacity: 1, clearProps: "transform" });
                if (nextDesc) gsap.set(nextDesc, { y: 0, opacity: 1, clearProps: "transform" });
                const finalLines = nextDesc ? nextDesc.querySelectorAll('.origin-line') : [];
                if (finalLines.length > 0) gsap.set(finalLines, { y: 0, opacity: 1, clearProps: "transform" });

                // Cleanup prev panel text state AFTER animation finishes
                const itemsToReset = [];
                if (currentTitle) itemsToReset.push(currentTitle);
                if (currentDesc) itemsToReset.push(currentDesc);
                if (itemsToReset.length > 0) gsap.set(itemsToReset, { y: 0, opacity: 1, clearProps: "transform" });
                if (currentLines && currentLines.length > 0) gsap.set(currentLines, { y: 0, opacity: 1, clearProps: "transform" });
            }
        });

        tl.to(nextPanel, { clipPath: "inset(0% 0% 0% 0%)", duration, ease }, 0);
        tl.to(nextCardImg, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration, ease }, 0);
        tl.to(nextBg, { scale: 1, duration: duration + 0.2, ease: "power2.out" }, 0);
        tl.to(prevBg, { scale: 1.1, opacity: 0.5, duration, ease }, 0);

        // Previous card remains static behind while the next card reveals over it

        // Exit animation for current panel text (Dramatic Parallax)
        tl.to(currentTitle, {
            y: direction === "down" ? -window.innerHeight * 1.5 : window.innerHeight * 1.5,
            duration: 1,
            ease: "power2.in"
        }, 0);

        if (currentLines.length > 0) {
            tl.to(currentLines, {
                y: direction === "down" ? -window.innerHeight * 0.5 : window.innerHeight * 0.5,
                duration: 0.8,
                ease: "power2.in",
                stagger: 0.05
            }, 0.1);
        } else if (currentDesc) {
            tl.to(currentDesc, {
                y: direction === "down" ? -window.innerHeight * 1.2 : window.innerHeight * 1.2,
                duration: 0.8,
                ease: "power2.in"
            }, 0.1);
        }

        // Entry animation for next panel text
        // Ensure parents are reset so word animations are visible
        if (nextTitle) gsap.set(nextTitle, { y: 0, opacity: 1, clearProps: "transform" });
        if (nextDesc) gsap.set(nextDesc, { y: 0, opacity: 1, clearProps: "transform" });

        tl.fromTo(nextTitle, { y: direction === "down" ? "100%" : "-100%" }, { y: "0%", duration: duration * 1, ease: "power4.out" }, 0.2);

        const nextLines = nextDesc ? nextDesc.querySelectorAll('.origin-line') : [];
        if (nextLines.length > 0) {
            tl.fromTo(nextLines,
                { opacity: 0, y: direction === "down" ? "100%" : "-100%" },
                { opacity: 1, y: "0%", duration: 0.8, ease: "power3.out", stagger: 0.1 },
                0.35
            );
        } else if (nextDesc) {
            tl.fromTo(nextDesc, { y: direction === "down" ? "100%" : "-100%" }, { y: "0%", duration: duration * 0.8, ease: "power4.out" }, 0.4);
        }
    }

    let lastScrollTime = 0;
    const scrollDelay = 1100;

    window.addEventListener("wheel", (e) => {
        if (!isOriginVisible || isOpen || isAnimating || isConnectVisible || isOfficeVisible) return;

        const now = Date.now();
        if (now - lastScrollTime < scrollDelay || originIsAnimating) return;

        if (Math.abs(e.deltaY) < 20) return;

        if (e.deltaY > 0) {
            const nextIndex = (originCurrentIndex + 1) % originPanels.length;
            gotoOriginSection(nextIndex, "down");
        } else {
            const nextIndex = (originCurrentIndex - 1 + originPanels.length) % originPanels.length;
            gotoOriginSection(nextIndex, "up");
        }
        lastScrollTime = now;
    }, { passive: true });

    // Handle window resize to re-calculate lines
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (isOriginVisible) {
                originPanels.forEach(panel => {
                    const desc = panel.querySelector('.origin-project-desc');
                    if (desc) {
                        splitTextToLines(desc);
                        resetOriginText(panel);
                    }
                });
            }
        }, 250);
    });

    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            if (isOpen) {
                let target = "home";
                if (isOriginVisible) target = "origin";
                else if (isConnectVisible) target = "connect";
                else if (isOfficeVisible) target = "office";
                closeMenu(target);
            }
            else openMenu();
        });
    }

    function cleanupPreviewImages() {
        const previewImages = menuPreviewImg.querySelectorAll("img");
        if (previewImages.length > 3) {
            for (let i = 0; i < previewImages.length - 3; i++) {
                menuPreviewImg.removeChild(previewImages[i]);
            }
        }
    }

    function resetPreviewImage() {
        menuPreviewImg.innerHTML = "";
        const defaultPreviewImg = document.createElement("img");
        defaultPreviewImg.src = "./images/1.png";
        menuPreviewImg.appendChild(defaultPreviewImg);
        currentPreviewImg = "./images/1.png";
    }

    function animateMenuToggle(isOpening) {
        const open = document.querySelector("p#menu-open");
        const close = document.querySelector("p#menu-close");

        gsap.to(isOpening ? open : close, {
            x: isOpening ? -5 : 5,
            y: isOpening ? -10 : 10,
            rotation: isOpening ? -5 : 5,
            opacity: 0,
            delay: 0.25,
            duration: 0.5,
            ease: "power2.out"
        })

        gsap.to(isOpening ? close : open, {
            x: 0,
            y: 0,
            rotation: 0,
            opacity: 1,
            delay: 0.5,
            duration: 0.5,
            ease: "power2.out"
        })
    }

    function openMenu() {
        if (isAnimating || isOpen) return;
        isAnimating = true;

        isOpen = true;
        toggleIndicators(false);
        logoLink.classList.remove("dark-mode");

        let activePage = homeContent;
        if (isOriginVisible) activePage = originPage;
        if (isConnectVisible) activePage = connectPage;
        if (isOfficeVisible) activePage = officePage;

        // Ensure consistent origin for rotation
        gsap.set(activePage, { transformOrigin: "right top", zIndex: 1 });

        // Ensure overlay is visible and ready
        gsap.set(menuOverlay, { visibility: "visible", display: "block", zIndex: 100 });
        gsap.set(menuContent, { visibility: "visible", opacity: 0 }); // Prepare for fade in

        // Lock position (only if home page is visible)
        if (!isOriginVisible && !isConnectVisible && !isOfficeVisible && heroImg && heroContent) {
            const heroRect = document.querySelector(".hero").getBoundingClientRect();
            const imgRect = heroImg.getBoundingClientRect();
            const offset = imgRect.top - heroRect.top;

            lenis.stop();

            const heroSection = document.querySelector(".hero");
            if (heroSection) {
                gsap.set(heroSection, { height: heroRect.height });
            }

            gsap.set(heroImg, {
                position: "absolute",
                top: offset,
                left: 0,
                height: imgRect.height,
                width: imgRect.width,
                zIndex: 0
            });
        }

        const tl = gsap.timeline({
            onComplete: () => {
                isAnimating = false;
            }
        });

        // 1. Throw page away
        tl.to(activePage, {
            rotation: 10,
            x: 300,
            y: 450,
            scale: 1.5,
            duration: 1.25,
            ease: "power4.inOut",
        }, 0);

        // 2. Open menu overlay
        tl.to(menuOverlay, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 175%, 0% 100%)",
            duration: 1.25,
            ease: "power4.inOut",
        }, 0);

        // 3. Bring in menu content
        tl.to(menuContent, {
            rotation: 0,
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 1.25,
            ease: "power4.inOut",
        }, 0);

        // 4. Stagger links
        tl.to([".link a", ".social a"], {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.1,
            ease: "power2.out",
        }, 0.5);

        animateMenuToggle(true);
    }

    function closeMenu(target = "home") {
        if (isAnimating || !isOpen) return;
        isAnimating = true;

        let activePage = homeContent;
        if (isOriginVisible) activePage = originPage;
        if (isConnectVisible) activePage = connectPage;
        if (isOfficeVisible) activePage = officePage;

        const isSwitching = (target === "origin" && !isOriginVisible) ||
            (target === "home" && (isOriginVisible || isConnectVisible || isOfficeVisible)) ||
            (target === "connect" && !isConnectVisible) ||
            (target === "office" && !isOfficeVisible);

        if (isSwitching) {
            let nextPage = homeContent;
            if (target === "origin") nextPage = originPage;
            if (target === "connect") nextPage = connectPage;
            if (target === "office") nextPage = officePage;

            // Prepare next page to match current "thrown" state
            gsap.set(nextPage, {
                display: "block",
                visibility: "visible",
                opacity: 1,
                rotation: 10,
                x: 300,
                y: 450,
                scale: 1.5,
                transformOrigin: "right top",
                zIndex: 1
            });

            // Hide the old page immediately
            gsap.set(activePage, { display: "none", visibility: "hidden", opacity: 0 });

            // Switch pointer to the new page for the animation back
            activePage = nextPage;
            isOriginVisible = (target === "origin");
            isConnectVisible = (target === "connect");
            isOfficeVisible = (target === "office");

            if (isOriginVisible || isConnectVisible || isOfficeVisible) {
                lenis.stop();
                toggleIndicators(false);
                gsap.set(activePage, { zIndex: 50 }); // Bring active sub-page to front
            } else {
                lenis.start();
                toggleIndicators(true);
                gsap.set(activePage, { zIndex: 1 }); // Home page z-index
            }
        }

        const tl = gsap.timeline({
            onComplete: () => {
                gsap.set(activePage, { clearProps: "transform" });
                // Note: Keep visibility/display as set during transition

                const isHomeActive = !isOriginVisible && !isConnectVisible && !isOfficeVisible;

                if (isHomeActive && heroImg) {
                    gsap.set(heroImg, { clearProps: "position,top,height,width" });
                    const heroSection = document.querySelector(".hero");
                    if (heroSection) {
                        gsap.set(heroSection, { clearProps: "height" });
                    }
                    lenis.start();
                }

                ScrollTrigger.refresh();
                isAnimating = false;
                isOpen = false;
                if (isHomeActive) toggleIndicators(true); // Only show if we ended up on home
                gsap.set(menuOverlay, { visibility: "hidden" }); // Explicit cleanup
                gsap.set([".link a", ".social a"], { y: "120%" });
                resetPreviewImage();
            }
        });

        // 1. Pull page back
        tl.to(activePage, {
            rotation: 0,
            x: 0,
            y: 0,
            scale: 1,
            duration: 1.25,
            ease: "power4.inOut",
        }, 0);

        // 2. Animate Menu Content out
        tl.to(menuContent, {
            rotation: -15,
            x: 300,
            y: -100,
            scale: 1.5,
            opacity: 0.25,
            duration: 1.25,
            ease: "power4.inOut",
        }, 0);

        // 3. Close Menu Overlay
        tl.to(menuOverlay, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 1.25,
            ease: "power4.inOut",
        }, 0);

        animateMenuToggle(false);
    }

    menulinks.forEach((link) => {
        link.addEventListener("mouseover", () => {
            if (!isOpen || isAnimating) return;

            const imgSrc = link.getAttribute("data-img");
            if (!imgSrc || imgSrc === currentPreviewImg) return;

            currentPreviewImg = imgSrc;

            const newPreviewImg = document.createElement("img");
            newPreviewImg.src = imgSrc;
            newPreviewImg.style.opacity = 0;

            gsap.set(newPreviewImg, {
                scale: 1.25,
                rotation: 10
            });

            menuPreviewImg.appendChild(newPreviewImg);
            cleanupPreviewImages();

            gsap.to(newPreviewImg, {
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: 0.75,
                ease: "power2.out",
            })
        });
    });

    const originLink = document.getElementById("origin-link");
    if (originLink) {
        originLink.addEventListener("click", (e) => {
            if (isOpen) {
                e.preventDefault();
                closeMenu("origin");
            }
        });
    }

    if (connectLink) {
        connectLink.addEventListener("click", (e) => {
            if (isOpen) {
                e.preventDefault();
                closeMenu("connect");
            }
        });
    }

    if (officeLink) {
        officeLink.addEventListener("click", (e) => {
            if (isOpen) {
                e.preventDefault();
                closeMenu("office");
            }
        });
    }

    if (logoLink) {
        logoLink.addEventListener("click", (e) => {
            if (isOpen) {
                e.preventDefault();
                closeMenu("home");
            } else if (isOriginVisible || isConnectVisible || isOfficeVisible) {
                e.preventDefault();
                if (isAnimating) return;
                isAnimating = true;

                let activePage = originPage;
                if (isConnectVisible) activePage = connectPage;
                if (isOfficeVisible) activePage = officePage;

                const tl = gsap.timeline({
                    onComplete: () => {
                        isAnimating = false;
                        isOriginVisible = false;
                        isConnectVisible = false;
                        isOfficeVisible = false;
                        gsap.set(activePage, { display: "none", visibility: "hidden" });
                        gsap.set(activePage, { clearProps: "all" });
                        gsap.set(homeContent, { clearProps: "transform" });
                        if (heroImg) {
                            gsap.set(heroImg, { clearProps: "position,top,height,width" });
                            const heroSection = document.querySelector(".hero");
                            if (heroSection) {
                                gsap.set(heroSection, { clearProps: "height" });
                            }
                        }
                        lenis.start();
                        ScrollTrigger.refresh();
                    }
                });

                // 1. Prepare Home Page behind Origin/Connect/Office
                gsap.set(homeContent, {
                    display: "block",
                    visibility: "visible",
                    opacity: 1,
                    rotation: 10,
                    x: 300,
                    y: 450,
                    scale: 1.5,
                    transformOrigin: "right top",
                    zIndex: 40
                });

                // 2. Prepare Page as the Curtain
                // Use the same skewed polygon as the menu for consistency
                gsap.set(activePage, {
                    zIndex: 50,
                    opacity: 1,
                    visibility: "visible",
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 175%, 0% 100%)"
                });

                // 3. Mirror the Menu-to-Home Transition precisely
                // Fly-away + wipe-up combined
                tl.to(activePage, {
                    rotation: -15,
                    x: 300,
                    y: -800,
                    scale: 1.5,
                    opacity: 0,
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
                    duration: 1.25,
                    ease: "power4.inOut"
                }, 0);

                tl.to(homeContent, {
                    rotation: 0,
                    x: 0,
                    y: 0,
                    scale: 1,
                    duration: 1.25,
                    ease: "power4.inOut"
                }, 0);

                toggleIndicators(true);
            }
        });
    }

    // 7. Scroll Animations
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);

        // Hero Background Parallax
        gsap.to(".hero-img img", {
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: 1
            },
            yPercent: -10,
            ease: "none"
        });

        // Logo & Menu Color Shift (Dark mode over content)
        const menuText = document.querySelector(".menu-toggle p");
        if (!menuText) console.warn("Menu text element not found!");

        ScrollTrigger.create({
            trigger: ".hero-content",
            start: "top 60px",
            end: "bottom 60px",
            onEnter: () => {
                if (!isOpen && !isOriginVisible && !isConnectVisible && !isOfficeVisible) {
                    logoLink.classList.add("dark-mode");
                }
            },
            onLeave: () => {
                logoLink.classList.remove("dark-mode");
            },
            onEnterBack: () => {
                if (!isOpen && !isOriginVisible && !isConnectVisible && !isOfficeVisible) {
                    logoLink.classList.add("dark-mode");
                }
            },
            onLeaveBack: () => {
                logoLink.classList.remove("dark-mode");
            },
        });

        // Menu Color Shift (Distinct trigger for full hero section)
        ScrollTrigger.create({
            trigger: ".hero",
            start: "top 60px",
            end: "bottom 60px",
            onEnter: () => {
                if (!isOpen && !isOriginVisible && !isConnectVisible && !isOfficeVisible) {
                    if (menuText) {
                        menuText.classList.add("dark-mode");
                        menuText.style.color = "";
                    }
                }
            },
            onLeave: () => {
                if (menuText) {
                    menuText.classList.remove("dark-mode");
                    menuText.style.color = "white";
                }
            },
            onEnterBack: () => {
                if (!isOpen && !isOriginVisible && !isConnectVisible && !isOfficeVisible) {
                    if (menuText) {
                        menuText.classList.add("dark-mode");
                        menuText.style.color = "";
                    }
                }
            },
            onLeaveBack: () => {
                if (menuText) {
                    menuText.classList.remove("dark-mode");
                    menuText.style.color = "white";
                }
            },
        });

        // Black Page Text Fade In
        const blackPageText = document.querySelector(".black-page-content h2 span");
        if (blackPageText) {
            gsap.from(blackPageText, {
                scrollTrigger: {
                    trigger: ".black-page",
                    start: "top 60%", // Start animation when black page is near center
                    toggleActions: "play none none reverse"
                },
                y: "110%",
                duration: 1.5,
                ease: "power4.out"
            });
        }

        // Projects Heading Text Fade In
        const projectsText = document.querySelector(".projects-heading h2 span");
        if (projectsText) {
            gsap.from(projectsText, {
                scrollTrigger: {
                    trigger: ".projects-heading",
                    start: "top 75%", // Start animation when element is in view
                    toggleActions: "play none none reverse"
                },
                y: "110%",
                duration: 1.5,
                ease: "power4.out"
            });
        }

        // Scroll Sequence Logic (Scrubbing)
        const textBlocks = gsap.utils.toArray(".text-block");
        const images = gsap.utils.toArray(".sticky-image-frame .seq-img");

        // We skip index 0 because it's the base layer that's already there.
        // We start animating from index 1 (the second image) onwards.
        images.forEach((img, i) => {
            if (i === 0) return; // Base image stays put

            ScrollTrigger.create({
                trigger: textBlocks[i],
                start: "top bottom", // Start sliding in when text enters viewport
                end: "top 25%",     // Lock in place when text is near top
                scrub: 1,           // Dynamic scrub (1s lag for smoothness)
                animation: gsap.fromTo(img,
                    { x: window.innerWidth + 100, rotation: 0 }, // Start off-screen right
                    { x: 0, rotation: (i % 2 === 0 ? 2 : -1.5), ease: "none" } // Slide to docked position with slight misalignment
                )
            });
        });

        // 1. Initialize Scroll Indicators
        const indicatorContainer = document.getElementById('indicator-container');
        const indicatorBars = [];

        if (indicatorContainer) {
            textBlocks.forEach((block, i) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'indicator-wrapper';

                const bar = document.createElement('div');
                bar.className = 'indicator-bar';
                if (i === 0) bar.classList.add('active');

                wrapper.appendChild(bar);
                indicatorContainer.appendChild(wrapper);
                indicatorBars.push(bar);

                wrapper.addEventListener('click', () => {
                    if (i === 0) {
                        lenis.scrollTo(0); // Top of page
                    } else if (i === textBlocks.length - 1) {
                        lenis.scrollTo(document.body.scrollHeight); // Bottom of page
                    } else {
                        lenis.scrollTo(block, { offset: -window.innerHeight * 0.1 });
                    }
                });
            });
        }

        // 2. Separate trigger for Text Opacity & Indicator Highlighting
        textBlocks.forEach((block, i) => {
            let startPoint = "top center";
            let endPoint = "bottom center";

            // If it's the first indicator, make it active from the very top of the page
            if (i === 0) startPoint = "top 200%";
            // If it's the last indicator, make it active until the very bottom of the page
            if (i === textBlocks.length - 1) endPoint = "bottom -100%";

            ScrollTrigger.create({
                trigger: block,
                start: startPoint,
                end: endPoint,
                onEnter: () => {
                    block.classList.add("active");
                    indicatorBars.forEach((b, idx) => b.classList.toggle('active', idx === i));
                },
                onLeave: () => {
                    block.classList.remove("active");
                },
                onEnterBack: () => {
                    block.classList.add("active");
                    indicatorBars.forEach((b, idx) => b.classList.toggle('active', idx === i));
                },
                onLeaveBack: () => {
                    block.classList.remove("active");
                }
            });
        });

        // 7. Connect Form Logic
        function initConnectForm() {
            const form = document.getElementById("contact-form");
            const statusMessage = document.getElementById("status");
            const submitBtn = document.getElementById("submit-btn");
            const lottieContainer = document.getElementById('lottie-loading');

            if (!form || !submitBtn || !lottieContainer) return;

            // Initialize Lottie Animation
            let animation;
            if (typeof lottie !== "undefined") {
                animation = lottie.loadAnimation({
                    container: lottieContainer,
                    renderer: 'svg',
                    loop: true,
                    autoplay: false,
                    path: 'loading.json'
                });
            }

            async function handleSubmit(event) {
                event.preventDefault();

                // Custom Validation
                const inputs = form.querySelectorAll("input[required], textarea[required]");
                let isValid = true;

                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        input.classList.add("error");
                        isValid = false;
                    } else {
                        input.classList.remove("error");
                    }

                    // Remove error on input
                    input.oninput = () => {
                        if (input.value.trim()) {
                            input.classList.remove("error");
                        }
                    };
                });

                if (!isValid) {
                    if (statusMessage) statusMessage.classList.remove("visible");
                    return;
                } else {
                    if (statusMessage) statusMessage.classList.remove("visible");
                }

                const data = new FormData(event.target);

                // Start Loading State
                submitBtn.disabled = true;
                submitBtn.classList.add('loading');
                if (animation) animation.play();

                fetch(event.target.action, {
                    method: form.method,
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                }).then(response => {
                    // Stop Loading State
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('loading');
                    if (animation) animation.stop();

                    if (response.ok) {
                        console.log("Formspree submission successful");
                        form.reset();
                        if (statusMessage) {
                            statusMessage.innerHTML = "Thanks for your message!";
                            statusMessage.style.color = "white";
                            statusMessage.classList.add("visible");
                        }
                    } else {
                        console.error("Formspree submission failed:", response.status, response.statusText);
                        response.json().then(data => console.error("Error data:", data));
                        if (statusMessage) {
                            statusMessage.innerHTML = "Oops! There was a problem submitting your form";
                            statusMessage.style.color = "#ff4d4d";
                            statusMessage.classList.add("visible");
                        }
                    }
                }).catch(error => {
                    // Stop Loading State
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('loading');
                    if (animation) animation.stop();
                    if (statusMessage) {
                        statusMessage.innerHTML = "Oops! There was a problem submitting your form";
                        statusMessage.style.color = "#ff4d4d";
                        statusMessage.classList.add("visible");
                    }
                });
            }
            form.addEventListener("submit", handleSubmit);
        }
        initConnectForm();

        // Connect Page Mouse Interaction
        window.addEventListener("mousemove", (e) => {
            if (!isConnectVisible) return;

            const connectBg = document.querySelector(".connect-background");
            if (!connectBg) return;

            const x = (e.clientX / window.innerWidth - 0.5) * 15; // Max movement 7.5px
            const y = (e.clientY / window.innerHeight - 0.5) * 15;

            gsap.to(connectBg, {
                x: x,
                y: y,
                duration: 1,
                ease: "power2.out"
            });
        });
    }

});

// --- Watch & Shop Carousel Integration ---
(function initWatchShopCarousel() {
    const sliderData = [
        { title: "Prismatic Shards", img: "screenshort/Screenshot 2026-02-16 at 12.43.34 AM.png", url: "#" },
        { title: "Brutalist Red", img: "screenshort/Screenshot 2026-02-15 at 2.56.38 AM.png", url: "#" },
        { title: "Brutalist Red", img: "screenshort/Screenshot 2026-02-16 at 1.06.28 AM.png", url: "#" },
        // { title: "Liquid Chrome", img: "screenshort/Screenshot 2026-02-15 at 2.57.08 AM.png", url: "#" },
        { title: "Mechanical Heart", img: "screenshort/Screenshot 2026-02-15 at 2.56.49 AM.png", url: "#" },
        // { title: "Mechanical Heart", img: "screenshort/Screenshot 2026-02-15 at 2.56.49 AM.png", url: "#" },
        // { title: "Prismatic Shards", img: "./images/watch_shop/img1.png", url: "#" },
        // { title: "Brutalist Red", img: "./images/watch_shop/img2.png", url: "#" },
        //{ title: "Liquid Chrome", img: "./images/watch_shop/img3.png", url: "#" },
        //{ title: "Mechanical Heart", img: "./images/watch_shop/img4.png", url: "#" },
        //{ title: "Gemini Art", img: "./Gemini_Generated_Image_7gcx597gcx597gcx.png", url: "#" },
    ];

    const config = {
        SCROLL_SPEED: 1.75,
        LEAP_FACTOR: 0.05,
        MAX_VELOCITY: 150,
    };

    const totalSlideCount = sliderData.length;
    const state = {
        currentX: 0, targetX: 0, slideWidth: 430, slides: [], isDragging: false,
        startX: 0, lastX: 0, lastMouseX: 0, lastScrollTime: Date.now(),
        isMoving: false, velocity: 0, lastCurrentX: 0, dragDistance: 0,
        hasActuallyDragged: false, isMobile: false,
    };

    function checkMobile() { state.isMobile = window.innerWidth < 1000; }

    function createSlideElement(index) {
        const slide = document.createElement("div");
        slide.className = "ws-slide";
        if (state.isMobile) { slide.style.width = "200px"; slide.style.height = "280px"; }

        const imageContainer = document.createElement("div");
        imageContainer.className = "ws-slide-image";

        const img = document.createElement("img");
        const dataIndex = index % totalSlideCount;
        img.src = sliderData[dataIndex].img;
        img.alt = sliderData[dataIndex].title;

        const overlay = document.createElement("div");
        overlay.className = "ws-slide-overlay";

        const title = document.createElement("p");
        title.className = "ws-project-title";
        title.textContent = sliderData[dataIndex].title;

        const arrow = document.createElement("div");
        arrow.className = "ws-project-arrow";
        arrow.innerHTML = `<svg viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>`;

        slide.addEventListener("click", (e) => {
            e.preventDefault();
            if (state.dragDistance < 10 && !state.hasActuallyDragged) {
                console.log("Clicked slide:", sliderData[dataIndex].title);
            }
        });

        overlay.appendChild(title);
        overlay.appendChild(arrow);
        imageContainer.appendChild(img);
        slide.appendChild(imageContainer);
        slide.appendChild(overlay);
        return slide;
    }

    function initializeSlides() {
        const track = document.querySelector(".ws-slide-track");
        if (!track) return;

        track.innerHTML = "";
        state.slides = [];
        checkMobile();
        // Desktop: 500px width + 50px margin (25 left + 25 right) = 550
        // Mobile: 200px width + 20px margin (10 left + 10 right - assumed from CSS or default) = 220 
        // Note: CSS mobile media query doesn't specify margin, so it inherits 25px from desktop unless overridden.
        // Let's verify CSS margin inheritance. The media query only updated width/height. 
        // So mobile margin is still 25px. 
        // Mobile width 200 + 50 = 250.
        state.slideWidth = state.isMobile ? 250 : 550;

        const copies = 6;
        const totalSlides = totalSlideCount * copies;

        for (let i = 0; i < totalSlides; i++) {
            const slide = createSlideElement(i);
            track.appendChild(slide);
            state.slides.push(slide);
            slide.dataset.x = i * state.slideWidth;
        }

        const startOffset = -(totalSlideCount * state.slideWidth * 2);
        state.currentX = startOffset;
        state.targetX = startOffset;
    }

    function updateSlidePosition() {
        const track = document.querySelector(".ws-slide-track");
        if (!track) return;
        const sequenceWidth = state.slideWidth * totalSlideCount;

        if (state.currentX > -sequenceWidth) {
            const diff = sequenceWidth * 3;
            state.currentX -= diff;
            state.targetX -= diff;
            state.lastCurrentX -= diff;
        } else if (state.currentX < -sequenceWidth * 5) {
            const diff = sequenceWidth * 3;
            state.currentX += diff;
            state.targetX += diff;
            state.lastCurrentX += diff;
        }
        track.style.transform = `translate3d(${state.currentX}px, 0, 0)`;
    }

    function updateParallax() {
        const viewportCenter = window.innerWidth / 2;
        const slideOffset = 20;

        state.slides.forEach((slide) => {
            const img = slide.querySelector("img");
            if (!img) return;
            const slideX = parseFloat(slide.dataset.x) + state.currentX;
            const slideWidth = state.slideWidth - 40;

            if (slideX + slideWidth < -500 || slideX > window.innerWidth + 500) return;

            const slideCenter = slideX + slideOffset + slideWidth / 2;
            const distanceFromCenter = slideCenter - viewportCenter;
            const parallaxOffset = distanceFromCenter * -0.25;
            img.style.transform = `translateX(${parallaxOffset}px) scale(1.5)`;
        });
    }

    function updateMovingState() {
        state.velocity = Math.abs(state.currentX - state.lastCurrentX);
        state.lastCurrentX = state.currentX;

        const isSlowEnough = state.velocity < 0.1;
        const hasBeenStillLongEnough = Date.now() - state.lastScrollTime > 200;
        state.isMoving = state.hasActuallyDragged || !isSlowEnough || !hasBeenStillLongEnough;

        document.documentElement.style.setProperty(
            "--slider-moving",
            state.isMoving ? "1" : "0"
        );
    }

    function animate() {
        state.currentX += (state.targetX - state.currentX) * config.LEAP_FACTOR;

        updateMovingState();
        updateSlidePosition();
        updateParallax();
        requestAnimationFrame(animate);
    }

    function handleWheel(e) {
        const slider = e.target.closest(".ws-slider");
        if (!slider) return;

        // Only consume if vertical scroll is dominant
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

        // If mouse is over the slider, prevent page scroll and move carousel
        e.preventDefault();
        const scrollDelta = e.deltaY * config.SCROLL_SPEED;
        state.targetX -= Math.max(Math.min(scrollDelta, config.MAX_VELOCITY), -config.MAX_VELOCITY);
        state.lastScrollTime = Date.now();
    }

    function handleMouseDown(e) {
        if (!e.target.closest(".ws-slider")) return;
        e.preventDefault();
        state.isDragging = true;
        state.startX = e.clientX;
        state.lastMouseX = e.clientX;
        state.lastX = state.targetX;
        state.dragDistance = 0;
        state.hasActuallyDragged = false;
    }

    function handleMouseMove(e) {
        if (!state.isDragging) return;
        e.preventDefault();
        const deltaX = (e.clientX - state.lastMouseX) * 2;
        state.targetX += deltaX;
        state.lastMouseX = e.clientX;
        state.dragDistance += Math.abs(deltaX);
        if (state.dragDistance > 5) state.hasActuallyDragged = true;
    }

    function handleMouseUp() {
        state.isDragging = false;
        setTimeout(() => { state.hasActuallyDragged = false; }, 100);
    }

    function init() {
        const slider = document.querySelector(".ws-slider");
        if (!slider) return;
        initializeSlides();
        slider.addEventListener("wheel", handleWheel, { passive: false });
        slider.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("resize", initializeSlides);
        animate();
        if (typeof ScrollTrigger !== "undefined") {
            ScrollTrigger.refresh();
        }

        // --- Social Icon Animations ---

        // 1. GitHub Lottie
        const githubContainer = document.getElementById('lottie-github');
        const githubLink = document.getElementById('github-link');
        if (githubContainer && typeof lottie !== 'undefined') {
            const githubAnim = lottie.loadAnimation({
                container: githubContainer,
                renderer: 'svg',
                loop: true,
                autoplay: false,
                path: './images/github.json'
            });

            // Ensure white stroke when loaded
            githubAnim.addEventListener('DOMLoaded', () => {
                const paths = githubContainer.querySelectorAll('path');
                paths.forEach(p => {
                    p.setAttribute('stroke', '#ffffff');
                    p.setAttribute('stroke-width', '2');
                    p.setAttribute('fill', 'none');
                });
            });

            if (githubLink) {
                githubLink.addEventListener('mouseenter', () => githubAnim.play());
                githubLink.addEventListener('mouseleave', () => githubAnim.stop());
            }
        }

        // 2. LinkedIn Lottie
        const linkedinContainer = document.getElementById('lottie-linkedin');
        const linkedinLink = document.getElementById('linkedin-link');
        if (linkedinContainer && typeof lottie !== 'undefined') {
            const linkedinAnim = lottie.loadAnimation({
                container: linkedinContainer,
                renderer: 'svg',
                loop: true,
                autoplay: false,
                path: './images/linkedin.json'
            });

            // Ensure white stroke when loaded
            linkedinAnim.addEventListener('DOMLoaded', () => {
                const paths = linkedinContainer.querySelectorAll('path');
                paths.forEach(p => {
                    p.setAttribute('stroke', '#ffffff');
                    p.setAttribute('stroke-width', '2');
                    p.setAttribute('fill', 'none');
                });
            });

            if (linkedinLink) {
                linkedinLink.addEventListener('mouseenter', () => linkedinAnim.play());
                linkedinLink.addEventListener('mouseleave', () => linkedinAnim.stop());
            }
        }

        // 3. X (Twitter) GSAP
        const xLink = document.getElementById('x-link');
        const xIcon = document.querySelector('.x-icon-svg');

        if (xLink && xIcon && typeof gsap !== 'undefined') {
            const xAnim = gsap.timeline({ paused: true });
            xAnim.to(xIcon, { scale: 1.2, duration: 0.1, ease: "power1.out" })
                .to(xIcon, { rotation: -10, duration: 0.1 })
                .to(xIcon, { rotation: 10, duration: 0.1 })
                .to(xIcon, { rotation: -10, duration: 0.1 })
                .to(xIcon, { rotation: 0, scale: 1, duration: 0.1 });

            xLink.addEventListener('mouseenter', () => xAnim.restart());
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
