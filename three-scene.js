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
     * Creates procedural decorative texture for butterfly wings
     */
    createButterflyWingTexture(baseColorHex, edgeColorHex) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Radiant wing gradient
        const grad = ctx.createRadialGradient(20, 120, 5, 128, 128, 140);
        grad.addColorStop(0, '#fff5f8');
        grad.addColorStop(0.35, baseColorHex);
        grad.addColorStop(0.75, edgeColorHex);
        grad.addColorStop(1, '#880e4f');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);

        // Delicate organic wing veins (gân cánh bướm)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Vein 1: Forewing crest
        ctx.moveTo(20, 128);
        ctx.bezierCurveTo(90, 80, 170, 50, 235, 45);
        // Vein 2: Forewing mid
        ctx.moveTo(20, 128);
        ctx.bezierCurveTo(100, 115, 180, 105, 245, 110);
        // Vein 3: Hindwing upper
        ctx.moveTo(20, 128);
        ctx.bezierCurveTo(105, 145, 180, 160, 240, 175);
        // Vein 4: Hindwing lower
        ctx.moveTo(20, 128);
        ctx.bezierCurveTo(90, 175, 160, 210, 220, 230);
        ctx.stroke();

        // Pearl dust dots along outer wing margin
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        for (let i = 0; i < 9; i++) {
            const py = 35 + i * 22;
            const px = 225 + Math.sin(i * 0.8) * 12;
            ctx.beginPath();
            ctx.arc(px, py, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        return texture;
    }

    /**
     * Create 3D Butterflies with authentic rounded 2-lobe wings and cute body
     */
    createButterflies(count) {
        // Butterfly Wing Shape (Classic Forewing + Hindwing 2-lobe silhouette)
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);

        // 1. Forewing (Cánh trước to, cong tròn bồng bềnh vươn cao)
        wingShape.bezierCurveTo(0.6, 1.5, 2.0, 3.4, 3.6, 3.4);
        wingShape.bezierCurveTo(4.4, 3.4, 4.8, 2.3, 4.2, 1.2);
        wingShape.bezierCurveTo(3.7, 0.5, 2.8, 0.2, 1.8, 0.1);

        // 2. Hindwing (Cánh sau tròn bầu bĩnh ôm sát)
        wingShape.bezierCurveTo(2.7, -0.3, 3.2, -1.6, 2.2, -2.3);
        wingShape.bezierCurveTo(1.3, -2.6, 0.5, -1.9, 0.2, -0.7);
        wingShape.bezierCurveTo(0.1, -0.3, 0.05, -0.1, 0, 0);

        const wingGeom = new THREE.ShapeGeometry(wingShape, 16);

        // Map UV coordinates smoothly across the shape
        const pos = wingGeom.attributes.position;
        const uvs = new Float32Array(pos.count * 2);
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            // Normalize UV coordinates [0, 1]
            uvs[i * 2] = (x + 0.5) / 5.2;
            uvs[i * 2 + 1] = (y + 2.8) / 6.4;
        }
        wingGeom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

        for (let i = 0; i < count; i++) {
            const butterflyGroup = new THREE.Group();

            const isPink = i % 2 === 0;
            const wingTex = this.createButterflyWingTexture(
                isPink ? '#ff85b3' : '#ffadc7',
                isPink ? '#ff2a85' : '#e91e63'
            );

            // Translucent glowing butterfly wing material
            const wingMat = new THREE.MeshStandardMaterial({
                map: wingTex,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.94,
                roughness: 0.2,
                metalness: 0.1,
                emissive: new THREE.Color(isPink ? 0xff4081 : 0xff69b4),
                emissiveIntensity: 0.35,
                depthWrite: false
            });

            // Right Wing
            const rightWing = new THREE.Mesh(wingGeom, wingMat);
            rightWing.scale.set(0.85, 0.85, 0.85);

            // Left Wing (Mirrored)
            const leftWing = new THREE.Mesh(wingGeom, wingMat);
            leftWing.scale.set(-0.85, 0.85, 0.85);

            // Wing pivot containers (pivot precisely along body axis)
            const rightPivot = new THREE.Group();
            rightPivot.position.set(0.15, 0, 0);
            rightPivot.add(rightWing);

            const leftPivot = new THREE.Group();
            leftPivot.position.set(-0.15, 0, 0);
            leftPivot.add(leftWing);

            butterflyGroup.add(rightPivot);
            butterflyGroup.add(leftPivot);

            // Cute, short body (Thorax + Abdomen - NOT long dragonfly stick!)
            const bodyMat = new THREE.MeshStandardMaterial({
                color: 0x4a0e2e,
                roughness: 0.5,
                metalness: 0.1
            });

            // Thorax (Thân ngực tròn)
            const thoraxGeom = new THREE.SphereGeometry(0.22, 12, 12);
            thoraxGeom.scale(0.8, 1.4, 0.8);
            const thorax = new THREE.Mesh(thoraxGeom, bodyMat);
            thorax.position.set(0, 0.2, 0);
            butterflyGroup.add(thorax);

            // Abdomen (Bụng bầu dục nhỏ xinh)
            const abdomenGeom = new THREE.SphereGeometry(0.18, 12, 12);
            abdomenGeom.scale(0.75, 1.8, 0.75);
            const abdomen = new THREE.Mesh(abdomenGeom, bodyMat);
            abdomen.position.set(0, -0.45, 0);
            butterflyGroup.add(abdomen);

            // Head (Đầu tròn nhỏ)
            const headGeom = new THREE.SphereGeometry(0.15, 10, 10);
            const head = new THREE.Mesh(headGeom, bodyMat);
            head.position.set(0, 0.52, 0.05);
            butterflyGroup.add(head);

            // Two cute curved antennae (Râu bướm cong duyên dáng)
            const antennaMat = new THREE.MeshBasicMaterial({ color: 0x2d081b });
            const antennaCurve1 = new THREE.CubicBezierCurve3(
                new THREE.Vector3(0.05, 0.6, 0.05),
                new THREE.Vector3(0.2, 0.9, 0.1),
                new THREE.Vector3(0.35, 1.1, 0.1),
                new THREE.Vector3(0.45, 1.15, 0.15)
            );
            const antennaGeom1 = new THREE.TubeGeometry(antennaCurve1, 8, 0.02, 6, false);
            butterflyGroup.add(new THREE.Mesh(antennaGeom1, antennaMat));

            const antennaCurve2 = new THREE.CubicBezierCurve3(
                new THREE.Vector3(-0.05, 0.6, 0.05),
                new THREE.Vector3(-0.2, 0.9, 0.1),
                new THREE.Vector3(-0.35, 1.1, 0.1),
                new THREE.Vector3(-0.45, 1.15, 0.15)
            );
            const antennaGeom2 = new THREE.TubeGeometry(antennaCurve2, 8, 0.02, 6, false);
            butterflyGroup.add(new THREE.Mesh(antennaGeom2, antennaMat));

            // Initial flight attributes
            const angle = (i / count) * Math.PI * 2;
            const radius = 22 + Math.random() * 22;

            butterflyGroup.position.set(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 35,
                (Math.random() - 0.5) * 25
            );

            const scale = 0.85 + Math.random() * 0.45;
            butterflyGroup.scale.set(scale, scale, scale);

            this.scene.add(butterflyGroup);

            this.butterflies.push({
                group: butterflyGroup,
                leftPivot: leftPivot,
                rightPivot: rightPivot,
                speed: 0.35 + Math.random() * 0.25,      // Slow, peaceful wave
                flapSpeed: 4.2 + Math.random() * 1.6,    // Gentle, graceful butterfly flap
                phase: Math.random() * Math.PI * 2,
                orbitRadius: radius,
                orbitSpeed: 0.06 + Math.random() * 0.04, // Dreamy, slow orbit around heart
                yAmplitude: 3.5 + Math.random() * 3.5,   // Soft vertical range
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
            // Gentle, elegant butterfly wing flap (soft flutter)
            const flap = Math.sin(time * b.flapSpeed + b.phase) * 0.65;
            b.rightPivot.rotation.y = flap;
            b.leftPivot.rotation.y = -flap;

            // Flight trajectory: 3D Lissajous orbit with gentle, silky-smooth drift
            const angle = time * b.orbitSpeed + b.phase;
            const x = Math.sin(angle) * b.orbitRadius + Math.cos(angle * 2) * 4;
            const z = Math.cos(angle) * (b.orbitRadius * 0.75) + Math.sin(time * 0.3) * 5;
            const flapBob = Math.sin(time * b.flapSpeed + b.phase) * 0.18; // Soft natural lift
            const y = b.yOffset + Math.sin(time * b.speed + b.phase) * b.yAmplitude + flapBob;

            // Update position
            const prevPos = b.group.position.clone();
            b.group.position.set(x, y, z);

            // Smooth orientation with slerp (prevents abrupt jerky turns)
            const dir = b.group.position.clone().sub(prevPos).normalize();
            if (dir.lengthSq() > 0.0001) {
                const targetQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
                b.group.quaternion.slerp(targetQuat, 0.08); // Silky smooth interpolation
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
