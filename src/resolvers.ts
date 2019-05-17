import * as admin from 'firebase-admin';
import { combineCollectionSnapshot, combineDocument } from './firestore';

export const resolvers = {
  Project: {
    async userId(context) {
      if (!context) {
        throw new Error('Not authorized.');
      }
      return context.userId;
    }
  },
  Query: {
    async todoProjects(root, args: null, context) {
      if (!context) {
        throw new Error('Not authorized.');
      }

      const snapshot = await admin
        .firestore()
        .collection('Projects')
        .where('isReady', '==', false)
        .where('userId', '==', context.userId)
        .get();

      const todoProjects = combineCollectionSnapshot(snapshot);

      return todoProjects;
    },
    async completedProjects(root, args: null, context) {
      if (!context) {
        throw new Error('Not authorized.');
      }

      const snapshot = await admin
        .firestore()
        .collection('Projects')
        .where('isReady', '==', true)
        .where('userId', '==', context.userId)
        .get();

      const completedProjects = combineCollectionSnapshot(snapshot);

      return completedProjects;
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
    },
    async markProjectAsCompleted(root, args: { projectId: string }, context) {
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

      const project = combineDocument(document);

      return project;
    },
    async deleteProject(root, args: { projectId: string }, context) {
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
