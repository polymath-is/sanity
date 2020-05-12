import React from 'react'
import InlinePreview from 'part:@sanity/components/previews/inline'
import {boolean, text, select} from 'part:@sanity/storybook/addons/knobs'
import Sanity from 'part:@sanity/storybook/addons/sanity'

const renderMedia = dimensions => {
  return <img src="http://www.fillmurray.com/300/300" alt="test" />
}

const renderTitle = options => {
  return (
    <span>
      This <span style={{color: 'green'}}>is</span> a <strong>title</strong>
      &nbsp;in the layout {options.layout}
    </span>
  )
}

const options = {
  functions: 'Functions',
  strings: 'Strings',
  elements: 'Element'
}

export function InlineStory() {
  const propType = select('Type of props', options, 'strings')
  if (propType === 'functions') {
    return (
      <Sanity part="part:@sanity/components/previews/inline" propTables={[InlinePreview]}>
        <p>
          This is a text, and suddenly a inline preview appearst before
          <InlinePreview
            title={renderTitle}
            media={renderMedia}
            isPlaceholder={boolean('isPlaceholder', false, 'props')}
          >
            {boolean('Custom children', false, 'test') && <span>This is custom children</span>}
          </InlinePreview>
          this word.
        </p>
      </Sanity>
    )
  }
  if (propType === 'elements') {
    return (
      <Sanity part="part:@sanity/components/previews/inline" propTables={[InlinePreview]}>
        <p>
          This is a text, and suddenly a inline preview appearst before
          <InlinePreview
            title={<span>title</span>}
            media={renderMedia}
            isPlaceholder={boolean('isPlaceholder', false, 'props')}
          >
            {boolean('Custom children', false, 'test') && <span>This is custom children</span>}
          </InlinePreview>
          this word.
        </p>
      </Sanity>
    )
  }
  return (
    <Sanity part="part:@sanity/components/previews/inline" propTables={[InlinePreview]}>
      <p>
        This is a text, and suddenly a inline preview appearst before
        <InlinePreview
          title={text('title', 'This is the title', 'props')}
          media={renderMedia}
          date={boolean('date', true, 'test') ? new Date() : false}
          isPlaceholder={boolean('isPlaceholder', false, 'props')}
        >
          {boolean('Custom children', false, 'test') && <span>This is custom children</span>}
        </InlinePreview>
        this word.
      </p>
    </Sanity>
  )
}
