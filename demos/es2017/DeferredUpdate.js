import m from 'mithril'
import temp from '../'

export default temp({
  onbeforeupdate : ({dom, attrs: {score: after}}, {attrs: {score: before}}) =>
    after !== before && new Promise(resume =>
      dom.animate({color: [after > before ? 'red' : 'blue', 'black']}, 400)
        .onfinish = resume
    ),

  onbeforeremove : async ({dom}) =>
    new Promise(resume =>
      dom.animate({color: ['black', 'white']}, 400)
        .onfinish = resume
    ),

  view : ({attrs: {name, score}}) =>
    m('.entry',
      m('.name',  name),
      m('.score', score)
    )
})
