import { MentionBlot } from "quill-mention";

export class OctoniusFolioMentionBlot extends MentionBlot {
  static render(data) {
    let element;
    if (!!data && data.denotationChar == '#') {
      element = document.createElement('a');
      element.innerText = data.value;
      element.href = data.link;
      element.target = data.target;
      element.style.color = data.color;
    } else if (!!data && data.denotationChar == '@') {
      element = document.createElement('span');
      element.innerText = data.value;
      element.style.color = data.color;
    }

	return element;
  }
}

OctoniusFolioMentionBlot.blotName = "octonius-folio-mention";
