import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useTransition } from 'react-spring/native'
import { useColumn } from '../../hooks/use-column'
import { useCSSVariablesOrSpringAnimatedTheme } from '../../hooks/use-css-variables-or-spring--animated-theme'
import { Platform } from '../../libs/platform'
import { sharedStyles } from '../../styles/shared'
import { columnHeaderHeight } from '../../styles/variables'
import { getDefaultReactSpringAnimationConfig } from '../../utils/helpers/animations'
import { SpringAnimatedTouchableOpacity } from '../animated/spring/SpringAnimatedTouchableOpacity'
import { SpringAnimatedView } from '../animated/spring/SpringAnimatedView'
import { AccordionView } from '../common/AccordionView'
import { fabSize } from '../common/FAB'
import { useAppLayout } from '../context/LayoutContext'
import { fabSpacing } from '../layout/FABRenderer'
import { ColumnHeader } from './ColumnHeader'
import { ColumnHeaderItem } from './ColumnHeaderItem'
import { ColumnOptions } from './ColumnOptions'

export interface ColumnOptionsRendererProps {
  close?: (() => void) | undefined
  columnId: string
  containerHeight: number
  forceOpenAll?: boolean
  inlineMode?: boolean
  startWithFiltersExpanded?: boolean
  visible: boolean
}

export const ColumnOptionsRenderer = React.memo(
  (props: ColumnOptionsRendererProps) => {
    const {
      close,
      columnId,
      containerHeight,
      forceOpenAll,
      inlineMode,
      startWithFiltersExpanded,
      visible,
    } = props

    const springAnimatedTheme = useCSSVariablesOrSpringAnimatedTheme()

    const { sizename } = useAppLayout()

    const { column, columnIndex } = useColumn(columnId)

    const immediate = Platform.realOS === 'android'
    const overlayTransition = useTransition<boolean, any>(
      visible ? [true] : [],
      () => 'column-options-overlay',
      {
        reset: true,
        unique: true,
        config: getDefaultReactSpringAnimationConfig(),
        immediate,
        from: { opacity: 0 },
        enter: { opacity: 0.75 },
        leave: { opacity: 0 },
      },
    )[0]

    const isFabVisible = sizename < '3-large'

    const availableHeight =
      containerHeight - (isFabVisible ? fabSize + 2 * fabSpacing : 0)
    const fixedWidth = inlineMode ? 250 : undefined

    if (!column) return null

    return (
      <>
        {!!overlayTransition && !fixedWidth && !!close && (
          <SpringAnimatedView
            collapsable={false}
            style={[
              StyleSheet.absoluteFillObject,
              overlayTransition.props,
              !!fixedWidth && { width: fixedWidth },
              { zIndex: 200 },
            ]}
          >
            <SpringAnimatedTouchableOpacity
              analyticsAction="close_via_overlay"
              analyticsLabel="column_options"
              activeOpacity={1}
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: springAnimatedTheme.backgroundColorMore1,
                zIndex: 200,
                ...Platform.select({ web: { cursor: 'default' } as any }),
              }}
              onPress={close && (() => close())}
              tabIndex={-1}
            />
          </SpringAnimatedView>
        )}

        <View
          collapsable={false}
          style={[
            !inlineMode && {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            },
            !!fixedWidth && { width: fixedWidth },
            {
              zIndex: 200,
            },
          ]}
        >
          {!!inlineMode && (
            <ColumnHeader>
              <ColumnHeaderItem
                analyticsLabel={undefined}
                fixedIconSize
                iconName="settings"
                subtitle=""
                title="filters"
                style={[sharedStyles.flex, { alignItems: 'flex-start' }]}
                tooltip={undefined}
              />
            </ColumnHeader>
          )}

          <AccordionView isOpen={visible}>
            <ColumnOptions
              key={`column-options-${column.type}`}
              availableHeight={
                availableHeight - (inlineMode ? columnHeaderHeight : 0)
              }
              column={column}
              columnIndex={columnIndex}
              forceOpenAll={forceOpenAll}
              fullHeight={inlineMode}
              startWithFiltersExpanded={startWithFiltersExpanded}
            />
          </AccordionView>
        </View>
      </>
    )
  },
)
