/* eslint-disable complexity */
import PropTypes from 'prop-types'
import React from 'react'
import styles from './styles/CreateDocumentPreview.css'
import {IntentLink} from 'part:@sanity/base/router'
import Ink from 'react-ink'

const fieldProp = PropTypes.oneOfType([PropTypes.string, PropTypes.node, PropTypes.func])

class CreateDocumentPreview extends React.PureComponent {
  static propTypes = {
    title: fieldProp,
    subtitle: fieldProp,
    media: fieldProp,
    icon: PropTypes.func,
    isPlaceholder: PropTypes.bool,
    params: PropTypes.shape({
      template: PropTypes.string
    }),
    mediaDimensions: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number,
      fit: PropTypes.oneOf(['clip', 'crop', 'fill', 'fillmax', 'max', 'scale', 'min']),
      aspect: PropTypes.number
    })
  }

  static defaultProps = {
    title: 'Untitled',
    subtitle: undefined,
    params: undefined,
    icon: undefined,
    media: undefined,
    mediaDimensions: {width: 80, height: 80, aspect: 1, fit: 'crop'}
  }

  render() {
    const {
      title,
      subtitle,
      media = this.props.icon,
      isPlaceholder,
      mediaDimensions,
      params
    } = this.props

    if (isPlaceholder || !params) {
      return (
        <div className={styles.placeholder}>
          <div className={styles.heading}>
            <h2 className={styles.title}>Loading…</h2>
            <h3 className={styles.subtitle}>Loading…</h3>
          </div>
          {media !== false && <div className={styles.media} />}
        </div>
      )
    }

    return (
      <IntentLink
        intent="create"
        params={params}
        className={styles.root}
        title={subtitle ? `Create new ${title} (${subtitle})` : `Create new ${title}`}
      >
        {media !== false && (
          <div className={styles.media}>
            {typeof media === 'function' && media({dimensions: mediaDimensions, layout: 'default'})}
            {typeof media === 'string' && <div className={styles.mediaString}>{media}</div>}
            {React.isValidElement(media) && media}
          </div>
        )}
        <div className={styles.heading}>
          <h2 className={styles.title}>
            {typeof title !== 'function' && title}
            {typeof title === 'function' && title({layout: 'default'})}
          </h2>
          {subtitle && (
            <h3 className={styles.subtitle}>
              {(typeof subtitle === 'function' && subtitle({layout: 'default'})) || subtitle}
            </h3>
          )}
        </div>
        <Ink duration={1000} opacity={0.1} radius={200} />
      </IntentLink>
    )
  }
}

export default CreateDocumentPreview