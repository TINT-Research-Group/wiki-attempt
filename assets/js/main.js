document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".portal-btn");

  buttons.forEach((button, index) => {
    button.style.animationDelay = `${index * 70}ms`;

    button.addEventListener("mouseenter", () => {
      button.classList.add("is-active");
    });

    button.addEventListener("mouseleave", () => {
      button.classList.remove("is-active");
    });

    button.addEventListener("focus", () => {
      button.classList.add("is-active");
    });

    button.addEventListener("blur", () => {
      button.classList.remove("is-active");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "h") {
      window.location.href = "index.html";
    }
  });
});
