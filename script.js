// Configuración de contacto
const MY_CONTACT_EMAIL = "contacto@webtostudio.com";

// Control del Menú Hamburguesa en Móvil
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const navbar = document.querySelector('.navbar');

let isClickScrolling = false;

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}

// Cerrar el menú desplegable y ocultar la cabecera al pulsar en un enlace en móvil
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    if (navLinks) {
      navLinks.classList.remove('active');
    }

    if (window.innerWidth <= 900 && navbar) {
      isClickScrolling = true;
      navbar.classList.add('hidden-nav');

      setTimeout(() => {
        isClickScrolling = false;
      }, 700);
    }
  });
});

// Lógica de Scroll para Ocultar/Mostrar Navbar en Móvil
let lastScrollTop = 0;

window.addEventListener('scroll', function() {
  if (window.innerWidth <= 900 && navbar) {
    if (isClickScrolling) return;

    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop && scrollTop > 70) {
      navbar.classList.add('hidden-nav');
      if (navLinks) navLinks.classList.remove('active');
    } else {
      navbar.classList.remove('hidden-nav');
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }
});

// Gestión del Formulario de Contacto hacia contacto@webtostudio.com
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;

    const subject = encodeURIComponent(`Nuevo contacto WebToStudio: ${name}`);
    const body = encodeURIComponent(`Nombre / Negocio: ${name}\nEmail de respuesta: ${email}\n\nMensaje:\n${message}`);

    // Disparar cliente de correo hacia la dirección autenticada
    window.location.href = `mailto:${MY_CONTACT_EMAIL}?subject=${subject}&body=${body}`;

    if (formStatus) {
      formStatus.style.display = 'block';
      formStatus.style.color = '#059669';
      formStatus.innerText = 'Abriendo tu aplicación de correo para enviar la consulta...';
    }
  });
}
