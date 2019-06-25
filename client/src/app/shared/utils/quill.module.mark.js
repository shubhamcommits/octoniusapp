import * as Quill from 'quill';
(window).Quill = Quill;

var Inline = Quill.import('blots/inline');

class Mark extends Inline {
    static create(value) {
      let node = super.create(value);
      if (value) {
        if (value.style && value.style.color) {
          node.style.color = value.style.color;
        }
        if (value.user) {
          node.setAttribute("data-toggle", "tooltip");
          node.setAttribute("data-placement", "top");
          node.setAttribute("title", value.user);
          // node.setAttribute("placement", "top");
          // node.setAttribute("ngbTooltip", value.user.first_name + " " + value.user.last_name);
        }
      }
      return node;
    }
}
Mark.blotName = 'mark';
Mark.tagName = 'marker';
Mark.className = 'ql-mark-collaborative';


// class MarkDelete extends Mark {
//   static create(value) {
//     let node = super.create(value);
//     node.style.textDecoration = "line-through";
//     node.contentEditable = false;
//     return node;
//   }

//   length() {
//     return 0;
//   }
// }
// MarkDelete.blotName = 'mark-delete';
// MarkDelete.tagName = 'markerdelete';
// MarkDelete.className = 'ql-mark-delete-collaborative';


// export {Mark, MarkDelete};

export {Mark}
