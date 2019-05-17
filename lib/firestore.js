"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
exports.combineDocument = (doc) => {
    if (!doc.exists) {
        return null;
    }
    const data = Object.assign({}, doc.data(), { id: doc.id });
    return data;
};
exports.combineDocumentBatch = (docs) => {
    if (!docs) {
        return null;
    }
    const data = docs.map(exports.combineDocument);
    return data;
};
exports.combineCollectionSnapshot = (snapshot) => {
    if (snapshot.empty) {
        return null;
    }
    const { docs } = snapshot;
    const data = exports.combineDocumentBatch(docs);
    return data;
};
exports.batchRequest = async (keys) => {
    const refs = keys.map(key => {
        const ref = admin.firestore().doc(key);
        return ref;
    });
    const docs = await admin.firestore().getAll(...refs);
    const items = exports.combineDocumentBatch(docs);
    return items;
};
//# sourceMappingURL=firestore.js.map