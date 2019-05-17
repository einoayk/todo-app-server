export const combineDocument = (doc: FirebaseFirestore.DocumentSnapshot) => {
  if (!doc.exists) {
    return null;
  }
  const data = { ...doc.data(), id: doc.id };
  return data;
};

export const combineDocumentBatch = (
  docs: FirebaseFirestore.DocumentSnapshot[]
) => {
  if (!docs) {
    return null;
  }
  const data = docs.map(combineDocument);
  return data;
};

export const combineCollectionSnapshot = (
  snapshot: FirebaseFirestore.QuerySnapshot
) => {
  if (snapshot.empty) {
    return null;
  }
  const { docs } = snapshot;
  const data = combineDocumentBatch(docs);
  return data;
};
