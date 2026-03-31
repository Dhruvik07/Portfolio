document.addEventListener('DOMContentLoaded', () => {

    /* --- Theme Toggle Logic --- */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    
    // Set initial icons based on current theme class
    if (document.documentElement.classList.contains('dark')) {
        themeToggleLightIcon.classList.remove('hidden');
    } else {
        themeToggleDarkIcon.classList.remove('hidden');
    }

    themeToggleBtn.addEventListener('click', function() {
        // Toggle icon
        themeToggleDarkIcon.classList.toggle('hidden');
        themeToggleLightIcon.classList.toggle('hidden');

        // Toggle dark mode class
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        
        // Re-initialize particles to match theme colors if needed
        initCanvasColors();
    });

    /* --- Sticky Glass Navbar --- */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-md');
        } else {
            navbar.classList.remove('shadow-md');
        }
    });

    /* --- Antigravity Particle Swarm Effect --- */
    // Simulates the effect of numerous small dots tracking / scattering from the mouse
    const canvas = document.getElementById('antigravity-system');
    const ctx = canvas.getContext('2d');
    
    // Resize canvas
    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Track mouse
    let mouse = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        radius: 150 // Interaction radius
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    // Determine colors based on Theme
    let idleColorStr = '26, 115, 232'; // Google Blue rgb
    let activeColorStr = '234, 67, 53'; // Google Red rgb
    
    function initCanvasColors() {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
            idleColorStr = '156, 76, 255'; // Purple
            activeColorStr = '234, 76, 255'; // Pinkish/Red
        } else {
            idleColorStr = '26, 115, 232'; // Google Blue rgb
            activeColorStr = '234, 67, 53'; // Google Red rgb
        }
    }
    initCanvasColors();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            // Pill/Capsule dimensions
            this.width = Math.random() * 6 + 2; // 2px to 8px width
            this.height = Math.random() * 2 + 1; // 1px to 3px height
            this.rotation = (Math.random() - 0.5) * 0.5; // Slight base rotation angle
            
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 5; 
            
            // For natural floating
            this.angle = Math.random() * Math.PI * 2;
            this.floatSpeed = Math.random() * 0.02 + 0.01;
            this.opacity = Math.random() * 0.5 + 0.3; // depth feel
        }
        
        draw(distanceRatio) {
            ctx.fillStyle = `rgba(${idleColorStr}, ${this.opacity})`;
            if (distanceRatio > 0) {
                ctx.fillStyle = `rgba(${activeColorStr}, ${Math.min(1, this.opacity + distanceRatio)})`;
            }
            
            ctx.save();
            ctx.translate(this.x, this.y);
            // Apply slight rotation for the capsule
            ctx.rotate(this.angle * 0.5 + this.rotation);
            
            ctx.beginPath();
            // Draw a pill shape using roundRect for a capsule look
            ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, this.height / 2);
            ctx.fill();
            
            ctx.restore();
        }
        
        update() {
            // Natural slow float
            this.angle += this.floatSpeed;
            this.baseX += Math.cos(this.angle) * 0.5;
            this.baseY -= Math.abs(Math.sin(this.angle) * 0.5); // Lift up effect

            // Keeps base position softly contained, Wrap around top if lifted
            if(this.baseX < 0) this.baseX = canvas.width;
            if(this.baseX > canvas.width) this.baseX = 0;
            if(this.baseY < -50) this.baseY = canvas.height + 50;
            if(this.baseY > canvas.height + 50) this.baseY = -50;

            // Mouse interaction: Repel logic
            let dx = this.x - mouse.x; // Vector pointing AWAY from mouse
            let dy = this.y - mouse.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            let distanceRatio = 0;
            
            // Repel effect around mouse
            if (distance < mouse.radius * 1.2) {
                distanceRatio = 1 - (distance / (mouse.radius * 1.2));
                
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                
                // Push particles away. The closer the mouse, the stronger the push.
                let pushStrength = distanceRatio * 10; 
                
                this.x += forceDirectionX * pushStrength;
                this.y += forceDirectionY * pushStrength;
                
                // Allow them to maintain this drift temporarily by updating baseX/Y slightly to prevent harsh snapping
                this.baseX += forceDirectionX * pushStrength * 0.1;
                this.baseY += forceDirectionY * pushStrength * 0.1;

            } else {
                // Return to base position with inertia
                if (this.x !== this.baseX) {
                    let dxb = this.x - this.baseX;
                    this.x -= dxb / 20; // Smooth return
                }
                if (this.y !== this.baseY) {
                    let dyb = this.y - this.baseY;
                    this.y -= dyb / 20;
                }
            }
            this.draw(distanceRatio);
        }
    }

    let particleArray = [];
    function initSwarm() {
        particleArray = [];
        // Determine number of particles based on screen size (Increase density)
        let numParticles = (canvas.width * canvas.height) / 4000;
        if(numParticles > 800) numParticles = 800; // Cap at 800 for dense swarm
        if(numParticles < 200) numParticles = 200; 
        
        for (let i = 0; i < numParticles; i++) {
            particleArray.push(new Particle());
        }
    }

    let radiusAngle = 0;

    function animateSwarm() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Slowly pulse the repel circle's radius between ~20px and ~180px
        radiusAngle += 0.015; // Speed of the pulse
        mouse.radius = 100 + Math.sin(radiusAngle) * 80;
        
        for (let i = 0; i < particleArray.length; i++) {
            particleArray[i].update();
        }
        
        requestAnimationFrame(animateSwarm);
    }

    // Initialize and run
    initSwarm();
    animateSwarm();

});
