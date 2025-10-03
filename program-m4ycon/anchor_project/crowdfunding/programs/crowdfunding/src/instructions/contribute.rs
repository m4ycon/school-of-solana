use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction::transfer;

use crate::errors::CrowdfundingError;
use crate::states::*;

pub fn _contribute(ctx: Context<ContributeContext>, amount: u64) -> Result<()> {
    let project = &mut ctx.accounts.project;
    let contributor = &mut ctx.accounts.contributor;

    require!(amount > 0, CrowdfundingError::AmountMustBeGreaterThanZero);
    require!(
        project.closed_at.is_none(),
        CrowdfundingError::AlreadyClosed
    );

    let contribution = &mut ctx.accounts.contribution;
    contribution.contributor = contributor.key();
    contribution.project = project.key();
    contribution.amount = amount;
    contribution.created_at = Clock::get()?.unix_timestamp;
    contribution.bump = ctx.bumps.contribution;

    project.contribution_id_counter += 1;
    project.amount_collected += amount;

    let instruction = transfer(&contributor.key(), &project.key(), amount);
    invoke(
        &instruction,
        &[
            project.to_account_info(),
            contributor.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct ContributeContext<'info> {
    #[account(mut)]
    pub contributor: Signer<'info>,

    #[account(mut)]
    pub project: Account<'info, Project>,

    #[account(
        init,
        payer = contributor,
        space = 8 + Contribution::INIT_SPACE,
        seeds = [
            CONTRIBUTION_SEED.as_bytes(),
            contributor.key().as_ref(),
            amount.to_le_bytes().as_ref(),
            project.key().as_ref(),
            project.contribution_id_counter.to_le_bytes().as_ref(),
        ],
        bump,
    )]
    pub contribution: Account<'info, Contribution>,

    pub system_program: Program<'info, System>,
}
