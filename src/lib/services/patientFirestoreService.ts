
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  QueryDocumentSnapshot,
  DocumentData,
  query,
  where
} from "firebase/firestore";
import { Patient } from "@/lib/db/types";

const PATIENTS_COLLECTION = "patients";

function fromFirestore(docSnap: QueryDocumentSnapshot<unknown, DocumentData>): Patient {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    ...(typeof data === 'object' ? data : {}),
  } as Patient;
}

export const patientFirestoreService = {
  async getAll(userId?: string): Promise<Patient[]> {
  let q: import('firebase/firestore').CollectionReference<DocumentData> | import('firebase/firestore').Query<DocumentData> = collection(db, PATIENTS_COLLECTION);
    if (userId) {
      q = query(q, where("userId", "==", userId));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(fromFirestore);
  },
  async getById(id: string): Promise<Patient | null> {
    const docSnap = await getDoc(doc(db, PATIENTS_COLLECTION, id));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Patient : null;
  },
  async create(patient: Omit<Patient, "id">): Promise<string> {
    if (!("userId" in patient) || !patient.userId) {
      throw new Error('userId es requerido para crear un paciente');
    }
    const docRef = await addDoc(collection(db, PATIENTS_COLLECTION), patient);
    return docRef.id;
  },
  async update(id: string, patient: Partial<Patient>): Promise<void> {
    await setDoc(doc(db, PATIENTS_COLLECTION, id), patient, { merge: true });
  },
  async remove(id: string): Promise<void> {
    await deleteDoc(doc(db, PATIENTS_COLLECTION, id));
  },
  async set(id: string, patient: Patient): Promise<void> {
    await setDoc(doc(db, PATIENTS_COLLECTION, id), patient);
  }
};

