// Rosa Perfume: cart + checkout. Products are read from each .prod card
// (data-name or <h3>, and the number inside .price), so editing a card updates the cart.
(function () {
  var WA_NUMBER = "201069466217";
  var CART_KEY = "rosa_cart_v1";
  var CUR = "EGP";
  var mapLink = "";
  var cart = load();

  function $(id) { return document.getElementById(id); }
  function load() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; } }
  function save() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} }
  function esc(t) { var d = document.createElement("div"); d.textContent = t; return d.innerHTML; }
  function fmt(n) { return n.toLocaleString("en-US") + " " + CUR; }
  function count() { return cart.reduce(function (a, i) { return a + i.qty; }, 0); }
  function total() { return cart.reduce(function (a, i) { return a + i.price * i.qty; }, 0); }
  function find(id) { return cart.filter(function (i) { return i.id === id; })[0]; }

  function readProduct(card) {
    var h = card.querySelector("h3");
    var name = card.getAttribute("data-name") || (h ? h.textContent.trim() : "");
    var pe = card.querySelector(".price");
    var se = card.querySelector("small");
    return {
      id: name,
      name: name,
      size: se ? se.textContent.trim() : "",
      price: pe ? (parseFloat(pe.textContent.replace(/[^0-9.]/g, "")) || 0) : 0
    };
  }

  function render() {
    var list = $("cart-list");
    if (!list) return;
    if (!cart.length) {
      list.innerHTML = '<div class="cart-empty">Your cart is empty. <a href="#shop">Browse the shop</a> to add perfumes.</div>';
    } else {
      var html = cart.map(function (i) {
        return '<div class="cart-row">' +
          '<div class="cart-row__info"><strong>' + esc(i.name) + '</strong>' + (i.size ? '<small>' + esc(i.size) + '</small>' : '') + '</div>' +
          '<div class="qty">' +
            '<button type="button" data-act="dec" data-id="' + esc(i.id) + '" aria-label="Decrease quantity">&minus;</button>' +
            '<span>' + i.qty + '</span>' +
            '<button type="button" data-act="inc" data-id="' + esc(i.id) + '" aria-label="Increase quantity">+</button>' +
          '</div>' +
          '<div class="cart-row__price">' + fmt(i.price * i.qty) + '</div>' +
          '<button type="button" class="cart-rm" data-act="rm" data-id="' + esc(i.id) + '" aria-label="Remove ' + esc(i.name) + '">&times;</button>' +
        '</div>';
      }).join("");
      html += '<div class="cart-foot"><span>Total</span><span>' + fmt(total()) + '</span></div>' +
              '<p class="cart-note">Total does not include shipping fees.</p>' +
              '<button type="button" class="cart-clear" data-act="clear">Clear cart</button>';
      list.innerHTML = html;
    }
    var n = count();
    if ($("cart-count")) $("cart-count").textContent = n;
    if ($("cart-fab")) $("cart-fab").classList.toggle("show", n > 0);
  }

  // Add to cart
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".add-to-cart");
    if (!b) return;
    var card = b.closest(".prod");
    if (!card) return;
    var p = readProduct(card);
    if (!p.name) return;
    var item = find(p.id);
    if (item) { item.qty += 1; item.price = p.price; item.size = p.size; }
    else { p.qty = 1; cart.push(p); }
    save(); render();
    var old = b.textContent;
    b.textContent = "Added \u2713";
    setTimeout(function () { b.textContent = old; }, 1200);
  });

  // + / - / remove / clear
  if ($("cart-list")) {
    $("cart-list").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-act]");
      if (!b) return;
      var act = b.getAttribute("data-act");
      if (act === "clear") { cart = []; save(); render(); return; }
      var id = b.getAttribute("data-id");
      var item = find(id);
      if (!item) return;
      if (act === "inc") item.qty += 1;
      if (act === "dec") item.qty -= 1;
      if (act === "rm" || item.qty < 1) cart = cart.filter(function (i) { return i.id !== id; });
      save(); render();
    });
  }

  // Delivery location
  if ($("c-loc")) {
    $("c-loc").addEventListener("click", function () {
      var st = $("c-loc-status");
      if (!navigator.geolocation) { st.textContent = "Your browser can't share location. Please type your full address."; return; }
      st.textContent = "Getting your location...";
      navigator.geolocation.getCurrentPosition(function (p) {
        mapLink = "https://maps.google.com/?q=" + p.coords.latitude.toFixed(6) + "," + p.coords.longitude.toFixed(6);
        st.textContent = "Location added \u2713 (no need to type the address, but you can add details like building or apartment)";
        if ($("c-err")) $("c-err").textContent = "";
      }, function () {
        mapLink = "";
        st.textContent = "Couldn't get your location. Allow location access or type your full address.";
      }, { enableHighAccuracy: true, timeout: 15000 });
    });
  }

  // Confirm order -> WhatsApp
  if ($("c-send")) {
    $("c-send").addEventListener("click", function () {
      var name = $("c-name").value.trim();
      var phone = $("c-phone").value.trim();
      var addr = $("c-addr").value.trim();
      var payEl = document.querySelector('input[name="pay"]:checked');
      var err = $("c-err");

      if (!cart.length) { err.textContent = "Your cart is empty. Add a perfume first."; return; }
      if (!name || !phone || (!addr && !mapLink)) { err.textContent = "Please fill in your name, mobile number and address (or tap Find my location)."; return; }
      if (phone.replace(/\D/g, "").length < 10) { err.textContent = "Please enter a valid mobile number."; return; }
      if (!payEl) { err.textContent = "Please choose a payment method."; return; }
      err.textContent = "";

      var lines = cart.map(function (i) {
        return "- " + i.name + (i.size ? " (" + i.size + ")" : "") + " x " + i.qty + " = " + fmt(i.price * i.qty);
      });
      var msg = [
        "New order from the Rosa Perfume website",
        "Items:",
        lines.join("\n"),
        "Total: " + fmt(total()) + " (excluding shipping fees)",
        "Name: " + name,
        "Mobile: " + phone,
        addr ? "Address: " + addr : "",
        mapLink ? "Location: " + mapLink : "",
        "Payment: " + payEl.value
      ].filter(Boolean).join("\n");

      var order = {
        items: cart.map(function (i) { return { name: i.name, size: i.size, price: i.price, qty: i.qty }; }),
        total: total(), name: name, phone: phone, addr: addr, location: mapLink, pay: payEl.value
      };
      var waUrl = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
      // Open the tab now (needed on phones), save the order, then send the customer to WhatsApp.
      var w = window.open("", "_blank");
      var saving = window.rosaSaveOrder ? window.rosaSaveOrder(order) : Promise.resolve();
      Promise.race([saving, new Promise(function (r) { setTimeout(r, 3500); })]).then(function () {
        if (w) w.location.href = waUrl; else location.href = waUrl;
      });

      // Order sent: empty the cart and reset the form
      cart = [];
      save();
      render();
      mapLink = "";
      ["c-name", "c-phone", "c-addr"].forEach(function (id) { if ($(id)) $(id).value = ""; });
      if ($("c-loc-status")) $("c-loc-status").textContent = "";
      if (payEl) payEl.checked = false;
    });
  }

  // Shop sections: All / Men / Women / Original
  var tabs = $("shop-tabs");
  if (tabs) {
    tabs.addEventListener("click", function (e) {
      var t = e.target.closest(".tab");
      if (!t) return;
      var f = t.getAttribute("data-filter");
      Array.prototype.forEach.call(tabs.querySelectorAll(".tab"), function (b) {
        b.classList.toggle("is-active", b === t);
      });
      var shown = 0;
      Array.prototype.forEach.call(document.querySelectorAll(".pgrid .prod"), function (card) {
        var cats = (card.getAttribute("data-cat") || "").split(/\s+/);
        var ok = f === "all" || cats.indexOf(f) !== -1;
        card.hidden = !ok;
        if (ok) shown++;
      });
      if ($("shop-empty")) $("shop-empty").hidden = shown > 0;
    });
  }

  render();
})();
