export enum Tags {
  USERS = 'Users',
  HEALTH = 'Health'
}

export const tags = [
  {
    name: Tags.USERS,
    description: 'Route to manage users'
  },
  {
    name: Tags.HEALTH,
    description: 'Application health and monitoring endpoints'
  }
]
