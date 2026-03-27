// 🔥 CLOUDINARY
const CLOUD_NAME = "dwkjg1zcm";
const UPLOAD_PRESET = "bzmwzjim";

// 🔥 FIREBASE (IMPORTS)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBlKG1xlE1beqzowdlQmiUBVRtBvzDznFs",
  authDomain: "romantico-8cb15.firebaseapp.com",
  projectId: "romantico-8cb15",
  storageBucket: "romantico-8cb15.firebasestorage.app",
  messagingSenderId: "919262413362",
  appId: "1:919262413362:web:e2c2bc37933810de25f22b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔐 LOGIN
window.login = function () {
    const input = document.getElementById("nombre");
    if (!input) return;

    const nombre = input.value;

    if (!nombre) {
        alert("Escribí tu nombre");
        return;
    }

    localStorage.setItem("usuario", nombre);
    window.location.href = "chat.html";
};

// 📸 SUBIR IMAGEN
window.subirImagen = async function () {
   window.subirImagen = async function () {
    const fileInput = document.getElementById("fileInput");
    const estado = document.getElementById("estadoSubida");
    const btn = document.getElementById("btnSubir");

    if (!fileInput) return;

    const file = fileInput.files[0];
    if (!file) return alert("Selecciona un archivo");

    estado.textContent = "Subiendo recuerdo... 💖";
    btn.disabled = true;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        const docRef = await addDoc(collection(db, "fotos"), {
            url: data.secure_url
        });

        mostrarImagen(data.secure_url, docRef.id);

        estado.textContent = "Subido con éxito 💕";

    } catch (error) {
        console.error(error);
        estado.textContent = "Error al subir 😢";
    }

    btn.disabled = false;
    fileInput.value = "";

    setTimeout(() => {
        estado.textContent = "";
    }, 2000);
};
};

// 🖼️ MOSTRAR IMAGEN
function mostrarImagen(url, id) {
    const gallery = document.getElementById("gallery");
    if (!gallery) return;

    const img = document.createElement("img");
    img.src = url;

    const btn = document.createElement("button");
    btn.textContent = "Eliminar ❌";
    btn.classList.add("delete-btn");

    const div = document.createElement("div");
    div.classList.add("gallery-item");
    div.appendChild(img);
    div.appendChild(btn);

    btn.onclick = async function() {
        const confirmar = confirm("¿Seguro que querés eliminar este recuerdo? 💔");
        if (!confirmar) return;

        try {
            await deleteDoc(doc(db, "fotos", id));
            div.remove();
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    gallery.appendChild(div);
}

// 🔄 CARGAR IMÁGENES
async function cargarImagenes() {
    const gallery = document.getElementById("gallery");
    if (!gallery) return;

    gallery.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "fotos"));

        querySnapshot.forEach((docItem) => {
            mostrarImagen(docItem.data().url, docItem.id);
        });

    } catch (error) {
        console.error("Error al cargar imágenes:", error);
    }
}

window.onload = cargarImagenes;

// 💖 CORAZONES
function crearCorazones() {
    const contenedor = document.querySelector(".corazones");
    if (!contenedor) return;

    setInterval(function () {
        const corazon = document.createElement("span");
        corazon.innerHTML = "💖";

        corazon.style.left = Math.random() * 100 + "%";
        corazon.style.fontSize = (Math.random() * 20 + 10) + "px";
        corazon.style.animationDuration = (Math.random() * 3 + 3) + "s";

        contenedor.appendChild(corazon);

        setTimeout(function () {
            corazon.remove();
        }, 6000);

    }, 300);
}

window.addEventListener("DOMContentLoaded", crearCorazones);

// 💬 CHAT
const usuario = localStorage.getItem("usuario");

if (window.location.pathname.includes("chat.html")) {

    if (!usuario) {
        window.location.href = "login.html";
    }

    const bienvenida = document.getElementById("bienvenida");
    if (bienvenida) {
        bienvenida.textContent = "Hola " + usuario + " 💖";
    }

    const chatBox = document.getElementById("chatBox");

    const q = query(collection(db, "mensajes"), orderBy("fecha"));

    onSnapshot(q, (snapshot) => {
        chatBox.innerHTML = "";

        snapshot.forEach((docItem) => {
            const data = docItem.data();

            const div = document.createElement("div");

if (data.usuario === usuario) {
    div.classList.add("mensaje", "mio");
} else {
    div.classList.add("mensaje", "otro");
}

div.innerHTML = `
    <span class="nombre">${data.usuario}</span>
    <p>${data.mensaje}</p>
`;

chatBox.appendChild(div);
        });

        chatBox.scrollTop = chatBox.scrollHeight;
    });
}

// 📩 ENVIAR MENSAJE
window.enviarMensaje = async function () {
    const input = document.getElementById("mensaje");
    if (!input) return;

    const texto = input.value;
    if (!texto) return;

    await addDoc(collection(db, "mensajes"), {
        usuario: usuario,
        mensaje: texto,
        fecha: new Date()
    });

    input.value = "";
};