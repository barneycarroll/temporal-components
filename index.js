import m from 'mithril'

// The supplementary model for determining a/sync diff-exclusion state
const stopped = new Set() // False return, abort in current loop
const waiting = new Set() // Promise return, abort loop indefinitely
const isntit  = new Set() // Failed initialisation
const unmade  = new Set() // Failed creation
// FYI "isn't it" is the Welsh opposite of the South English "innit"

// Convenience function to fork logic depending on method return values
const fork    = (outcome, ifBoth, ifAsync, ifFalse, ifNone) => {
  const isFalse = outcome == false
  const isAsync = typeof outcome.then === 'function'

       if(isFalse) ifFalse(outcome)
  else if(isAsync) ifAsync(outcome)
  else return void ifNone(outcome)
                   ifBoth(outcome)
}

// A dummy component definition to use as a placeholder and force diffs on uninitialised components
const dummy   = {view:() => []}

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
const aint    = setter(isntit) /* || function(vnode, remove){
  if(arguments.length === 1){
    return isntit.has(vnode.state)
  }
  else if(remove)
    isntit.delete(vnode.state)
    x.tag = x.state.view
  }
  else {
    isntit.add(x.state)
    x.tag = dummy
  }
}*/
const unmake  = setter(unmade)

export default function asynchronise(component){
  const {view, oninit, oncreate, onbeforeupdate, onupdate} = component
  const returned = Object.assign({}, component)

  if(view)
    returned.view = function(vnode){
      return isnt(vnode) ? [] : view.apply(this, arguments)
    }

  if(oninit)
    returned.oninit = function(vnode){
      if(wait(vnode))
        return

      return !!fork(
        oninit.apply(this, arguments),

        () => { aint(vnode, true) },

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
    }

  if(oncreate)
    returned.oncreate = function(vnode){
      if(wait(vnode) || stop(vnode))
        return false

      return fork(
        oncreate.apply(this, arguments),

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
    }

  if(onbeforeupdate)
    returned.onbeforeupdate = function(vnode){
      if(wait(vnode))
        return false

      if(aint(vnode))
        return returned.oninit.apply(this, arguments)

      return !!fork(
        onbeforeupdate.apply(this, arguments),

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
    }

  if(onupdate)
    returned.onbeforeupdate = function(vnode){
      if(wait(vnode))
        return false

      if(aint(vnode))
        return returned.oncreate.apply(this,arguments)

      if(unmake(vnode))
        return returned.oncreate.apply(this, arguments)

      return fork(
        onbeforeupdate.apply(this, arguments),

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
    }
}
