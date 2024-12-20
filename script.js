import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';



document.addEventListener('DOMContentLoaded', function() {
    // Tạo overlay welcome screen
    const welcomeOverlay = document.createElement('div');
    welcomeOverlay.className = 'welcome-overlay';
    welcomeOverlay.innerHTML = `
        <div class="welcome-content">
            <h1 class="agbalumo-regular">Chào mừng bạn đến với giáng sinh 2024 🎄</h1>
            <p class="agbalumo-regular">Bấm vào bất kỳ đâu để tiếp tục</p>
        </div>
    `;
    document.body.appendChild(welcomeOverlay);

    // Xử lý sự kiện click
    welcomeOverlay.addEventListener('click', function() {
        document.getElementById('background-music').play();
        welcomeOverlay.style.opacity = '0';
        setTimeout(() => {
            welcomeOverlay.remove();
        }, 1000);
    });
});

document.querySelector('.house').addEventListener('mouseenter', function() {
    // Tạo container cho nhân vật và bong bóng chat nếu chưa tồn tại
    if (!document.getElementById('character-container')) {
        const container = document.createElement('div');
        container.id = 'character-container';

        // Tạo phần tử cho nhân vật
        const character = document.createElement('img');
        character.id = 'anime-character';
        character.src = '/public/anime_character.png';

        // Tạo bong bóng chat
        const chatBubble = document.createElement('div');
        chatBubble.id = 'chat-bubble';
        chatBubble.textContent = 'Bấm vào ngôi nhà lẹ 😤😤';

        container.appendChild(chatBubble);
        container.appendChild(character);
        document.body.appendChild(container);
    }

    const container = document.getElementById('character-container');
    container.className = 'show';
});

// Thêm event listener cho mouseleave
document.querySelector('.house').addEventListener('mouseleave', function() {
    const container = document.getElementById('character-container');
    if (container) {
        container.className = container.className.replace('show', '');
    }
});

document.querySelector('.house').addEventListener('click', function() {
    // Tạo overlay trắng nếu chưa tồn tại
    if (!document.getElementById('transition-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'transition-overlay';
        document.body.appendChild(overlay);
    }

    // Tạo container cho ảnh trong nhà nếu chưa tồn tại
    if (!document.getElementById('interior-container')) {
        const interiorContainer = document.createElement('div');
        interiorContainer.id = 'interior-container';

        // Thêm ảnh trong nhà
        const interiorImage = document.createElement('img');
        interiorImage.src = '/public/in-house.jpg';
        interiorImage.alt = 'House Interior';

        const inHouseContainer3D = document.createElement('div');
        inHouseContainer3D.id = 'inHouseContainer3D';

        // Thêm container chứa quà
        const giftsContainer = document.createElement('div');
        giftsContainer.className = 'gifts-container';

        interiorContainer.appendChild(interiorImage);
        interiorContainer.appendChild(inHouseContainer3D);
        interiorContainer.appendChild(giftsContainer);
        document.body.appendChild(interiorContainer);

        // Mảng chứa các phần quà có thể nhận được
        const gifts = [{
                title: "Món quà đặc biệt",
                description: "Một bữa ăn ở bất kỳ 🍽",
                image: "/public/food.png"
            },
            {
                title: "Món quà may mắn",
                description: "Một cây son bất kỳ 💄",
                image: "/public/son.png"
            },
            {
                title: "Món quà bí ẩn",
                description: "Một blind box 🎁",
                image: "/public/bb3.png"
            },
            // Thêm các phần quà khác...
        ];

        let receivedGifts = [];



        // Hàm tạo một gift 3D
        function createGift3D(position, index) {
            const giftContainer = document.createElement('div');
            giftContainer.id = `gift3d-container-${index + 1}`;
            giftContainer.className = 'gift3d-container';

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 20;

            const renderer = new THREE.WebGLRenderer({ alpha: true });
            renderer.setSize(250, 250); // Kích thước của mỗi gift
            giftContainer.appendChild(renderer.domElement);

            // Ánh sáng
            const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(5, 5, 5);
            scene.add(directionalLight);

            // Load model
            const loader = new GLTFLoader();
            let gift;
            let mixer;

            loader.load('/public/gift.glb',
                function(gltf) {
                    gift = gltf.scene;
                    gift.scale.set(1, 0.5, 0.5);
                    gift.position.set(position.x, position.y, 0); // Đặt vị trí
                    scene.add(gift);

                    giftContainer.addEventListener('click', function() {
                        if (gltf.animations.length > 0) {
                            mixer = new THREE.AnimationMixer(gift);
                            const action = mixer.clipAction(gltf.animations[0]);
                            action.setLoop(THREE.LoopOnce); // Chỉ chạy một lần
                            action.clampWhenFinished = true;
                            action.play();
                            setTimeout(() => {
                                showGiftCard(index);
                            }, 500); // Điều chỉnh thời gian delay tùy animation
                        }
                    });
                },
                undefined,
                function(error) {
                    console.error('Lỗi khi tải model:', error);
                }
            );

            // Animation
            function animate() {
                requestAnimationFrame(animate);
                if (mixer) mixer.update(0.008);
                renderer.render(scene, camera);
            }

            animate();
            return giftContainer;
        }

        function showGiftCard(giftIndex) {
            // Chọn ngẫu nhiên một món quà chưa được nhận
            let availableGifts = gifts.filter(gift => !receivedGifts.includes(gift));
            if (availableGifts.length === 0) {
                availableGifts = gifts;
                receivedGifts = [];
            }
            const randomGift = availableGifts[Math.floor(Math.random() * availableGifts.length)];
            receivedGifts.push(randomGift);

            // Tạo card overlay
            const cardOverlay = document.createElement('div');
            cardOverlay.className = 'gift-card-overlay';
            cardOverlay.innerHTML = `
                <div class="card-container">
                    <div class="left-section">
                        <h1 class="agbalumo-regular">Chúc mừng bạn đã trúng thưởng</h1>
                        <p class="agbalumo-regular">Món quà của bạn là: ${randomGift.description}</p>
                        <p class="agbalumo-regular">Made with ❤️ by Nhật Hùng</p>
                    </div>
                    <div class="right-section">
                        <div class="cake-card">
                            <img src="${randomGift.image}">
                            <div class="balloons">
                                ⭐⭐⭐⭐⭐
                            </div>
                            <h2 class="agbalumo-regular">Chúc mừng bạn đã trúng thưởng</h2>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(cardOverlay);

            // Animation hiển thị card
            setTimeout(() => {
                cardOverlay.style.opacity = '1';
                cardOverlay.querySelector('.card-container').style.transform = 'scale(1)';
            }, 10);

            // Xử lý đóng card khi click ra ngoài
            cardOverlay.addEventListener('click', (e) => {
                if (e.target === cardOverlay) {
                    cardOverlay.style.opacity = '0';
                    cardOverlay.querySelector('.card-container').style.transform = 'scale(0.7)';
                    setTimeout(() => {
                        cardOverlay.remove();
                    }, 300);
                }
            });
        }

        // Tạo nhiều gift với các vị trí khác nhau
        const giftPositions = [

            { x: -1, y: 0 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },

        ];

        giftPositions.forEach((position, index) => {
            giftsContainer.appendChild(createGift3D(position, index));
        });


        const camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 200;

        const scene = new THREE.Scene();
        let tree;
        let mixer;
        const loader = new GLTFLoader();
        loader.load('/public/christmas_tree.glb',
            function(gltf) {
                tree = gltf.scene;

                tree.scale.set(0.5, 0.5, 0.5);
                scene.add(tree);
                mixer = new THREE.AnimationMixer(tree);
                mixer.clipAction(gltf.animations[0]).play();
            },
            function(xhr) {},
            function(error) {}
        );
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        inHouseContainer3D.appendChild(renderer.domElement);

        // light
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
        scene.add(ambientLight);

        const topLight = new THREE.DirectionalLight(0xffffff, 1);
        topLight.position.set(500, 500, 500);
        scene.add(topLight);

        const reRender3D = () => {
            requestAnimationFrame(reRender3D);
            renderer.render(scene, camera);
            if (mixer) mixer.update(0.008);
        };

        reRender3D();

        // Xử lý resize
        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        });
    }

    // Thêm class để bắt đầu animation
    document.querySelector('.house').classList.add('zoom-in');


    // Sau khi zoom xong, hiện overlay trắng
    setTimeout(() => {
        document.getElementById('transition-overlay').classList.add('show');
        setTimeout(() => {
            document.querySelector('.house').classList.add('zoom-out');
        }, 1000);
    }, 1000);

    // Sau khi overlay trắng hiện hoàn toàn, hiển thị ảnh trong nhà
    setTimeout(() => {
        document.getElementById('interior-container').classList.add('show');
    }, 2000);
});


// 3D model
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 10;

const scene = new THREE.Scene();
let santa;
let mixer;
const loader = new GLTFLoader();
loader.load('/public/santa.glb',
    function(gltf) {
        santa = gltf.scene;
        scene.add(santa);

        mixer = new THREE.AnimationMixer(santa);
        mixer.clipAction(gltf.animations[0]).play();
    },
    function(xhr) {},
    function(error) {}
);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

// light
const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
scene.add(ambientLight);

const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
scene.add(topLight);


const reRender3D = () => {
    requestAnimationFrame(reRender3D);
    renderer.render(scene, camera);
    if (mixer) mixer.update(0.008);
};

reRender3D();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
})