(function () {
  var t = localStorage.getItem('otc-theme');
  if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
})();
