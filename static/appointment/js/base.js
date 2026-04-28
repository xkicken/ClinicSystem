function setTheme(theme) {
  const html = document.documentElement;
  const themeButton = document.getElementById("themeToggle");

  html.setAttribute("data-bs-theme", theme);

  if (theme === "dark") {
    themeButton.classList.remove("btn-outline-dark");
    themeButton.classList.add("btn-outline-light");
    themeButton.textContent = "Light";
  } else {
    themeButton.classList.remove("btn-outline-light");
    themeButton.classList.add("btn-outline-dark");
    themeButton.textContent = "Dark";
  }

  localStorage.setItem("theme", theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-bs-theme");
  const next = current === "dark" ? "light" : "dark";
  setTheme(next);
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    setTheme(getSystemTheme());
  }
});
