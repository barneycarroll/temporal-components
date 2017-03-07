# masync

**Work in progress:** Extra lifecycle controls for Mithril components

This codebase exposes a function which extends the consumed component's lifecycle methods to add extra lifecycle hooks. At the time of writing, not all lifecycle methods are created equal:

* `onbeforeupdate` has special semantics when it returns `false`
* `onbeforeremove` has special semantics when it returns a `Promise`

*masync* extends `oninit`, `oncreate`, `onbeforeupdate` & `onupdate` to trigger equivalent functionality when they trigger either `false` or `Promise`, too. This affords exciting new opportunities.

```javascript
import desynchronise from 'masync'

// Straw man
export default desynchronise({
  oninit(){
    return false
    // ^ Indicate that the component failed to initialise.
    // The view will not render and oncreate will not fire.
    // The node will attempt to initialise again in the next render loop.

    return new Promise(/**/)
    // ^ As above, except you define the criteria for resuming lifecycle.
    // When the promise resolves, a redraw is triggered.
    // `oninit` will not execute in the next loop; `view` & `oncreate` will.
  },

  onbeforeupdate(){
    return new Promise(/**/)
    // ^ Equivalent to returning `false` until the promise resolves.
  },

  oncreate(){
    return false
    // ^ Indicate creation criteria weren't met.
    // `oncreate` will run instead of `onupdate` in the next render loop.

    return new Promise(/**/)
    //  ^ The node will not redraw until resolution.
    // No redraw is triggered, since `oncreate` marks the end of the local lifecycle.
  },

  onupdate(){
    return new Promise(/**/)
    // ^ As per `oncreate`'s Promise return path.
  }
})
```

### In brief

* A `false` return value indicates that the current lifecycle should be aborted: all subsequent lifecycle methods - including the `view` - won't execute. In the case of first-loop methods - `oninit` & `oncreate` - this indicates that the method should execute again in the next loop instead of its subsequent-loop counterpart. *
* A `Promise` return value indicates that the lifecycle should be paused until the promise resolves. Unlike `false` return values, a resolved promise implies that the method succeeded, and thus the next loop should resume as normal. In the case of `oninit` this means the next loop will trigger `view` and then `oncreate`. In all other cases the next loop will follow the normal sequence.

### Why?

`false` and `Promise` represent 2 ways of doing the same thing: the former says 'no'; the latter says 'not until'. A preference for `false` is likely if your application model follows a functional route where the determining logic comes from elsewhere, and you're happy thinking of your component returning `false` until the input matches your conditions; `Promise` is preferable if your component is in charge of marshalling its own state, and you need to determine resolution conditions internally.

#### Stop avoiding the question

Given that `false` & `Promise` amount to the same functionality for different architectures, reasons for either fit into 2 broad categories:

1. Yielding control from the render loop to another process
3. Better internal semantics for complex licecycles

The first is a common requirement in web UIs, applied in current Mithril API by `onbeforeremove` (for DOM animation) and RouteResolvers' `onmatch` (for data fetching). Yielding control to URL logic, DOM animation processes or 3rd party plugins is not an anti-pattern. In contrast, remodelling your application such that the stateless view is capable of catering for all possible states of routed resource acquisition, element movement & removal in a purely procedural way is incredibly difficult. The argument that view components should be stateless is thwarted by the counter-argument that models shouldn't include view-specific data. If you want these features, you may as well model them in the place they make sense instead of re-designing your entire application structure.

The second case follows the same argument. A component that requires different functions to run at different times in its lifecycle should be able to control that lifecycle in order to better separate concerns if that's what makes sense on a component level.

#### Pathetic

Yeah but consider routing...

**TBC**

<!--
### What about...?
#### `false` returns for `onbeforeremove`; `onremove` semantics
 -->
