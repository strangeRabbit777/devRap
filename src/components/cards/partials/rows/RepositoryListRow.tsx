import React, { PureComponent } from 'react'

import { IGitHubRepo } from '../../../../types'
import { getOwnerAndRepo } from '../../../../utils/helpers/github/shared'
import { getRepoFullNameFromObject } from '../../../../utils/helpers/github/url'
import { RepositoryRow } from './RepositoryRow'
import { RenderItem, RowList } from './RowList'

export interface RepositoryListRowProps {
  isForcePush?: boolean
  isFork?: boolean
  isPush?: boolean
  isRead: boolean
  maxHeight?: number
  repos: IGitHubRepo[]
}

export class RepositoryListRow extends PureComponent<RepositoryListRowProps> {
  renderItem: RenderItem<IGitHubRepo> = ({
    item: repo,
    showMoreItemsIndicator,
  }) => {
    if (!(repo && repo.id)) return null

    const repoFullName = getRepoFullNameFromObject(repo)
    const { owner: repoOwnerName, repo: repoName } = getOwnerAndRepo(
      repoFullName,
    )

    if (!(repoOwnerName && repoName)) return null

    return (
      <RepositoryRow
        key={`repo-row-${repo.id}`}
        {...this.props}
        ownerName={repoOwnerName!}
        repositoryName={repoName!}
        showMoreItemsIndicator={showMoreItemsIndicator}
      />
    )
  }

  render() {
    const { repos, ...props } = this.props

    if (!(repos && repos.length > 0)) return null

    return <RowList {...props} data={repos} renderItem={this.renderItem} />
  }
}
