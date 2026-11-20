// Rosa Perfume: Firebase email/password login (modal in the nav).
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { auth, isAdmin } from "./fb.js";

const $ = (id) => document.getElementById(id);

const ERRORS = {
  "auth/invalid-email": "The email address is not valid.",
  "auth/missing-password": "Enter your password.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/email-already-in-use": "This email is already registered. Try logging in.",
  "auth/invalid-credential": "Wrong email or password.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Wrong password.",
  "auth/too-many-requests": "Too many attempts. Wait a bit and try again.",
  "auth/network-request-failed": "Network problem. Check your connection.",
  "auth/operation-not-allowed": "Email/Password sign-in is not enabled in Firebase Console."
};

let mode = "login";
const modal = $("auth-modal");
const msg = $("auth-msg");

function say(text, type) { msg.textContent = text; msg.className = "auth__msg" + (type ? " " + type : ""); }
function openModal() { modal.classList.add("open"); say(""); $("auth-email").focus(); }
function closeModal() { modal.classList.remove("open"); }

function setMode(m) {
  mode = m;
  $("auth-tab-login").classList.toggle("is-active", m === "login");
  $("auth-tab-signup").classList.toggle("is-active", m === "signup");
  $("auth-submit").textContent = m === "login" ? "Log in" : "Create account";
  $("auth-password").autocomplete = m === "login" ? "current-password" : "new-password";
  say("");
}

$("auth-open").addEventListener("click", () => {
  if (auth.currentUser) signOut(auth); else openModal();
});
$("auth-close").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
$("auth-tab-login").addEventListener("click", () => setMode("login"));
$("auth-tab-signup").addEventListener("click", () => setMode("signup"));

$("auth-submit").addEventListener("click", async () => {
  const email = $("auth-email").value.trim();
  const password = $("auth-password").value;
  $("auth-submit").disabled = true;
  try {
    if (mode === "login") await signInWithEmailAndPassword(auth, email, password);
    else await createUserWithEmailAndPassword(auth, email, password);
    $("auth-password").value = "";
    closeModal();
    if (isAdmin(auth.currentUser)) location.href = "admin.html";
  } catch (e) {
    say(ERRORS[e.code] || ("Something went wrong: " + e.code), "error");
  } finally {
    $("auth-submit").disabled = false;
  }
});

$("auth-reset").addEventListener("click", async () => {
  const email = $("auth-email").value.trim();
  if (!email) return say("Enter your email first, then tap Forgot password.", "error");
  try {
    await sendPasswordResetEmail(auth, email);
    say("We sent a password reset link to your email.", "ok");
  } catch (e) {
    say(ERRORS[e.code] || ("Something went wrong: " + e.code), "error");
  }
});

onAuthStateChanged(auth, (user) => {
  const btn = $("auth-open");
  btn.innerHTML = user ? "Log out" : '<span class="nav__auth-tag">Admins</span> Log in';
  btn.title = user ? user.email : "";
  document.body.classList.toggle("is-authed", !!user);
});
