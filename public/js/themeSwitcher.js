var isDarkMode = window.localStorage.getItem('dark-theme');
var themeCheckbox = document.getElementById('themeCheck');
themeCheckbox.checked = (isDarkMode == "true") ? true : false;
if (themeCheckbox.checked) {
  document.documentElement.setAttribute('data-bs-theme', 'dark');
}
else {
  document.documentElement.setAttribute('data-bs-theme', 'light');
}
function switchTheme() {
  if (themeCheckbox.checked) {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
    window.localStorage.setItem('dark-theme', true);
  } else {
    document.documentElement.setAttribute('data-bs-theme', 'light');
    window.localStorage.setItem('dark-theme', false);
  }
}
