// Add smooth scrolling behavior and navbar glass effect on scroll
document.addEventListener('DOMContentLoaded', () => {
    
    const navbar = document.getElementById('navbar');
    
    // Add scroll listener for navbar transparency
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-md');
            navbar.style.background = 'rgba(15, 23, 42, 0.8)';
            navbar.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        } else {
            navbar.classList.remove('shadow-md');
            navbar.style.background = 'rgba(15, 23, 42, 0.3)';
            navbar.style.borderBottom = 'none';
        }
    });
});
