// import m from 'mithril'

// The supplementary model for determining a/sync diff-exclusion state
const stopped = new Set() // False return, abort in current loop
const waiting = new Set() // Promise return, abort loop indefinitely
const isntit  = new Set() // Failed initialisation
const unmade  = new Set() // Failed creation
// FYI "isn't it" is the Welsh opposite of the South English "innit"

// Convenience function to fork logic depending on method return values
const fork    = (outcome, ifBoth, ifAsync, ifFalse, ifNone) => {
  const isFalse = outcome == false
  const isAsync = outcome && typeof outcome.then === 'function'

       if(isFalse) ifFalse(outcome)
  else if(isAsync) ifAsync(outcome)
  else return void ifNone ? ifNone(outcome) : undefined
                   ifBoth(outcome)
}

const call    = (method, vnode, ...rest) =>
  method ? method.call(vnode.state, vnode, ...rest) : undefined

// Shorthands for terse state-keeping
const setter  = set =>
  function(vnode, added){
    return (
      arguments.length === 1
      ? set.has(vnode.state)
      : added
        ? void set.add(vnode.state)
        : void set.delete(vnode.state)
    )
  }
const wait    = setter(waiting)
const stop    = setter(stopped)
const aint    = setter(isntit)
const unmake  = setter(unmade)

/* export default */ function asynchronise(component){
  const override = {
    view: vnode => (
      aint(vnode)
      ? []
      : call(component.view, vnode)
    ),

    oninit: vnode => (
      wait(vnode)
      ? undefined
      : !!fork(
          call(component.oninit, vnode),

          () => {
            aint(vnode, true)
          },

          () => {
            stop(vnode, true)

            asap().then(() => {
              stop(vnode, false)
            })
          },

          promise => {
            wait(vnode, true)

            promise.then(() => {
              wait(vnode, false)
              aint(vnode, false)

              m.redraw()
            })
          },

          () => {
            stop(vnode, false)
            aint(vnode, false)
          }
        )
    ),

    oncreate : vnode => (
      ( wait(vnode) || stop(vnode) )
      ? false
      : fork(
          call(component.oncreate, vnode),

          () => {
            unmake(vnode, true)
          },

          Function.prototype,

          promise => {
            wait(vnode, true)

            promise.then(() => {
              wait(vnode, false)
            })
          }
        )
    ),

    onbeforeupdate : (vnode, old) => (
      wait(vnode)
      ? false
      : aint(vnode)
        ? call(override.oninit, vnode, old)
        : !!fork(
            call(component.onbeforeupdate, vnode, old),

            () => false,

            () => false,

            promise => {
              wait(vnode, true)

              promise.then(() => {
                wait(vnode, false)

                m.redraw()
              })
            }
          )
    ),

    onupdate : vnode => (
      wait(vnode)
      ? false
      : unmake(vnode)
        ? call(override.oncreate, vnode)
        : fork(
            call(component.onupdate, vnode),

            Function.prototype,

            Function.prototype,

            promise => {
              wait(vnode, true)

              promise.then(() => {
                wait(vnode, false)

                m.redraw()
              })
            }
          )
    ),
  }

  return Object.assign({}, component, override)
}
