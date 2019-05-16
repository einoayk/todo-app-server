import { ApolloServer, gql } from 'apollo-server';
import * as admin from 'firebase-admin';

const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

interface User {
  id: string;
  email: string;
  displayName: string;
}

interface Project {
  id: string;
  name: string;
  isReady: boolean;
  text: string;
  userId: string;
}

interface Context {
  userId?: string;
}

const typeDefs = gql`
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
    async todoProjects(root, args: null, context) {
      if (!context) {
        throw new Error('Not authorized.');
      }

      const todoProjects = await admin
        .firestore()
        .collection('Projects')
        .where('isReady', '==', false)
        .where('userId', '==', context.userId)
        .get();

      return todoProjects.docs.map(project => project.data()) as Project[];
    },
    async completedProjects(root, args: null, context) {
      if (!context) {
        throw new Error('Not authorized.');
      }

      const completedProjects = await admin
        .firestore()
        .collection('Projects')
        .where('isReady', '==', true)
        .where('userId', '==', context.userId)
        .get();

      return completedProjects.docs.map(project => project.data()) as Project[];
    }
  },
  Mutation: {
    async addProject(root, args: { name: string; text: string }, context) {
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
