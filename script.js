// Configura tu número de teléfono con prefijo internacional (ejemplo: 34 para España)
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

function calculateTotal() {
  // 1. Obtener tipo de web seleccionado
  let selectedRadio = document.querySelector('input[name="webType"]:checked');
  let basePrice = parseInt(selectedRadio.value);
  let webTypeName = selectedRadio.getAttribute('data-name');

  let extraSectionsCount = 0;
  let extraSectionsPrice = 0;
  let total = 0;
  let message = "";

  // 2. Lógica según el tipo de proyecto
  if (basePrice === 200) {
    // Caso Web App
    sectionsGroup.classList.add('hidden');
    extrasGroup.classList.add('hidden');
    webappNotice.classList.remove('hidden');
    
    priceTitle.innerText = "Precio Inicial";
    totalDisplay.innerText = "Desde 200€";

    message = `Hola WebTo! Me interesa consultar presupuesto para una *Web App Interactiva* (Desde 200€). Me gustaría comentar los detalles de la funcionalidad que necesito.`;

  } else {
    // Caso Landing Page o Página Web
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

    // Sumar extras
    let domainPrice = extraDomainCheckbox.checked ? parseInt(extraDomainCheckbox.value) : 0;
    let i18nPrice = extraI18nCheckbox.checked ? parseInt(extraI18nCheckbox.value) : 0;

    total = basePrice + extraSectionsPrice + domainPrice + i18nPrice;
    totalDisplay.innerText = total + "€";

    // Mensaje de WhatsApp
    message = `Hola WebTo! Me interesa solicitar un proyecto web:%0A`;
    message += `- *Tipo:* ${webTypeName}%0A`;
    if (extraSectionsPrice > 0) message += `- *Secciones extra:* ${extraSectionsCount} (+${extraSectionsPrice}€)%0A`;
    if (domainPrice) message += `- *Dominio + Hosting:* Sí (+30€)%0A`;
    if (i18nPrice) message += `- *Multi-idioma:* Sí (+25€)%0A`;
    message += `%0A*Precio Estimado Total: ${total}€*`;
  }

  // Actualizar enlace de WhatsApp
  whatsappBtn.href = `https://wa.me/${MY_PHONE_NUMBER}?text=${message}`;
}

// Escuchar eventos
webTypeRadios.forEach(radio => {
  radio.addEventListener('change', calculateTotal);
});

extraSectionsInput.addEventListener('input', calculateTotal);
extraDomainCheckbox.addEventListener('change', calculateTotal);
extraI18nCheckbox.addEventListener('change', calculateTotal);

// Ejecutar al cargar
calculateTotal();