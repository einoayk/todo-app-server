export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface Project {
  id: string;
  name: string;
  isReady: boolean;
  text: string;
}
export interface Context {
  userId?: string;
}
