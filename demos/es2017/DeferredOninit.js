import m from 'mithril'
import asynchronise from '../'

export default asynchronise({
  oninit : async ({state}) =>
    m.request('http://rem-rest-api.herokuapp.com/api/users/2')
      .then(data => {
        state.data = data
      }),

  view : ({state: {data}}) =>
    m('h1', data.firstName)
})
