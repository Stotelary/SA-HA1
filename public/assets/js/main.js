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
const contactForm = document.getElementById("contactForm");

if (telInput && contactForm) {
  // Placeholder
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

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let nombre = document.getElementById("name")?.value.trim() || "";
    let email = document.getElementById("email")?.value.trim() || "";
    let asunto = document.getElementById("subject")?.value.trim() || "";
    let mensaje = document.getElementById("message")?.value.trim() || "";

    let telefono = telInput.value.replace("+56 ", "").trim();

    let regexTelefono = /^[0-9]{8,15}$/;
    let regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (nombre === "") return alert("El nombre completo es obligatorio.");
    if (!regexTelefono.test(telefono)) return alert("Teléfono inválido.");
    if (!regexEmail.test(email)) return alert("Email inválido.");
    if (asunto === "") return alert("El asunto es obligatorio.");
    if (mensaje.length < 10) return alert("Mensaje muy corto.");

    const toast = document.getElementById("toast");
    if (toast) {
      toast.classList.add("show");
      this.reset();
      setTimeout(() => (telInput.value = "+56 "), 0);
      setTimeout(() => toast.classList.remove("show"), 5000);
    }
  });
}

  

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
