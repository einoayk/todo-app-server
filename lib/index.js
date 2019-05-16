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
    userId: ID!
  }

  type User {
    id: ID!
    email: String!
    displayName: String!
  }

  type Query {
    todoProjects: [Project]
    completedProjects: [Project]
  }

  type Mutation {
    addProject(name: String!, text: String!): Project
  }
`;
const resolvers = {
    Project: {
        async userId(context) {
            if (!context) {
                throw new Error('Not authorized.');
            }
            return context;
        }
    },
    Query: {
        async todoProjects(root, args, context) {
            if (!context) {
                throw new Error('Not authorized.');
            }
            const todoProjects = await admin
                .firestore()
                .collection('Projects')
                .where('isReady', '==', false)
                .where('userId', '==', context.userId)
                .get();
            return todoProjects.docs.map(project => project.data());
        },
        async completedProjects(root, args, context) {
            if (!context) {
                throw new Error('Not authorized.');
            }
            const completedProjects = await admin
                .firestore()
                .collection('Projects')
                .where('isReady', '==', true)
                .where('userId', '==', context.userId)
                .get();
            return completedProjects.docs.map(project => project.data());
        }
    },
    Mutation: {
        async addProject(root, args, context) {
            console.log('context', context.userId);
            if (!context) {
                throw new Error('Not authorized.');
            }
            const newProject = {
                name: args.name,
                isReady: false,
                text: args.text,
                userId: context.userId
            };
            await admin
                .firestore()
                .collection('Projects')
                .add(newProject);
            return newProject;
        }
    }
};
const server = new apollo_server_1.ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        if (!req.headers.authorization) {
            return {};
        }
        else {
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
//# sourceMappingURL=index.js.map