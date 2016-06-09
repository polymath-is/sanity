import {test} from 'tap'
import {createFormBuilderState} from '../src/state/FormBuilderState'
import ObjectContainer from '../src/inputs/Object/ObjectContainer'
import ArrayContainer from '../src/inputs/Array/ArrayContainer'
import {compileSchema} from '../src'

import schema from './fixtures/schema'

const compiledSchema = compileSchema(schema)

const rawValue = {
  $type: 'simple',
  someString: 'foo',
  home: {
    $type: 'homeAddress',
    zip: '2012',
    location: {
      $type: 'latlon',
      lat: 231,
      lon: 31
    }
  },
  someLatLon: {
    $type: 'latlon',
    lat: 10,
    lon: 10
  }
}

function defaultResolveContainer(field, type) {
  switch (field.type) {
    case 'object':
      return ObjectContainer
    case 'array':
      return ArrayContainer
  }
  switch (type.type) {
    case 'object':
      return ObjectContainer
    case 'array':
      return ArrayContainer
  }
}

const defaultContext = {
  type: compiledSchema.types.simple,
  schema: schema,
  resolveContainer: defaultResolveContainer
}

test('create from raw value', t => {
  const state = createFormBuilderState(rawValue, defaultContext)
  t.same(state.unwrap(), rawValue)
  t.end()
})

test('create from empty', t => {
  const state = createFormBuilderState(void 0, defaultContext)
  t.same(state.unwrap(), void 0)
  t.end()
})

test('create empty, and patch with simple value', t => {
  const state = createFormBuilderState(void 0, defaultContext)
  const newState = state.patch({
    someString: {$set: 'foobar'}
  })

  t.same(newState.unwrap(), {
    $type: 'simple',
    someString: 'foobar'
  })

  t.end()
})


test('apply a patch setting a simple value', t => {
  const state = createFormBuilderState(rawValue, defaultContext)
  const newState = state.patch({someString: {$set: 'bar'}})
  t.same(newState.unwrap(), {
    $type: 'simple',
    someString: 'bar',
    home: {
      $type: 'homeAddress',
      zip: '2012',
      location: {
        $type: 'latlon',
        lat: 231,
        lon: 31
      }
    },
    someLatLon: {
      $type: 'latlon',
      lat: 10,
      lon: 10
    }
  })
  t.end()
})

test('apply a patch by replacing a tree', t => {
  const state = createFormBuilderState(rawValue, defaultContext)

  const newState = state.patch({
    home: {
      location: {
        lat: {$set: 666},
        lon: {$set: 444}
      }
    }
  })

  t.same(newState.unwrap(), {
    $type: 'simple',
    someString: 'foo',
    home: {
      $type: 'homeAddress',
      zip: '2012',
      location: {
        $type: 'latlon',
        lat: 666,
        lon: 444
      }
    },
    someLatLon: {
      $type: 'latlon',
      lat: 10,
      lon: 10
    }
  })
  t.end()
})


test('custom container', t => {

  class NumberContainer {
    constructor(value, context) {
      this.value = value
      this.context = context
    }

    patch(patch) {
      if (patch.hasOwnProperty('$set')) {
        this.value = patch.$set
        return new NumberContainer(patch.$set, this.context)
      }
      throw new Error(`Only $set is supported by NumberContainer, got: ${JSON.stringify(patch)}`)
    }

    unwrap() {
      return this.value.trim() ? Number(this.value) : void 0
    }
  }

  NumberContainer.wrap = function wrap(val) {
    return new NumberContainer(String(val))
  }

  function resolveContainer(field, schemaType) {
    if (field.type === 'number' || schemaType.type === 'number') {
      return NumberContainer
    }
    return defaultResolveContainer(field, schemaType)
  }

  const state = createFormBuilderState(rawValue, {
    type: compiledSchema.types.simple,
    schema,
    resolveContainer
  })

  const newState = state.patch({
    home: {
      location: {
        lat: {$set: '666'},
        lon: {$set: '444'}
      }
    }
  })

  t.same(newState.unwrap(), {
    $type: 'simple',
    someString: 'foo',
    home: {
      $type: 'homeAddress',
      zip: '2012',
      location: {
        $type: 'latlon',
        lat: 666,
        lon: 444
      }
    },
    someLatLon: {
      $type: 'latlon',
      lat: 10,
      lon: 10
    }
  })
  t.end()
})
