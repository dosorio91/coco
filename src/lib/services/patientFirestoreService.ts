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
  DocumentData
} from "firebase/firestore";
import { Patient } from "@/lib/db/types";

const PATIENTS_COLLECTION = "patients";

function fromFirestore(docSnap: QueryDocumentSnapshot<DocumentData>): Patient {
  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Patient;
}

export const patientFirestoreService = {
  async getAll(): Promise<Patient[]> {
    const querySnapshot = await getDocs(collection(db, PATIENTS_COLLECTION));
    return querySnapshot.docs.map(fromFirestore);
  },
  async getById(id: string): Promise<Patient | null> {
    const docSnap = await getDoc(doc(db, PATIENTS_COLLECTION, id));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Patient : null;
  },
  async create(patient: Omit<Patient, "id">): Promise<string> {
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
