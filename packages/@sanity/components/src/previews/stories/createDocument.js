import React from 'react'
import CreateDocumentPreview from 'part:@sanity/components/previews/create-document'
import {text} from 'part:@sanity/storybook/addons/knobs'
import Sanity from 'part:@sanity/storybook/addons/sanity'
import FileIcon from 'part:@sanity/base/file-icon'

export function CreateDocumentStory() {
  return (
    <Sanity
      part="part:@sanity/components/previews/create-document"
      propTables={[CreateDocumentPreview]}
    >
      <CreateDocumentPreview
        // eslint-disable-next-line no-script-url
        params={{intent: 'create', type: 'test'}}
        title={text('title', 'Movie', 'props')}
        subtitle={text('subtitle', 'Sci-fi', 'props')}
        description={text(
          'description',
          'Science fiction is a genre of speculative fiction that has been called the "literature of ideas". It typically deals with imaginative and futuristic concepts such as advanced science and technology, time travel, parallel universes, fictional worlds, space exploration, and extraterrestrial life.',
          'props'
        )}
        icon={FileIcon}
      />
    </Sanity>
  )
}
