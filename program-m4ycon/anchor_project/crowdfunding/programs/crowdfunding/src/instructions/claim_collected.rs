use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_lang::solana_program::system_instruction::transfer;

use crate::errors::CrowdfundingError;
use crate::states::*;

pub fn _claim_collected(ctx: Context<ClaimCollectedContext>) -> Result<()> {
    let project = &mut ctx.accounts.project;
    let owner = &mut ctx.accounts.owner;

    require!(
        project.closed_at.is_none(),
        CrowdfundingError::AlreadyClosed
    );
    require!(
        project.amount_collected >= project.amount_goal
            || Clock::get()?.unix_timestamp >= project.goal_expires_at,
        CrowdfundingError::TooEarlyToClaim
    );

    // ensure there will be enough lamports to transfer
    let rent = Rent::get()?.minimum_balance(8 + Project::INIT_SPACE);
    let project_lamports = **project.to_account_info().lamports.borrow();
    require!(
        project_lamports - rent > 0,
        CrowdfundingError::InsufficientFundsToClaim
    );

    // set as closed and transfer collected lamports to owner
    project.closed_at = Some(Clock::get()?.unix_timestamp);
    **project.to_account_info().try_borrow_mut_lamports()? -= project.amount_collected;
    **owner.to_account_info().try_borrow_mut_lamports()? += project.amount_collected;

    Ok(())
}

#[derive(Accounts)]
#[instruction()]
pub struct ClaimCollectedContext<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut, constraint = owner.key() == project.owner)]
    pub project: Account<'info, Project>,

    pub system_program: Program<'info, System>,
}
