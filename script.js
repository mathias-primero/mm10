const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowercase = "abcdefghijklmnopqrstuvwxyz";
const numbers = "0123456789";
const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

const elements = {
  length: document.getElementById("length"),
  lengthValue: document.getElementById("lengthValue"),
  includeUppercase: document.getElementById("includeUppercase"),
  includeLowercase: document.getElementById("includeLowercase"),
  includeNumbers: document.getElementById("includeNumbers"),
  includeSymbols: document.getElementById("includeSymbols"),
  passwordOutput: document.getElementById("passwordOutput"),
  strengthText: document.getElementById("strengthText"),
  strengthFill: document.getElementById("strengthFill"),
  plainText: document.getElementById("plainText"),
  secretKey: document.getElementById("secretKey"),
  encryptedOutput: document.getElementById("encryptedOutput"),
  cipherInput: document.getElementById("cipherInput"),
  decryptKey: document.getElementById("decryptKey"),
  decryptedOutput: document.getElementById("decryptedOutput"),
};

function updateLengthLabel() {
  elements.lengthValue.textContent = elements.length.value;
}

function getSelectedCharacters() {
  let chars = "";

  if (elements.includeUppercase.checked) chars += uppercase;
  if (elements.includeLowercase.checked) chars += lowercase;
  if (elements.includeNumbers.checked) chars += numbers;
  if (elements.includeSymbols.checked) chars += symbols;

  return chars || lowercase;
}

function randomInt(max) {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
}

function generatePassword() {
  const length = Number(elements.length.value);
  const chars = getSelectedCharacters();

  let password = "";

  for (let i = 0; i < length; i += 1) {
    password += chars[randomInt(chars.length)];
  }

  if (!password) {
    return "";
  }

  elements.passwordOutput.value = password;
  updateStrength(password);
}

function updateStrength(password) {
  const length = password.length;
  let score = 0;

  if (length >= 12) score += 40;
  if (length >= 16) score += 20;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[a-z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;

  const normalized = Math.min(score, 100);
  const fill = document.getElementById("strengthFill");
  fill.style.width = `${normalized}%`;

  if (normalized < 40) {
    elements.strengthText.textContent = "Fraca";
  } else if (normalized < 70) {
    elements.strengthText.textContent = "Média";
  } else if (normalized < 90) {
    elements.strengthText.textContent = "Forte";
  } else {
    elements.strengthText.textContent = "Muito forte";
  }
}

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function toBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function encryptText() {
  const text = elements.plainText.value.trim();
  const password = elements.secretKey.value.trim();

  if (!text || !password) {
    elements.encryptedOutput.value = "Preencha o texto e a chave secreta.";
    return;
  }

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encoded = new TextEncoder().encode(text);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  const payload = `${toBase64(salt)}.${toBase64(iv)}.${toBase64(new Uint8Array(encrypted))}`;
  elements.encryptedOutput.value = payload;
}

async function decryptText() {
  const payload = elements.cipherInput.value.trim();
  const password = elements.decryptKey.value.trim();

  if (!payload || !password) {
    elements.decryptedOutput.value = "Preencha o texto criptografado e a chave secreta.";
    return;
  }

  try {
    const [saltB64, ivB64, dataB64] = payload.split(".");
    if (!saltB64 || !ivB64 || !dataB64) {
      throw new Error("Formato inválido.");
    }

    const salt = fromBase64(saltB64);
    const iv = fromBase64(ivB64);
    const encryptedData = fromBase64(dataB64);
    const key = await deriveKey(password, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedData
    );

    elements.decryptedOutput.value = new TextDecoder().decode(decrypted);
  } catch (error) {
    elements.decryptedOutput.value = "Não foi possível descriptografar. Verifique a chave e o texto.";
  }
}

async function copyText(element) {
  if (!element.value) return;
  await navigator.clipboard.writeText(element.value);
}

function bindEvents() {
  elements.length.addEventListener("input", () => {
    updateLengthLabel();
  });

  document.getElementById("generateBtn").addEventListener("click", generatePassword);
  document.getElementById("copyPasswordBtn").addEventListener("click", () => copyText(elements.passwordOutput));
  document.getElementById("encryptBtn").addEventListener("click", encryptText);
  document.getElementById("copyEncryptedBtn").addEventListener("click", () => copyText(elements.encryptedOutput));
  document.getElementById("decryptBtn").addEventListener("click", decryptText);
  document.getElementById("copyDecryptedBtn").addEventListener("click", () => copyText(elements.decryptedOutput));

  elements.includeUppercase.addEventListener("change", generatePassword);
  elements.includeLowercase.addEventListener("change", generatePassword);
  elements.includeNumbers.addEventListener("change", generatePassword);
  elements.includeSymbols.addEventListener("change", generatePassword);
}

updateLengthLabel();
generatePassword();
bindEvents();
