import anchor from '@coral-xyz/anchor'

export type CreateProjectForm = {
  title: string
  description: string
  amountGoal: number
  goalExpiresAt: string
}

export type CreateProject = {
  title: string
  description: string
  amountGoal: number
  goalExpiresAt: Date
}

export interface Project {
  publicKey: anchor.web3.PublicKey
  owner: anchor.web3.PublicKey
  title: string
  description: string
  amountGoal: anchor.BN
  amountCollected: anchor.BN
  goalExpiresAt: Date
  closedAt: Date | null
  createdAt: Date
  bump: number
  contributionIdCounter: anchor.BN
}

export interface Contribution {
  publicKey: anchor.web3.PublicKey
  contributor: anchor.web3.PublicKey
  project: anchor.web3.PublicKey
  amount: anchor.BN
  createdAt: Date
}

export type ContributeForm = {
  amount: number
}

export type Contribute = {
  projectPK: anchor.web3.PublicKey
  amount: number
}

export type ClaimCollected = {
  projectPK: anchor.web3.PublicKey
}
