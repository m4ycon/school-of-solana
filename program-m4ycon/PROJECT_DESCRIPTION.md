# Project Description

**Deployed Frontend URL:** https://solana-program-six.vercel.app/

**Solana Program ID:** 2YwZqidKUCJvQxpcuyqii4eT9hsPJcUbjZUZZVXukHVU (devnet)

## Project Overview

### Description

This is a decentralized crowdfunding dApp built on Solana using the Anchor framework. It allows users to create crowdfunding projects to raise SOL for specific goals, such as ideas, causes, or initiatives. Each project includes a title (up to 32 characters), a detailed description (up to 500 characters), a funding goal in lamports (must be greater than 0), and an expiration timestamp (must be in the future).

Projects start in an open state where any user can contribute SOL. Contributions are recorded in individual accounts for transparency and to allow multiple donations from the same contributor. The project tracks the total amount collected and increments a contribution counter with each donation.

The project owner can claim the collected funds under two conditions:

- The total collected amount meets or exceeds the goal.
- The project has expired (current timestamp >= expiration timestamp).

Upon claiming, the collected lamports are transferred to the owner's wallet, and the project is marked as closed. Notably, if the project expires without reaching the goal, the owner can still claim whatever funds were collected (no refunds to contributors).

### Key Features

- **Project Creation**: Users can initialize projects with customizable parameters, ensuring uniqueness via PDAs based on title and owner.
- **Contributions**: Any user can donate SOL to an active project, with each contribution stored in a separate account for auditability.
- **Claiming**: Project owners can withdraw collected funds once the goal is met or the project expires, closing the project to prevent further interactions.
- **Transparency**: All data (e.g., collected amounts, timestamps) is stored on-chain in readable accounts, also they aren't closed on claim.

### How to Use the dApp

1. **Connect Wallet**
2. **To create a project**
    1. Use the button on upper right
    2. Fill fields, submit and sign with your wallet
3. On home page there will be a list of projects, in the upper right of each card there will be a **set of buttons**
    1. History button, you can check the contributions that have been made to that project
    2. Contribute button, you can place a value to contribute to the selected project
    3. Claim button, if some conditions are met, including you being the owner, you can claim the value collected and close the project

## Program Architecture
The program is structured using Anchor's framework, with modular instructions, states, and errors. The main entry point is `lib.rs`, which declares the program ID and exports instructions. Instructions are separated into files (`initialize_project.rs`, `contribute.rs`, `claim_collected.rs`) for clarity.

Data flow:
- **Initialization:** User signs to create a project PDA account, storing metadata and initializing counters/amounts to zero.
- **Contribution:** Contributor transfers SOL to the project account, updates `amount_collected`, increments the counter, and creates a contribution PDA for record-keeping.
- **Claiming:** Owner checks conditions, transfers collected SOL back to themselves (minus rent exemption), and sets the project as closed.

### PDA Usage

**PDAs Used:**
- **Project PDA:** Seeds = `[title.as_bytes(), "project".as_bytes(), owner.key().as_ref()]`. Purpose: Unique per owner and title to avoid duplicates; stores project metadata and acts as the escrow for collected funds.
- **Contribution PDA:** Seeds = `["contribution".as_bytes(), contributor.key().as_ref(), amount.to_le_bytes().as_ref(), project.key().as_ref(), contribution_id_counter.to_le_bytes().as_ref()]`. Purpose: Unique per contribution (allows multiple from same user with different amounts or via counter); records individual donations for transparency.

### Program Instructions
**Instructions Implemented:**
- **initialize_project:** Creates a new project account with provided args (title, description, amount_goal, goal_expires_at). Validates inputs (lengths, `goal > 0`, `expires > now`). Initializes fields like owner, amounts, timestamps, and bump.
- **contribute:** Transfers SOL from contributor to project, creates a contribution account, updates project's collected amount and counter. Validates `amount > 0` and project not closed.
- **claim_collected:** Transfers collected SOL from project to owner if goal met or expired. Validates owner, project not closed, conditions met, and sufficient funds (after rent). Sets closed_at timestamp.

### Account Structure
```rust
#[account]
#[derive(InitSpace)]
pub struct Project {
    pub owner: Pubkey,              // Project creator's public key
    #[max_len(TITLE_LENGTH)]        // TITLE_LENGTH = 32
    pub title: String,              // Project title
    #[max_len(DESCRIPTION_LENGTH)]  // DESCRIPTION_LENGTH = 500
    pub description: String,        // Project description
    pub amount_goal: u64,           // Target funding amount in lamports
    pub amount_collected: u64,      // Current collected amount in lamports
    pub goal_expires_at: i64,       // Unix timestamp when project expires
    pub closed_at: Option<i64>,     // Unix timestamp when closed (None if open)
    pub created_at: i64,            // Unix timestamp of creation
    pub bump: u8,                   // PDA bump seed
    pub contribution_id_counter: u64, // Counter for unique contributions
}
```

```rust
#[account]
#[derive(InitSpace)]
pub struct Contribution {
    pub contributor: Pubkey,        // Donor's public key
    pub project: Pubkey,            // Associated project public key
    pub amount: u64,                // Donated amount in lamports
    pub created_at: i64,            // Unix timestamp of contribution
    pub bump: u8,                   // PDA bump seed
}
```

## Testing

### Test Coverage
Tests are written in TypeScript using Anchor's testing framework and Mocha. They cover initialization, contributions, and claiming, with assertions on account data, balances, and errors. Utilities like `prepareProject`, `prepareContribution`, and `prepareClaim` simplify setup.

**Happy Path Tests:**
- Initialize a project with valid parameters and verify all fields (owner, title, etc.).
- Contribute to a project, verify updated amounts, new contribution account, and balance transfer.
- Claim funds after reaching goal, verify transfer, closed status, and rent exemption remains.

**Unhappy Path Tests:**
- Initialize with title > 32 chars (fails with `TitleTooLong`).
- Initialize with description > 500 chars (fails with `DescriptionTooLong`).
- Initialize with goal = 0 (fails with `GoalMustBeGreaterThanZero`).
- Initialize with past expiration (fails with `ExpiresAtMustBeGreaterThanNow`).
- Contribute amount = 0 (fails with `AmountMustBeGreaterThanZero`).
- Contribute to closed project (fails with `AlreadyClosed`).
- Claim as non-owner (fails with `ConstraintRaw`).
- Claim twice on closed project (fails with `AlreadyClosed`).
- Claim before goal or expiration (fails with `TooEarlyToClaim`).

### Running Tests
```bash
# Commands to run your tests
anchor test
```

### Additional Notes for Evaluators

- Just that if I had more time I would come up with some instructions for **really** closing the accounts, after a given time.
- Frontend was a little "go horse" style hehe
