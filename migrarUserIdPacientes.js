// migrarUserIdPacientes.js
const admin = require("firebase-admin");

// Reemplaza la ruta por la de tu archivo de credenciales de servicio de Firebase
const serviceAccount = require("./ruta/a/tu/credencial-firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const USER_UID = "uLp1pSVp4IgH56PzIw1E3RSgCml1"; // UID de Constanza

async function migrar() {
  const snapshot = await db.collection("patients").get();
  const batch = db.batch();

  snapshot.forEach(doc => {
    batch.update(doc.ref, { userId: USER_UID });
  });

  await batch.commit();
  console.log("Migración completada: todos los pacientes ahora tienen userId.");
}

migrar().catch(console.error);
