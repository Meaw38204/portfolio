// Three.js setup for the animated wave background
const container = document.getElementById('webgl-container');
let scene, camera, renderer, water;
let originalZPositions; // Array to store original Z positions

function initThreeJS() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 100);
    camera.rotation.x = -Math.PI / 8;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Water Geometry - a large plane to cover the entire background
    const geometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
    const material = new THREE.MeshBasicMaterial({
        color: 0x808080,
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });
    water = new THREE.Mesh(geometry, material);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0;
    scene.add(water);

    // Store original Z positions for wave animation, using BufferGeometry attributes
    originalZPositions = [];
    const positionAttribute = water.geometry.attributes.position;
    for (let i = 0; i < positionAttribute.count; i++) {
        originalZPositions.push(positionAttribute.getZ(i));
    }

    // Handle window resizing
    window.addEventListener('resize', onWindowResize, false);
    // Kick off the animation loop
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Progress bar animation logic
const progressBars = document.querySelectorAll('.progress-bar');
const animateProgressBars = () => {
    progressBars.forEach(bar => {
        const progress = bar.dataset.progress;
        bar.style.width = `${progress}%`;
    });
};

// IntersectionObserver to handle the pop-up effect and other animations
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            const sectionId = entry.target.id;
            if (sectionId === 'skills') {
                animateProgressBars();
            }
            // Uncomment the next line to stop observing the element after it has become visible
            // observer.unobserve(entry.target);
        } else {
            // Uncomment the next line to have the effect re-run when scrolling back up
            // entry.target.classList.remove('is-visible');
        }
    });
}, {
    threshold: 0.3 // Trigger when 30% of the element is in view
});

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    // The home section should be visible by default
    if (section.id === 'home') {
        section.classList.add('is-visible');
    } else {
        observer.observe(section);
    }
});

// Water Wave Animation
const animate = () => {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;
    const positionAttribute = water.geometry.attributes.position;

    for (let i = 0; i < positionAttribute.count; i++) {
        // Accessing x and y coordinates from the attribute buffer
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        
        // Use the original z position and calculate the new z
        const z = originalZPositions[i] + Math.sin(x * 0.05 + time) * 2 + Math.cos(y * 0.05 + time) * 2;
        
        // Update the z coordinate
        positionAttribute.setZ(i, z);
    }
    
    // Set the needsUpdate flag to true to inform Three.js about the changes
    positionAttribute.needsUpdate = true;
    renderer.render(scene, camera);
};

// Initializing the Three.js scene when the window loads
window.onload = function () {
    initThreeJS();
}