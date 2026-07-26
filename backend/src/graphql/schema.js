import { buildSchema } from 'graphql';

export const schema = buildSchema(`
type Query {
  getUser: User!
}
  type User {
    id: ID!
    username: String!
    email: String!
    password: String!
    tasks: [Task!]!
} 
  type Task {
    id: ID!
    userId: ID!
    name: String!
    description: String!
    day: String!
    isCompleted: Boolean!
    createdAt: String!
}
type Authpayload {
    token: String!
    user: User!
}   
type Mutation {
  register(name: String!, email: String!, password: String!): Authpayload!
  login(email: String!, password: String!): Authpayload!
  logout: String!
}
    
    
    
    
    
    
    
    
    
    
    
`);