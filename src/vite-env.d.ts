/// <reference types="svelte" />
/// <reference types="vite/client" />

export interface User {
  avatar: string
  collectionId: string
  collectionName: string
  created: string
  description: string
  displayName: string
  email: string
  emailVisibility: boolean
  games: Game[]
  id: string
  updated: string
  username: string
  verified: boolean
}

export interface Game {
  exePath: string
  favorite: boolean
  id: number
  imagePath: string
  iop: string
  name: string
}
