"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const admin = require("firebase-admin");
const firestore_1 = require("./firestore");
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
    markProjectAsCompleted(projectId: String!): Project
    deleteProject(projectId: String!): String
  }
`;
const resolvers = {
    Project: {
        async userId(context) {
            if (!context) {
                throw new Error('Not authorized.');
            }
            return context.userId;
        }
    },
    Query: {
        async todoProjects(root, args, context) {
            if (!context) {
                throw new Error('Not authorized.');
            }
            const snapshot = await admin
                .firestore()
                .collection('Projects')
                .where('isReady', '==', false)
                .where('userId', '==', context.userId)
                .get();
            const todoProjects = firestore_1.combineCollectionSnapshot(snapshot);
            return todoProjects;
        },
        async completedProjects(root, args, context) {
            if (!context) {
                throw new Error('Not authorized.');
            }
            const snapshot = await admin
                .firestore()
                .collection('Projects')
                .where('isReady', '==', true)
                .where('userId', '==', context.userId)
                .get();
            const completedProjects = firestore_1.combineCollectionSnapshot(snapshot);
            return completedProjects;
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
        },
        async markProjectAsCompleted(root, args, context) {
            if (!context) {
                throw new Error('Not authorized.');
            }
            console.log(args.projectId);
            const ref = await admin
                .firestore()
                .collection('Projects')
                .doc(args.projectId);
            await ref.set({ isReady: true }, { merge: true });
            const document = await ref.get();
            const project = firestore_1.combineDocument(document);
            return project;
        },
        async deleteProject(root, args, context) {
            if (!context) {
                throw new Error('Not authorized.');
            }
            await admin
                .firestore()
                .collection('Projects')
                .doc(args.projectId)
                .delete();
            return args.projectId;
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