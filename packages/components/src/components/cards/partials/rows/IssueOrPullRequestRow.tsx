import React from 'react'
import { Text, View } from 'react-native'

import {
  getDateSmallText,
  getFullDateText,
  getGitHubURLForUser,
  GitHubLabel,
  Omit,
  stripMarkdown,
  trimNewLinesAndSpaces,
} from '@devhub/core'
import { useCSSVariablesOrSpringAnimatedTheme } from '../../../../hooks/use-css-variables-or-spring--animated-theme'
import { Platform } from '../../../../libs/platform'
import { sharedStyles } from '../../../../styles/shared'
import { contentPadding, smallAvatarSize } from '../../../../styles/variables'
import { fixURL } from '../../../../utils/helpers/github/url'
import {
  SpringAnimatedIcon,
  SpringAnimatedIconProps,
} from '../../../animated/spring/SpringAnimatedIcon'
import { SpringAnimatedText } from '../../../animated/spring/SpringAnimatedText'
import { Avatar } from '../../../common/Avatar'
import { IntervalRefresh } from '../../../common/IntervalRefresh'
import { LabelProps } from '../../../common/Label'
import { Link } from '../../../common/Link'
import { Spacer } from '../../../common/Spacer'
import { cardStyles, getCardStylesForTheme } from '../../styles'
import { CardItemId } from '../CardItemId'
import { CardSmallThing } from '../CardSmallThing'
import { LabelsView } from './LabelsView'
import { BaseRow, BaseRowProps } from './partials/BaseRow'
import { cardRowStyles, innerCardSpacing } from './styles'

export interface IssueOrPullRequestRowProps
  extends Omit<
    BaseRowProps,
    'containerStyle' | 'contentContainerStyle' | 'left' | 'right'
  > {
  addBottomAnchor?: boolean
  avatarUrl: string | undefined
  backgroundThemeColor: LabelProps['backgroundThemeColor']
  body: string | undefined
  bold?: boolean
  commentsCount?: number
  createdAt: string | undefined
  hideIcon?: boolean
  hideLabelText?: boolean
  iconColor?: string
  iconName?: SpringAnimatedIconProps['name']
  id: string | number | undefined
  isPrivate: boolean
  isRead: boolean
  issueOrPullRequestNumber: number
  labels?: GitHubLabel[] | undefined
  owner: string
  repo: string
  showBodyRow: boolean
  showCreationDetails: boolean
  title: string
  updatedAt?: string | undefined
  url: string
  userLinkURL: string | undefined
  username: string | undefined
}

export const IssueOrPullRequestRow = React.memo(
  (props: IssueOrPullRequestRowProps) => {
    const springAnimatedTheme = useCSSVariablesOrSpringAnimatedTheme()

    const {
      addBottomAnchor,
      avatarUrl,
      backgroundThemeColor,
      body: _body,
      bold,
      commentsCount,
      createdAt,
      hideIcon,
      hideLabelText,
      iconColor,
      iconName = 'issue-opened',
      id,
      isPrivate,
      isRead,
      issueOrPullRequestNumber,
      labels,
      owner,
      repo,
      showBodyRow,
      showCreationDetails,
      title: _title,
      updatedAt,
      url,
      userLinkURL,
      username: _username,
      viewMode,
      ...otherProps
    } = props

    const title = trimNewLinesAndSpaces(_title)
    if (!title) return null

    const body = trimNewLinesAndSpaces(stripMarkdown(`${_body || ''}`), 150)
    const isBot = Boolean(_username && _username.indexOf('[bot]') >= 0)
    const numberOfLines = viewMode === 'compact' ? 1 : 2
    const username =
      isBot && _username ? _username.replace('[bot]', '') : _username
    const byText = username ? `@${username}` : ''
    const htmlUrl = fixURL(url, {
      addBottomAnchor,
      issueOrPullRequestNumber,
    })

    const inlineLabels =
      viewMode === 'compact' &&
      numberOfLines === 1 &&
      (hideLabelText ? labels && labels.length <= 20 : true)
    const keepLabelsTogether = true

    return (
      <BaseRow
        {...otherProps}
        left={
          username ? (
            <Avatar
              avatarUrl={avatarUrl}
              isBot={isBot}
              linkURL={userLinkURL}
              small
              style={cardStyles.avatar}
              username={username}
            />
          ) : isPrivate ? (
            <SpringAnimatedIcon
              name="lock"
              size={smallAvatarSize}
              style={{ color: springAnimatedTheme.orange }}
            />
          ) : null
        }
        right={
          <View style={cardRowStyles.mainContentContainer}>
            <View
              style={[
                sharedStyles.flex,
                {
                  justifyContent: keepLabelsTogether
                    ? 'space-between'
                    : 'flex-start',
                  width: '100%',
                },
                inlineLabels && sharedStyles.horizontal,
                inlineLabels && sharedStyles.flexWrap,
              ]}
            >
              <Link
                enableTextWrapper
                href={htmlUrl}
                style={[
                  !inlineLabels && sharedStyles.flexGrow,
                  { alignSelf: 'flex-start' },
                  !!inlineLabels &&
                    labels &&
                    labels.length > 0 && { marginRight: contentPadding / 2 },
                  !inlineLabels &&
                    labels &&
                    labels.length > 0 && { marginBottom: innerCardSpacing },
                ]}
                textProps={{
                  numberOfLines,
                  style: [
                    sharedStyles.flex,
                    getCardStylesForTheme(springAnimatedTheme).normalText,
                    bold && !isRead && cardStyles.boldText,
                    isRead &&
                      getCardStylesForTheme(springAnimatedTheme).mutedText,
                  ],
                }}
                // tooltip={`${title}${_body ? `\n\n${_body}` : ''}`}
              >
                <>
                  {!hideIcon && (
                    <>
                      <SpringAnimatedIcon
                        name={iconName}
                        size={13}
                        style={[
                          getCardStylesForTheme(springAnimatedTheme).normalText,
                          getCardStylesForTheme(springAnimatedTheme).icon,
                          { color: iconColor || undefined },
                        ]}
                      />{' '}
                    </>
                  )}
                  {title}

                  {!!issueOrPullRequestNumber &&
                    (viewMode === 'compact' || !showCreationDetails) && (
                      <SpringAnimatedText
                        style={{
                          fontSize: 11,
                          fontWeight: '400',
                        }}
                      >
                        {`  #${issueOrPullRequestNumber}`}
                      </SpringAnimatedText>
                    )}
                </>
              </Link>

              {!!labels && labels.length > 0 && (
                <LabelsView
                  backgroundThemeColor={backgroundThemeColor}
                  borderColor={
                    hideLabelText && backgroundThemeColor
                      ? springAnimatedTheme[backgroundThemeColor]
                      : undefined
                  }
                  fragment={!keepLabelsTogether}
                  hideText={hideLabelText}
                  labels={labels.map(label => ({
                    key: `issue-or-pr-row-${id}-${owner}-${repo}-${issueOrPullRequestNumber}-label-${label.id ||
                      label.name}`,
                    color: label.color && `#${label.color}`,
                    name: label.name,
                  }))}
                  muted={isRead}
                  textColor={springAnimatedTheme.foregroundColorMuted50}
                />
              )}
            </View>

            <View style={{ alignSelf: 'stretch', maxWidth: '100%' }}>
              {!!showBodyRow && !!body && (
                <>
                  <Spacer height={innerCardSpacing} />

                  <Link
                    href={htmlUrl}
                    style={cardRowStyles.mainContentContainer}
                    textProps={{
                      numberOfLines,
                      style: [
                        sharedStyles.flex,
                        getCardStylesForTheme(springAnimatedTheme).commentText,
                        isRead &&
                          getCardStylesForTheme(springAnimatedTheme).mutedText,
                      ],
                    }}
                  >
                    {body}
                  </Link>
                </>
              )}

              {!!(byText || createdAt || updatedAt || commentsCount) &&
                showCreationDetails && (
                  <>
                    <Spacer height={innerCardSpacing} />

                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignSelf: 'stretch',
                        alignItems: 'center',
                      }}
                    >
                      {!!byText && (
                        <Link
                          href={
                            userLinkURL ||
                            (username && getGitHubURLForUser(username))
                          }
                          textProps={{
                            style: [
                              getCardStylesForTheme(springAnimatedTheme)
                                .smallerMutedText,
                            ],
                          }}
                        >
                          {byText}
                        </Link>
                      )}

                      {!!createdAt && (
                        <IntervalRefresh date={createdAt}>
                          {() => {
                            const dateText = getDateSmallText(createdAt, false)
                            if (!dateText) return null

                            return (
                              <>
                                {!!byText && <Text children="  " />}

                                <SpringAnimatedText
                                  numberOfLines={1}
                                  style={
                                    getCardStylesForTheme(springAnimatedTheme)
                                      .smallerMutedText
                                  }
                                  {...Platform.select({
                                    web: {
                                      title: `Created: ${getFullDateText(
                                        createdAt,
                                      )}`,
                                    },
                                  })}
                                >
                                  {dateText}
                                </SpringAnimatedText>
                              </>
                            )
                          }}
                        </IntervalRefresh>
                      )}

                      {!!updatedAt && (
                        <IntervalRefresh date={updatedAt}>
                          {() => {
                            const dateText = getDateSmallText(updatedAt, false)
                            if (!dateText) return null

                            return (
                              <>
                                {!!byText && <Text children="  " />}

                                <SpringAnimatedText
                                  numberOfLines={1}
                                  style={
                                    getCardStylesForTheme(springAnimatedTheme)
                                      .smallerMutedText
                                  }
                                  {...Platform.select({
                                    web: {
                                      title: `Updated: ${getFullDateText(
                                        updatedAt,
                                      )}`,
                                    },
                                  })}
                                >
                                  <SpringAnimatedIcon name="clock" /> {dateText}
                                </SpringAnimatedText>
                              </>
                            )
                          }}
                        </IntervalRefresh>
                      )}

                      {viewMode === 'compact' ? (
                        <Spacer width={contentPadding / 2} />
                      ) : (
                        <Spacer flex={1} />
                      )}

                      {typeof commentsCount === 'number' &&
                        commentsCount >= 0 && (
                          <CardSmallThing
                            icon="comment"
                            isRead={isRead}
                            text={commentsCount}
                            url={htmlUrl}
                          />
                        )}

                      {viewMode !== 'compact' && (
                        <>
                          <Spacer width={contentPadding / 2} />

                          <CardItemId
                            id={issueOrPullRequestNumber}
                            isRead={isRead}
                            url={htmlUrl}
                          />
                        </>
                      )}
                    </View>
                  </>
                )}
            </View>
          </View>
        }
        viewMode={viewMode}
      />
    )
  },
)
