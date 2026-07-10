const themeSwitch = document.getElementById('themeSwitch');
const body = document.body;
const mainNavbar = document.getElementById('mainNavbar');

function handleScroll() {
   if (window.scrollY > 10) {
      mainNavbar.classList.add('scrolled');
   } else {
      mainNavbar.classList.remove('scrolled');
   }
}

window.addEventListener('scroll', handleScroll);

function applyTheme(theme) {
   if (theme === 'dark') {
      body.classList.remove('light-mode');
      themeSwitch.checked = true;
   } else {
      body.classList.add('light-mode');
      themeSwitch.checked = false;
   }
   localStorage.setItem('theme', theme);
}

const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

themeSwitch.addEventListener('change', function () {
   if (this.checked) {
      applyTheme('dark');
   } else {
      applyTheme('light');
   }
});

handleScroll();