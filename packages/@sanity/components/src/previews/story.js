import {storiesOf} from 'part:@sanity/storybook'
import {number, withKnobs} from 'part:@sanity/storybook/addons/knobs'
import React from 'react'
import {BlockStory} from './stories/block'
import {BlockImageStory} from './stories/blockImage'
import {CardStory} from './stories/card'
import {CreateDocumentStory} from './stories/createDocument'
import {DefaultStory} from './stories/default'
import {DetailStory} from './stories/detail'
import {InlineStory} from './stories/inline'
import {MediaStory} from './stories/media'

function Centered(storyFn) {
  return (
    <div
      style={{
        height: '100vh',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1em'
      }}
    >
      <div
        style={{
          width: `${number('width', 300, {range: true, min: 100, max: 2000}, 'test')}px`
        }}
      >
        {storyFn()}
      </div>
    </div>
  )
}

storiesOf('@sanity/components/previews', module)
  .addDecorator(Centered)
  .addDecorator(withKnobs)
  .add('Default', DefaultStory)
  .add('Card', CardStory)
  .add('Detail', DetailStory)
  .add('Media', MediaStory)
  .add('Inline', InlineStory)
  .add('Block', BlockStory)
  .add('Block image', BlockImageStory)
  .add('Create document', CreateDocumentStory)
