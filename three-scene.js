/**
 * Three.js Romantic Scene: Fluttering 3D Butterflies & Beating Heart Particles
 * Lightweight, high-performance, mobile-optimized (60 FPS)
 */

class RomanticThreeScene {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.butterflies = [];
        this.heartParticles = null;
        this.floatingDust = null;
        this.clock = new THREE.Clock();
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        this.isVisible = true;

        this.init();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0xfff0f5, 0.0018);

        // Camera setup
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
        this.camera.position.set(0, 0, 75);

        // Renderer setup (capped pixel ratio for lag-free performance on mobile)
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffe4e6, 1.2);
        this.scene.add(ambientLight);

        const pinkLight = new THREE.PointLight(0xff69b4, 2.5, 120);
        pinkLight.position.set(20, 20, 40);
        this.scene.add(pinkLight);

        const warmLight = new THREE.PointLight(0xffd1dc, 2.0, 100);
        warmLight.position.set(-20, -10, 30);
        this.scene.add(warmLight);

        // Create Components
        this.createBeatingHeart();
        this.createButterflies(8); // 8 gentle butterflies
        this.createFloatingDust(180); // 180 soft glowing particles

        // Event Listeners
        window.addEventListener('resize', this.onResize.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this), { passive: true });
        window.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });
        
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (this.isVisible) this.clock.start();
        });

        // Start render loop
        this.animate();
    }

    /**
     * Creates a 3D beating heart particle constellation
     */
    createBeatingHeart() {
        const particleCount = 1200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const originalPositions = new Float32Array(particleCount * 3);

        const color1 = new THREE.Color(0xff2a85); // Vibrant rose pink
        const color2 = new THREE.Color(0xff85b3); // Soft pastel pink
        const color3 = new THREE.Color(0xffc2d1); // Warm blush

        for (let i = 0; i < particleCount; i++) {
            // Heart parametric equation in 3D
            const t = Math.PI * 2 * Math.random();
            const u = Math.PI * (Math.random() - 0.5);
            
            // Heart contour
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            
            // Add thickness & 3D volume
            const zSpread = (Math.random() - 0.5) * 8 * Math.cos(u);
            const volumeScale = 0.8 + Math.random() * 0.4;

            const finalX = (x * volumeScale) * 0.95;
            const finalY = (y * volumeScale) * 0.95;
            const finalZ = zSpread;

            positions[i * 3] = finalX;
            positions[i * 3 + 1] = finalY;
            positions[i * 3 + 2] = finalZ;

            originalPositions[i * 3] = finalX;
            originalPositions[i * 3 + 1] = finalY;
            originalPositions[i * 3 + 2] = finalZ;

            // Gradient colors from center to edges
            const lerpVal = Math.random();
            const pColor = lerpVal < 0.6 ? color1.clone().lerp(color2, Math.random()) : color2.clone().lerp(color3, Math.random());

            colors[i * 3] = pColor.r;
            colors[i * 3 + 1] = pColor.g;
            colors[i * 3 + 2] = pColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Create a circular glowing texture for heart points
        const texture = this.createGlowingPointTexture();

        const material = new THREE.PointsMaterial({
            size: 1.8,
            map: texture,
            transparent: true,
            opacity: 0.88,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.heartParticles = new THREE.Points(geometry, material);
        this.heartParticles.position.set(0, 4, -5);
        this.heartOriginalPos = originalPositions;
        this.scene.add(this.heartParticles);
    }

    /**
     * Creates procedural circular glowing particle texture
     */
    createGlowingPointTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.25, 'rgba(255, 182, 193, 0.9)');
        grad.addColorStop(0.6, 'rgba(255, 105, 180, 0.4)');
        grad.addColorStop(1, 'rgba(255, 105, 180, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(32, 32, 32, 0, Math.PI * 2);
        ctx.fill();

        return new THREE.CanvasTexture(canvas);
    }

    /**
     * Create 3D Butterflies with flapping dual wings
     */
    createButterflies(count) {
        for (let i = 0; i < count; i++) {
            const butterflyGroup = new THREE.Group();

            // Wing shape geometry
            const wingShape = new THREE.Shape();
            wingShape.moveTo(0, 0);
            wingShape.bezierCurveTo(1.5, 2.5, 3.5, 3.5, 4.0, 1.8);
            wingShape.bezierCurveTo(4.5, 0.5, 3.5, -1.0, 2.0, -1.8);
            wingShape.bezierCurveTo(1.0, -2.5, 0.2, -1.5, 0, 0);

            const wingGeom = new THREE.ShapeGeometry(wingShape);

            // Shimmering butterfly wing material
            const wingMat = new THREE.MeshStandardMaterial({
                color: i % 2 === 0 ? 0xff6b9d : 0xff9ec7,
                emissive: 0xff3377,
                emissiveIntensity: 0.25,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9,
                roughness: 0.3,
                metalness: 0.1
            });

            // Right Wing
            const rightWing = new THREE.Mesh(wingGeom, wingMat);
            rightWing.scale.set(0.7, 0.7, 0.7);

            // Left Wing (Mirrored)
            const leftWing = new THREE.Mesh(wingGeom, wingMat);
            leftWing.scale.set(-0.7, 0.7, 0.7);

            // Wing pivot containers
            const rightPivot = new THREE.Group();
            rightPivot.add(rightWing);

            const leftPivot = new THREE.Group();
            leftPivot.add(leftWing);

            // Body
            const bodyGeom = new THREE.CylinderGeometry(0.12, 0.08, 2.2, 8);
            const bodyMat = new THREE.MeshBasicMaterial({ color: 0x5a1832 });
            const body = new THREE.Mesh(bodyGeom, bodyMat);
            body.rotation.x = Math.PI / 2;

            butterflyGroup.add(rightPivot);
            butterflyGroup.add(leftPivot);
            butterflyGroup.add(body);

            // Initial flight attributes
            const angle = (i / count) * Math.PI * 2;
            const radius = 25 + Math.random() * 20;

            butterflyGroup.position.set(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 35,
                (Math.random() - 0.5) * 25
            );

            const scale = 0.65 + Math.random() * 0.45;
            butterflyGroup.scale.set(scale, scale, scale);

            this.scene.add(butterflyGroup);

            this.butterflies.push({
                group: butterflyGroup,
                leftPivot: leftPivot,
                rightPivot: rightPivot,
                speed: 1.2 + Math.random() * 0.8,
                flapSpeed: 16 + Math.random() * 8,
                phase: Math.random() * Math.PI * 2,
                orbitRadius: radius,
                orbitSpeed: 0.25 + Math.random() * 0.3,
                yAmplitude: 8 + Math.random() * 10,
                yOffset: butterflyGroup.position.y,
                baseScale: scale
            });
        }
    }

    /**
     * Creates soft glowing floating dust & tiny floating hearts
     */
    createFloatingDust(count) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const speeds = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 110;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
            speeds[i] = 0.08 + Math.random() * 0.15;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            size: 2.2,
            map: this.createGlowingPointTexture(),
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            color: 0xffd6e0
        });

        this.floatingDust = new THREE.Points(geometry, material);
        this.dustSpeeds = speeds;
        this.scene.add(this.floatingDust);
    }

    onMouseMove(e) {
        this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    onTouchMove(e) {
        if (e.touches.length > 0) {
            this.targetMouseX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
            this.targetMouseY = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
        }
    }

    onResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        if (!this.isVisible) return;

        const time = this.clock.getElapsedTime();

        // Smooth mouse damping
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        // Subtle camera parallax
        this.camera.position.x = this.mouseX * 6;
        this.camera.position.y = -this.mouseY * 4;
        this.camera.lookAt(0, 0, 0);

        // 1. Beating Heart animation (Double-pulse systole/diastole heartbeat)
        if (this.heartParticles) {
            const beatCycle = time * 3.2; // Heartbeat tempo
            const p1 = Math.pow(Math.sin(beatCycle), 12);
            const p2 = 0.5 * Math.pow(Math.sin(beatCycle - 0.4), 16);
            const pulse = (p1 + p2) * 0.16;

            const scale = 1.0 + pulse;
            this.heartParticles.scale.set(scale, scale, scale);

            // Gentle sway rotation
            this.heartParticles.rotation.y = Math.sin(time * 0.4) * 0.18 + this.mouseX * 0.2;
            this.heartParticles.rotation.x = Math.cos(time * 0.3) * 0.08 - this.mouseY * 0.1;
        }

        // 2. Butterfly flight paths & wing flapping
        this.butterflies.forEach((b) => {
            // Wing flapping
            const flap = Math.sin(time * b.flapSpeed + b.phase) * 0.75;
            b.rightPivot.rotation.y = flap;
            b.leftPivot.rotation.y = -flap;

            // Flight trajectory: 3D Lissajous / spiral orbit
            const angle = time * b.orbitSpeed + b.phase;
            const x = Math.sin(angle) * b.orbitRadius + Math.cos(angle * 2) * 6;
            const z = Math.cos(angle) * (b.orbitRadius * 0.7) + Math.sin(time * 0.8) * 8;
            const y = b.yOffset + Math.sin(time * b.speed + b.phase) * b.yAmplitude;

            // Update position
            const prevPos = b.group.position.clone();
            b.group.position.set(x, y, z);

            // Look along flight direction
            const dir = b.group.position.clone().sub(prevPos).normalize();
            if (dir.lengthSq() > 0.001) {
                b.group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
                // Banking roll
                b.group.rotateZ(Math.sin(time * 4 + b.phase) * 0.3);
            }
        });

        // 3. Floating Dust & Sparkles drifting gently upwards
        if (this.floatingDust) {
            const posAttr = this.floatingDust.geometry.attributes.position;
            const count = posAttr.count;

            for (let i = 0; i < count; i++) {
                let y = posAttr.getY(i) + this.dustSpeeds[i];
                if (y > 45) y = -45;
                posAttr.setY(i, y);

                // Slight drift
                let x = posAttr.getX(i) + Math.sin(time * 0.6 + i) * 0.03;
                posAttr.setX(i, x);
            }
            posAttr.needsUpdate = true;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.romanticScene = new RomanticThreeScene('three-canvas');
});
