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
  projects: Project;
}

interface Project {
  id: string;
  name: string;
  isReady: boolean;
  text: string;
  userId: string;
}

const typeDefs = gql`
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

  #type Mutation {
  # addProject(userId: String!, name: String!, text: String!): Project
  #}
`;

const resolvers = {
  Query: {
    async projects() {
      const projects = await admin
        .firestore()
        .collection('Projects')
        .get();

      return projects.docs.map(project => project.data()) as Project[];
    },
    async todoProjects() {
      const todoProjects = await admin
        .firestore()
        .collection('Projects')
        .where('isReady', '==', true)
        .get();

      return todoProjects.docs.map(project => project.data()) as Project[];
    },
    async completedProjects() {
      const completedProjects = await admin
        .firestore()
        .collection('Projects')
        .where('isReady', '==', false)
        .get();

      return completedProjects.docs.map(project => project.data()) as Project[];
    }
  }
  //Mutation: {
  //async addProject(args: { userId: string; name: string; text: string }) {}
  // }
};

const server = new ApolloServer({ typeDefs, resolvers, introspection: true });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
