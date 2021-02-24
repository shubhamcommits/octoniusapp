// Quill Import
import Quill from 'quill';

// Quill Clipboard
const Clipboard = Quill.import('modules/clipboard')

// Quill Delta
const Delta = Quill.import('delta')

export default class QuillClipboard extends Clipboard {

  onCapturePaste(e) {
      this.onPaste(e);
  }

  onPaste (e: any) {

    e.preventDefault()

    // Get the range
    const range = this.quill.getSelection()

    // get the html
    const text = e.clipboardData.getData('text/plain')
    var html = e.clipboardData.getData('text/html')

    // If HTML String is empty then add it to anchor tag
    if(html == "")
      html = `<a href="${text}">${text}</a>`

    // fetch the list of current formats
    const formats = this.quill.getFormat(range.index)

    // convert the html and formats to the delta
    const pastedDelta = this.quill.clipboard.convert(html, formats)

    // form a new delta
    const delta = new Delta()
      .retain(range.index)
      .delete(range.length)
      .concat(pastedDelta)

    // Set the content into the current quill view
    const index = html.length + range.index
    const length = 0
    this.quill.updateContents(delta, 'user')
    this.quill.setSelection(delta.length() - range.length, 'user')
    this.quill.scrollIntoView()
  }
}
