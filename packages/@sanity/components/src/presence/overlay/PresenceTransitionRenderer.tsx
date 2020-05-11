/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/no-multi-comp */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from 'react'
import {CSSProperties} from 'react'
import {RegionIntersectionAssembler} from './RegionIntersectionAssembler'
import {flatten, groupBy, orderBy, sortBy} from 'lodash'
import {
  AVATAR_SIZE,
  DEBUG,
  MAX_AVATARS,
  SLIDE_RIGHT_THRESHOLD_BOTTOM,
  SLIDE_RIGHT_THRESHOLD_TOP,
  SNAP_TO_DOCK_DISTANCE_BOTTOM,
  SNAP_TO_DOCK_DISTANCE_TOP
} from '../constants'
import {RegionWithIntersectionDetails} from '../types'
import {AvatarProvider, PopoverList, StackCounter} from '..'
import {splitRight} from '../utils'

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
  const dir = position === 'top' ? 1 : -1
  const allPresenceItems = flatten(
    sortBy(regionsWithIntersectionDetails, r => r.region.rect.top * dir).map(
      withIntersection => withIntersection.region.data?.presence || []
    ) || []
  )

  const [hiddenUsers, visibleUsers] = splitRight(allPresenceItems, MAX_AVATARS)

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
      <PopoverList presence={allPresenceItems} position={position} avatarSize="small" distance={10}>
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
        transform: `translate3d(${(visibleUsers.length - 1 - i) * -(AVATAR_SIZE - 8)}px, 0px, 0px)`
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
        bottom: position === 'bottom' ? AVATAR_SIZE + arrowHeight : 0,
        right: 0,
        left: 0,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: AVATAR_SIZE,
          height: AVATAR_SIZE
        }}
      >
        <PopoverList
          disabled={allPresenceItems.length <= MAX_AVATARS}
          presence={allPresenceItems}
          avatarSize="small"
          position={position}
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

function renderInside(regionsWithIntersectionDetails: RegionWithSpacerHeight[], maxRight: number) {
  return regionsWithIntersectionDetails.map(withIntersection => {
    const distanceMaxLeft =
      maxRight - withIntersection.region.rect.width - withIntersection.region.rect.left
    const originalLeft = withIntersection.region.rect.left
    const {distanceTop, distanceBottom} = withIntersection

    const nearTop = distanceTop + SNAP_TO_DOCK_DISTANCE_TOP < SLIDE_RIGHT_THRESHOLD_TOP
    const nearBottom = distanceBottom + SNAP_TO_DOCK_DISTANCE_BOTTOM < SLIDE_RIGHT_THRESHOLD_BOTTOM

    const {component: Component, data} = withIntersection.region
    return (
      <React.Fragment key={withIntersection.region.id}>
        <Spacer height={withIntersection.spacerHeight} />
        <div
          style={{
            ...ITEM_STYLE,
            ...ITEM_TRANSITION,
            transform: `translate3d(${originalLeft +
              (nearTop || nearBottom ? distanceMaxLeft : 0)}px, 0px, 0px)`,
            height: withIntersection.region.rect.height,
            width: withIntersection.region.rect.width
          }}
        >
          <DebugValue value={() => `⤒${distanceTop} | ${distanceBottom}⤓`}>
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
          left: -15,
          fontSize: 11,
          right: -15,
          textAlign: 'center',
          height: AVATAR_SIZE,
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          position: 'absolute',
          zIndex: 1000
        }}
      >
        {props.value()}
      </span>
    </div>
  )
}
