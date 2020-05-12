import React from 'react'
import {text, number, boolean} from 'part:@sanity/storybook/addons/knobs'
import Fieldset from 'part:@sanity/components/fieldsets/default'
import Sanity from 'part:@sanity/storybook/addons/sanity'
import {Container} from 'part:@sanity/storybook/components'

export function DefaultStory() {
  return (
    <Container>
      <Sanity part="part:@sanity/components/fieldsets/default" propTables={[Fieldset]}>
        <div style={{margin: '0 auto', maxWidth: 640}}>
          <Fieldset
            legend={text('legend', 'This is the legend', 'props')}
            description={text('description', 'This is the description', 'props')}
            level={number('level', 1, 'props')}
            transparent={boolean('transparent', false, 'props')}
            tabIndex={boolean('tabIndex', false, 'test') ? 0 : false}
            markers={boolean('show markers', false, 'test') ? [] : undefined}
          >
            {text('children', 'Put content here', 'props')}
          </Fieldset>
        </div>
      </Sanity>
    </Container>
  )
}
