document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const authModal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeModal = document.getElementById('closeModal');
    const counter = document.getElementById('counter');
    const clickBtn = document.getElementById('clickBtn');
    const cpsDisplay = document.getElementById('cps');
    const totalDisplay = document.getElementById('total');
    const clickSound = document.getElementById('clickSound');
    let planeMaterial;

    // Game Variables
    let count = 0;
    let clicks = [];
    let totalClicks = 0;
    let clickPower = 0;

    // Three.js Variables
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    let particleSystem;
    let loadingParticles;

    // Initialize the app
    initThreeJS();
    initModal();
    initLoader();
    initGame();

    function initThreeJS() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.getElementById('webgl-container').appendChild(renderer.domElement);
        camera.position.z = 5;
        createGalaxyParticles();
    }

    function initModal() {
        if (loginBtn && authModal && closeModal) {
            loginBtn.addEventListener('click', () => {
                authModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });

            closeModal.addEventListener('click', () => {
                authModal.classList.remove('active');
                document.body.style.overflow = '';
            });

            authModal.addEventListener('click', (e) => {
                if (e.target === authModal) {
                    authModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
    }

    function initLoader() {
        const loaderContainer = document.createElement('div');
        loaderContainer.id = 'loader-container';
        loaderContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
            z-index: 1000;
            color: white;
            font-family: 'Arial', sans-serif;
        `;

        const loader = document.createElement('div');
        loader.className = 'loader';
        loader.style.cssText = `
            width: 80px;
            height: 80px;
            border: 8px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            border-top: 8px solid #4b6cb7;
            animation: spin 1.5s linear infinite;
            margin-bottom: 20px;
        `;

        const loaderText = document.createElement('div');
        loaderText.className = 'loader-text';
        loaderText.textContent = 'Загрузка галактики...';
        loaderText.style.cssText = `
            font-size: 18px;
            margin-top: 20px;
            opacity: 0;
        `;

        loaderContainer.appendChild(loader);
        loaderContainer.appendChild(loaderText);
        document.body.appendChild(loaderContainer);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes pulse {
                0% { opacity: 0.5; }
                50% { opacity: 1; }
                100% { opacity: 0.5; }
            }
            .loading-dots::after {
                content: '.';
                animation: dots 1.5s steps(5, end) infinite;
            }
            @keyframes dots {
                0%, 20% { content: '.'; }
                40% { content: '..'; }
                60% { content: '...'; }
                80%, 100% { content: ''; }
            }
        `;
        document.head.appendChild(style);

        gsap.to(loaderText, {
            opacity: 1,
            duration: 1,
            delay: 0.5,
            onComplete: () => {
                loaderText.innerHTML = 'Загрузка галактики<span class="loading-dots"></span>';
            }
        });

        loadingParticles = createLoadingParticles();
        scene.add(loadingParticles);
        loadingAnimation();
    }

    function initGame() {
        if (clickSound) {
            clickSound.volume = 0.3;
            clickSound.load();
        }

        gsap.from(".cosmic-header", {
            y: -100,
            opacity: 0,
            duration: 1.5,
            delay: 0.5,
            ease: "power3.out"
        });

        gsap.set(["h1", ".counter", ".click-btn", ".stats"], {
            opacity: 0,
            y: 20
        });

        loadInitialCount();
        loadInitialTotal();

        if (clickBtn) {
            clickBtn.addEventListener('click', handleClick);
        }

        // Start animation loop
        animate();
    }

    function createLoadingParticles() {
        const particles = new THREE.BufferGeometry();
        const count = 1000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

            colors[i * 3] = 0.2 + Math.random() * 0.3;
            colors[i * 3 + 1] = 0.1 + Math.random() * 0.2;
            colors[i * 3 + 2] = 0.5 + Math.random() * 0.5;

            sizes[i] = Math.random() * 2 + 1;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        return new THREE.Points(particles, material);
    }

    function createGalaxyParticles() {
        const particleCount = 5000;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const radius = Math.random() * 5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 2;

            positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
            positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
            positions[i * 3 + 2] = radius * Math.cos(theta);

            colors[i * 3] = Math.random() * 0.5 + 0.5;
            colors[i * 3 + 1] = Math.random() * 0.3;
            colors[i * 3 + 2] = Math.random() * 0.5 + 0.5;

            sizes[i] = Math.random() * 2 + 1;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        particleSystem = new THREE.Points(particles, particleMaterial);
        scene.add(particleSystem);

        // Create shader plane
        const planeGeometry = new THREE.PlaneGeometry(10, 10);
         planeMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                mouse: { value: new THREE.Vector2(0, 0) },
                clickPower: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec2 resolution;
                uniform vec2 mouse;
                uniform float clickPower;
                varying vec2 vUv;

                float noise(vec3 p) {
                    vec3 i = floor(p);
                    vec4 a = dot(i, vec3(1., 57., 21.)) + vec4(0., 57., 21., 78.);
                    vec3 f = cos((p-i)*acos(-1.))*(-.5)+.5;
                    a = mix(sin(cos(a)*a),sin(cos(1.+a)*(1.+a)), f.x);
                    a.xy = mix(a.xz, a.yw, f.y);
                    return mix(a.x, a.y, f.z);
                }

                float fbm(vec3 p) {
                    float f = 0.0;
                    f += 0.5000*noise(p); p *= 2.01;
                    f += 0.2500*noise(p); p *= 2.02;
                    f += 0.1250*noise(p); p *= 2.03;
                    f += 0.0625*noise(p);
                    return f/0.9375;
                }

                void main() {
                    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
                    float dist = length(uv);
                    float hole = smoothstep(0.3, 0.0, dist);
                    vec3 p = vec3(uv*3.0, time*0.1);
                    float f = fbm(p);
                    float clickEffect = smoothstep(0.1, 0.0, length(uv - mouse*0.5)) * clickPower;
                    vec3 color = mix(
                        vec3(0.1, 0.3, 0.5),
                        vec3(0.9, 0.2, 0.7),
                        f
                    );
                    color += clickEffect * vec3(1.0, 0.5, 0.2);
                    color = mix(color, vec3(0.0), hole);
                    gl_FragColor = vec4(color, 0.1);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.z = -2;
        scene.add(plane);
    }

    function animateLoadingParticles() {
        if (!loadingParticles) return;

        loadingParticles.rotation.x += 0.001;
        loadingParticles.rotation.y += 0.002;

        const positions = loadingParticles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] *= 1.001;
            positions[i + 1] *= 1.001;
            positions[i + 2] *= 1.001;

            if (Math.abs(positions[i]) > 5 || Math.abs(positions[i + 1]) > 5 || Math.abs(positions[i + 2]) > 5) {
                positions[i] = (Math.random() - 0.5) * 0.1;
                positions[i + 1] = (Math.random() - 0.5) * 0.1;
                positions[i + 2] = (Math.random() - 0.5) * 0.1;
            }
        }

        loadingParticles.geometry.attributes.position.needsUpdate = true;
    }

    function loadingAnimation() {
        if (document.getElementById('loader-container')) {
            animateLoadingParticles();
            renderer.render(scene, camera);
            requestAnimationFrame(loadingAnimation);
        }
    }

    function hideLoader() {
        gsap.to("#loader-container", {
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            onComplete: () => {
                document.getElementById('loader-container')?.remove();

                gsap.to("h1", {
                    y: 0,
                    opacity: 1,
                    duration: 1.5,
                    ease: "elastic.out(1, 0.5)"
                });

                gsap.to(".counter", {
                    scale: 1,
                    opacity: 1,
                    duration: 1,
                    ease: "back.out(2)"
                });

                gsap.to(".click-btn", {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    delay: 0.5,
                    ease: "power3.out"
                });

                gsap.to(".stats", {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    delay: 0.8,
                    ease: "power2.out"
                });
            }
        });
    }

    async function loadInitialCount() {
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const response = await fetch('/api/v2/find', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.value !== undefined) {
                    count = data.value;
                    counter.textContent = '0';
                    counter.style.opacity = '1';

                    gsap.to(counter, {
                        innerText: count,
                        duration: 2,
                        snap: { innerText: 1 },
                        ease: "power2.out",
                        onUpdate: function() {
                            counter.textContent = Math.floor(this.targets()[0].innerText);
                        },
                        onComplete: hideLoader
                    });
                } else {
                    hideLoader();
                }
            } else {
                hideLoader();
            }
        } catch (error) {
            console.error('Ошибка при загрузке счетчика:', error);
            hideLoader();
        }
    }

    async function loadInitialTotal() {
        try {
            const response = await fetch('/api/v3/total', {
                credentials: 'include'
            });

            if (response.ok) {
                const total = await response.json();
                if (total !== undefined) {
                    totalClicks = total;
                    totalDisplay.textContent = totalClicks;
                }
            }
        } catch (error) {
            console.error('Ошибка при загрузке начального значения:', error);
        }
    }

    async function handleClick(e) {
        try {
            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
            }

            const response = await fetch('/api/v2/click', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.ok) {
                count++;
                totalClicks++;

                counter.textContent = count;
                totalDisplay.textContent = totalClicks;

                clicks.push(Date.now());
                clicks = clicks.filter(time => time > Date.now() - 1000);
                cpsDisplay.textContent = clicks.length;

                clickPower = 1.0;
                gsap.to(counter, {
                    scale: 1.5,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1
                });
                createParticleExplosion(e.clientX, e.clientY);

                gsap.to(particleSystem.rotation, {
                    x: particleSystem.rotation.x + (Math.random() - 0.5) * 0.2,
                    y: particleSystem.rotation.y + (Math.random() - 0.5) * 0.2,
                    duration: 1,
                    ease: "elastic.out(1, 0.3)"
                });
            } else {
                console.error('Ошибка при сохранении клика:', response.status);
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
        }
    }

    function createParticleExplosion(x, y) {
        const explosionParticles = new THREE.BufferGeometry();
        const expPositions = new Float32Array(100 * 3);
        const expColors = new Float32Array(100 * 3);
        const expSizes = new Float32Array(100);

        for (let i = 0; i < 100; i++) {
            expPositions[i * 3] = (x / window.innerWidth) * 2 - 1;
            expPositions[i * 3 + 1] = -(y / window.innerHeight) * 2 + 1;
                        expColors[i * 3] = Math.random() * 0.5 + 0.5;
                        expColors[i * 3 + 1] = Math.random() * 0.5;
                        expColors[i * 3 + 2] = Math.random() * 0.5 + 0.5;

                        expSizes[i] = Math.random() * 5 + 2;
                    }

                    explosionParticles.setAttribute('position', new THREE.BufferAttribute(expPositions, 3));
                    explosionParticles.setAttribute('color', new THREE.BufferAttribute(expColors, 3));
                    explosionParticles.setAttribute('size', new THREE.BufferAttribute(expSizes, 1));

                    const expMaterial = new THREE.PointsMaterial({
                        size: 0.1,
                        vertexColors: true,
                        transparent: true,
                        opacity: 1,
                        blending: THREE.AdditiveBlending,
                        sizeAttenuation: true
                    });

                    const expSystem = new THREE.Points(explosionParticles, expMaterial);
                    scene.add(expSystem);

                    const positions = explosionParticles.attributes.position.array;
                    const startTime = Date.now();

                    function animateExplosion() {
                        const time = (Date.now() - startTime) / 1000;
                        if (time > 2) {
                            scene.remove(expSystem);
                            return;
                        }

                        for (let i = 0; i < 100; i++) {
                            const speed = 2 + Math.random() * 3;
                            const angle = Math.random() * Math.PI * 2;
                            const angle2 = Math.random() * Math.PI * 2;

                            positions[i * 3] += Math.sin(angle) * Math.cos(angle2) * speed * time * 0.01;
                            positions[i * 3 + 1] += Math.cos(angle) * Math.sin(angle2) * speed * time * 0.01;
                            positions[i * 3 + 2] += (Math.random() - 0.5) * speed * time * 0.01;
                            expMaterial.opacity = 1 - time / 2;
                        }

                        explosionParticles.attributes.position.needsUpdate = true;
                        requestAnimationFrame(animateExplosion);
                    }

                    animateExplosion();
                }

                function animate() {
                    requestAnimationFrame(animate);

                    if (particleSystem) {
                        particleSystem.rotation.x += 0.0005;
                        particleSystem.rotation.y += 0.0007;
                    }

                    if (planeMaterial) {
                        planeMaterial.uniforms.time.value += 0.01;

                        if (clickPower > 0) {
                            clickPower -= 0.02;
                            if (clickPower < 0) clickPower = 0;
                            planeMaterial.uniforms.clickPower.value = clickPower;
                        }
                    }

                    renderer.render(scene, camera);
                }

                // Mouse movement handler
                document.addEventListener('mousemove', (e) => {
                    if (planeMaterial) {
                        planeMaterial.uniforms.mouse.value.x = (e.clientX / window.innerWidth) * 2 - 1;
                        planeMaterial.uniforms.mouse.value.y = -(e.clientY / window.innerHeight) * 2 + 1;
                    }
                });

                // Window resize handler
                window.addEventListener('resize', () => {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);

                    if (planeMaterial) {
                        planeMaterial.uniforms.resolution.value.set(
                            window.innerWidth,
                            window.innerHeight
                        );
                    }
                });

                // OAuth functions
                function authWith(provider) {
                    let authUrl;

                    switch(provider) {
                        case 'github':
                            authUrl = '/oauth2/authorization/github';
                            break;
                        case 'discord':
                            authUrl = '/oauth2/authorization/discord';
                            break;
                        case 'google':
                            authUrl = '/oauth2/authorization/google';
                            break;
                        default:
                            return;
                    }

                    window.location.href = authUrl;

                    const btn = document.querySelector(`.btn-${provider}`);
                    if (btn) {
                        gsap.to(btn, {
                            scale: 0.95,
                            repeat: 1,
                            yoyo: true,
                            duration: 0.3
                        });
                    }
                }

                async function checkAuth() {
                    try {
                        const response = await fetch('/api/user', {
                            credentials: 'include'
                        });

                        if (response.ok) {
                            const user = await response.json();
                            updateHeader(user);
                        }
                    } catch (error) {
                        console.error('Auth check error:', error);
                    }
                }

                function updateHeader(user) {
                    const header = document.querySelector('.cosmic-header');
                    if (header) {
                        header.innerHTML = `
                            <div class="logo">COSMIC HYPER CLICKER</div>
                            <div class="header-user">
                                <img src="${user.avatarUrl || 'https://randomuser.me/api/portraits/lego/1.jpg'}"
                                     alt="User Avatar" class="user-avatar">
                                <span class="username">${user.username || 'CosmicTraveler'}</span>
                            </div>
                        `;

                        gsap.from(".header-user", {
                            x: 50,
                            opacity: 0,
                            duration: 1,
                            ease: "back.out(1.5)"
                        });
                    }
                }

                // CPS calculation
                setInterval(() => {
                    if (clicks.length > 0 && Date.now() - clicks[clicks.length - 1] > 1000) {
                        clicks = clicks.filter(time => time > Date.now() - 1000);
                        if (cpsDisplay) {
                            cpsDisplay.textContent = clicks.length;
                        }
                    }
                }, 300);
            });
