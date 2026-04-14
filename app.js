
const hamburger = document.querySelector('.header .nav-bar .nav-list .hamburger');
const mobile_menu = document.querySelector('.header .nav-bar .nav-list ul');
const menu_item = document.querySelectorAll('.header .nav-bar .nav-list ul li a');
const header = document.querySelector('.header.container');

hamburger.addEventListener('click', () => {
	hamburger.classList.toggle('active');
	mobile_menu.classList.toggle('active');
});

document.addEventListener('scroll', () => {
	var scroll_position = window.scrollY;
	if (scroll_position > 250) {
		header.style.backgroundColor = '#29323c';
	} 
  else {
		header.style.backgroundColor = 'transparent';
	}
});

menu_item.forEach((item) => {
	item.addEventListener('click', () => {
		hamburger.classList.toggle('active');
		mobile_menu.classList.toggle('active');
	});
});

// Resume Download Logic
document.getElementById('resume-cta')?.addEventListener('click', (e) => {
	const cta = e.currentTarget;
	if (document.body.classList.contains('edit-mode')) return;
	
	if (cta.dataset.pdf) {
		e.preventDefault();
		const link = document.createElement('a');
		link.href = cta.dataset.pdf;
		link.download = 'resume.pdf';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
});