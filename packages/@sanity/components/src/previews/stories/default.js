import React from 'react'
import DefaultPreview from 'part:@sanity/components/previews/default'
import {boolean, number, text, select} from 'part:@sanity/storybook/addons/knobs'
import Sanity from 'part:@sanity/storybook/addons/sanity'
import WarningIcon from 'part:@sanity/base/warning-icon'
import LinkIcon from 'part:@sanity/base/link-icon'

const renderMedia = dimensions => {
  return <img src="http://www.fillmurray.com/300/300" alt="test" />
}

const renderStatus = options => {
  return (
    <span>
      Status <LinkIcon /> <WarningIcon />
    </span>
  )
}

const renderTitle = options => {
  return (
    <span>
      This <span style={{color: 'green'}}>is</span> a <strong>title</strong>
      &nbsp;in the layout {options.layout}
    </span>
  )
}

const renderSubtitle = options => {
  return (
    <span>
      This is a{' '}
      <strong style={{color: 'red'}}>
        <WarningIcon />
        subtitle
      </strong>
    </span>
  )
}

const renderDescription = options => {
  return (
    <span>
      This is the{' '}
      <strong style={{color: 'red'}}>
        <WarningIcon />
        description
      </strong>
    </span>
  )
}

const renderCustomChildren = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '0',
          right: '0'
        }}
      >
        <div
          style={{
            position: 'absolute',
            fontSize: '10px',
            textTransform: 'uppercase',
            top: '0',
            right: '0',
            fontWeight: '700',
            boxShadow: '0 0 5px rgba(0,0,0,0.2)',
            backgroundColor: 'yellow',
            padding: '0.2em 3em',
            transform: 'translate(28%, 43%) rotate(45deg)'
          }}
        >
          New
        </div>
      </div>
    </div>
  )
}

const options = {
  functions: 'Functions',
  strings: 'Strings',
  elements: 'Element'
}

export function DefaultStory() {
  const propType = select('Type of props', options, 'strings')

  if (propType === 'functions') {
    return (
      <Sanity part="part:@sanity/components/previews/default" propTables={[DefaultPreview]}>
        <DefaultPreview
          title={renderTitle}
          subtitle={renderSubtitle}
          description={renderDescription}
          status={renderStatus}
          media={renderMedia}
          isPlaceholder={boolean('placeholder', false, 'props')}
          date={new Date()}
          progress={number(
            'progress',
            undefined,
            {range: true, min: 0, max: 100, step: 1},
            'props'
          )}
        >
          {boolean('Custom children', false) && renderCustomChildren()}
        </DefaultPreview>
      </Sanity>
    )
  }

  if (propType === 'elements') {
    return (
      <Sanity part="part:@sanity/components/previews/default" propTables={[DefaultPreview]}>
        <DefaultPreview
          title={
            <span>
              This <span style={{color: 'green'}}>is</span> a <strong>test</strong>
            </span>
          }
          subtitle={
            <span>
              This is a <strong style={{color: 'red'}}>subtitle</strong>
            </span>
          }
          description={
            <span>
              This is the long the descriptions that should no be to long, beacuse we will cap it
            </span>
          }
          isPlaceholder={boolean('placeholder', false, 'props')}
          media={boolean('Show image', true, 'test') ? renderMedia : undefined}
          status={
            <div>
              <LinkIcon />
              <WarningIcon />
            </div>
          }
          date={new Date()}
          progress={number(
            'progress',
            undefined,
            {range: true, min: 0, max: 100, step: 1},
            'props'
          )}
        >
          {boolean('Custom children', false, 'test') && renderCustomChildren()}
        </DefaultPreview>
      </Sanity>
    )
  }

  return (
    <Sanity part="part:@sanity/components/previews/default" propTables={[DefaultPreview]}>
      <DefaultPreview
        title={text(
          'title',
          'This is the title an it is very long, so long that it should be ellipsed',
          'props'
        )}
        subtitle={text(
          'subtitle',
          `This is the title an it is very long, so long that it should be ellipsed.
             This is the title an it is very long, so long that it should be ellipsed`,
          'props'
        )}
        description={text(
          'description',
          'This is the long the descriptions that should no be to long, beacuse we will cap it',
          'props'
        )}
        status={text('status', '🔔 🐣 👻', 'props')}
        media={boolean('Show image', true, 'props') ? renderMedia : undefined}
        isPlaceholder={boolean('placeholder', false, 'props')}
        date={new Date()}
        progress={number('progress', undefined, {range: true, min: 0, max: 100, step: 1}, 'props')}
      >
        {boolean('Custom children', false, 'test') && renderCustomChildren()}
      </DefaultPreview>
    </Sanity>
  )
}
