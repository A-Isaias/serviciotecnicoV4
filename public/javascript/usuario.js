//slider de imagenes de favoritos

const sliderContainer = document.querySelector(".carrusel");
const leftArrow = document.getElementById("left");
const rightArrow = document.getElementById("right");
const sliderItems = document.querySelectorAll(".contenidio");

const itemWidth = sliderItems[0].offsetWidth;

let position = 0;

function slideLeft() {
  if (position === 0) return;
  position += itemWidth;
  sliderContainer.style.transform = `translateX(${position}px)`;
}

function slideRight() {
  const maxPosition = -(sliderItems.length - 1) * itemWidth;
  if (position === maxPosition) return;
  position -= itemWidth;
  sliderContainer.style.transform = `translateX(${position}px)`;
}

leftArrow.addEventListener("click", slideLeft);
rightArrow.addEventListener("click", slideRight);

//slider de ultimas compras
const comprasContainer = document.querySelector(".compras-carrusel");
const comprasLeftArrow = document.getElementById("compras-left");
const comprasRightArrow = document.getElementById("compras-right");
const comprasItems = document.querySelectorAll(".compras-contenido");

const comprasItemWidth = comprasItems[0].offsetWidth;

let comprasPosition = 0;
const comprasMaxPosition = -(comprasItems.length - 1) * comprasItemWidth;

function updateComprasArrowsVisibility() {
  comprasLeftArrow.style.display = comprasPosition === 0 ? "none" : "";
  comprasRightArrow.style.display =
    comprasPosition === comprasMaxPosition ? "none" : "";
}

function slideComprasLeft() {
  if (comprasPosition === 0) return;
  comprasPosition += comprasItemWidth;
  comprasContainer.style.transform = `translateX(${comprasPosition}px)`;
  updateComprasArrowsVisibility();
}

function slideComprasRight() {
  if (comprasPosition === comprasMaxPosition) return;
  comprasPosition -= comprasItemWidth;
  comprasContainer.style.transform = `translateX(${comprasPosition}px)`;
  updateComprasArrowsVisibility();
}

comprasLeftArrow.addEventListener("click", slideComprasLeft);
comprasRightArrow.addEventListener("click", slideComprasRight);

updateComprasArrowsVisibility();
