import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import {
  collection,
  query,
  getDocs,
  where,
  onSnapshot,
} from "firebase/firestore";

export function useBiblosData() {
  const [entities, setEntities] = useState([]);
  const [status, setStatus] = useState("loading"); // loading, connected, error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let unsubscribe = () => {};

    const loadData = async () => {
      try {
        const q = query(collection(db, "entities"));

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setEntities(data);
            setStatus("connected");
          },
          (err) => {
            console.error("Firestore Error:", err);
            setStatus("error");
            setErrorMsg(err.message);
          }
        );
      } catch (err) {
        console.error("Setup Error:", err);
        setStatus("error");
        setErrorMsg(err.message);
      }
    };

    loadData();

    return () => unsubscribe();
  }, []);

  const fetchVerses = async (entityId) => {
    try {
      const q = query(
        collection(db, "verses"),
        where("tags", "array-contains", entityId)
      );
      const snap = await getDocs(q);
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Fetch Verses Error:", err);
      return [];
    }
  };

  return { entities, status, errorMsg, fetchVerses };
}
