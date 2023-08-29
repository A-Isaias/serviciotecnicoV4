const search = document.querySelector(".search-box");
const menu = document.querySelector(".navbar");

document.querySelector("#search-icon").onclick = () => {
  search.classList.toggle("active");
  menu.classList.remove("active");
};

document.querySelector("#menu-icon").onclick = () => {
  menu.classList.toggle("active");
  search.classList.remove("active");
};

window.onscroll = () => {
  search.classList.remove("active");
  menu.classList.remove("active");
};
