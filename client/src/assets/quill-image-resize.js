let BlockEmbed = Quill2.import('blots/block/embed');
class ImageBlot extends BlockEmbed {
    static create(value) {
        let node = super.create();
        node.setAttribute('style',value.style);
        node.setAttribute('src',value.src);
        node.setAttribute('id',value.id);
        return node;
    }

    static value(node) {
        return {
            style: node.getAttribute('style'),
            src: node.getAttribute('src'),
            id: node.getAttribute('id')
        }
    }
}
ImageBlot.blotName = 'image';
ImageBlot.tagName = 'img';
Quill2.register(ImageBlot);
function ImageModule(quill, options) {
  this.quill = quill;
  this.options = options;
}
ImageModule.prototype.insertImage = (quill) => {
  let input = document.createElement('input');
  input.type = 'file';
  input.accept = '.png, .jpg, .jpeg'
  input.onchange = _ => {
        files = Array.from(input.files);
        var oFReader = new FileReader();
        oFReader.readAsDataURL(files[0]);
        oFReader.onload = function (oFREvent) {
            let range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', {src:oFREvent.target.result,style:'',id:create_UUID()}, Quill2.sources.USER);
        };
    };
  input.click();
}

ImageModule.prototype.alignLeft = (quill, selection) => {
    const selectedContent = quill.getContents(selection.index,selection.length);
    const ops = selectedContent.ops;
    ops.forEach((element) => {
      if(element.insert.image.id) {
        const images = this.document.querySelectorAll('img');
        images.forEach(img => {
          if(img.id === element.insert.image?.id) {
            img.style.display = "inline",
            img.style.margin = "auto",
            img.style.float = "left"
          }
        });
      }
    })
}

ImageModule.prototype.alignRight = (quill, selection) => {
    const selectedContent = quill.getContents(selection.index,selection.length);
    const ops = selectedContent.ops;
    ops.forEach((element) => {
      if(element.insert.image.id) {
        const images = this.document.querySelectorAll('img');
        images.forEach(img => {
          if(img.id === element.insert.image?.id) {
            img.style.display = "inline",
            img.style.margin = "auto",
            img.style.float = "right"
          }
        });
      }
    })
}

ImageModule.prototype.alignCenter = (quill, selection) => {
    const selectedContent = quill.getContents(selection.index,selection.length);
    const ops = selectedContent.ops;
    ops.forEach((element) => {
      if(element.insert.image.id) {
        const images = this.document.querySelectorAll('img');
        images.forEach(img => {
          if(img.id === element.insert.image?.id) {
            img.style.display = "block",
            img.style.margin = "auto"
          }
        });
      }
   });
}

ImageModule.prototype.resize = (quill, selection, percentage) => {
  const selectedContent = quill.getContents(selection.index,selection.length);
  const ops = selectedContent.ops;
  ops.forEach((element) => {
    if(element.insert.image.id) {
      const images = this.document.querySelectorAll('img');
      images.forEach(img => {
        if(img.id === element.insert.image?.id) {
          img.style.width = `${percentage}%`;
        }
      });
    }
 });
}

Quill2.register('modules/imageModule',ImageModule);
const create_UUID = () => {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}
