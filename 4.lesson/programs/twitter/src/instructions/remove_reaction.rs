//-------------------------------------------------------------------------------
///
/// TASK: Implement the remove reaction functionality for the Twitter program
///
/// Requirements:
/// - Verify that the tweet reaction exists and belongs to the reaction author
/// - Decrement the appropriate counter (likes or dislikes) on the tweet
/// - Close the tweet reaction account and return rent to reaction author
///
///-------------------------------------------------------------------------------
use anchor_lang::prelude::*;

use crate::errors::TwitterError;
use crate::states::*;

pub fn remove_reaction(ctx: Context<RemoveReactionContext>) -> Result<()> {
    let tweet_reaction = &mut ctx.accounts.tweet_reaction;
    let tweet = &mut ctx.accounts.tweet;

    match tweet_reaction.reaction {
        ReactionType::Like => {
            tweet.likes = match tweet.likes.checked_sub(1) {
                Some(likes) => likes,
                None => return Err(TwitterError::MinLikesReached.into()),
            };
        }
        ReactionType::Dislike => {
            tweet.dislikes = match tweet.dislikes.checked_sub(1) {
                Some(dislikes) => dislikes,
                None => return Err(TwitterError::MinDislikesReached.into()),
            };
        }
    };

    Ok(())
}

#[derive(Accounts)]
pub struct RemoveReactionContext<'info> {
    #[account(mut)]
    pub reaction_author: Signer<'info>,

    #[account(
        mut,
        close = reaction_author,
        constraint = tweet_reaction.reaction_author == reaction_author.key(),
    )]
    pub tweet_reaction: Account<'info, Reaction>,

    #[account(mut)]
    pub tweet: Account<'info, Tweet>,
}
