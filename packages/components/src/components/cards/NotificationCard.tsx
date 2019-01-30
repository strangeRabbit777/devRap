import React from 'react'
import { StyleSheet, View } from 'react-native'

import {
  EnhancedGitHubNotification,
  getGitHubURLForRepo,
  getGitHubURLForRepoInvitation,
  getGitHubURLForSecurityAlert,
  getIssueOrPullRequestNumberFromUrl,
  getOwnerAndRepo,
  getUserAvatarByUsername,
  GitHubNotificationReason,
  isNotificationPrivate,
  trimNewLinesAndSpaces,
} from '@devhub/core'
import { contentPadding } from '../../styles/variables'
import { getNotificationReasonMetadata } from '../../utils/helpers/github/notifications'
import {
  getIssueIconAndColor,
  getNotificationIconAndColor,
  getPullRequestIconAndColor,
} from '../../utils/helpers/github/shared'
import { fixURL } from '../../utils/helpers/github/url'
import { SpringAnimatedView } from '../animated/spring/SpringAnimatedView'
import { useSpringAnimatedTheme } from '../context/SpringAnimatedThemeContext'
import { NotificationCardHeader } from './partials/NotificationCardHeader'
import { CommentRow } from './partials/rows/CommentRow'
import { CommitRow } from './partials/rows/CommitRow'
import { IssueOrPullRequestRow } from './partials/rows/IssueOrPullRequestRow'
import { ReleaseRow } from './partials/rows/ReleaseRow'
import { RepositoryRow } from './partials/rows/RepositoryRow'

export interface NotificationCardProps {
  notification: EnhancedGitHubNotification
  onlyOneRepository?: boolean
  repoIsKnown?: boolean
}

const styles = StyleSheet.create({
  container: {
    padding: contentPadding,
  },
})

export const NotificationCard = React.memo((props: NotificationCardProps) => {
  const { notification, onlyOneRepository } = props

  const springAnimatedTheme = useSpringAnimatedTheme()

  if (!notification) return null

  const {
    comment,
    id,
    repository: repo,
    saved,
    subject,
    unread,
    updated_at: updatedAt,
  } = notification

  if (!subject) return null

  const isRead = !unread
  const isSaved = saved === true
  const isPrivate = isNotificationPrivate(notification)

  const title = trimNewLinesAndSpaces(subject.title)

  const repoFullName =
    notification.repository.full_name || notification.repository.name || ''
  const { owner: repoOwnerName, repo: repoName } = getOwnerAndRepo(repoFullName)

  const subjectType = subject.type || ''

  const commit =
    notification.commit ||
    (subjectType === 'Commit' && {
      author: { avatar_url: '', login: '', html_url: '' },
      commit: {
        author: {
          name: '',
          email: '',
        },
        message: subject.title,
        url: subject.url,
      },
      url: subject.url,
    }) ||
    null

  const issue =
    notification.issue ||
    (subjectType === 'Issue' && {
      body: undefined,
      comments: undefined,
      state: undefined,
      title: subject.title,
      url: subject.latest_comment_url || subject.url,
      user: { avatar_url: '', login: '', html_url: '' },
    }) ||
    null

  const pullRequest =
    notification.pullRequest ||
    (subjectType === 'PullRequest' && {
      body: undefined,
      comments: undefined,
      state: undefined,
      title: subject.title,
      url: subject.latest_comment_url || subject.url,
      user: { avatar_url: '', login: '', html_url: '' },
    }) ||
    null

  const release =
    notification.release ||
    (subjectType === 'Release' && {
      author: { avatar_url: '', login: '', html_url: '' },
      body: '',
      name: subject.title,
      tag_name: '',
      url: subject.latest_comment_url || subject.url,
    }) ||
    null

  const isRepoInvitation = subjectType === 'RepositoryInvitation'
  const isVulnerabilityAlert = subjectType === 'RepositoryVulnerabilityAlert'

  const cardIconDetails = getNotificationIconAndColor(notification, (issue ||
    pullRequest ||
    undefined) as any)
  const cardIconName = cardIconDetails.icon
  const cardIconColor = cardIconDetails.color

  const { icon: pullRequestIconName, color: pullRequestIconColor } = pullRequest
    ? getPullRequestIconAndColor(pullRequest as any)
    : { icon: undefined, color: undefined }

  const { icon: issueIconName, color: issueIconColor } = issue
    ? getIssueIconAndColor(issue as any)
    : { icon: undefined, color: undefined }

  const issueOrPullRequestNumber =
    issue || pullRequest
      ? getIssueOrPullRequestNumberFromUrl((issue || pullRequest)!.url)
      : undefined

  // TODO: Show user actor + action text like activity events?
  const actor = {
    display_login: repoName,
    login: repoFullName,
    avatar_url: getUserAvatarByUsername(repoOwnerName || ''),
    html_url: repo.html_url || getGitHubURLForRepo(repoFullName),
  }
  const actionText = ''

  const isBot = Boolean(actor.login && actor.login.indexOf('[bot]') >= 0)

  const smallLeftColumn = false

  return (
    <SpringAnimatedView
      key={`notification-card-${id}-inner`}
      style={[
        styles.container,
        {
          backgroundColor: isRead
            ? springAnimatedTheme.backgroundColorDarker1
            : springAnimatedTheme.backgroundColor,
        },
      ]}
    >
      <NotificationCardHeader
        key={`notification-card-header-${id}`}
        actionText={actionText}
        avatarURL={actor && actor.avatar_url}
        cardIconColor={cardIconColor}
        cardIconName={cardIconName}
        date={updatedAt}
        ids={[id]}
        isBot={isBot}
        isPrivate={isPrivate}
        isRead={isRead}
        isSaved={isSaved}
        reason={notification.reason as GitHubNotificationReason}
        smallLeftColumn={smallLeftColumn}
        userLinkURL={actor.html_url || ''}
        username={actor.display_login || actor.login}
      />

      {!!(
        repoOwnerName &&
        repoName &&
        !onlyOneRepository &&
        !(
          (actor &&
            (actor.display_login === repoName || actor.login === repoName)) ||
          (actor.display_login === repoFullName || actor.login === repoFullName)
        )
      ) && (
        <RepositoryRow
          key={`notification-repo-row-${repo.id}`}
          isRead={isRead}
          ownerName={repoOwnerName}
          repositoryName={repoName}
          smallLeftColumn={smallLeftColumn}
        />
      )}

      {!!commit && (
        <CommitRow
          key={`notification-commit-row-${commit.url}`}
          authorEmail={commit.commit.author.email}
          authorName={commit.commit.author.name}
          authorUsername={commit.author && commit.author.login}
          isRead={isRead}
          latestCommentUrl={subject.latest_comment_url}
          message={commit.commit.message}
          smallLeftColumn={smallLeftColumn}
          url={commit.url || commit.commit.url}
        />
      )}

      {!!issue && (
        <IssueOrPullRequestRow
          key={`notification-issue-row-${issueOrPullRequestNumber}`}
          addBottomAnchor
          avatarURL={issue.user.avatar_url}
          commentsCount={issue.comments}
          iconColor={issueIconColor!}
          iconName={issueIconName!}
          isRead={isRead}
          issueOrPullRequestNumber={issueOrPullRequestNumber!}
          smallLeftColumn={smallLeftColumn}
          title={issue.title}
          url={issue.url}
          userLinkURL={issue.user.html_url || ''}
          username={issue.user.login || ''}
        />
      )}

      {!comment && !!(issue && issue.state === 'open' && issue.body) && (
        <CommentRow
          key={`notification-issue-body-${issue.id}`}
          avatarURL={issue.user.avatar_url}
          body={issue.body}
          isRead={isRead}
          smallLeftColumn={smallLeftColumn}
          url={issue.html_url}
          userLinkURL={issue.user.html_url || ''}
          username={issue.user.login}
        />
      )}

      {!!pullRequest && (
        <IssueOrPullRequestRow
          key={`notification-pr-row-${issueOrPullRequestNumber}`}
          addBottomAnchor
          avatarURL={pullRequest.user.avatar_url}
          commentsCount={pullRequest.comments}
          iconColor={pullRequestIconColor!}
          iconName={pullRequestIconName!}
          isRead={isRead}
          issueOrPullRequestNumber={issueOrPullRequestNumber!}
          smallLeftColumn={smallLeftColumn}
          title={pullRequest.title}
          url={pullRequest.url}
          userLinkURL={pullRequest.user.html_url || ''}
          username={pullRequest.user.login || ''}
        />
      )}

      {!comment &&
        !!(pullRequest && pullRequest.state === 'open' && pullRequest.body) && (
          <CommentRow
            key={`notification-pr-body-${pullRequest.id}`}
            avatarURL={pullRequest.user.avatar_url}
            body={pullRequest.body}
            isRead={isRead}
            smallLeftColumn={smallLeftColumn}
            url={pullRequest.html_url}
            userLinkURL={pullRequest.user.html_url || ''}
            username={pullRequest.user.login}
          />
        )}

      {!!release && (
        <ReleaseRow
          key={`notification-release-row-${repo.id}`}
          avatarURL={release.author.avatar_url}
          body={release.body}
          isRead={isRead}
          name={release.name || ''}
          ownerName={repoOwnerName!}
          repositoryName={repoName!}
          smallLeftColumn={smallLeftColumn}
          tagName={release.tag_name || ''}
          url={release.url}
          userLinkURL={release.author.html_url || ''}
          username={release.author.login || ''}
        />
      )}

      {!(commit || issue || pullRequest || release) && !!title && (
        <CommentRow
          key={`notification-${id}-comment-row`}
          avatarURL=""
          body={title}
          isRead={isRead}
          smallLeftColumn={smallLeftColumn}
          userLinkURL=""
          username=""
          url={
            isRepoInvitation && repo && repo.full_name
              ? getGitHubURLForRepoInvitation(repo.full_name)
              : isVulnerabilityAlert && repo && repo.full_name
              ? getGitHubURLForSecurityAlert(repo.full_name)
              : fixURL(subject.latest_comment_url || subject.url)
          }
        />
      )}

      {!!comment && (
        <CommentRow
          key={`notification-comment-row-${comment.id}`}
          addBottomAnchor
          avatarURL={comment.user.avatar_url}
          body={comment.body}
          isRead={isRead}
          smallLeftColumn={smallLeftColumn}
          url={comment.html_url}
          userLinkURL={comment.user.html_url || ''}
          username={comment.user.login}
        />
      )}
    </SpringAnimatedView>
  )
})
