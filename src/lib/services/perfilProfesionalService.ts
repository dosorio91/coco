import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { PerfilProfesional } from "@/lib/db/perfilProfesionalTypes";

const PERFIL_COLLECTION = "perfilesProfesionales";

export async function getPerfilProfesional(userId: string): Promise<PerfilProfesional | null> {
	const ref = doc(db, PERFIL_COLLECTION, userId);
	const snap = await getDoc(ref);
	if (!snap.exists()) return null;
	return snap.data() as PerfilProfesional;
}

export async function savePerfilProfesional(perfil: PerfilProfesional): Promise<void> {
	const ref = doc(db, PERFIL_COLLECTION, perfil.userId);
	await setDoc(ref, perfil, { merge: true });
}
