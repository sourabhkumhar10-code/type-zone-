// Browser detection and basic capability checks.
(function () {
  navigator.sayswho = function (agent) {
    var ua = typeof agent === "string" ? agent : navigator.userAgent,
      tem,
      mobile = !!ua.match(/mobile/),
      M =
        ua.match(/(opera|edge|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) ||
        ["unknown", "1.0"];

    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return { browser: "MSIE", version: tem[1] ? tem[1] : "", mobile: mobile };
    }
    if (M[1] === "Chrome") {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem != null) {
        return { browser: tem[1].replace("OPR", "Opera"), version: tem[2], mobile: mobile };
      }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, "-?"];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return { browser: M[0], version: M[1], mobile: mobile };
  };

  var browser = navigator.sayswho();
  if (
    browser.browser.toLowerCase() === "msie" ||
    (browser.browser.toLowerCase() === "firefox" && browser.version < 50) ||
    (browser.browser.toLowerCase() === "edge" && browser.version < 15) ||
    (browser.browser.toLowerCase() === "chrome" && browser.version < 50)
  ) {
    navigator.isFailBrowser = true;
  }
})();

if (navigator.isFailBrowser) {
  alert(
    "Your browser is not supported. Please use a modern browser like Chrome, Firefox, Edge, or Safari."
  );
}

try {
  window.__noLocalStorage = false;
  window.localStorage.setItem("test", "test");
  if (window.localStorage.getItem("test") !== "test") {
    window.__noLocalStorage = true;
  }
  window.localStorage.removeItem("test");
} catch (e) {
  window.__noLocalStorage = true;
  console.warn("LocalStorage not available");
}
