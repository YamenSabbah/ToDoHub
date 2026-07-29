import { buildSchema } from 'graphql';

export const schema = buildSchema(`
    type User {
    id: ID!
    username: String!
    email: String!
} 
  type Task {
    id: ID!
    userId: ID!
    name: String!
    description: String!
    day: Day!
    isCompleted: Boolean!
    createdAt: String!
}
type Authpayload {
    token: String!
    user: User!
}   

type Query {
  getUser: User!
  getAllTasks: [Task!]!
}

type Mutation {
  register(name: String!, email: String!, password: String!): Authpayload!
  login(email: String!, password: String!): Authpayload!
  logout: String!
  createTask(name: String!, description: String!, day: Day!): Task!
  updateTaskChecked(id: ID!, isCompleted: Boolean!): Task!
  editTask(id: ID!, name: String!, description: String!, day: Day!): Task!
  deleteTask(id: ID!): String!
}

enum Day {
    Sunday
    Monday
    Tuesday
    Wednesday
    Thursday
    Friday
    Saturday
}
    
    
    
    
    
    
    
    
    
    
`);