import { ApolloServer } from 'apollo-server';
import * as admin from 'firebase-admin';
import { resolvers } from './resolvers';
import { typeDefs } from './typedefenitions';

const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    if (!req.headers.authorization) {
      return {};
    } else {
      const token = req.headers.authorization.split('Bearer ')[1];
      const decoded = await admin.auth().verifyIdToken(token);
      const userId = decoded.uid;
      return { userId };
    }
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
