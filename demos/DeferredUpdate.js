// import m from 'mithril'
// import asynchronise from '../'

const DeferredUpdate = asynchronise({
  async onbeforeupdate : ({dom, attrs: {score: after}}, {attrs: {score: before}}) =>
    after !== before && new Promise(resume =>
      dom.animate({color: [after > before ? 'red' : 'blue', 'black']}, 400)
        .onfinish = resume
    ),

  async onbeforeremove : ({dom}) =>
    new Promise(resume =>
      dom.animate({color: ['black', 'white']}, 400)
        .onfinish = resume
    ),

  view : ({attrs: {name, score}}) =>
    m('h1', data.firstName)
})
