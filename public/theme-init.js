(function () {
  var theme = localStorage.getItem("bookmarks-color-theme");
  var valid = ["red", "blue", "green", "purple", "orange"];
  if (theme && valid.indexOf(theme) !== -1) {
    document.documentElement.setAttribute("data-color-theme", theme);
  }
})();
