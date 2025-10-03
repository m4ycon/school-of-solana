import { PublicKey } from '@solana/web3.js'
import { useAnchorProgram } from './anchor'
import {
  ClaimCollected,
  Contribute,
  Contribution,
  CreateProject,
  Project,
} from './types'
import * as anchor from '@coral-xyz/anchor'
import { Crowdfunding } from '../idl/crowdfunding'
import { useWallet } from '@solana/wallet-adapter-react'
import dayjs from 'dayjs'

const PROJECT_SEED = 'project'
const CONTRIBUTION_SEED = 'contribution'

export const getProjectAddress = (
  title: string,
  owner: PublicKey,
  programID: PublicKey
) => {
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(title),
      anchor.utils.bytes.utf8.encode(PROJECT_SEED),
      owner.toBuffer(),
    ],
    programID
  )
}

export const getContributionAddress = async (
  program: anchor.Program<Crowdfunding>,
  contributor: PublicKey,
  amount: anchor.BN,
  project: PublicKey,
  programID: PublicKey
) => {
  const projectData = await program.account.project.fetch(project)
  const contribution_id_count = new anchor.BN(projectData.contributionIdCounter)

  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(CONTRIBUTION_SEED),
      contributor.toBuffer(),
      amount.toArrayLike(Buffer, 'le', 8),
      project.toBuffer(),
      contribution_id_count.toArrayLike(Buffer, 'le', 8),
    ],
    programID
  )
}

export function useCrowdfunding() {
  const { publicKey: userPK } = useWallet()
  const program = useAnchorProgram()
  const initialized = program !== null && userPK !== null

  const initProject = async (project: CreateProject): Promise<PublicKey> => {
    if (!initialized) throw new Error('Program not initialized')

    const [projectPK] = getProjectAddress(
      project.title,
      userPK,
      program.programId
    )

    console.log({
      userPK: userPK.toBase58(),
      projectPK: projectPK.toBase58(),
      programId: program.programId.toBase58(),
    })

    await program.methods
      .initializeProject(project)
      .accounts({
        projectOwner: userPK,
        project: projectPK,
        systemProgram: anchor.web3.SystemProgram.programId,
      // TODO: for some reason accounts are not typed correctly by anchor build
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .rpc({ commitment: 'confirmed' })

    return projectPK
  }

  const contribute = async ({
    amount,
    projectPK,
  }: Contribute): Promise<PublicKey> => {
    if (!initialized) throw new Error('Program not initialized')

    const amountLamports = new anchor.BN(amount * anchor.web3.LAMPORTS_PER_SOL)

    const [contributionPK] = await getContributionAddress(
      program,
      userPK,
      amountLamports,
      projectPK,
      program.programId
    )

    await program.methods
      .contribute(amountLamports)
      .accounts({
        contributor: userPK,
        project: projectPK,
        contribution: contributionPK,
        systemProgram: anchor.web3.SystemProgram.programId,
      // TODO: for some reason accounts are not typed correctly by anchor build
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .rpc({ commitment: 'confirmed' })

    return contributionPK
  }

  const claimCollected = async ({ projectPK }: ClaimCollected) => {
    if (!initialized) throw new Error('Program not initialized')

    await program.methods
      .claimCollected()
      .accounts({
        owner: userPK,
        project: projectPK,
        // systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc({ commitment: 'confirmed' })
  }

  const listProjects = async () => {
    if (!initialized) throw new Error('Program not initialized')

    const projectAccounts = await program.account.project.all()
    return projectAccounts
      .map(
        account =>
          <Project>{
            publicKey: account.publicKey,
            owner: account.account.owner,
            title: account.account.title,
            description: account.account.description,
            amountGoal: account.account.amountGoal,
            amountCollected: account.account.amountCollected,
            goalExpiresAt: dayjs(
              account.account.goalExpiresAt.toNumber() * 1000
            ).toDate(),
            closedAt: account.account.closedAt
              ? dayjs(account.account.closedAt.toNumber() * 1000).toDate()
              : null,
            createdAt: dayjs(
              account.account.createdAt.toNumber() * 1000
            ).toDate(),
            bump: account.account.bump,
            contributionIdCounter: account.account.contributionIdCounter,
          }
      )
      .toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  const listContributions = async (projectPK: PublicKey) => {
    if (!initialized) throw new Error('Program not initialized')

    const contributionAccounts = await program.account.contribution.all()
    return contributionAccounts
      .filter(contribution => contribution.account.project.equals(projectPK))
      .map(
        contribution =>
          <Contribution>{
            publicKey: contribution.publicKey,
            contributor: contribution.account.contributor,
            amount: contribution.account.amount,
            project: contribution.account.project,
            createdAt: dayjs(
              contribution.account.createdAt.toNumber() * 1000
            ).toDate(),
          }
      )
  }

  return {
    initialized,
    initProject,
    contribute,
    claimCollected,
    listProjects,
    listContributions,
  }
}
