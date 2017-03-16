var DeferredUpdate = temp({
  onbeforeupdate : function(before, after){
    if(after === before)
      return false
    else
      return new Promise(function(resume){
        dom.animate({color: [after > before ? 'red' : 'blue', 'black']}, 400)
          .onfinish = resume
      })
  },

  onbeforeremove : function(vnode){
    return new Promise(resume =>
      vnode.dom.animate({color: ['black', 'white']}, 400)
        .onfinish = resume
    )
  },

  view : function(vnode){
    return m('.entry',
      m('.name',  vnode.attrs.name),
      m('.score', vnode.attrs.score)
    )
  }
})
