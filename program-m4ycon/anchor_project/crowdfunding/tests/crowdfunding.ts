import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Crowdfunding } from '../target/types/crowdfunding'
import {
    airdrop,
    checkProject,
    CreateProject,
    getContributionAddress,
    getProjectAddress,
    prepareClaim,
    prepareContribution,
    prepareProject,
    PROJECT_SPACE,
} from './testUtils'
import dayjs from 'dayjs'
import { assert } from 'chai'

describe('crowdfunding', () => {
    const provider = anchor.AnchorProvider.env()
    anchor.setProvider(provider)

    const program = anchor.workspace.crowdfunding as Program<Crowdfunding>

    const bob = anchor.web3.Keypair.generate()
    const alice = anchor.web3.Keypair.generate()

    let projectRentExemption: number

    before('prepare', async () => {
        await airdrop(
            provider.connection,
            bob.publicKey,
            anchor.web3.LAMPORTS_PER_SOL * 10
        )
        await airdrop(
            provider.connection,
            alice.publicKey,
            anchor.web3.LAMPORTS_PER_SOL * 10
        )

        projectRentExemption =
            await provider.connection.getMinimumBalanceForRentExemption(
                PROJECT_SPACE
            )
    })

    describe('initialize project', () => {
        it('should initialize project', async () => {
            const project: CreateProject = {
                title: 'title',
                amountGoal: new anchor.BN(1000000000),
                description: 'description',
                goalExpiresAt: new anchor.BN(dayjs().add(1, 'day').unix()),
            }

            const [project_pkey, project_bump] = getProjectAddress(
                project.title,
                bob.publicKey,
                program.programId
            )

            await program.methods
                .initializeProject(project)
                .accounts({
                    projectOwner: bob.publicKey,
                    project: project_pkey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([bob])
                .rpc()

            await checkProject(program, project_pkey, {
                owner: bob.publicKey,
                title: project.title,
                description: project.description,
                amountGoal: project.amountGoal,
                amountCollected: new anchor.BN(0),
                goalExpiresAt: project.goalExpiresAt,
                closedAt: null,
                bump: project_bump,
            })
        })

        it('should not be able to initialize project if title is too long', async () => {
            try {
                await prepareProject(program, bob, { title: 'c'.repeat(33) })
                assert.fail()
            } catch (_err) {
                assert.ok(true)
            }
        })

        it('should not be able to initialize project if description is too long', async () => {
            try {
                await prepareProject(program, bob, {
                    description: 'c'.repeat(501),
                })
                assert.fail()
            } catch (_err) {
                const err = _err as anchor.AnchorError
                assert.strictEqual(
                    err.error.errorCode.code,
                    'DescriptionTooLong'
                )
            }
        })

        it('should not be able to initialize project if goal is not enough', async () => {
            try {
                await prepareProject(program, bob, {
                    amountGoal: new anchor.BN(0),
                })
                assert.fail()
            } catch (_err) {
                const err = _err as anchor.AnchorError
                assert.strictEqual(
                    err.error.errorCode.code,
                    'GoalMustBeGreaterThanZero'
                )
            }
        })

        it('should not be able to initialize project if expires at is in the past', async () => {
            try {
                await prepareProject(program, bob, {
                    goalExpiresAt: new anchor.BN(
                        dayjs().subtract(1, 'day').unix()
                    ),
                })
                assert.fail()
            } catch (_err) {
                const err = _err as anchor.AnchorError
                assert.strictEqual(
                    err.error.errorCode.code,
                    'ExpiresAtMustBeGreaterThanNow'
                )
            }
        })
    })

    describe('contribute', () => {
        it('should be able to contribute to a project', async () => {
            const project_pkey = await prepareProject(program, bob)

            const amount = new anchor.BN(10000)
            const [contribution_pkey] = await getContributionAddress(
                program,
                bob.publicKey,
                amount,
                project_pkey,
                program.programId
            )

            await program.methods
                .contribute(amount)
                .accounts({
                    contributor: bob.publicKey,
                    project: project_pkey,
                    contribution: contribution_pkey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([bob])
                .rpc()

            const projectData = await program.account.project.fetch(
                project_pkey
            )
            const contributionData = await program.account.contribution.fetch(
                contribution_pkey
            )

            assert.strictEqual(
                projectData.amountCollected.toString(),
                contributionData.amount.toString()
            )

            const project_balance = await provider.connection.getBalance(
                project_pkey
            )
            assert.strictEqual(
                project_balance,
                contributionData.amount.toNumber() + projectRentExemption
            )
        })

        it('should not be able to contribute to a closed project', async () => {
            const goal = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL)
            const project_pkey = await prepareProject(program, bob, {
                amountGoal: goal,
            })
            await prepareContribution(program, project_pkey, bob, goal)
            await prepareClaim(program, project_pkey, bob)

            try {
                await prepareContribution(
                    program,
                    project_pkey,
                    bob,
                    new anchor.BN(1000000)
                )
                assert.fail()
            } catch (_err) {
                const err = _err as anchor.AnchorError
                assert.strictEqual(err.error.errorCode.code, 'AlreadyClosed')
            }
        })

        it('should not be able to contribute zero to a project', async () => {
            const goal = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL)
            const project_pkey = await prepareProject(program, bob, {
                amountGoal: goal,
            })

            try {
                await prepareContribution(
                    program,
                    project_pkey,
                    bob,
                    new anchor.BN(0)
                )
                assert.fail()
            } catch (_err) {
                const err = _err as anchor.AnchorError
                assert.strictEqual(
                    err.error.errorCode.code,
                    'AmountMustBeGreaterThanZero'
                )
            }
        })
    })

    describe('claim', () => {
        it('should be able to claim a project', async () => {
            // prepare project
            const goal = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL)
            const project_pkey = await prepareProject(program, bob, {
                amountGoal: goal,
            })

            // contribute
            await prepareContribution(program, project_pkey, bob, goal)

            assert.strictEqual(
                await provider.connection.getBalance(project_pkey),
                goal.toNumber() + projectRentExemption
            )

            // claim
            const userBalanceBeforeClaim = await provider.connection.getBalance(
                bob.publicKey
            )

            await program.methods
                .claimCollected()
                .accounts({
                    owner: bob.publicKey,
                    project: project_pkey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([bob])
                .rpc()

            const projectData = await program.account.project.fetch(
                project_pkey
            )

            assert.strictEqual(
                projectData.amountCollected.toString(),
                goal.toString()
            )
            assert.strictEqual(
                await provider.connection.getBalance(project_pkey),
                projectRentExemption
            )
            assert.isTrue(
                (await provider.connection.getBalance(bob.publicKey)) ===
                    userBalanceBeforeClaim + goal.toNumber()
            )
            assert.isDefined(projectData.closedAt.toString())
        })

        it('should not be able to claim as its not owner', async () => {
            // prepare project
            const goal = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL)
            const project_pkey = await prepareProject(program, bob, {
                amountGoal: goal,
            })

            // contribute
            await prepareContribution(program, project_pkey, bob, goal)

            // claim
            try {
                await program.methods
                    .claimCollected()
                    .accounts({
                        owner: alice.publicKey,
                        project: project_pkey,
                        systemProgram: anchor.web3.SystemProgram.programId,
                    })
                    .signers([alice])
                    .rpc()
                assert.fail()
            } catch (_err) {
                const err = _err as anchor.AnchorError
                assert.strictEqual(err.error.errorCode.code, 'ConstraintRaw')
            }
        })

        it('should not be able to claim twice as its already closed', async () => {
            // prepare project
            const goal = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL)
            const project_pkey = await prepareProject(program, bob, {
                amountGoal: goal,
            })

            // contribute
            await prepareContribution(program, project_pkey, bob, goal)

            // claim
            await prepareClaim(program, project_pkey, bob)

            // second claim
            try {
                await prepareClaim(program, project_pkey, bob)
                assert.fail()
            } catch (_err) {
                const err = _err as anchor.AnchorError
                assert.strictEqual(err.error.errorCode.code, 'AlreadyClosed')
            }
        })

        it('should not be able to claim as it didnt reach the goal', async () => {
            // prepare project
            const goal = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL)
            const project_pkey = await prepareProject(program, bob, {
                amountGoal: goal,
            })

            // contribute
            await prepareContribution(
                program,
                project_pkey,
                bob,
                goal.div(new anchor.BN(2))
            )

            // claim
            try {
                await prepareClaim(program, project_pkey, bob)
                assert.fail()
            } catch (_err) {
                const err = _err as anchor.AnchorError
                assert.strictEqual(err.error.errorCode.code, 'TooEarlyToClaim')
            }
        })
    })
})
