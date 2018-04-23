import React, { PureComponent } from 'react'

import CommitRow from './CommitRow'
import RowList, { RenderItem } from './RowList'

import { IGitHubCommit, ITheme } from '../../../../types'

export interface CommitListRowProperties {
  isRead: boolean
  maxHeight?: number
  commits: IGitHubCommit[]
  theme: ITheme
}

export default class CommitListRow extends PureComponent<
  CommitListRowProperties
> {
  renderItem: RenderItem<IGitHubCommit> = ({
    showMoreItemsIndicator,
    item: commit,
  }) => {
    if (!(commit && commit.sha && commit.message)) return null

    return (
      <CommitRow
        key={`commit-row-${commit.sha}`}
        {...this.props}
        authorEmail={commit.author.email}
        authorName={commit.author.name}
        message={commit.message}
        showMoreItemsIndicator={showMoreItemsIndicator}
        url={commit.url}
      />
    )
  }

  render() {
    const { commits, ...props } = this.props

    if (!(commits && commits.length > 0)) return null

    return <RowList {...props} data={commits} renderItem={this.renderItem} />
  }
}
