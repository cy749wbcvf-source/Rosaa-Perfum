// Loads products from Firestore into the shop grid, then starts extras.js. Also saves orders.
import { db } from "./fb.js";
import { collection, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const esc = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (n) => Number(n).toLocaleString("en-US") + " EGP";

function card(p) {
  const eff = p.offer && p.offer < p.price ? p.offer : p.price;
  const old = eff < p.price ? '<s class="old">' + fmt(p.price) + '</s><span class="offer-tag">Offer</span>' : "";
  return '<article class="prod" data-name="' + esc(p.name) + '" data-cat="' + esc((p.cats || []).join(" ")) + '" data-desc="' + esc(p.desc) + '" data-img="' + esc(p.img || "") + '">' +
    '<div class="prod__img">' + (p.img ? '<img class="photo" src="' + esc(p.img) + '" alt="' + esc(p.name) + '">' : '') + '<span class="bottle" style="--c1:' + esc(p.c1 || "#5b3bd1") + ';--c2:' + esc(p.c2 || "#c9b8ff") + (p.img ? ';display:none' : '') + '"></span></div>' +
    '<h3>' + esc(p.name) + '</h3><small>' + esc(p.size) + '</small>' +
    '<div class="price">' + fmt(eff) + '</div>' + old +
    '<button type="button" class="prod__btn add-to-cart">Add to cart</button></article>';
}

window.rosaSaveOrder = (o) => addDoc(collection(db, "orders"), { ...o, createdAt: serverTimestamp() }).catch(() => {});

(async () => {
  try {
    const snap = await getDocs(collection(db, "products"));
    const list = snap.docs.map(d => d.data()).filter(p => !p.hidden).sort((a, b) => (a.sort || 0) - (b.sort || 0));
    document.querySelector(".pgrid").innerHTML = list.map(card).join("");
    const em = document.getElementById("shop-empty"); if (em) em.hidden = list.length > 0;
  } catch (e) { const em = document.getElementById("shop-empty"); if (em) { em.hidden = false; em.textContent = "Could not load products (" + (e.code || e.message) + ")."; } }
  const s = document.createElement("script"); s.src = "extras.js"; document.body.appendChild(s);
})();
