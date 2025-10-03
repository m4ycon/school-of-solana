use anchor_lang::prelude::*;

pub const TITLE_LENGTH: usize = 32;
pub const DESCRIPTION_LENGTH: usize = 500;

pub const PROJECT_SEED: &str = "project";
pub const CONTRIBUTION_SEED: &str = "contribution";

#[account]
#[derive(InitSpace)]
pub struct Project {
    pub owner: Pubkey,

    #[max_len(TITLE_LENGTH)]
    pub title: String,
    #[max_len(DESCRIPTION_LENGTH)]
    pub description: String,

    pub amount_goal: u64,
    pub amount_collected: u64,

    pub goal_expires_at: i64,
    pub closed_at: Option<i64>,

    pub created_at: i64,
    pub bump: u8,

    pub contribution_id_counter: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Contribution {
    pub contributor: Pubkey,
    pub project: Pubkey,
    pub amount: u64,

    pub created_at: i64,
    pub bump: u8,
}
