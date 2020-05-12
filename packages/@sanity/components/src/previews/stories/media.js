/* eslint-disable react/no-multi-comp, complexity */
import React from 'react'
import MediaPreview from 'part:@sanity/components/previews/media'
import {boolean, text} from 'part:@sanity/storybook/addons/knobs'
import Sanity from 'part:@sanity/storybook/addons/sanity'

const renderMedia = dimensions => {
  return <img src="http://www.fillmurray.com/300/300" alt="test" />
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

export function MediaStory() {
  return (
    <Sanity part="part:@sanity/components/previews/media" propTables={[MediaPreview]}>
      <MediaPreview
        title={text('title (prop)', 'This is the title', 'props')}
        subtitle={text('subtitle (prop)', 'This is the subtitle', 'props')}
        description={text(
          'description',
          'This is the long the descriptions that should no be to long, beacuse we will cap it',
          'props'
        )}
        date={boolean('date', true, 'test') ? new Date() : false}
        media={renderMedia}
        isPlaceholder={boolean('isplaceholder', false, 'props')}
      >
        {boolean('Custom children', false, 'test') && renderCustomChildren()}
      </MediaPreview>
    </Sanity>
  )
}
