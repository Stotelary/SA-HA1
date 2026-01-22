// ===========================
// 404 SERVICE - MAIN JAVASCRIPT
// ===========================

;(() => {
  // ===========================
  // HEADER SCROLL EFFECT
  // ===========================
  const header = document.getElementById("header")
  let lastScroll = 0

  function handleScroll() {
    const currentScroll = window.pageYOffset

    if (currentScroll > 10) {
      header.classList.add("scrolled")
    } else {
      header.classList.remove("scrolled")
    }

    lastScroll = currentScroll
  }

  window.addEventListener("scroll", handleScroll)

  // ===========================
  // MOBILE MENU TOGGLE
  // ===========================
  // const menuToggle = document.getElementById("menuToggle")
  // const mobileMenu = document.getElementById("mobileMenu")

  // if (menuToggle && mobileMenu) {
  //   menuToggle.addEventListener("click", () => {
  //     menuToggle.classList.toggle("active")
  //     mobileMenu.classList.toggle("active")
  //   })

  //   // Close mobile menu when clicking on a link
  //   const mobileLinks = mobileMenu.querySelectorAll(".mobile-menu__link")
  //   mobileLinks.forEach((link) => {
  //     link.addEventListener("click", () => {
  //       menuToggle.classList.remove("active")
  //       mobileMenu.classList.remove("active")
  //     })
  //   })
  // }
  const menuToggle = document.querySelector('.navbar-toggler');
  if (menuToggle) {
      menuToggle.addEventListener('click', function() {
          this.classList.toggle('active');
      });
  }

  // ===========================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ===========================
  const anchorLinks = document.querySelectorAll('a[href^="#"]')

  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href")

      // Skip if it's just "#"
      if (href === "#") {
        e.preventDefault()
        return
      }

      const target = document.querySelector(href)

      if (target) {
        e.preventDefault()
        const headerHeight = header.offsetHeight
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        })
      }
    })
  })

  // ===========================
  // CONTACT FORM SUBMISSION
  // ===========================


const telInput = document.getElementById("phone");

// Establecer placeholder desde JavaScript
telInput.placeholder = "Telefono: 9 1234 5678";

// Prevenir borrar el prefijo +56
telInput.addEventListener("keydown", (e) => {
  if (telInput.selectionStart <= 4 && (e.key === "Backspace" || e.key === "Delete")) {
    e.preventDefault();
  }
});

// Mantener siempre el prefijo +56
telInput.addEventListener("input", () => {
  if (!telInput.value.startsWith("+56 ")) {
    telInput.value = "+56 ";
  }
});

// Un solo event listener para el submit
document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Evita enviar si hay errores

  let nombre = document.getElementById("name").value.trim();
  let email = document.getElementById("email").value.trim();
  let asunto = document.getElementById("subject").value.trim();
  let mensaje = document.getElementById("message").value.trim();

  // Obtener el teléfono y quitar el prefijo +56 para validar
  let telefono = telInput.value.replace("+56 ", "").trim();

  // Expresiones regulares
  let regexTelefono = /^[0-9]{8,15}$/;  
  let regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validaciones
  if (nombre === "") {
    alert("El nombre completo es obligatorio.");
    return;
  }

  if (!regexTelefono.test(telefono)) {
    alert("El número de teléfono debe contener solo números (8 a 15 dígitos).");
    return;
  }

  if (!regexEmail.test(email)) {
    alert("Debe ingresar un email válido.");
    return;
  }

  if (asunto === "") {
    alert("El asunto es obligatorio.");
    return;
  }

  if (mensaje.length < 10) {
    alert("El mensaje debe tener al menos 10 caracteres.");
    return;
  }

  // Si pasa todas las validaciones, mostrar toast y resetear
  const toast = document.getElementById("toast");
  if (toast) {
    toast.classList.add("show");

    // Resetear formulario
    this.reset();
    
    // Restaurar el prefijo +56 después del reset
    setTimeout(() => {
      telInput.value = "+56 ";
    }, 0);

    // Ocultar toast después de 5 segundos
    setTimeout(() => {
      toast.classList.remove("show");
    }, 5000);
  }
});

  

  // ===========================
  // INTERSECTION OBSERVER FOR ANIMATIONS
  // ===========================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  // Observe elements that should animate on scroll
  const animatedElements = document.querySelectorAll(".service-card, .benefit-card, .testimonial-card")

  animatedElements.forEach((el, index) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(30px)"
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    el.style.transitionDelay = (index % 3) * 0.1 + "s"
    observer.observe(el)
  })
})()
