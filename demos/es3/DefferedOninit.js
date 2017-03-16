var DeferredOninit = temp({
  oninit : function(vnode){
    return m.request('http://rem-rest-api.herokuapp.com/api/users/2')
      .then(function(data){
        vnode.state.data = data
      })
  },

  view : function(vnode){
    return m('h1', vnode.state.data.firstName)
  }
})
