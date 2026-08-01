// ============================================
// DATA — kept in one place so the form, the
// stub preview, and the confirmation ticket
// all agree on prices and titles.
// ============================================
const EVENTS = {
  "riverside-jazz": { title: "Riverside Jazz Quintet", date: "Fri, Aug 14 2026", price: 35 },
  "neon-basement": { title: "Neon Basement Sessions", date: "Fri, Aug 21 2026", price: 28 },
  "paperback-poets": { title: "Paperback Poets Night", date: "Fri, Aug 28 2026", price: 15 },
  "orchestra-under-stars": { title: "Orchestra Under the Stars", date: "Sat, Sep 5 2026", price: 52 },
  "stand-up-saturdays": { title: "Stand-Up Saturdays", date: "Sat, Sep 12 2026", price: 22 },
  "rooftop-cinema": { title: "Rooftop Cinema Night", date: "Sat, Sep 19 2026", price: 18 },
  "salsa-workshop": { title: "Salsa Floor Workshop", date: "Sat, Sep 26 2026", price: 25 },
};

const form = document.getElementById("booking-form");
const eventSelect = document.getElementById("eventSelect");
const ticketCount = document.getElementById("ticketCount");
const formStatus = document.getElementById("form-status");

// ============================================
// "Pick this show" buttons on the event cards
// scroll down and pre-fill the select
// ============================================
document.querySelectorAll(".btn-pick").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.pick;
    eventSelect.value = key;
    document.querySelectorAll(".btn-pick").forEach((b) => b.classList.remove("picked"));
    btn.classList.add("picked");
    updateStub();
    document.getElementById("book").scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("fullName").focus({ preventScroll: true });
  });
});

// ============================================
// Live stub preview (right-hand side of the form)
// ============================================
function updateStub() {
  const chosen = EVENTS[eventSelect.value];
  const qty = Math.max(1, parseInt(ticketCount.value, 10) || 1);

  document.getElementById("stub-qty").textContent = qty;
  document.getElementById("stub-show").textContent = chosen ? chosen.title : "— not chosen —";
  document.getElementById("stub-total").textContent = chosen ? `$${chosen.price * qty}` : "$0";
}
eventSelect.addEventListener("change", updateStub);
ticketCount.addEventListener("input", updateStub);
updateStub();

// ============================================
// VALIDATION
// Each validator returns "" when the field is
// valid, or an error string when it isn't.
// ============================================
const validators = {
  fullName(value) {
    const trimmed = value.trim();
    if (!trimmed) return "Tell us who's showing up.";
    if (trimmed.length < 2) return "That's too short to be a full name.";
    if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) return "Letters, spaces, hyphens only, please.";
    return "";
  },
  email(value) {
    const trimmed = value.trim();
    if (!trimmed) return "We need an email to send your code to.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "That email doesn't look complete.";
    return "";
  },
  phone(value) {
    const trimmed = value.trim();
    if (!trimmed) return "A phone number in case the show moves.";
    const digits = trimmed.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) return "That's not quite a valid phone number.";
    return "";
  },
  eventSelect(value) {
    if (!value) return "Pick a show before you book it.";
    return "";
  },
  ticketCount(value) {
    const n = Number(value);
    if (!value || Number.isNaN(n)) return "How many tickets?";
    if (n < 1) return "At least one ticket, unless you plan to watch from the parking lot.";
    if (n > 8) return "Max 8 per booking — email us for groups larger than that.";
    if (!Number.isInteger(n)) return "Whole tickets only.";
    return "";
  },
  terms(checked) {
    if (!checked) return "You'll need to accept this to hold a seat.";
    return "";
  },
};

function fieldWrapper(inputEl) {
  return inputEl.closest(".field");
}

function showError(name, message) {
  const input = document.getElementById(name);
  const errorEl = document.getElementById(`err-${name}`);
  const wrapper = fieldWrapper(input);
  if (message) {
    wrapper.classList.add("error");
    errorEl.textContent = message;
  } else {
    wrapper.classList.remove("error");
    errorEl.textContent = "";
  }
  return !message;
}

function validateField(name) {
  const input = document.getElementById(name);
  const value = input.type === "checkbox" ? input.checked : input.value;
  const message = validators[name](value);
  return showError(name, message);
}

// validate as people move through the form, not just on submit
["fullName", "email", "phone", "eventSelect", "ticketCount"].forEach((name) => {
  const el = document.getElementById(name);
  el.addEventListener("blur", () => validateField(name));
  el.addEventListener("input", () => {
    if (fieldWrapper(el).classList.contains("error")) validateField(name);
  });
});
document.getElementById("terms").addEventListener("change", () => validateField("terms"));

// ============================================
// SUBMIT
// ============================================
function generateBookingCode() {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `NL-${digits}`;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const fieldNames = ["fullName", "email", "phone", "eventSelect", "ticketCount", "terms"];
  const results = fieldNames.map(validateField);
  const allValid = results.every(Boolean);

  if (!allValid) {
    formStatus.textContent = "A few things need fixing above before this ticket is valid.";
    formStatus.classList.remove("ok");
    const firstInvalid = fieldNames[results.indexOf(false)];
    document.getElementById(firstInvalid).focus();
    return;
  }

  formStatus.textContent = "";

  const chosen = EVENTS[eventSelect.value];
  const qty = parseInt(ticketCount.value, 10);
  const name = document.getElementById("fullName").value.trim();

  document.getElementById("rt-title").textContent = chosen.title;
  document.getElementById("rt-name").textContent = name;
  document.getElementById("rt-date").textContent = chosen.date;
  document.getElementById("rt-qty").textContent = qty;
  document.getElementById("rt-total").textContent = `$${chosen.price * qty}`;
  document.getElementById("rt-code").textContent = generateBookingCode();

  document.getElementById("booking-form").closest(".ticket-form-shell").hidden = true;
  const confirmation = document.getElementById("confirmation");
  confirmation.hidden = false;
  confirmation.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.getElementById("book-another").addEventListener("click", () => {
  form.reset();
  document.querySelectorAll(".field.error").forEach((f) => f.classList.remove("error"));
  document.querySelectorAll(".error-msg").forEach((e) => (e.textContent = ""));
  document.querySelectorAll(".btn-pick").forEach((b) => b.classList.remove("picked"));
  updateStub();
  formStatus.textContent = "";

  document.querySelector(".ticket-form-shell").hidden = false;
  document.getElementById("confirmation").hidden = true;
  document.getElementById("book").scrollIntoView({ behavior: "smooth", block: "start" });
});