import { gql } from 'apollo-server';

export const typeDefs = gql`
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
