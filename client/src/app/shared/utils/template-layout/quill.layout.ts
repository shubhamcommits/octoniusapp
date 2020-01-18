import Quill from 'quill';
(window as any).Quill = Quill;

const Parchment = Quill.import('parchment')
const Block = Quill.import('blots/block')
const Container = Quill.import('blots/container')
const BlockEmbed = Quill.import('blots/block/embed');
const Break = Quill.import('blots/break');
const Inline = Quill.import('blots/inline');
const TextBlot = Quill.import('blots/text');

class LayoutCol extends Block {
  static create(value) {
    const node = super.create();
    const { rowId, colId } = value;
    if (rowId) { node.setAttribute('data-row-id', rowId) }
    if (colId) { node.setAttribute('data-col-id', colId) }
    node.style.border = '1px solid black';
    node.style.flex = '1';
    return node;
  }

  static formats(node) {
    const rowId = node.hasAttribute('data-row-id') ? node.getAttribute('data-row-id') : null
    const colId = node.hasAttribute('data-col-id') ? node.getAttribute('data-col-id') : null

    return { rowId, colId };
  }
  
  optimize() {
    // wrap cols in rows
    super.optimize();
    if (this.parent && this.parent.statics.blotName !== 'layout-row') {
      const row = Parchment.create('layout-row', this.statics.formats(this.domNode));
      this.parent.insertBefore(row, this);
      row.appendChild(this);
    }
  }
}
LayoutCol.blotName = 'layout-col';
LayoutCol.className = 'layoutCol';
LayoutCol.tagName = 'div';
LayoutCol.allowedChildren = [Inline, TextBlot, Block, BlockEmbed, Container, Break];


class LayoutRow extends Container {
  static create (value) {
    const node = super.create();
    const { rowId } = value;
    node.style.height = '400px';
    node.style.display = '-ms-flex';
    node.style.display = '-webkit-flex';
    node.style.display = 'flex';
    if (rowId) { node.setAttribute('data-row-id', rowId) }
    return node
  }
}

LayoutRow.blotName = 'layout-row';
LayoutRow.scope = Parchment.Scope.BLOCK_BLOT;
LayoutRow.tagName = 'div';
LayoutRow.className = 'layoutRow';
LayoutRow.defaultChild = 'layout-col';
LayoutRow.allowedChildren = [LayoutCol, Block, BlockEmbed, Container, Break];

export { LayoutCol, LayoutRow }