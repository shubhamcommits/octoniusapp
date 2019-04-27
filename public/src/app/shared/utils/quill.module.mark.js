// var Parchment = Quill.import('Parchment');
var Inline = Quill.import('blots/inline'); 

class Mark extends Inline {
    static create(value) {
      let node = super.create(value);
      node.style.color = value.style.color;
      node.setAttribute('data-mark-id', value.id);
      return node;
    }

    static formats(domNode) {
      return domNode.getAttribute('data-mark-id');
    }

}
Mark.blotName = 'mark';
Mark.tagName = 'SPAN';
export {Mark};