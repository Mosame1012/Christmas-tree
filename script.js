// 全局变量和配置
let christmasTree;
let animationPaused = false;
let rotationSpeed = 1;
let particleDensity = 2;
let stars = [];
let starsEnabled = true;
let decorationsConfig = null; // 装饰配置



// 粒子类
class Particle {
    constructor(x, y, z, size, color, type) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.size = size;
        this.color = color;
        this.type = type;
        this.element = this.createElement();
        this.originalPosition = { x, y, z };
        this.animationOffset = Math.random() * Math.PI * 2;
        this.rotation = this.calculateRotation();
    }

    calculateRotation() {
        // 计算粒子指向旋转中心的角度
        // 旋转轴是Y轴，所以我们需要计算粒子在XZ平面上的角度
        const angle = Math.atan2(this.x, this.z);
        return angle * (180 / Math.PI); // 转换为度数
    }

    createElement() {
        const element = document.createElement('div');
        element.className = `particle ${this.type}`;
        element.style.width = `${this.size}px`;
        element.style.height = `${this.size}px`;
        
        // 应用位置和旋转
        element.style.transform = `translate3d(${this.x - this.size/2}px, ${this.y - this.size/2}px, ${this.z}px) rotateY(${this.rotation}deg)`;
        
        if (this.type !== 'star') {
            element.style.background = this.color;
        }
        
        return element;
    }

    update(time) {
        // 添加微小的浮动动画
        const floatAmount = Math.sin(time * 0.001 + this.animationOffset) * 2;
        const newY = this.originalPosition.y + floatAmount;
        
        // 修复：使用原始位置而不是当前位置，防止装饰物聚拢到中心
        this.element.style.transform = `translate3d(${this.originalPosition.x - this.size/2}px, ${newY - this.size/2}px, ${this.originalPosition.z}px) rotateY(${this.rotation}deg)`;
    }

    
}

// 星星粒子类（继承自Particle）
class StarParticle extends Particle {
    constructor(x, y, z, size) {
        super(x, y, z, size, '', 'star');
        
        // 使用配置中的符号和颜色
        const config = decorationsConfig?.stars || {};
        const symbols = config.symbols || ['✨', '⭐', '🌟', '💫'];
        const colors = config.colors || { primary: '#fbbf24', secondary: '#fde047' };
        
        this.starSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        this.element.innerHTML = this.starSymbol;
        this.element.style.fontSize = `${1.0 + Math.random() * 0.6}em`;
        this.element.style.color = colors.primary;
        this.element.style.textShadow = `0 0 15px ${colors.glow || 'rgba(251, 191, 36, 1)'}, 0 0 25px ${colors.glow || 'rgba(251, 191, 36, 0.8)'}, 0 0 35px ${colors.glow || 'rgba(251, 191, 36, 0.6)'}`;
        this.element.style.animationDelay = `${Math.random() * 3}s`;
        this.element.style.opacity = `${0.9 + Math.random() * 0.1}`; // 提高最低透明度
        this.element.style.zIndex = '100'; // 确保星星在最上层
        this.element.style.filter = 'brightness(2) contrast(1.5)'; // 增加亮度和对比度
    }

    update(time) {
        // 星星有特殊的动画效果，闪烁和轻微移动
        const twinkle = Math.sin(time * 0.003 + this.animationOffset) * 0.1 + 0.9; // 提高最低透明度
        const floatAmount = Math.sin(time * 0.001 + this.animationOffset) * 1.5;
        const newY = this.originalPosition.y + floatAmount;
        
        this.element.style.transform = `translate3d(${this.originalPosition.x - this.size/2}px, ${newY - this.size/2}px, ${this.originalPosition.z}px) rotateY(${this.rotation}deg)`;
        this.element.style.opacity = twinkle;
        
        // 动态调整亮度
        const brightness = 1.3 + Math.sin(time * 0.002 + this.animationOffset) * 0.3;
        this.element.style.filter = `brightness(${brightness}) contrast(1.2)`;
    }
}

// 礼物盒粒子类
class GiftParticle extends Particle {
    constructor(x, y, z, size, colors = null) {
        super(x, y, z, size, '', 'gift');
        
        // 使用传入的颜色或配置中的颜色
        const config = decorationsConfig?.gifts || {};
        const availableColors = colors || config.colors || ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
        this.giftColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        this.ribbonColors = config.ribbonColors || ['#fbbf24', '#ffffff'];
        
        // 创建礼物盒SVG
        const giftSvg = this.createGiftSvg();
        this.element.innerHTML = giftSvg;
        
        // 样式设置
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        this.updateGlow();
    }

    updateGlow() {
        // 根据礼物颜色创建相应的发光效果
        const colorRgb = this.hexToRgb(this.giftColor);
        const glowColor = `rgba(${colorRgb.r}, ${colorRgb.g}, ${colorRgb.b}, 0.4)`;
        
        this.element.style.filter = `brightness(1.3) drop-shadow(0 0 15px ${glowColor})`;
        this.element.style.boxShadow = `0 0 20px ${glowColor}`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }

    createGiftSvg() {
        const boxColor = this.giftColor;
        const ribbonColor = this.ribbonColors[Math.floor(Math.random() * this.ribbonColors.length)];
        
        return `
            <svg width="100%" height="100%" viewBox="0 0 100 100" style="position: absolute;">
                <!-- 礼物盒主体 -->
                <rect x="20" y="40" width="60" height="50" fill="${boxColor}" stroke="#000" stroke-width="1"/>
                <!-- 礼物盒盖子 -->
                <rect x="15" y="30" width="70" height="15" fill="${boxColor}" stroke="#000" stroke-width="1"/>
                <!-- 垂直丝带 -->
                <rect x="45" y="25" width="10" height="65" fill="${ribbonColor}" stroke="#000" stroke-width="0.5"/>
                <!-- 水平丝带 -->
                <rect x="15" y="55" width="70" height="10" fill="${ribbonColor}" stroke="#000" stroke-width="0.5"/>
                <!-- 蝴蝶结 -->
                <ellipse cx="50" cy="20" rx="15" ry="8" fill="${ribbonColor}" stroke="#000" stroke-width="0.5"/>
                <ellipse cx="35" cy="22" rx="8" ry="5" fill="${ribbonColor}" stroke="#000" stroke-width="0.5" transform="rotate(-30 35 22)"/>
                <ellipse cx="65" cy="22" rx="8" ry="5" fill="${ribbonColor}" stroke="#000" stroke-width="0.5" transform="rotate(30 65 22)"/>
            </svg>
        `;
    }

    update(time) {
        // 礼物盒有轻微的摇摆动画
        const sway = Math.sin(time * 0.001 + this.animationOffset) * 2;
        const newY = this.originalPosition.y + sway;
        
        // 动态发光效果
        const glowIntensity = Math.sin(time * 0.002 + this.animationOffset) * 0.1 + 0.9;
        const colorRgb = this.hexToRgb(this.giftColor);
        const glowColor = `rgba(${colorRgb.r}, ${colorRgb.g}, ${colorRgb.b}, ${0.4 * glowIntensity})`;
        
        this.element.style.filter = `brightness(${1.3 * glowIntensity}) drop-shadow(0 0 ${15 * glowIntensity}px ${glowColor})`;
        this.element.style.boxShadow = `0 0 ${20 * glowIntensity}px ${glowColor}`;
        
        this.element.style.transform = `translate3d(${this.originalPosition.x - this.size/2}px, ${newY - this.size/2}px, ${this.originalPosition.z}px) rotateY(${this.rotation}deg)`;
    }
}

// 装饰球粒子类
class OrnamentParticle extends Particle {
    constructor(x, y, z, size, colors = null) {
        super(x, y, z, size, '', 'ornament');
        
        // 使用传入的颜色或配置中的颜色
        const config = decorationsConfig?.ornaments || {};
        const availableColors = colors || config.colors || ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
        this.ornamentColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        this.capColors = config.capColors || ['#d97706', '#6b7280'];
        
        // 创建装饰球SVG
        const ornamentSvg = this.createOrnamentSvg();
        this.element.innerHTML = ornamentSvg;
        
        // 样式设置
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        this.updateGlow();
    }

    updateGlow() {
        // 根据装饰球颜色创建相应的发光效果
        const colorRgb = this.hexToRgb(this.ornamentColor);
        const glowColor = `rgba(${colorRgb.r}, ${colorRgb.g}, ${colorRgb.b}, 0.5)`;
        
        this.element.style.filter = `brightness(1.4) drop-shadow(0 0 12px ${glowColor})`;
        this.element.style.boxShadow = `0 0 25px ${glowColor}`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }

    createOrnamentSvg() {
        const ballColor = this.ornamentColor;
        const capColor = this.capColors[Math.floor(Math.random() * this.capColors.length)];
        
        return `
            <svg width="100%" height="100%" viewBox="0 0 100 100" style="position: absolute;">
                <!-- 装饰球主体 -->
                <circle cx="50" cy="55" r="35" fill="${ballColor}" stroke="#000" stroke-width="0.5"/>
                <!-- 高光效果 -->
                <ellipse cx="40" cy="45" rx="12" ry="8" fill="rgba(255, 255, 255, 0.6)"/>
                <!-- 装饰球顶部 -->
                <rect x="45" y="15" width="10" height="8" fill="${capColor}" stroke="#000" stroke-width="0.5"/>
                <!-- 挂环 -->
                <circle cx="50" cy="18" r="3" fill="none" stroke="#6b7280" stroke-width="1"/>
            </svg>
        `;
    }

    update(time) {
        // 装饰球有轻微的闪烁和摆动
        const twinkle = Math.sin(time * 0.002 + this.animationOffset) * 0.1 + 0.9;
        const swing = Math.sin(time * 0.0015 + this.animationOffset) * 1.5;
        const newY = this.originalPosition.y + swing;
        
        // 动态发光效果
        const glowIntensity = Math.sin(time * 0.003 + this.animationOffset) * 0.15 + 0.85;
        const colorRgb = this.hexToRgb(this.ornamentColor);
        const glowColor = `rgba(${colorRgb.r}, ${colorRgb.g}, ${colorRgb.b}, ${0.5 * glowIntensity})`;
        
        this.element.style.filter = `brightness(${1.4 * glowIntensity}) drop-shadow(0 0 ${12 * glowIntensity}px ${glowColor})`;
        this.element.style.boxShadow = `0 0 ${25 * glowIntensity}px ${glowColor}`;
        
        this.element.style.transform = `translate3d(${this.originalPosition.x - this.size/2}px, ${newY - this.size/2}px, ${this.originalPosition.z}px) rotateY(${this.rotation}deg)`;
        this.element.style.opacity = twinkle;
    }
}

// 顶部大星星类
class TopStarParticle extends Particle {
    constructor(x, y, z, size) {
        // 调用父类构造函数
        super(x, y, z, size, '', 'top-star');
        
        // 清除父类创建的元素，我们自己创建
        this.element.innerHTML = '';
        
        // 根据位置决定星星颜色
        const fillColor = Math.abs(this.x) > Math.abs(this.y) ? '#fbbf24' : '#fde047';
        const strokeColor = Math.abs(this.x) > Math.abs(this.y) ? '#f59e0b' : '#fbbf24';
        
        // 创建星星
        const star = this.createStarElement(fillColor, strokeColor);
        star.style.position = 'absolute';
        star.style.left = '0';
        star.style.top = '0';
        star.style.width = '100%';
        star.style.height = '100%';
        
        this.element.appendChild(star);
        
        // 设置样式
        this.element.style.zIndex = '200';
    }

    createStarElement(fillColor, strokeColor) {
        const starElement = document.createElement('div');
        
        // 创建五角星SVG
        const starSvg = `
            <svg width="100%" height="100%" viewBox="0 0 100 100" style="position: absolute; display: block;">
                <path d="M50,5 L61,35 L95,35 L68,57 L79,87 L50,65 L21,87 L32,57 L5,35 L39,35 Z" 
                      fill="${fillColor}" 
                      stroke="${strokeColor}" 
                      stroke-width="2"/>
            </svg>
        `;
        
        starElement.innerHTML = starSvg;
        return starElement;
    }

    update(time) {
        // 顶部星星有缓慢的旋转和发光效果
        const floatAmount = Math.sin(time * 0.0008) * 3; // 轻微浮动
        
        const newY = this.originalPosition.y + floatAmount;
        
        // 主元素跟随圣诞树一起旋转
        this.element.style.transform = `translate3d(${this.originalPosition.x - this.size/2}px, ${newY - this.size/2}px, ${this.originalPosition.z}px) rotateY(${this.rotation}deg)`;
        
        // 移除透明度变化，保持完全不透明
        this.element.style.opacity = '1';
        
        // 动态调整亮度，实现发光效果
        const brightness = 2.0 + Math.sin(time * 0.001) * 0.5;
        this.element.style.filter = `brightness(${brightness}) contrast(1.8) drop-shadow(0 0 20px rgba(251, 191, 36, 0.8))`;
    }
}

// 配置加载函数 - 内嵌经典主题配置
function loadDecorationsConfig() {
    decorationsConfig = {
        "theme": "classic",
        "name": "经典圣诞主题",
        "description": "传统的红绿金配色圣诞树",
        "stars": {
            "symbols": ["✨", "⭐", "🌟", "💫"],
            "count": { "perLayer": [6, 5, 4, 3, 2, 2], "topStar": true },
            "colors": { "primary": "#fbbf24", "secondary": "#fde047", "glow": "rgba(251, 191, 36, 0.8)" },
            "sizes": { "regular": { "min": 20, "max": 32 }, "top": 50 }
        },
        "gifts": { 
            "count": 12, 
            "colors": ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
            "ribbonColors": ["#fbbf24", "#ffffff"],
            "sizes": { "min": 14, "max": 24 },
            "distribution": { "layers": 4, "avoidTrunkRadius": 12 }
        },
        "ornaments": { 
            "count": 18, 
            "colors": ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"],
            "capColors": ["#d97706", "#6b7280"],
            "sizes": { "min": 10, "max": 18 },
            "distribution": { "layers": 6, "avoidTrunkRadius": 10 }
        },
        "tree": {
            "crown": { 
                "layers": 6,
                "particlesPerLayer": [40, 35, 30, 25, 20, 15],
                "baseRadius": 120,
                "layerHeight": 40,
                "colors": { "primary": "#22c55e", "secondary": "#16a34a" }
            },
            "trunk": { 
                "height": 60,
                "radius": 15,
                "particleCount": 40,
                "colors": { "primary": "#92400e", "secondary": "#78350f" }
            }
        },
        "animations": {
            "rotationSpeed": 10,
            "starTwinkle": true,
            "giftGlow": true,
            "ornamentSparkle": true
        }
    };
    
    console.log(`🎄 已加载配置: ${decorationsConfig.name}`);
    return decorationsConfig;
}

// 圣诞树类
class ChristmasTree {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.time = 0;
        this.init();
    }

    init() {
        // 加载配置
        loadDecorationsConfig();
        
        this.clearTree();
        this.createTreeCrown();
        this.createTreeTrunk();
        this.createDecorations(); // 添加礼物和装饰球
        
        // 添加特效
        if (starsEnabled) {
            this.createStars();
        }
        
        this.addParticlesToContainer();
    }

    clearTree() {
        this.container.innerHTML = '';
        this.particles = [];
        stars = []; // 清空星星数组
    }

    

    // 创建树冠粒子
    createTreeCrown() {
        const config = decorationsConfig?.tree?.crown || {};
        const layers = config.layers || 6;
        const baseRadius = config.baseRadius || 120;
        const layerHeight = config.layerHeight || 40;
        const particlesPerLayer = config.particlesPerLayer || [40, 35, 30, 25, 20, 15];
        const colors = config.colors || { primary: '#22c55e', secondary: '#16a34a' };
        
        for (let layer = 0; layer < layers; layer++) {
            // 创建真正的三角形层次结构
            const layerRadius = baseRadius * (1 - layer * 0.18);
            const layerY = -40 - layer * layerHeight; // 降低垂直坐标，实现尖顶角度
            const particlesInLayer = Math.floor((particlesPerLayer[layer] || 30) * particleDensity);
            
            // 创建多个角度环，确保360度分布
            const ringsPerLayer = 3;
            for (let ring = 0; ring < ringsPerLayer; ring++) {
                const ringOffset = (ring / ringsPerLayer) * (Math.PI * 2 / particlesInLayer);
                
                for (let i = 0; i < particlesInLayer / ringsPerLayer; i++) {
                    const angle = (i / (particlesInLayer / ringsPerLayer)) * Math.PI * 2 + ringOffset;
                    // 创建更自然的分布，从中心到边缘，避免原点
                    const radiusVariation = Math.random();
                    const radius = layerRadius * (0.7 + radiusVariation * 0.3); // 减小半径浮动范围
                    
                    const x = Math.cos(angle) * radius;
                    const z = Math.sin(angle) * radius;
                    const y = layerY + (Math.random() - 0.5) * 15;
                    const size = 4 + Math.random() * 3;
                    
                    const particle = new Particle(
                        x, y, z, size,
                        `radial-gradient(circle, ${colors.primary}, ${colors.secondary})`,
                        'tree-crown'
                    );
                    
                    this.particles.push(particle);
                }
            }
        }
    }

    // 创建树干粒子

        createTreeTrunk() {

            const config = decorationsConfig?.tree?.trunk || {};

            const trunkHeight = config.height || 60;

            const trunkRadius = config.radius || 15;

            const totalParticles = (config.particleCount || 40) * particleDensity;

            const colors = config.colors || { primary: '#92400e', secondary: '#78350f' };

            

            for (let i = 0; i < totalParticles; i++) {

                // 完全随机分布在圆柱体内

                const height = Math.random() * trunkHeight - 30; // 从-30到30

                const angle = Math.random() * Math.PI * 2;

                

                // 使用平方根分布确保在圆形截面内均匀分布

                const radius = Math.sqrt(Math.random()) * trunkRadius * 0.9; // 0.9避免边缘

                

                const x = Math.cos(angle) * radius;

                const z = Math.sin(angle) * radius;

                const y = height;

                const size = 4 + Math.random() * 3;

                

                // 确保不会在树干中心线创建粒子

                if (Math.abs(x) < 1 && Math.abs(z) < 1) {

                    continue; // 跳过中心线附近的粒子

                }

                

                const particle = new Particle(

                    x, y, z, size,

                    `radial-gradient(circle, ${colors.primary}, ${colors.secondary})`,

                    'tree-trunk'

                );

                

                this.particles.push(particle);

            }

        }

    // 创建叶子粒子 - 已移除
    createLeaves() {
        // 叶子粒子已完全移除
    }

    // 创建礼物和装饰球
    createDecorations() {
        this.createGiftBoxes();
        this.createOrnaments();
    }

    // 创建礼物盒
    createGiftBoxes() {
        const config = decorationsConfig?.gifts || {};
        const giftCount = config.count || 12;
        const colors = config.colors || ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];
        const sizes = config.sizes || { min: 14, max: 24 };
        const distribution = config.distribution || { layers: 4, avoidTrunkRadius: 12 };
        
        for (let i = 0; i < giftCount; i++) {
            // 礼物主要分布在树的下层和中层
            const layer = Math.floor(Math.random() * distribution.layers);
            const layerRadius = 100 * (1 - layer * 0.15);
            const angle = Math.random() * Math.PI * 2;
            const radius = layerRadius * (0.6 + Math.random() * 0.4);
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = -40 - layer * 40 + (Math.random() - 0.5) * 20;
            const size = sizes.min + Math.random() * (sizes.max - sizes.min);
            
            // 确保礼物不会出现在树干位置
            if (Math.abs(x) < distribution.avoidTrunkRadius && Math.abs(z) < distribution.avoidTrunkRadius && y > -20) {
                continue;
            }
            
            const gift = new GiftParticle(x, y, z, size, colors);
            this.particles.push(gift);
        }
    }

    // 创建装饰球
    createOrnaments() {
        const config = decorationsConfig?.ornaments || {};
        const ornamentCount = config.count || 18;
        const colors = config.colors || ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];
        const sizes = config.sizes || { min: 10, max: 18 };
        const distribution = config.distribution || { layers: 6, avoidTrunkRadius: 10 };
        
        for (let i = 0; i < ornamentCount; i++) {
            // 装饰球分布在整棵树上
            const layer = Math.floor(Math.random() * distribution.layers);
            const layerRadius = 120 * (1 - layer * 0.18);
            const angle = Math.random() * Math.PI * 2;
            const radius = layerRadius * (0.7 + Math.random() * 0.3);
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = -40 - layer * 40 + (Math.random() - 0.5) * 15;
            const size = sizes.min + Math.random() * (sizes.max - sizes.min);
            
            // 确保装饰球不会出现在树干位置
            if (Math.abs(x) < distribution.avoidTrunkRadius && Math.abs(z) < distribution.avoidTrunkRadius && y > -20) {
                continue;
            }
            
            const ornament = new OrnamentParticle(x, y, z, size, colors);
            this.particles.push(ornament);
        }
    }

    // 创建星星效果（星星长在圣诞树上）
    createStars() {
        const config = decorationsConfig?.stars || {};
        
        // 首先创建顶部大星星
        if (config.count?.topStar !== false) {
            this.createTopStar();
        }
        
        // 按层次分配星星数量
        const starsPerLayer = config.count?.perLayer || [6, 5, 4, 3, 2, 2];
        const sizes = config.sizes || { regular: { min: 20, max: 32 } };
        
        for (let layer = 0; layer < starsPerLayer.length; layer++) {
            const layerRadius = 120 * (1 - layer * 0.18);
            const starsInThisLayer = starsPerLayer[layer];
            
            // 在每层内均匀分布星星
            for (let i = 0; i < starsInThisLayer; i++) {
                // 基础角度 + 随机偏移，实现均匀但有随机性的分布
                const baseAngle = (i / starsInThisLayer) * Math.PI * 2;
                const randomOffset = (Math.random() - 0.5) * (Math.PI * 2 / starsInThisLayer) * 0.6;
                const angle = baseAngle + randomOffset;
                
                // 星星主要分布在外层，但有少量在内层
                const radiusRatio = Math.random() < 0.7 ? 
                    (0.6 + Math.random() * 0.4) : // 70%在外层60%-100%
                    (0.3 + Math.random() * 0.3); // 30%在内层30%-60%
                const radius = layerRadius * radiusRatio;
                
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = -40 - layer * 40 + (Math.random() - 0.5) * 10; // 减小垂直范围
                
                // 确保星星不会出现在树干位置
                if (Math.abs(x) < 10 && Math.abs(z) < 10 && y > -20) {
                    continue; // 跳过树干中心位置
                }
                
                // 使用配置中的尺寸范围
                const sizeRange = sizes.regular || { min: 20, max: 32 };
                const size = (sizeRange.min - layer * 2) + Math.random() * (sizeRange.max - sizeRange.min);
                const star = new StarParticle(x, y, z, size);
                
                this.particles.push(star);
                stars.push(star);
            }
        }
    }

    // 创建顶部大星星
    createTopStar() {
        // 顶部星星位置：在树冠最高层上方
        const y = -260; // 调回适当高度，位于顶层树叶上方
        const z = 0;
        const size = 50; // 大星星尺寸
        
        // 创建第一个星星，在x轴方向有微小偏移
        const topStar1 = new TopStarParticle(0.00001, y, z, size);
        this.particles.push(topStar1);
        stars.push(topStar1);
        
        // 创建第二个星星，在y轴方向有微小偏移
        const topStar2 = new TopStarParticle(0, y, 0.00001, size);
        this.particles.push(topStar2);
        stars.push(topStar2);
    }

// 添加粒子到容器
    addParticlesToContainer() {
        // 先添加普通粒子
        this.particles.forEach(particle => {
            if (particle.type !== 'star') {
                this.container.appendChild(particle.element);
            }
        });
        
        // 最后添加星星，确保它们在最上层
        this.particles.forEach(particle => {
            if (particle.type === 'star') {
                this.container.appendChild(particle.element);
            }
        });
    }

    // 更新动画
    update() {
        this.time += 16; // 假设60fps
        
        this.particles.forEach(particle => {
            particle.update(this.time);
        });
    }

    // 设置旋转速度（固定为1）
    setRotationSpeed() {
        this.container.style.animationDuration = '10s';
    }

    // 暂停/恢复动画
    toggleAnimation() {
        animationPaused = !animationPaused;
        if (animationPaused) {
            this.container.classList.add('paused');
        } else {
            this.container.classList.remove('paused');
        }
        return animationPaused;
    }

    // 更新粒子密度
    updateDensity(newDensity) {
        particleDensity = newDensity;
        this.init();
    }
}

// 动画循环
function animate() {
    if (!animationPaused && christmasTree) {
        christmasTree.update();
    }
    requestAnimationFrame(animate);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('christmasTree');
    christmasTree = new ChristmasTree(container);
    
    // 初始化
    christmasTree.init();
    
    // 设置固定参数
    christmasTree.setRotationSpeed();
    
    animate();
    
    console.log(`🎄 送你一棵${decorationsConfig?.name || '圣诞树'}！`);
    
    // 创建雪花效果
    createSnowfall();
});

// 雪花效果
function createSnowfall() {
    const snowflakeSymbols = ['❄', '❅', '❆', '✻', '✼', '❉'];
    const maxSnowflakes = 50;
    
    function createSnowflake() {
        if (document.querySelectorAll('.snowflake').length >= maxSnowflakes) {
            return;
        }
        
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.innerHTML = snowflakeSymbols[Math.floor(Math.random() * snowflakeSymbols.length)];
        
        // 随机位置和大小
        const startX = Math.random() * window.innerWidth;
        const fontSize = Math.random() * 10 + 10;
        const animationDuration = Math.random() * 10 + 10;
        const animationDelay = Math.random() * 5;
        
        snowflake.style.left = `${startX}px`;
        snowflake.style.fontSize = `${fontSize}px`;
        snowflake.style.animationDuration = `${animationDuration}s`;
        snowflake.style.animationDelay = `${animationDelay}s`;
        snowflake.style.opacity = Math.random() * 0.6 + 0.4;
        
        document.body.appendChild(snowflake);
        
        // 动画结束后移除雪花
        setTimeout(() => {
            if (snowflake.parentNode) {
                snowflake.parentNode.removeChild(snowflake);
            }
        }, (animationDuration + animationDelay) * 1000);
    }
    
    // 定期创建新雪花
    setInterval(createSnowflake, 300);
    
    // 初始创建一些雪花
    for (let i = 0; i < 20; i++) {
        setTimeout(createSnowflake, i * 200);
    }
}