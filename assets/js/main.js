(function () {
  var root = document.documentElement;
  var stored = localStorage.getItem("theme");
  if (stored) root.setAttribute("data-theme", stored);

  function currentTheme() {
    var attr = root.getAttribute("data-theme");
    if (attr) return attr;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function updateToggleIcon(btn) {
    if (!btn) return;
    btn.textContent = currentTheme() === "dark" ? "☀" : "☾";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toggleBtn = document.querySelector("[data-theme-toggle]");
    updateToggleIcon(toggleBtn);
    if (toggleBtn) {
      toggleBtn.addEventListener("click", function () {
        var next = currentTheme() === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
        updateToggleIcon(toggleBtn);
      });
    }

    var navToggle = document.querySelector("[data-nav-toggle]");
    var navLinks = document.querySelector("[data-nav-links]");
    if (navToggle && navLinks) {
      navToggle.addEventListener("click", function () {
        var open = navLinks.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", String(open));
      });
      navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          navLinks.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    // Active nav link is set server-side from the `page` local.

    // Guard destructive forms.
    document.querySelectorAll("form[data-confirm]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        if (!window.confirm(form.getAttribute("data-confirm"))) e.preventDefault();
      });
    });

    // Click-to-copy on readonly URL inputs.
    document.querySelectorAll("input[data-copy]").forEach(function (input) {
      input.addEventListener("click", function () {
        input.select();
        navigator.clipboard?.writeText(input.value).then(function () {
          var original = input.value;
          input.value = "Copied!";
          setTimeout(function () { input.value = original; }, 900);
        }).catch(function () {});
      });
    });
  });
})();
