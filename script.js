// Configura tu número de teléfono
const MY_PHONE_NUMBER = "34628594299"; 

// Selección de elementos del DOM
const webTypeRadios = document.querySelectorAll('input[name="webType"]');
const sectionsGroup = document.getElementById('sectionsGroup');
const extrasGroup = document.getElementById('extrasGroup');
const webappNotice = document.getElementById('webappNotice');
const extraSectionsInput = document.getElementById('extraSections');

const extraDomainCheckbox = document.getElementById('extraDomain');
const extraI18nCheckbox = document.getElementById('extraI18n');

const priceTitle = document.getElementById('priceTitle');
const totalDisplay = document.getElementById('totalDisplay');
const whatsappBtn = document.getElementById('whatsappBtn');

// Control del Menú Hamburguesa en Móvil
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Cerrar el menú desplegable automáticamente al hacer clic en un enlace
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});

function calculateTotal() {
  let selectedRadio = document.querySelector('input[name="webType"]:checked');
  let basePrice = parseInt(selectedRadio.value);
  let webTypeName = selectedRadio.getAttribute('data-name');

  let extraSectionsCount = 0;
  let extraSectionsPrice = 0;
  let total = 0;
  let message = "";

  if (basePrice === 200) {
    sectionsGroup.classList.add('hidden');
    extrasGroup.classList.add('hidden');
    webappNotice.classList.remove('hidden');
    
    priceTitle.innerText = "Precio Inicial";
    totalDisplay.innerText = "Desde 200€";

    message = `Hola WebTo! Me interesa consultar presupuesto para una *Web App Interactiva* (Desde 200€). Me gustaría comentar los detalles de la funcionalidad que necesito.`;

  } else {
    extrasGroup.classList.remove('hidden');
    webappNotice.classList.add('hidden');
    priceTitle.innerText = "Precio Estimado";

    if (basePrice === 100) {
      sectionsGroup.classList.remove('hidden');
      extraSectionsCount = parseInt(extraSectionsInput.value) || 0;
      extraSectionsPrice = extraSectionsCount * 10;
    } else {
      sectionsGroup.classList.add('hidden');
      extraSectionsInput.value = 0;
    }

    let domainPrice = extraDomainCheckbox.checked ? parseInt(extraDomainCheckbox.value) : 0;
    let i18nPrice = extraI18nCheckbox.checked ? parseInt(extraI18nCheckbox.value) : 0;

    total = basePrice + extraSectionsPrice + domainPrice + i18nPrice;
    totalDisplay.innerText = total + "€";

    message = `Hola WebTo! Me interesa solicitar un proyecto web:%0A`;
    message += `- *Tipo:* ${webTypeName}%0A`;
    if (extraSectionsPrice > 0) message += `- *Secciones extra:* ${extraSectionsCount} (+${extraSectionsPrice}€)%0A`;
    if (domainPrice) message += `- *Dominio + Hosting:* Sí (+30€)%0A`;
    if (i18nPrice) message += `- *Multi-idioma:* Sí (+25€)%0A`;
    message += `%0A*Precio Estimado Total: ${total}€*`;
  }

  whatsappBtn.href = `https://wa.me/${MY_PHONE_NUMBER}?text=${message}`;
}

webTypeRadios.forEach(radio => {
  radio.addEventListener('change', calculateTotal);
});

extraSectionsInput.addEventListener('input', calculateTotal);
extraDomainCheckbox.addEventListener('change', calculateTotal);
extraI18nCheckbox.addEventListener('change', calculateTotal);

calculateTotal();

// =========================================================
// OBTENER EFECTO SCROLL PARA OCULTAR NAVBAR Y CERRAR MENÚ MÓVIL
// =========================================================
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', function() {
  if (window.innerWidth <= 900) {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 70) {
      // Bajando -> Ocultar navbar y cerrar menú lateral si estaba abierto
      navbar.classList.add('hidden-nav');
      navLinks.classList.remove('active');
    } else {
      // Subiendo -> Mostrar navbar
      navbar.classList.remove('hidden-nav');
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }
});
