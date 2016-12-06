// @flow

import React from 'react';
import { RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/Octicons';
import styled from 'styled-components/native';
import ImmutableListView from 'react-native-immutable-list-view';

import Card, { iconRightMargin } from './Card';
import CreateColumnUtils from './utils/CreateColumnUtils';
import ScrollableContentContainer from './ScrollableContentContainer';
import Themable from './hoc/Themable';
import TransparentTextOverlay from './TransparentTextOverlay';
import { getIcon } from '../api/github';
import { getDateWithHourAndMinuteText } from '../utils/helpers';
import { contentPadding } from '../styles/variables';
import type { ActionCreators, Column, ThemeObject } from '../utils/types';

const Root = styled.View`
  background-color: ${({ theme }) => theme.base02};
  border-radius: ${({ radius }) => radius || 0};
`;

const StyledTextOverlay = styled(TransparentTextOverlay)`
  border-radius: ${({ radius }) => radius || 0};
`;

const HeaderButtonsContainer = styled.View`
  flex-direction: row;
  padding-right: ${iconRightMargin};
`;

const Title = styled.Text`
  padding: ${contentPadding};
  font-size: 20;
  color: ${({ theme }) => theme.base04};
`;

const HeaderButton = styled.TouchableOpacity`
  padding-vertical: ${contentPadding};
  padding-horizontal: ${contentPadding};
`;

const HeaderButtonText = styled.Text`
  font-size: 14;
  color: ${({ theme }) => theme.base04};
`;

const FixedHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: ${20 + (3 * contentPadding)};
  border-width: 0;
  border-bottom-width: 1;
  border-color: ${({ theme }) => theme.base01};
`;

// const HiddenHeader = styled.View`
//   margin-top: -16;
//   align-items: center;
//   justify-content: center;
//   overflow: visible;
// `;
//
// const SubHeaderText = styled.Text`
//   text-align: center;
//   font-size: 14;
//   color: ${({ theme }) => theme.base05};
// `;

@Themable
export default class extends React.PureComponent {
  onCreateColumnButtonPress = () => {
    CreateColumnUtils.showColumnTypeSelectAlert(this.props.actions);
  };

  onRefresh = () => {
    const { column, actions: { updateColumnSubscriptions } } = this.props;
    updateColumnSubscriptions(column.get('id'));
  };

  props: {
    actions: ActionCreators,
    column: Column,
    radius?: number,
    style?: ?Object,
    theme: ThemeObject,
  };

  renderRow = (event) => (
    <Card
      key={`card-${event.get('id')}`}
      event={event}
      actions={this.props.actions}
    />
  );

  render() {
    const { actions, radius, theme, ...props } = this.props;

    const { id, events, loading = false, subscriptions, title, updatedAt } = {
      id: this.props.column.get('id'),
      events: this.props.column.get('events'),
      loading: this.props.column.get('loading'),
      subscriptions: this.props.column.get('subscriptions'),
      title: (this.props.column.get('title') || '').toLowerCase(),
      updatedAt: this.props.column.get('updatedAt'),
    };

    const icon = (
      subscriptions && subscriptions.size > 0
      ? getIcon(subscriptions.first().get('requestType'))
      : ''
    ) || 'mark-github';

    const dateFromNowText = getDateWithHourAndMinuteText(updatedAt);
    const updatedText = dateFromNowText ? `Updated ${dateFromNowText}` : '';

    return (
      <Root radius={radius} {...props}>
        <FixedHeader>
          <TransparentTextOverlay color={theme.base02} size={contentPadding} from="right">
            <ScrollableContentContainer>
              <Title numberOfLines={1}>
                <Icon name={icon} size={20} />&nbsp;{title}
              </Title>
            </ScrollableContentContainer>
          </TransparentTextOverlay>

          <HeaderButtonsContainer>
            <HeaderButton onPress={this.onCreateColumnButtonPress}>
              <HeaderButtonText><Icon name="plus" size={20} /></HeaderButtonText>
            </HeaderButton>

            <HeaderButton onPress={() => actions.deleteColumn(id)}>
              <HeaderButtonText><Icon name="trashcan" size={20} /></HeaderButtonText>
            </HeaderButton>
          </HeaderButtonsContainer>
        </FixedHeader>

        <StyledTextOverlay color={theme.base02} size={contentPadding} from="bottom" radius={radius}>
          <ImmutableListView
            immutableData={events}
            initialListSize={5}
            rowsDuringInteraction={5}
            renderRow={this.renderRow}
            refreshControl={
              <RefreshControl
                refreshing={loading || false}
                onRefresh={this.onRefresh}
                colors={[theme.base08]}
                tintColor={theme.base08}
                title={(loading ? 'Loading...' : (updatedText || ' ')).toLowerCase()}
                titleColor={theme.base05}
                progressBackgroundColor={theme.base02}
              />
            }
          />
        </StyledTextOverlay>
      </Root>
    );
  }
}
