/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/no-multi-comp */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from 'react'
import {CSSProperties} from 'react'
import {RegionIntersectionAssembler} from './RegionIntersectionAssembler'
import {groupBy, orderBy} from 'lodash'
import {AvatarProvider, PopoverList, StackCounter} from '@sanity/components/lib/presence'
import {DEBUG, THRESHOLD_TOP, MAX_AVATARS, AVATAR_WIDTH} from './constants'
import {RegionWithIntersectionDetails} from './types'

const splitRight = (array, index) => {
  const idx = Math.max(0, array.length - index)
  return [array.slice(0, idx), array.slice(idx)]
}

const ITEM_TRANSITION: CSSProperties = {
  transitionProperty: 'transform',
  transitionDuration: '200ms',
  transitionTimingFunction: 'cubic-bezier(0.85, 0, 0.15, 1)'
}
const ITEM_STYLE: CSSProperties = {
  position: 'sticky',
  pointerEvents: 'all',
  top: 0,
  bottom: 0
}

const bottom = rect => rect.top + rect.height

type RegionWithSpacerHeight = RegionWithIntersectionDetails & {
  spacerHeight: number
}

function withSpacerHeight(
  regionsWithIntersectionDetails: RegionWithIntersectionDetails[]
): RegionWithSpacerHeight[] {
  return regionsWithIntersectionDetails.map(
    (withIntersection, idx, regionsWithIntersectionDetails) => {
      const prevRect = regionsWithIntersectionDetails[idx - 1]?.region.rect
      const prevBottom = prevRect ? bottom(prevRect) : 0
      return {...withIntersection, spacerHeight: withIntersection.region.rect.top - prevBottom}
    }
  )
}

const orderByTop = (regionsWithIntersectionDetails: RegionWithIntersectionDetails[]) =>
  orderBy(regionsWithIntersectionDetails, withIntersection => withIntersection.region.rect.top)

const plus = (a, b) => a + b
const sum = array => array.reduce(plus, 0)

type RegionWithSpacerHeightAndIndent = RegionWithSpacerHeight & {indent: number}

function group(
  regionsWithIntersectionDetails: RegionWithIntersectionDetails[]
): {
  top: RegionWithSpacerHeightAndIndent[]
  inside: RegionWithSpacerHeightAndIndent[]
  bottom: RegionWithSpacerHeightAndIndent[]
} {
  const regionsWithSpacerHeight = withSpacerHeight(orderByTop(regionsWithIntersectionDetails))
  const grouped: {
    top: RegionWithSpacerHeight[]
    inside: RegionWithSpacerHeight[]
    bottom: RegionWithSpacerHeight[]
  } = {
    top: [],
    inside: [],
    bottom: [],
    ...groupBy(regionsWithSpacerHeight, withSpacerHeight => withSpacerHeight.position)
  }

  return {
    top: orderByTop(grouped.top).map(
      (withIntersection: RegionWithSpacerHeight, i, grp): RegionWithSpacerHeightAndIndent => ({
        ...withIntersection,
        indent: grp
          .slice(i + 1)
          .reduce((w, withIntersection) => w + withIntersection.region.rect.width, 0)
      })
    ),
    inside: orderByTop(grouped.inside).map(
      (withIntersection: RegionWithSpacerHeight): RegionWithSpacerHeightAndIndent => ({
        ...withIntersection,
        indent: 0
      })
    ),
    bottom: orderByTop(grouped.bottom).map(
      (withIntersection: RegionWithSpacerHeight, i, grp): RegionWithSpacerHeightAndIndent => ({
        ...withIntersection,
        indent: grp
          .slice(0, i)
          .reduce((w, withIntersection) => w + withIntersection.region.rect.width, 0)
      })
    )
  }
}

const Spacer = ({height, ...rest}: {height: number; style?: CSSProperties}) => (
  <div style={{height: Math.max(0, height), ...rest?.style}} />
)

type Props = {
  regions: any[]
  children: React.ReactElement
  trackerRef: React.RefObject<any>
}

export function PresenceTransitionRenderer(props: Props) {
  return (
    <RegionIntersectionAssembler
      {...props}
      render={(regionsWithIntersectionDetails: RegionWithIntersectionDetails[]) => {
        const maxRight = Math.max(
          ...regionsWithIntersectionDetails.map(
            withIntersection =>
              withIntersection.region.rect.left + withIntersection.region.rect.width
          )
        )
        const grouped = group(regionsWithIntersectionDetails)
        const topSpacing = sum(grouped.top.map(n => n.region.rect.height + n.spacerHeight))
        const bottomSpacing = sum(grouped.bottom.map(n => n.region.rect.height + n.spacerHeight))
        return (
          <>
            {[
              renderDock('top', grouped.top),
              <Spacer key="spacerTop" height={topSpacing} />,
              ...renderInside(grouped.inside, maxRight),
              <Spacer key="spacerBottom" height={bottomSpacing} />,
              renderDock('bottom', grouped.bottom)
            ]}
          </>
        )
      }}
    />
  )
}

function renderDock(
  position: 'top' | 'bottom',
  regionsWithIntersectionDetails: RegionWithIntersectionDetails[]
) {
  const allPresenceItems =
    regionsWithIntersectionDetails.flatMap(
      withIntersection => withIntersection.region.data?.presence || []
    ) || []
  const [hiddenUsers, visibleUsers] = splitRight(
    allPresenceItems,
    allPresenceItems.length > MAX_AVATARS ? MAX_AVATARS - 1 : MAX_AVATARS
  )

  const counter = hiddenUsers.length > 0 && (
    <div
      data-hidden-users
      key={hiddenUsers.length > 1 ? 'counter' : hiddenUsers[hiddenUsers.length - 1].sessionId}
      style={{
        ...ITEM_TRANSITION,
        position: 'absolute',
        transform: `translate3d(${visibleUsers.length * -13}px, 0px, 0px)`
      }}
    >
      <PopoverList
        userList={allPresenceItems}
        arrowPosition={position}
        avatarSize="small"
        distance={10}
      >
        <StackCounter count={hiddenUsers.length} />
      </PopoverList>
    </div>
  )

  const visibleItems = visibleUsers.map((avatar, i) => (
    <div
      data-visible-users
      key={avatar.sessionId}
      style={{
        ...ITEM_TRANSITION,
        position: 'absolute',
        transform: `translate3d(${(visibleUsers.length - 1 - i) * -(AVATAR_WIDTH - 8)}px, 0px, 0px)`
      }}
    >
      <AvatarProvider position={position} userId={avatar.identity} {...avatar} />
    </div>
  ))
  const arrowHeight = 4
  return (
    <div
      data-dock={position}
      key={`sticky-${position}`}
      style={{
        position: 'sticky',
        top: arrowHeight,
        bottom: position === 'bottom' ? AVATAR_WIDTH + arrowHeight : 0,
        right: 0,
        left: 0,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: AVATAR_WIDTH,
          height: AVATAR_WIDTH
        }}
      >
        <PopoverList
          disabled={allPresenceItems.length <= MAX_AVATARS}
          userList={allPresenceItems}
          avatarSize="small"
          arrowPosition={position}
        >
          {[].concat(counter || []).concat(visibleItems)}
        </PopoverList>
      </div>
    </div>
  )
}

//  keep for debugging purposes
// function renderAbsolute(entry) {
//   return (
//     <div style={{position: 'absolute', ...entry.item.rect}}>
//       {entry.position}
//       {(entry.item.props.presence || []).map(pr => pr.sessionId).join(', ')}
//     </div>
//   )
// }

// The avatar will move to the right when this close (in pixels) to the top
const topDistanceRightMovementThreshold = 12

function renderInside(regionsWithIntersectionDetails: RegionWithSpacerHeight[], maxRight: number) {
  return regionsWithIntersectionDetails.map(withIntersection => {
    const distanceMaxLeft =
      maxRight - withIntersection.region.rect.width - withIntersection.region.rect.left
    const originalLeft = withIntersection.region.rect.left
    const distanceTop = withIntersection.distanceTop + THRESHOLD_TOP

    const {component: Component, data} = withIntersection.region
    return (
      <React.Fragment key={withIntersection.region.id}>
        <Spacer height={withIntersection.spacerHeight} />
        <div
          style={{
            ...ITEM_STYLE,
            ...ITEM_TRANSITION,
            transform: `translate3d(${originalLeft +
              (distanceTop < topDistanceRightMovementThreshold
                ? distanceMaxLeft
                : 0)}px, 0px, 0px)`,
            height: withIntersection.region.rect.height,
            width: withIntersection.region.rect.width
          }}
        >
          <DebugValue value={() => distanceTop}>
            {Component ? <Component {...data} /> : null}
          </DebugValue>
        </div>
      </React.Fragment>
    )
  })
}

function DebugValue(props: any) {
  if (!DEBUG) {
    return props.children
  }
  return (
    <div style={{position: 'absolute'}}>
      {props.children}
      <span
        style={{
          top: 0,
          left: 0,
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          padding: 4,
          position: 'absolute'
        }}
      >
        {props.value()}
      </span>
    </div>
  )
}
