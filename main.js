// Load navbar
fetch("navbar.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("navbar-container").innerHTML = data;

    // After navbar loads, highlight the current page
    const current = location.pathname.split("/").pop();
    document.querySelectorAll(".nav-links a").forEach(link => {
      if (link.getAttribute("href") === current) {
        link.classList.add("active");
      }
    });
  });

// Load footer
fetch("footer.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("footer-container").innerHTML = data;

    // Set the current year in the footer
    const yearSpan = document.getElementById("year");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  });

// Toggle mobile nav menu (used in navbar.html)
function toggleMenu() {
  const navLinks = document.getElementById("nav-links");
  if (navLinks) {
    navLinks.classList.toggle("show");
  }
}
