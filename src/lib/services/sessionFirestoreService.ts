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
  query as fsQuery,
  where
} from "firebase/firestore";
import { Session } from "@/lib/db/types";

const SESSIONS_COLLECTION = "sessions";

function fromFirestore(docSnap: QueryDocumentSnapshot<DocumentData>): Session {
  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Session;
}

export const sessionFirestoreService = {
  async getAll(patientId?: string): Promise<Session[]> {
    const colRef = collection(db, SESSIONS_COLLECTION);
    let q = colRef;
    if (patientId) {
      q = fsQuery(colRef, where("patientId", "==", patientId));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(fromFirestore);
  },
  async getById(id: string): Promise<Session | null> {
    const docSnap = await getDoc(doc(db, SESSIONS_COLLECTION, id));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Session : null;
  },
  async create(session: Omit<Session, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, SESSIONS_COLLECTION), session);
    return docRef.id;
  },
  async update(id: string, session: Partial<Session>): Promise<void> {
    await updateDoc(doc(db, SESSIONS_COLLECTION, id), session);
  },
  async remove(id: string): Promise<void> {
    await deleteDoc(doc(db, SESSIONS_COLLECTION, id));
  },
  async set(id: string, session: Session): Promise<void> {
    await setDoc(doc(db, SESSIONS_COLLECTION, id), session);
  }
};
