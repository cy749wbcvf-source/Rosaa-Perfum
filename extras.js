// Rosa: hero perfumes that swap one after another + perfume detail page.
(function () {
  var esc = function (t) { var d = document.createElement("div"); d.textContent = t; return d.innerHTML; };
  var cards = [].slice.call(document.querySelectorAll(".prod"));
  function info(card) {
    var se = card.querySelector("small"), cat = (card.getAttribute("data-cat") || "").split(/\s+/), lab = [];
    if (cat.indexOf("men") > -1) lab.push("Men's");
    if (cat.indexOf("women") > -1) lab.push("Women's");
    if (cat.indexOf("original") > -1) lab.push("Original");
    var bt = card.querySelector(".bottle");
    return {
      name: card.getAttribute("data-name"), size: se ? se.textContent.trim() : "",
      price: card.querySelector(".price").textContent.trim(), cat: lab.join(" \u00b7 "),
      c1: bt.style.getPropertyValue("--c1").trim(), c2: bt.style.getPropertyValue("--c2").trim(),
      desc: card.getAttribute("data-desc") || "", img: card.getAttribute("data-img") || "",
      notes: [["Top notes", "data-top"], ["Heart notes", "data-heart"], ["Base notes", "data-base"]]
        .map(function (n) { return [n[0], card.getAttribute(n[1])]; }).filter(function (n) { return n[1]; }),
      card: card
    };
  }
  function slug(n) { return "p-" + n.toLowerCase().replace(/[^a-z0-9]+/g, "-"); }
  function bottle(i) { if (i.img) return '<img class="photo" src="' + esc(i.img) + '" alt="">'; return '<span class="bottle" style="--c1:' + i.c1 + ';--c2:' + i.c2 + '"></span>'; }
  var all = cards.map(info), opened = false, curI = null;

  // ---- Detail page ----
  var pd = document.createElement("div");
  pd.className = "pd"; pd.setAttribute("role", "dialog"); pd.setAttribute("aria-modal", "true");
  document.body.appendChild(pd);
  function render(i) {
    curI = i;
    pd.innerHTML = '<button type="button" class="pd__x" aria-label="Close">&times;</button><div class="pd__in">' +
      '<div class="pd__img">' + bottle(i) + '</div><div>' +
      '<p class="pd__cat">' + esc(i.cat) + '</p><h2>' + esc(i.name) + '</h2><p class="pd__size">' + esc(i.size) + '</p>' +
      '<div class="pd__price">' + esc(i.price) + '</div>' +
      (i.desc ? '<p class="pd__desc">' + esc(i.desc) + '</p>' : '') +
      (i.notes.length ? '<ul class="pd__list">' + i.notes.map(function (n) { return '<li><span>' + esc(n[0]) + '</span><span>' + esc(n[1]) + '</span></li>'; }).join("") + '</ul>' : '') +
      '<ul class="pd__list"><li><span>Delivery</span><span>Fast and guaranteed</span></li><li><span>Returns</span><span>14 days</span></li></ul>' +
      '<button type="button" class="prod__btn pd__add">Add to cart</button></div></div>';
    pd.classList.add("open"); document.body.style.overflow = "hidden"; pd.scrollTop = 0;
  }
  function hide() { pd.classList.remove("open"); document.body.style.overflow = ""; }
  function openD(i) { opened = true; location.hash = slug(i.name); }
  function closeD() { if (opened) { opened = false; history.back(); } else { location.hash = "#shop"; } }
  function sync() {
    var h = location.hash.slice(1), f = h.indexOf("p-") === 0 && all.filter(function (i) { return slug(i.name) === h; })[0];
    if (f) render(f); else hide();
  }
  addEventListener("hashchange", sync); sync();
  pd.addEventListener("click", function (e) {
    if (e.target.closest(".pd__x")) { closeD(); return; }
    var b = e.target.closest(".pd__add");
    if (b && curI) {
      curI.card.querySelector(".add-to-cart").click();
      b.textContent = "Added \u2713"; setTimeout(function () { b.textContent = "Add to cart"; }, 1200);
    }
  });
  addEventListener("keydown", function (e) { if (e.key === "Escape" && pd.classList.contains("open")) closeD(); });
  document.addEventListener("click", function (e) {
    var t = e.target.closest(".prod__img, .prod h3");
    if (t) openD(info(t.closest(".prod")));
  });

  // ---- Hero: perfumes appear one after another, tint + number follow the active perfume ----
  var st = document.getElementById("pstage");
  var hero = document.getElementById("top");
  var list = all.slice(0, 5);
  if (st && hero && list.length) {
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var pad2 = function (n) { return (n < 10 ? "0" : "") + n; };
    st.innerHTML = list.map(function (i, k) {
      return '<button type="button" class="hp" data-i="' + k + '" aria-label="' + esc(i.name) + '"><span class="hp__b">' + bottle(i) +
        '</span></button>';
    }).join("");
    var hs = [].slice.call(st.children), cur = 0, pause = false, timer = null;

    var num = document.createElement("div");
    num.className = "hnum"; num.setAttribute("aria-hidden", "true");
    hero.appendChild(num);
    var mist = document.createElement("div");
    mist.className = "hmist"; mist.setAttribute("aria-hidden", "true");
    st.appendChild(mist);
    var info2 = document.createElement("div");
    info2.className = "hname";
    info2.innerHTML = '<b></b><span></span>';
    hero.appendChild(info2);
    var dots = document.createElement("div");
    dots.className = "hdots"; dots.setAttribute("role", "tablist"); dots.setAttribute("aria-label", "Featured perfumes");
    dots.innerHTML = list.map(function (i, k) {
      return '<button type="button" role="tab" data-k="' + k + '" aria-label="' + esc(i.name) + '"></button>';
    }).join("");
    hero.appendChild(dots);

    function spray() {
      if (reduce) return;
      mist.innerHTML = "";
      for (var n = 0; n < 16; n++) {
        var m = document.createElement("i");
        m.style.setProperty("--dx", (Math.random() * 220 - 110).toFixed(0) + "px");
        m.style.setProperty("--dy", (Math.random() * -150 - 20).toFixed(0) + "px");
        m.style.setProperty("--s", (1.4 + Math.random() * 1.8).toFixed(2));
        m.style.animationDelay = (Math.random() * 0.35).toFixed(2) + "s";
        mist.appendChild(m);
      }
      setTimeout(function () { mist.innerHTML = ""; }, 2200);
    }

    function paint(k) {
      var i = list[k];
      hero.style.setProperty("--hc", i.c2 || "#c9b8ff");
      hero.style.setProperty("--hc2", i.c1 || "#5b3bd1");
      num.textContent = pad2(k + 1);
      info2.firstChild.textContent = i.name;
      info2.lastChild.textContent = i.price + (i.size ? "  /  " + i.size : "");
      [].forEach.call(dots.children, function (d, j) { d.classList.toggle("on", j === k); d.setAttribute("aria-selected", j === k); });
    }

    function show(next, first) {
      if (!first) {
        var p = hs[cur]; p.classList.remove("on"); p.classList.add("out");
        setTimeout(function () { p.classList.remove("out"); }, 1000);
      }
      cur = next;
      hs[cur].classList.add("on");
      paint(cur);
      if (!first) spray();
    }

    // First load: the bottle drops in from the top of the page, then sprays.
    if (!reduce) {
      hs[0].classList.add("drop");
      setTimeout(spray, 1150);
      setTimeout(function () { hs[0].classList.remove("drop"); }, 1800);
    }
    show(0, true);

    function start() { clearInterval(timer); timer = setInterval(function () { if (!pause) show((cur + 1) % hs.length); }, 4200); }
    start();
    st.addEventListener("pointerenter", function () { pause = true; });
    st.addEventListener("pointerleave", function () { pause = false; });
    st.addEventListener("click", function (e) { var b = e.target.closest(".hp"); if (b) openD(list[b.getAttribute("data-i")]); });
    dots.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-k]"); if (!b) return;
      var k = +b.getAttribute("data-k"); if (k !== cur) { show(k); start(); }
    });
  }
})();
