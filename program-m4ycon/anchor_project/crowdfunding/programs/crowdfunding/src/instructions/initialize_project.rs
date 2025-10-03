use anchor_lang::prelude::*;

use crate::errors::CrowdfundingError;
use crate::states::*;

pub fn _initialize_project(
    ctx: Context<InitializeProjectContext>,
    args: InitializeProjectArgs,
) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;

    require!(
        args.title.bytes().len() <= TITLE_LENGTH,
        CrowdfundingError::TitleTooLong
    );
    require!(
        args.description.bytes().len() <= DESCRIPTION_LENGTH,
        CrowdfundingError::DescriptionTooLong
    );
    require!(
        args.amount_goal > 0,
        CrowdfundingError::GoalMustBeGreaterThanZero
    );
    require!(
        args.goal_expires_at > now,
        CrowdfundingError::ExpiresAtMustBeGreaterThanNow
    );

    let project = &mut ctx.accounts.project;

    project.owner = ctx.accounts.project_owner.key();
    project.title = args.title;
    project.description = args.description;
    project.amount_goal = args.amount_goal;
    project.amount_collected = 0;
    project.goal_expires_at = args.goal_expires_at;
    project.closed_at = None;
    project.created_at = Clock::get()?.unix_timestamp;
    project.bump = ctx.bumps.project;
    project.contribution_id_counter = 0;

    Ok(())
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct InitializeProjectContext<'info> {
    #[account(mut)]
    pub project_owner: Signer<'info>,

    #[account(
        init,
        payer = project_owner,
        space = 8 + Project::INIT_SPACE,
        seeds = [title.as_bytes(), PROJECT_SEED.as_bytes(), project_owner.key().as_ref()],
        bump,
    )]
    pub project: Account<'info, Project>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct InitializeProjectArgs {
    pub title: String,
    pub description: String,
    pub amount_goal: u64,
    pub goal_expires_at: i64,
}
