use crate::instructions::*;
use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod states;

declare_id!("2YwZqidKUCJvQxpcuyqii4eT9hsPJcUbjZUZZVXukHVU");

#[program]
pub mod crowdfunding {
    use super::*;

    pub fn initialize_project(
        ctx: Context<InitializeProjectContext>,
        args: InitializeProjectArgs,
    ) -> Result<()> {
        _initialize_project(ctx, args)
    }

    pub fn contribute(ctx: Context<ContributeContext>, amount: u64) -> Result<()> {
        _contribute(ctx, amount)
    }

    pub fn claim_collected(ctx: Context<ClaimCollectedContext>) -> Result<()> {
        _claim_collected(ctx)
    }
}
