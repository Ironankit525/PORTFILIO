document.addEventListener("DOMContentLoaded", () => {
    // Reveal animation
    gsap.to(".reveal-text", {
        y: 0,
        opacity: 1,
        duration: 0.75,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.2
    });
});
