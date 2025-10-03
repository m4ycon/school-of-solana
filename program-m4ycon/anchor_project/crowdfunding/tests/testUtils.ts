import * as anchor from '@coral-xyz/anchor'
import { PublicKey, Connection } from '@solana/web3.js'
import { Crowdfunding } from '../target/types/crowdfunding'
import { assert } from 'chai'
import dayjs from 'dayjs'

export const PROJECT_SEED = 'project'
export const CONTRIBUTION_SEED = 'contribution'

export const PROJECT_SPACE = 630 // 8 + 32 + 36 + 504 + 8 + 8 + 8 + 9 + 8 + 1 + 8

export type Project = {
    owner: anchor.web3.PublicKey
    title: string
    description: string
    amountGoal: anchor.BN
    amountCollected: anchor.BN
    goalExpiresAt: anchor.BN
    closedAt: anchor.BN
    createdAt: anchor.BN
    bump: number
}

export type CreateProject = {
    title: string
    description: string
    amountGoal: anchor.BN
    goalExpiresAt: anchor.BN
}

export async function airdrop(
    connection: Connection,
    address: PublicKey,
    amount = anchor.web3.LAMPORTS_PER_SOL
) {
    await connection.confirmTransaction(
        await connection.requestAirdrop(address, amount),
        'confirmed'
    )
}

export function getProjectAddress(
    title: string,
    owner: PublicKey,
    programID: PublicKey
) {
    return PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode(title),
            anchor.utils.bytes.utf8.encode(PROJECT_SEED),
            owner.toBuffer(),
        ],
        programID
    )
}

export async function getContributionAddress(
    program: anchor.Program<Crowdfunding>,
    contributor: PublicKey,
    amount: anchor.BN,
    project: PublicKey,
    programID: PublicKey
) {
    const projectData = await program.account.project.fetch(project)
    const contribution_id_count = new anchor.BN(
        projectData.contributionIdCounter
    )

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

export async function checkProject(
    program: anchor.Program<Crowdfunding>,
    project: PublicKey,
    expected: Partial<Project>
) {
    const projectData = await program.account.project.fetch(project)

    if (expected.owner) {
        assert.strictEqual(
            projectData.owner.toString(),
            expected.owner.toString()
        )
    }
    if (expected.title) {
        assert.strictEqual(projectData.title, expected.title)
    }
    if (expected.description) {
        assert.strictEqual(projectData.description, expected.description)
    }
    if (expected.amountGoal) {
        assert.strictEqual(
            projectData.amountGoal.toString(),
            expected.amountGoal.toString()
        )
    }
    if (expected.amountCollected) {
        assert.strictEqual(
            projectData.amountCollected.toString(),
            expected.amountCollected.toString()
        )
    }
    if (expected.goalExpiresAt) {
        assert.strictEqual(
            projectData.goalExpiresAt.toString(),
            expected.goalExpiresAt.toString()
        )
    }
    if (expected.closedAt) {
        assert.strictEqual(
            projectData.closedAt.toString(),
            expected.closedAt.toString()
        )
    } else {
        assert.strictEqual(projectData.closedAt, null)
    }
    if (expected.createdAt) {
        assert.strictEqual(
            projectData.createdAt.toString(),
            expected.createdAt.toString()
        )
    }
    if (expected.bump) {
        assert.strictEqual(projectData.bump, expected.bump)
    }
}

export async function prepareProject(
    program: anchor.Program<Crowdfunding>,
    owner: anchor.web3.Keypair,
    projectPartial: Partial<CreateProject> = {}
) {
    // create project
    const project: CreateProject = {
        title: projectPartial.title ?? Math.random().toString(),
        amountGoal:
            projectPartial.amountGoal ??
            new anchor.BN(anchor.web3.LAMPORTS_PER_SOL),
        description: projectPartial.description ?? 'description',
        goalExpiresAt:
            projectPartial.goalExpiresAt ??
            new anchor.BN(dayjs().add(1, 'day').unix()),
    }

    const [project_pkey] = getProjectAddress(
        project.title,
        owner.publicKey,
        program.programId
    )

    await program.methods
        .initializeProject(project)
        .accounts({
            projectOwner: owner.publicKey,
            project: project_pkey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([owner])
        .rpc()

    return project_pkey
}

export async function prepareContribution(
    program: anchor.Program<Crowdfunding>,
    project_pkey: PublicKey,
    contributor: anchor.web3.Keypair,
    amount: anchor.BN
) {
    const [contribution_pkey] = await getContributionAddress(
        program,
        contributor.publicKey,
        amount,
        project_pkey,
        program.programId
    )

    await program.methods
        .contribute(amount)
        .accounts({
            contributor: contributor.publicKey,
            project: project_pkey,
            contribution: contribution_pkey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([contributor])
        .rpc()
}

export async function prepareClaim(
    program: anchor.Program<Crowdfunding>,
    project_pkey: PublicKey,
    owner: anchor.web3.Keypair
) {
    await program.methods
        .claimCollected()
        .accounts({
            owner: owner.publicKey,
            project: project_pkey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([owner])
        .rpc()
}
