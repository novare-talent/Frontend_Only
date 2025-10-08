// This function handles the mobile menu functionality.
function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    // I only proceed if both the button and the menu exist.
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            // This line toggles the 'hidden' class on the menu, making it appear or disappear.
            mobileMenu.classList.toggle('hidden');
        });

        // This part closes the menu when you click on a link inside it.
        document.querySelectorAll('#mobile-menu a, #mobile-menu button').forEach(element => {
            element.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }
}

// This function initializes the testimonials carousel.
function setupTestimonialsCarousel() {
    // I check if Swiper is defined before trying to use it.
    if (typeof Swiper !== 'undefined') {
        new Swiper('.testimonials-swiper', {
            // These are the settings for the slider
            loop: true,
            slidesPerView: 1, // This ensures only one slide is visible at a time
            effect: 'fade',   // I'm using a fade transition for a smooth effect
            fadeEffect: {
                crossFade: true
            },
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    }
}

// I wait for the DOM to be fully loaded before running my scripts.
document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupTestimonialsCarousel();
});
