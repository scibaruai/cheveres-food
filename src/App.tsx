import React, { useState, useEffect, useRef } from 'react';
import CheveresScene from './components/CheveresScene';
import { Flame, ShoppingCart, Info, MapPin, Clock, Phone, ArrowRight, CheckCircle2, Award, MousePointer, Lock, Star } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface MenuItem {
    title: string;
    desc: string;
    price: string;
    badges: string[];
    tag: string;
    image: string;
}

const menuData: Record<string, MenuItem[]> = {
    listos: [
        {
            title: "Tequeños Chéveres x6",
            desc: "Deliciosos deditos de queso mozzarella envueltos en masa artesanal crujiente y hojaldrada. El balance perfecto de sal y textura dorada.",
            price: "$10.500 COP",
            badges: ["Artesanal", "Queso estirable", "El Favorito 🧡"],
            tag: "Fresco del día",
            image: "/tequenos.jpg"
        },
        {
            title: "Pastelitos de Carne y Queso x4",
            desc: "Pastelitos redondos de masa de trigo crujiente rellenos de carne molida sazonada y queso derretido en los bordes.",
            price: "$9.000 COP",
            badges: ["Crocante", "Sabor Tradicional"],
            tag: "Recién Frito",
            image: "/Pasteles.jpg"
        },
        {
            title: "Empanadas de Pollo Guisado x4",
            desc: "Empanadas de maíz súper tostadas, rellenas de pechuga de pollo desmechada cocida en un guiso criollo lleno de sabor.",
            price: "$8.500 COP",
            badges: ["Maíz Tostado", "Pollo Desmechado"],
            tag: "Crujiente",
            image: "/Empanada de pollo.jpg"
        },
        {
            title: "Combo Familiar Chéveres",
            desc: "Ideal para compartir: 6 tequeños clásicos, 4 pastelitos de carne y 4 empanadas pequeñas, acompañados de salsa de ajo especial de la casa.",
            price: "$24.900 COP",
            badges: ["Para Compartir", "Salsa Especial", "Ahorro Brutal"],
            tag: "Recomendado",
            image: "/Combo Familiar.jpg"
        }
    ],
    congelados: [
        {
            title: "Bandeja Tequeños Congelados x20",
            desc: "Deditos de queso listos para hornear, freír en aceite caliente o en tu freidora de aire. Perfectos para antojos o reuniones.",
            price: "$22.000 COP",
            badges: ["Larga Duración", "Listos para Freír/Hornear"],
            tag: "Congelados",
            image: "/Tequenos y Pasteles.jpg"
        },
        {
            title: "Bandeja Pastelitos Congelados x15",
            desc: "Bandeja surtida de pastelitos de trigo congelados (carne molida, pollo y queso). Relleno sellado para freír sin derrames.",
            price: "$20.000 COP",
            badges: ["Surtidos", "Ideal Airfryer"],
            tag: "Práctico",
            image: "/Pasteles.jpg"
        },
        {
            title: "Bandeja Empanadas Congeladas x15",
            desc: "Empanadas de maíz precocidas y ultracongeladas para conservar toda la frescura y la textura crujiente al prepararlas.",
            price: "$18.500 COP",
            badges: ["Precocidas", "Queso y Carne"],
            tag: "Listos en Minutos",
            image: "/Empanada de pollo.jpg"
        }
    ]
};

const App: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrollFraction, setScrollFraction] = useState(0);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [activeTab, setActiveTab] = useState<'listos' | 'congelados'>('listos');

    const mainRef = useRef<HTMLDivElement>(null);
    const menuGridRef = useRef<HTMLDivElement>(null);

    // Track scroll fractions (clamped to first 100vh for 3D model)
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const firstStepHeight = window.innerHeight;
            const fraction = firstStepHeight > 0 ? Math.min(scrollTop / firstStepHeight, 1) : 0;
            setScrollFraction(fraction);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Force R3F Canvas container to remeasure bounds during scroll-driven 3D transforms
    useEffect(() => {
        window.dispatchEvent(new Event('resize'));
    }, [scrollFraction]);

    // Mouse coordinates tracker
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMouse({
                x: (e.clientX / window.innerWidth) - 0.5,
                y: (e.clientY / window.innerHeight) - 0.5
            });

            // GSAP cursor tracker
            const dot = document.querySelector('.custom-cursor-dot');
            const ring = document.querySelector('.custom-cursor-ring');
            if (dot && ring) {
                gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.05, overwrite: "auto" });
                gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.25, overwrite: "auto" });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Custom cursor hover triggers
    useEffect(() => {
        const dot = document.querySelector('.custom-cursor-dot');
        const ring = document.querySelector('.custom-cursor-ring');

        const handleMouseEnter = () => {
            dot?.classList.add('cursor-hover');
            ring?.classList.add('cursor-hover');
        };
        const handleMouseLeave = () => {
            dot?.classList.remove('cursor-hover');
            ring?.classList.remove('cursor-hover');
        };

        const attachCursorHovers = () => {
            const hoverables = document.querySelectorAll(
                'a, button, .menu-card, .feature-card, .review-card, .tab-btn'
            );
            hoverables.forEach(target => {
                target.addEventListener('mouseenter', handleMouseEnter);
                target.addEventListener('mouseleave', handleMouseLeave);
            });
        };

        const timer = setTimeout(attachCursorHovers, 600);
        return () => clearTimeout(timer);
    }, [scrollFraction, activeTab]);

    // Handle Menu Tab change animations
    const handleTabChange = (tab: 'listos' | 'congelados') => {
        if (!menuGridRef.current) return;
        gsap.to(menuGridRef.current, {
            opacity: 0,
            y: 15,
            duration: 0.2,
            onComplete: () => {
                setActiveTab(tab);
                gsap.to(menuGridRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: "power2.out"
                });
            }
        });
    };

    // GSAP ScrollTrigger Configurations
    useEffect(() => {
        if (!mainRef.current) return;

        const ctx = gsap.context(() => {
            const panels = gsap.utils.toArray('.panel') as HTMLElement[];

            // Configure initial 3D transform origin for first 2 panels
            panels.forEach((panel, i) => {
                gsap.set(panel, {
                    transformOrigin: "50% 50% -50vh",
                    backfaceVisibility: "hidden",
                    z: 0
                });
                if (i > 0) {
                    gsap.set(panel, { rotationX: 90, opacity: 0 });
                }
            });

            // Master Pinned Scroll Timeline for Hero to Historia transition
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: '.panels-container',
                    start: 'top top',
                    end: '+=100%', // 1 full screen scroll transition
                    scrub: 1.2,
                    pin: true,
                    anticipatePin: 1
                }
            });

            // Rotate Panel 1 out and Panel 2 in, and blend background color smoothly
            tl.to(panels[0], {
                rotationX: -90,
                opacity: 0,
                ease: 'none'
            }, 0)
            .to(panels[1], {
                rotationX: 0,
                opacity: 1,
                ease: 'none'
            }, 0)
            .to('.panels-container', {
                backgroundColor: '#ffffff', // Transition to white (matches History)
                ease: 'none'
            }, 0)
            .from('.history-text-side', { opacity: 0, y: 40, duration: 0.5 }, 0.3)
            .from('.history-visual-side', { opacity: 0, scale: 0.95, duration: 0.5 }, 0.3);

            // Transition background color from brand orange to pure white when reaching Menu
            gsap.fromTo(document.body, 
                { backgroundColor: '#ff5500', color: '#050505' },
                {
                    backgroundColor: '#ffffff',
                    color: '#050505',
                    scrollTrigger: {
                        trigger: '#menu',
                        start: 'top 60%',
                        end: 'bottom 10%',
                        toggleActions: 'play reverse play reverse'
                    }
                }
            );

            // 3D Card Tilt effect
            const cards = document.querySelectorAll('.menu-card, .feature-card, .review-card');
            cards.forEach(card => {
                const onMouseMove = (e: Event) => {
                    const me = e as MouseEvent;
                    const rect = card.getBoundingClientRect();
                    const x = me.clientX - rect.left;
                    const y = me.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const rotateX = ((centerY - y) / centerY) * 12;
                    const rotateY = ((x - centerX) / centerX) * 12;

                    gsap.to(card, {
                        rotateX: rotateX,
                        rotateY: rotateY,
                        y: -8,
                        scale: 1.02,
                        transformPerspective: 1000,
                        duration: 0.3,
                        overwrite: "auto",
                        ease: "power1.out"
                    });
                };

                const onMouseLeave = () => {
                    gsap.to(card, {
                        rotateX: 0,
                        rotateY: 0,
                        y: 0,
                        scale: 1,
                        duration: 0.5,
                        overwrite: "auto",
                        ease: "power3.out"
                    });
                };

                card.addEventListener('mousemove', onMouseMove);
                card.addEventListener('mouseleave', onMouseLeave);
            });

            // Scroll reveals
            gsap.fromTo(".hero-text-side", 
                { opacity: 0, y: 60 },
                { opacity: 1, y: 0, duration: 1.2, ease: "power4.out" }
            );

            gsap.fromTo(".feature-card", 
                { opacity: 0, y: 40 },
                {
                    scrollTrigger: {
                        trigger: ".features-section",
                        start: "top 80%",
                        toggleActions: "play none none none"
                    },
                    opacity: 1,
                    y: 0,
                    stagger: 0.12,
                    duration: 0.8,
                    ease: "power2.out"
                }
            );

            gsap.fromTo(".menu-grid-wrapper", 
                { opacity: 0, y: 50 },
                {
                    scrollTrigger: {
                        trigger: ".menu-section",
                        start: "top 80%",
                        toggleActions: "play none none none"
                    },
                    opacity: 1,
                    y: 0,
                    duration: 1.0,
                    ease: "power3.out"
                }
            );

            gsap.fromTo(".sede-card", 
                { opacity: 0, y: 40 },
                {
                    scrollTrigger: {
                        trigger: ".sedes-section",
                        start: "top 80%",
                        toggleActions: "play none none none"
                    },
                    opacity: 1,
                    y: 0,
                    stagger: 0.2,
                    duration: 0.8,
                    ease: "power2.out"
                }
            );

            gsap.fromTo(".review-card", 
                { opacity: 0, y: 40 },
                {
                    scrollTrigger: {
                        trigger: ".reviews-section",
                        start: "top 80%",
                        toggleActions: "play none none none"
                    },
                    opacity: 1,
                    y: 0,
                    stagger: 0.15,
                    duration: 0.8,
                    ease: "power2.out"
                }
            );
        }, mainRef);

        const timer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 800);

        return () => {
            ctx.revert();
            clearTimeout(timer);
        };
    }, []);

    return (
        <div ref={mainRef} className="app-wrapper">
            {/* Custom pointer cursor */}
            <div className="custom-cursor-dot" />
            <div className="custom-cursor-ring" />

            {/* Navigation Bar */}
            <nav id="main-nav">
                <div className="nav-container">
                    <div className="nav-logo" id="brand-logo">
                        <a href="#inicio" className="nav-logo-link">
                            <img src="/Logo.jpg" alt="Chéveres Food Logo" className="nav-logo-img" />
                            <span className="logo-text">Chéveres <span className="orange-text">Food</span></span>
                        </a>
                    </div>
                    <ul className="nav-links">
                        <li><a href="#inicio">Inicio</a></li>
                        <li><a href="#menu">Menú</a></li>
                        <li><a href="#sedes">Sedes</a></li>
                        <li><a href="#horarios">Horarios</a></li>
                        <li><a href="#reseñas">Reseñas</a></li>
                    </ul>
                    <a href="https://wa.me/573166325650" className="nav-cta-btn" id="nav-order-btn" target="_blank" rel="noreferrer">
                        <Flame size={16} className="neon-icon" /> ¡Pedir Tequeños!
                    </a>
                    <button 
                        className="mobile-nav-toggle" 
                        id="mobile-menu-toggle" 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Abrir menú"
                    >
                        <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`} />
                    </button>
                </div>

                {/* Mobile Dropdown Menu */}
                {mobileMenuOpen && (
                    <div className="mobile-menu" id="mobile-menu-dropdown">
                        <a href="#inicio" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Inicio</a>
                        <a href="#menu" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Menú</a>
                        <a href="#sedes" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Sedes</a>
                        <a href="#horarios" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Horarios</a>
                        <a href="#reseñas" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Reseñas</a>
                        <a 
                            href="https://wa.me/573166325650" 
                            className="mobile-cta-btn" 
                            target="_blank" 
                            rel="noreferrer"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <Flame size={16} style={{ marginRight: '8px' }} /> ¡Pedir Tequeños!
                        </a>
                    </div>
                )}
            </nav>

            {/* Pinned 3D Panels Scroll Container (Hero & Historia) */}
            <div className="panels-container">
                {/* Panel 1: Hero Section */}
                <header id="inicio" className="panel hero-section">
                    <div className="hero-content-container">
                        <div className="hero-text-side">
                            <div className="tagline-badge">🥟 100% Productos Artesanales</div>
                            <h1 id="hero-main-title">Pasabocas que<br /><span className="orange-text">encienden tus sentidos</span></h1>
                            <p className="hero-description">
                                Tequeños crujientes con queso mozzarella súper elástico, pastelitos y empanadas doradas listas para comer o en formato congelado para preparar en casa.
                            </p>
                            <div className="hero-actions">
                                <a href="#menu" className="btn-primary" id="explore-menu-btn">
                                    Ver Carta Menú <ArrowRight size={18} />
                                </a>
                                <a href="https://wa.me/573166325650" className="btn-secondary-orange" target="_blank" rel="noreferrer">
                                    Pedidos WhatsApp
                                </a>
                            </div>
                            <div className="hero-features-list">
                                <div className="feature-item">
                                    <CheckCircle2 className="icon-orange" size={18} />
                                    <span>Sabor Artesanal</span>
                                </div>
                                <div className="feature-item">
                                    <Flame className="icon-orange" size={18} />
                                    <span>Queso Estirable</span>
                                </div>
                                <div className="feature-item">
                                    <Award className="icon-orange" size={18} />
                                    <span>Línea Congelados</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="hero-3d-side" id="hero-3d-wrapper">
                            {/* Three.js Canvas Container for Stretchy Tequeño */}
                            <CheveresScene scrollFraction={scrollFraction} mouse={mouse} />
                            <div className="scroll-indicator-text">
                                <MousePointer className="scroll-icon-anim" size={14} /> Scroll para estirar el tequeño
                            </div>
                        </div>
                    </div>
                </header>

                {/* Panel 2: Brand Story / History Description */}
                <section id="historia" className="panel history-section">
                    <div className="history-container">
                        <div className="history-text-side">
                            <span className="history-badge"><Info size={14} /> Nuestra Esencia</span>
                            <h2 className="section-title">Pasión por lo Crujiente</h2>
                            <p className="history-desc">
                                En Chéveres Food nació con la convicción de llevar la mística de los pasabocas tradicionales a un nivel superior en Palmira. Fusionando las recetas tradicionales venezolano-colombianas con insumos locales seleccionados, logramos tequeños crujientes, pastelitos dorados y empanadas con un relleno rebosante de sabor.
                            </p>
                            <p className="history-desc">
                                A diario, elaboramos cada lote a mano para garantizar que disfrutes de la frescura inigualable de un producto 100% artesanal. Ya sea listos para devorar al instante o en nuestra popular línea de congelados para tus reuniones, en Chéveres Food encendemos tus sentidos con cada mordisco.
                            </p>
                        </div>
                        <div className="history-visual-side">
                            <div className="history-photo-card">
                                <img src="/Tequenos y Pasteles.jpg" alt="Chéveres Food Tequeños y Pasteles" />
                                <div className="photo-label">El Legado Dorado de Chéveres Food 🧡</div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Features Section */}
            <section className="features-section">
                <div className="features-container">
                    <div className="feature-card">
                        <div className="feature-icon"><i className="fas fa-pizza-slice" /></div>
                        <h3>100% Artesanal</h3>
                        <p>Elaborados a mano diariamente con insumos seleccionados y queso de alta elasticidad.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><i className="fas fa-snowflake" /></div>
                        <h3>Línea Congelados</h3>
                        <p>Mantén tus pasabocas listos en el congelador para freír u hornear en cualquier momento especial.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><i className="fas fa-truck" /></div>
                        <h3>Cobertura Amplia</h3>
                        <p>Despachamos rápidamente a todo Palmira desde nuestras dos sedes de distribución.</p>
                    </div>
                </div>
            </section>

            {/* Menu Section */}
            <section id="menu" className="menu-section">
                <div className="section-header-centered">
                    <span className="history-badge">🧡 CARTA DEL NEGOCIO</span>
                    <h2 className="section-title">Antojos que Cautivan</h2>
                    <p className="section-subtitle">Descubre los pasabocas que conquistan los paladares en Palmira</p>
                    <div className="days-tabs-wrapper">
                        <button 
                            className={`day-tab ${activeTab === 'listos' ? 'active' : ''}`} 
                            onClick={() => handleTabChange('listos')}
                        >
                            Listos para Comer
                        </button>
                        <button 
                            className={`day-tab ${activeTab === 'congelados' ? 'active' : ''}`} 
                            onClick={() => handleTabChange('congelados')}
                        >
                            Congelados Chéveres
                        </button>
                    </div>
                </div>

                <div className="menu-grid-wrapper">
                    <div ref={menuGridRef} className="menu-grid" id="menu-display-grid">
                        {menuData[activeTab].map((item, idx) => (
                            <div className="menu-card" key={idx}>
                                <div className="menu-image">
                                    <img src={item.image} alt={item.title} />
                                    <span className="menu-tag-label">{item.tag}</span>
                                </div>
                                <div className="menu-content">
                                    <div>
                                        <h3>{item.title}</h3>
                                        <p>{item.desc}</p>
                                        <div className="menu-badges-row">
                                            {item.badges.map((b, i) => (
                                                <span key={i} className="menu-badge">{b}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="menu-footer">
                                        <span className="menu-price">{item.price}</span>
                                        <a 
                                            href={`https://wa.me/573166325650?text=Hola,%20quisiera%20pedir%20el%20producto:%20${encodeURIComponent(item.title)}`} 
                                            className="btn-menu-order" 
                                            target="_blank" 
                                            rel="noreferrer"
                                        >
                                            Pedir <ShoppingCart size={14} style={{ marginLeft: '4px' }} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sedes / Cobertura Section */}
            <section id="sedes" className="sedes-section">
                <div className="section-header-centered">
                    <h2 className="section-title">Nuestras Sedes en Palmira</h2>
                    <p className="section-subtitle">Pide a tu punto más cercano o visítanos para tardear</p>
                </div>
                <div className="sedes-container">
                    <div className="sede-card">
                        <div className="sede-badge">Principal</div>
                        <div className="sede-icon"><i className="fas fa-store" /></div>
                        <h3>Sede 1: Centro / Centro-Sur</h3>
                        <p className="sede-address"><i className="fas fa-map-marker-alt" /> Calle 23 # 20 - 05, Palmira</p>
                        <p className="sede-desc">Nuestra sede fundadora. El punto ideal para tardear, compartir y retirar tus pedidos recién salidos de la freidora.</p>
                        <a href="https://maps.google.com/?q=Calle+23+20-05,+Palmira" target="_blank" rel="noreferrer" className="sede-link">
                            Cómo Llegar <i className="fas fa-chevron-right" style={{ marginLeft: '4px' }} />
                        </a>
                    </div>
                    <div className="sede-card">
                        <div className="sede-badge badge-new">¡Nueva Sede!</div>
                        <div className="sede-icon"><i className="fas fa-pizza-slice" /></div>
                        <h3>Sede 2: Norte / Nororiente</h3>
                        <p className="sede-address"><i className="fas fa-map-marker-alt" /> Carrera 28 # 48A - 121, Palmira</p>
                        <p className="sede-desc">Inaugurada en Junio de 2026 para ampliar cobertura. Optimizada para despachos y entregas rápidas a domicilio en el norte de la ciudad.</p>
                        <a href="https://maps.google.com/?q=Carrera+28+48A-121,+Palmira" target="_blank" rel="noreferrer" className="sede-link">
                            Cómo Llegar <i className="fas fa-chevron-right" style={{ marginLeft: '4px' }} />
                        </a>
                    </div>
                </div>
            </section>

            {/* Horarios & Operations Section */}
            <section id="horarios" className="horarios-section">
                <div className="horarios-container">
                    <div className="horarios-content">
                        <div className="tagline-badge">📅 OPERACIONES</div>
                        <h2 className="section-title">Horarios de Atención</h2>
                        <div className="horario-row">
                            <span>Lunes a Domingo</span>
                            <span className="highlight-orange">4:00 PM – 10:00 PM</span>
                        </div>
                        <div className="horario-row closed-day">
                            <span>Miércoles</span>
                            <span className="badge-closed"><Lock size={14} style={{ marginRight: '4px' }} /> Cerrado 🔒</span>
                        </div>
                        <p className="horario-note">
                            *Elaboramos lotes frescos artesanales diariamente. Te sugerimos realizar tu orden temprano para asegurar stock y disponibilidad.
                        </p>
                    </div>
                    <div className="horarios-image-card">
                        <div className="glow-bg"></div>
                        <div className="image-placeholder">
                            <div className="logo-large">🥟</div>
                            <h3>Chéveres Food</h3>
                            <p>Pasabocas con Amor 🧡</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <section id="reseñas" className="reviews-section">
                <div className="section-header-centered">
                    <h2 className="section-title">Voces de Nuestros Clientes</h2>
                    <p className="section-subtitle">Testimonios de quienes ya disfrutan de nuestro sabor artesanal</p>
                </div>
                <div className="reviews-container">
                    <div className="review-card">
                        <div className="stars">
                            <Star size={14} fill="#ffb703" color="#ffb703" />
                            <Star size={14} fill="#ffb703" color="#ffb703" />
                            <Star size={14} fill="#ffb703" color="#ffb703" />
                            <Star size={14} fill="#ffb703" color="#ffb703" />
                            <Star size={14} fill="#ffb703" color="#ffb703" />
                        </div>
                        <p className="review-text">"Los mejores tequeños de Palmira, el queso es súper elástico y la salsa de ajo es espectacular. ¡Siempre pido para mis reuniones familiares!"</p>
                        <div className="review-author">
                            <span className="author-avatar">🧡</span>
                            <div className="author-info">
                                <h4>Camila Restrepo</h4>
                                <span>Cliente Frecuente</span>
                            </div>
                        </div>
                    </div>
                    <div className="review-card">
                        <div className="stars">
                            <Star size={14} fill="#ffb703" color="#ffb703" />
                            <Star size={14} fill="#ffb703" color="#ffb703" />
                            <Star size={14} fill="#ffb703" color="#ffb703" />
                            <Star size={14} fill="#ffb703" color="#ffb703" />
                            <Star size={14} fill="#ffb703" color="#ffb703" />
                        </div>
                        <p className="review-text">"Los pastelitos de carne y queso siempre llegan súper calientes y crocantes. El servicio a domicilio por WhatsApp responde al instante."</p>
                        <div className="review-author">
                            <span className="author-avatar">🥟</span>
                            <div className="author-info">
                                <h4>Mateo Gómez</h4>
                                <span>Cliente Sede Norte</span>
                            </div>
                        </div>
                    </div>
                    <div className="review-card">
                        <div className="stars">
                            <Star size={14} fill="#ffb703" color="#ffb703" />
                            <Star size={14} fill="#ffb703" color="#ffb703" />
                            <Star size={14} fill="#ffb703" color="#ffb703" />
                            <Star size={14} fill="#ffb703" color="#ffb703" />
                            <Star size={14} fill="#ffb703" color="#ffb703" />
                        </div>
                        <p className="review-text">"Compré tres bandejas de tequeños y empanadas congeladas para el cumpleaños de mi hija y fue un éxito. Sencillos de preparar y deliciosos."</p>
                        <div className="review-author">
                            <span className="author-avatar">🔥</span>
                            <div className="author-info">
                                <h4>Valentina Muñoz</h4>
                                <span>Cliente de Congelados</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Unified Footer with Locations & Info */}
            <footer id="contacto" className="contact-section">
                <div className="contact-container">
                    <div className="contact-grid">
                        <div className="contact-info-block">
                            <div className="contact-brand">
                                <img src="/Logo.jpg" alt="Chéveres Food Logo" className="contact-logo-img" />
                                <span className="space-title">CHÉVERES FOOD</span>
                            </div>
                            <p className="contact-bio">
                                Elaboración artesanal de los mejores tequeños, pastelitos y empanadas en Palmira. Llevamos el sabor crujiente de las tradiciones directo a tu paladar y a tus eventos.
                            </p>
                            
                            <div className="contact-details-grid">
                                <div className="contact-detail-card">
                                    <MapPin className="detail-icon" size={20} />
                                    <div>
                                        <h4>Sede Principal</h4>
                                        <p>Calle 23 # 20-05, Palmira, Valle del Cauca.</p>
                                    </div>
                                </div>
                                <div className="contact-detail-card">
                                    <MapPin className="detail-icon" size={20} />
                                    <div>
                                        <h4>Sede Norte</h4>
                                        <p>Carrera 28 # 48A-121, Palmira, Valle del Cauca.</p>
                                    </div>
                                </div>
                                <div className="contact-detail-card">
                                    <Clock className="detail-icon" size={20} />
                                    <div>
                                        <h4>Horarios</h4>
                                        <p>Lun a Dom: 4:00 PM - 10:00 PM<br />Miércoles: Cerrado🔒</p>
                                    </div>
                                </div>
                                <div className="contact-detail-card">
                                    <Phone className="detail-icon" size={20} />
                                    <div>
                                        <h4>WhatsApp Pedidos</h4>
                                        <p>+57 316 632 5650</p>
                                    </div>
                                </div>
                            </div>

                            <div className="social-icons">
                                <a href="https://www.instagram.com/cheveresfood.co/" target="_blank" rel="noreferrer" aria-label="Instagram">
                                    <i className="fab fa-instagram" />
                                </a>
                                <a href="https://wa.me/573166325650" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                                    <i className="fab fa-whatsapp" />
                                </a>
                                <a href="https://www.facebook.com/cheveresfood.co/" target="_blank" rel="noreferrer" aria-label="Facebook">
                                    <i className="fab fa-facebook-f" />
                                </a>
                            </div>
                        </div>

                        {/* Location Maps Side */}
                        <div className="contact-map-block">
                            <div className="map-wrapper-card">
                                <div className="map-header">
                                    <MapPin className="text-orange" size={16} />
                                    <span>Ubicación Sede 1 - Palmira</span>
                                </div>
                                <div className="map-container-real">
                                    <iframe 
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3982.7231456722246!2d-76.3012345!3d3.5391234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3a75668e1a1215%3A0x6b4ef84ef2a1d471!2sCl.%2023%20%2320-05%2C%20Palmira%2C%20Valle%20del%20Cauca!5e0!3m2!1ses!2sco!4v1719000000000!5m2!1ses!2sco" 
                                        width="100%" 
                                        height="100%" 
                                        style={{ border: 0 }} 
                                        allowFullScreen 
                                        loading="lazy" 
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Chéveres Food Map Location"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="footer-bottom">
                        <p>&copy; 2026 Chéveres Food. Diseñado con la excelencia de <span className="scibaru-credit">Scibaru AI</span>.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;
