
const hamburger = document.querySelector('.header .nav-bar .nav-list .hamburger');
const mobile_menu = document.querySelector('.header .nav-bar .nav-list ul');
const menu_item = document.querySelectorAll('.header .nav-bar .nav-list ul li a');
const header = document.querySelector('.header.container');

const REVEAL_GROUPS = [
	{
		selector: '#services .section-title, #projects .section-title, #about .section-title, #contact .section-title, #services .service-top p',
		effect: 'reveal-up'
	},
	{
		selector: '#services .service-item',
		effect: 'reveal-up',
		stagger: 70
	},
	{
		selector: '#projects .project-item',
		effect: 'reveal-up',
		stagger: 90
	},
	{
		selector: '#about .col-left',
		effect: 'reveal-left'
	},
	{
		selector: '#about .col-right',
		effect: 'reveal-right'
	},
	{
		selector: '#contact .contact-item',
		effect: 'reveal-scale',
		stagger: 80
	}
];

let revealObserver = null;

function toggleMobileMenu() {
	if (!hamburger || !mobile_menu) return;
	hamburger.classList.toggle('active');
	mobile_menu.classList.toggle('active');
}

function closeMobileMenu() {
	if (!hamburger || !mobile_menu) return;
	hamburger.classList.remove('active');
	mobile_menu.classList.remove('active');
}

function updateHeaderBackground() {
	if (!header) return;
	var scroll_position = window.scrollY;
	if (scroll_position > 250) {
		header.style.backgroundColor = '#29323c';
	} else {
		header.style.backgroundColor = 'transparent';
	}
}

function setupMenuControls() {
	if (hamburger) {
		hamburger.addEventListener('click', toggleMobileMenu);
	}

	menu_item.forEach((item) => {
		item.addEventListener('click', () => {
			closeMobileMenu();
		});
	});
}

function setupHeaderScrollEffect() {
	document.addEventListener('scroll', updateHeaderBackground);
	updateHeaderBackground();
}

function setupSmoothAnchorScrolling() {
	document.addEventListener('click', (event) => {
		if (document.body.classList.contains('edit-mode')) return;

		const link = event.target.closest('a[href^="#"]');
		if (!link) return;

		const hash = link.getAttribute('href');
		if (!hash || hash === '#') return;

		const target = document.querySelector(hash);
		if (!target) return;

		event.preventDefault();

		const headerHeight = header ? header.getBoundingClientRect().height : 0;
		const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;

		window.scrollTo({
			top: Math.max(0, targetTop),
			behavior: 'smooth'
		});

		if (window.history && window.history.pushState) {
			window.history.pushState(null, '', hash);
		}

		closeMobileMenu();
	});
}

function createRevealObserver() {
	if (!('IntersectionObserver' in window)) return null;

	return new IntersectionObserver(
		(entries, observer) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				entry.target.classList.add('revealed');
				observer.unobserve(entry.target);
			});
		},
		{
			threshold: 0.18,
			rootMargin: '0px 0px -10% 0px'
		}
	);
}

function registerRevealTargets() {
	REVEAL_GROUPS.forEach((group) => {
		const nodes = document.querySelectorAll(group.selector);
		nodes.forEach((node, index) => {
			if (node.dataset.revealBound === 'true') return;

			node.dataset.revealBound = 'true';
			node.classList.add('reveal-ready', group.effect);

			if (group.stagger) {
				const delay = Math.min(index, 8) * group.stagger;
				node.style.transitionDelay = `${delay}ms`;
			}

			if (document.body.classList.contains('edit-mode')) {
				node.classList.add('revealed');
				return;
			}

			if (revealObserver) {
				revealObserver.observe(node);
			} else {
				node.classList.add('revealed');
			}
		});
	});
}

function setupRevealController() {
	revealObserver = createRevealObserver();
	registerRevealTargets();

	document.addEventListener('portfolio:content-updated', () => {
		registerRevealTargets();
	});
}

function setupResumeDownload() {
	// Resume Download Logic
	document.getElementById('resume-cta')?.addEventListener('click', (e) => {
		const cta = e.currentTarget;
		if (document.body.classList.contains('edit-mode')) return;
		e.preventDefault();

		const href = cta.getAttribute('href') || '';
		const source = cta.dataset.pdf || (href && href !== '#' ? href : '');
		if (!source) return;

		const link = document.createElement('a');
		link.href = source;
		link.download = 'resume.pdf';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	});
}

function initPortfolioEnhancements() {
	setupMenuControls();
	setupHeaderScrollEffect();
	setupSmoothAnchorScrolling();
	setupRevealController();
	setupResumeDownload();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initPortfolioEnhancements);
} else {
	initPortfolioEnhancements();
}