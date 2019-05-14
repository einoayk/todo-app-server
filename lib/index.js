"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const admin = require("firebase-admin");
const serviceAccount = require('../service-account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const typeDefs = apollo_server_1.gql `
  type Project {
    id: ID!
    name: String!
    isReady: Boolean!
    text: String!
  }

  type Query {
    projects: [Project]
    todoProjects: [Project]
    completedProjects: [Project]
  }
`;
const resolvers = {
    Query: {
        async projects() {
            const projects = await admin
                .firestore()
                .collection('Projects')
                .get();
            return projects.docs.map(project => project.data());
        },
        async todoProjects() {
            const todoProjects = await admin
                .firestore()
                .collection('Projects')
                .where('isReady', '==', true)
                .get();
            return todoProjects.docs.map(project => project.data());
        },
        async completedProjects() {
            const completedProjects = await admin
                .firestore()
                .collection('Projects')
                .where('isReady', '==', false)
                .get();
            return completedProjects.docs.map(project => project.data());
        }
    }
};
const server = new apollo_server_1.ApolloServer({ typeDefs, resolvers, introspection: true });
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
//# sourceMappingURL=index.js.map